
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro_amiga';

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña (en producción usar bcrypt.compare)
    // const isValid = await bcrypt.compare(password, user.password);
    // Para el demo inicial sin hash en DB:
    const isValid = password === user.password; 

    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!user.active) {
        return res.status(403).json({ message: 'Usuario inactivo' });
    }

    // Generar tokens
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email }, 
      SECRET_KEY, 
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        SECRET_KEY,
        { expiresIn: '7d' }
    );

    // Eliminar password del objeto user antes de enviarlo
    delete user.password;

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
