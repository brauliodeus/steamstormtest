// Importaciones de librerías usando CommonJS
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // <--- CRÍTICO: Módulo 'path' para resolver la ruta

// Configuración para cargar variables de entorno desde .env
// Usamos path.resolve(__dirname) para garantizar que el archivo .env se encuentre en la carpeta padre (backend).
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); 

// Importaciones de rutas y modelos
const gamesRouter = require('./routes/games'); // Tu router original de juegos
const authRouter = require('./routes/authRoutes'); // Router de autenticación

// Verificación de carga de la URI antes de la conexión (DEBUG)
console.log("URI intentando cargar:", process.env.MONGO_URI ? "Cargada exitosamente." : "FALLO: URI NO ENCONTRADA.");

const app = express();

// Middleware
app.use(cors()); // Permite peticiones de origen cruzado
app.use(express.json()); // Permite leer el cuerpo JSON de las peticiones

// Rutas
app.use("/api/games", gamesRouter); // Ruta original
app.use("/api/auth", authRouter); // Rutas de autenticación

// Ruta simple para verificar el servidor
app.get("/", (req, res) => {
  res.send("Servidor SteamStorm funcionando correctamente, incluyendo autenticación.");
});

// Conexión a MongoDB (usando Promesas)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conectado a MongoDB");

    // Escuchar en el puerto 3000
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Rutas de Autenticación: http://localhost:${PORT}/api/auth/register`);
    });
  })
  .catch((error) => console.error("Error al conectar MongoDB:", error.message));