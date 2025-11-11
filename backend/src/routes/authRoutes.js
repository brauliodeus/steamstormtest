// backend/src/routes/authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import 'dotenv/config'; // Necesario para acceder a JWT_SECRET

const router = express.Router();

// Función auxiliar para generar JSON Web Token (JWT)
const generateToken = (id) => {
    // Utilizamos la clave secreta definida en el .env
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // El token expira en 30 días
    });
};

// --- RUTA DE REGISTRO (POST /api/auth/register) ---
router.post('/register', async (req, res) => {
    // La desestructuración funciona si express.json() se aplica ANTES de esta ruta
    const { username, email, password } = req.body; 

    try {
        // 1. Validar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe con este correo electrónico.' });
        }

        // 2. Crear y guardar el usuario (la contraseña se hashea en el modelo)
        const user = await User.create({ username, email, password });

        // 3. Respuesta exitosa con Token
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            message: "Registro exitoso.",
            token: generateToken(user._id), // Genera el token JWT
        });
    } catch (error) {
        // Mongoose Validation Error (ej. falta un campo requerido)
        res.status(500).json({ 
            message: "Error en el servidor al registrar el usuario.", 
            error: error.message 
        });
    }
});


// --- RUTA DE LOGIN (POST /api/auth/login) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`[DEBUG LOGIN] Intento de login para email: ${email}`); // Debug 1

        // 1. Buscar usuario
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`[DEBUG LOGIN] Usuario no encontrado: ${email}`); // Debug 2
            // Aseguramos el return para que no siga ejecutando
            return res.status(401).json({ message: 'Correo electrónico o contraseña inválidos.' });
        }
        
        // 2. Validar usuario y contraseña
        const isMatch = await user.matchPassword(password);
        
        console.log(`[DEBUG LOGIN] Contraseña plana recibida: ${password}`); // Debug 3
        console.log(`[DEBUG LOGIN] Hash en DB: ${user.password.substring(0, 10)}...`); // Debug 4 (muestra parcial del hash)
        console.log(`[DEBUG LOGIN] Resultado de bcrypt.compare: ${isMatch}`); // Debug 5

        if (isMatch) {
            // 3. Respuesta exitosa con Token
            return res.json({ // Usamos return para terminar la ejecución
                _id: user._id,
                username: user.username,
                email: user.email,
                message: "Inicio de sesión exitoso.",
                token: generateToken(user._id),
            });
        } else {
            // Aseguramos el return para que no siga ejecutando
            return res.status(401).json({ message: 'Correo electrónico o contraseña inválidos.' });
        }
    } catch (error) {
        console.error("[DEBUG LOGIN ERROR] Error interno:", error);
        return res.status(500).json({ // Usamos return para manejar errores internos
            message: "Error en el servidor durante el inicio de sesión.", 
            error: error.message 
        });
    }
});

export default router;