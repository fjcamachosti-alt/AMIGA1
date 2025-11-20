
const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware simple de autenticación
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        next();
    } else {
        res.sendStatus(403);
    }
};

// Helper to process documents with uploaded files
const processDocuments = (req) => {
    // req.body might contain documents as JSON strings if sent via FormData
    // We need to parse them and attach file paths if files were uploaded
    const categories = ['documentosBasicos', 'documentosEspecificos', 'documentosAdicionales'];
    const processedDocs = {};

    categories.forEach(cat => {
        let docs = [];
        if (req.body[cat]) {
            try {
                docs = JSON.parse(req.body[cat]);
            } catch (e) {
                docs = [];
            }
        }

        // If files were uploaded, map them to the documents
        // This simplistic logic assumes the frontend sends files with fieldnames matching the category 
        // or we just attach them. In a real app, you'd match by index or ID.
        // Here, we'll simply update the file path if a file with a matching name was uploaded,
        // or if the logic is more complex, we assume the DB stores the metadata.
        
        // For this implementation, let's assume we save the file path in the document object
        // We iterate through req.files to find matches if needed, or just return the metadata structure.
        // Since mapping multipart files to specific array indices is complex without a strict convention,
        // we will return the docs as parsed, and users would handle file linking in the frontend logic 
        // (sending the filename that matches the uploaded file).
        
        // Basic handling: update 'file' property if it matches an uploaded file's original name
        if (req.files && req.files.length > 0) {
            docs = docs.map(doc => {
                const uploadedFile = req.files.find(f => f.originalname === doc.name); // Simple matching strategy
                if (uploadedFile) {
                    return { ...doc, file: uploadedFile.filename, uploadDate: new Date().toISOString().split('T')[0] };
                }
                return doc;
            });
        }
        
        processedDocs[cat] = JSON.stringify(docs);
    });

    return processedDocs;
};

// GET /api/vehicles - Get all vehicles with filters
router.get('/', async (req, res) => {
    try {
        const { status, brand, model } = req.query;
        let queryText = 'SELECT * FROM vehicles WHERE 1=1';
        const queryParams = [];

        if (status) {
            queryParams.push(status);
            queryText += ` AND estado = $${queryParams.length}`;
        }
        if (brand) {
            queryParams.push(brand);
            queryText += ` AND marca = $${queryParams.length}`;
        }
        if (model) {
            queryParams.push(model);
            queryText += ` AND modelo = $${queryParams.length}`;
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/vehicles/:id - Get single vehicle
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/vehicles - Create vehicle
router.post('/', verifyToken, upload.any(), async (req, res) => {
    try {
        const { matricula, marca, modelo, ano, estado, visibilidad, proximaITV, proximaRevision, kmActual, vencimientoSeguro } = req.body;

        // Validation
        if (!matricula || !marca || !modelo) {
            return res.status(400).json({ message: 'Campos obligatorios faltantes: matricula, marca, modelo' });
        }

        const docs = processDocuments(req);

        const query = `
            INSERT INTO vehicles (
                matricula, marca, modelo, ano, estado, visibilidad, 
                proxima_itv, proxima_revision, km_actual, vencimiento_seguro,
                documentos_basicos, documentos_especificos, documentos_adicionales
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *
        `;

        const values = [
            matricula, marca, modelo, ano, estado, visibilidad,
            proximaITV, proximaRevision, kmActual, vencimientoSeguro,
            docs.documentosBasicos, docs.documentosEspecificos, docs.documentosAdicionales
        ];

        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/vehicles/:id - Update vehicle
router.put('/:id', verifyToken, upload.any(), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check existence
        const check = await db.query('SELECT id FROM vehicles WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });

        const { matricula, marca, modelo, ano, estado, visibilidad, proximaITV, proximaRevision, kmActual, vencimientoSeguro } = req.body;
        
         // Validation
         if (!matricula || !marca || !modelo) {
            return res.status(400).json({ message: 'Campos obligatorios faltantes: matricula, marca, modelo' });
        }

        const docs = processDocuments(req);

        const query = `
            UPDATE vehicles SET 
                matricula = $1, marca = $2, modelo = $3, ano = $4, estado = $5, visibilidad = $6,
                proxima_itv = $7, proxima_revision = $8, km_actual = $9, vencimiento_seguro = $10,
                documentos_basicos = $11, documentos_especificos = $12, documentos_adicionales = $13,
                updated_at = NOW()
            WHERE id = $14
            RETURNING *
        `;

        const values = [
            matricula, marca, modelo, ano, estado, visibilidad,
            proximaITV, proximaRevision, kmActual, vencimientoSeguro,
            docs.documentosBasicos, docs.documentosEspecificos, docs.documentosAdicionales,
            id
        ];

        const result = await db.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const check = await db.query('SELECT id FROM vehicles WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });

        await db.query('DELETE FROM vehicles WHERE id = $1', [id]);
        res.json({ message: 'Vehículo eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
