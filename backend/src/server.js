// backend/src/server.js

import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'; // Para cargar el archivo .env
import cors from 'cors'; 

// Importamos las rutas
import authRoutes from './routes/authRoutes.js'; 

const app = express();

// MIDDLEWARES GENERALES
// 1. Configuración de CORS para permitir la conexión desde el frontend local
app.use(cors()); 

// 2. MIDDLEWARE CRÍTICO: Permite que Express lea JSON en el cuerpo de la petición (req.body)
app.use(express.json()); 


// Función para establecer la conexión a la Base de Datos
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
             console.error('❌ Error Crítico: MONGO_URI no está definido. Revisa tu archivo .env.');
             process.exit(1); 
        }

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Atlas conectado exitosamente en local.');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1); 
    }
};

// Establecer la conexión al inicio del servidor
connectDB();

// -----------------------------------------------------
// 📦 Rutas
// -----------------------------------------------------

// Incluir rutas de autenticación
app.use('/api/auth', authRoutes); 

// Ruta principal de prueba
app.get('/', (req, res) => {
    res.send('Backend SteamStorm funcionando.');
});


// -----------------------------------------------------
// 🚀 Inicialización del Servidor
// -----------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor de desarrollo corriendo en http://localhost:${PORT}`));