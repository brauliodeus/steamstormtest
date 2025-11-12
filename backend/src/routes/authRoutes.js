const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importa el modelo de usuario (es CommonJS)
const router = express.Router();


// Función auxiliar para generar JWT
const generateToken = (id) => {
    // Usamos una clave secreta definida en el .env
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // El token expira en 30 días
    });
};

// --- RUTA DE REGISTRO (POST /api/auth/register) ---
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Validar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'El usuario ya existe con este correo electrónico.' });
    }

    try {
        // 2. Crear y guardar el usuario (la contraseña se hashea en el modelo)
        const user = await User.create({ username, email, password });

        // 3. Respuesta exitosa con Token
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
            message: 'Registro exitoso.'
        });
    } catch (error) {
        // Maneja errores de validación (campos faltantes o minlength) o de base de datos
        res.status(500).json({ 
            message: 'Error en el servidor al registrar el usuario.', 
            error: error.message 
        });
    }
});

// --- RUTA DE LOGIN (POST /api/auth/login) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Buscar usuario
    const user = await User.findOne({ email });
    
    // 2. Validar usuario y contraseña
    if (user && (await user.matchPassword(password))) {
        // 3. Respuesta exitosa con Token
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
            message: 'Inicio de sesión correcto.'
        });
    } else {
        // 4. Respuesta de fallo de autenticación
        return res.status(401).json({ message: 'Correo electrónico o contraseña inválidos.' });
    }
});

module.exports = router;