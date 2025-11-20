const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Nomina = require('../models/Nomina');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Directorio temporal

// Subir nómina original (Admin)
router.post('/upload', upload.single('nomina'), async (req, res) => {
  const { empleadoId, empleadoNombre, mes } = req.body;
  const nominaPdf = req.file;
  const carpetaMes = path.join('nominas', mes);
  if (!fs.existsSync(carpetaMes)) fs.mkdirSync(carpetaMes, { recursive: true });
  const destino = path.join(carpetaMes, nominaPdf.originalname);
  fs.renameSync(nominaPdf.path, destino);
  const nomina = new Nomina({
    empleadoId,
    empleadoNombre,
    mes,
    documentoOriginal: destino
  });
  await nomina.save();
  res.json({ ok: true, nomina });
});

// Descargar nómina (pendiente o firmada)
router.get('/:id/descargar', async (req, res) => {
  const nomina = await Nomina.findById(req.params.id);
  if (!nomina) return res.status(404).json({ error: 'No existe' });
  const file = nomina.estado === 'firmada' && nomina.documentoFirmado
    ? nomina.documentoFirmado
    : nomina.documentoOriginal;
  res.download(file);
});

// Subir PDF firmado
router.post('/:id/firmada', upload.single('firmada'), async (req, res) => {
  const nomina = await Nomina.findById(req.params.id);
  if (!nomina) return res.status(404).json({ error: 'No existe' });
  const carpetaMes = path.join('nominas', nomina.mes);
  const destino = path.join(carpetaMes, `firmada_${req.file.originalname}`);
  fs.renameSync(req.file.path, destino);
  nomina.documentoFirmado = destino;
  nomina.estado = 'firmada';
  nomina.fechaFirma = Date.now();
  await nomina.save();
  res.json({ ok: true });
});

// Listar nóminas agrupadas por mes y estado (para el empleado)
router.get('/mis', async (req, res) => {
  const empleadoId = req.user.id;
  const nominas = await Nomina.find({ empleadoId }).sort({ mes: -1 });
  const resultado = {};
  nominas.forEach(n => {
    if (!resultado[n.mes]) resultado[n.mes] = [];
    resultado[n.mes].push(n);
  });
  res.json(resultado);
});

// Listar todas las nóminas (admin, filtro opcional)
router.get('/admin', async (req, res) => {
  const { mes, estado } = req.query;
  const filtro = {};
  if (mes) filtro.mes = mes;
  if (estado) filtro.estado = estado;
  const nominas = await Nomina.find(filtro).sort({ empleadoNombre: 1 });
  res.json(nominas);
});

module.exports = router;