// src/routes/games.js
import express from "express";
import axios from "axios";
import Game from "../models/Game.js"; 

const router = express.Router();

//  Obtener todos los juegos (ordenados por rating)
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().sort({ rating: -1 });
    res.json(games);
  } catch (error) {
    console.error("Error al obtener los juegos:", error.message);
    res.status(500).json({ error: "Error al obtener los juegos" });
  }
});

//  Importar un juego desde Steam y guardarlo/actualizarlo en MongoDB
router.get("/import/:appId", async (req, res) => {
  const { appId } = req.params;

  try {
    const response = await axios.get(
      `https://store.steampowered.com/api/appdetails?appids=${appId}`
    );

    const data = response.data[appId];
    if (!data.success) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    const gameData = data.data;

    // Creamos o actualizamos el juego en MongoDB
    const game = await Game.findOneAndUpdate(
      { steamId: appId },
      {
        name: gameData.name,
        steamId: appId,
        genre: gameData.genres
          ? gameData.genres.map((g) => g.description).join(", ")
          : "Desconocido",
        price: gameData.price_overview
          ? gameData.price_overview.final / 100
          : 0,
        image: gameData.header_image,
        rating: Math.floor(Math.random() * 5) + 1,
        reviews: Math.floor(Math.random() * 5000) + 100,
      },
      { upsert: true, new: true }
    );

    res.json(game);
  } catch (error) {
    console.error("Error al obtener datos de Steam:", error.message);
    res.status(500).json({ error: "Error al consultar la API de Steam" });
  }
});

// 🔹 Ruta para votar por un juego 
router.post("/vote/:steamId", async (req, res) => {
  const { steamId } = req.params;
  const { vote } = req.body; // +1 o -1

  try {
    const game = await Game.findOneAndUpdate(
      { steamId },
      { $inc: { votes: vote } },
      { new: true }
    );

    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    res.json({ message: "Voto registrado", votes: game.votes });
  } catch (error) {
    console.error("Error al registrar voto:", error.message);
    res.status(500).json({ error: "Error al registrar voto" });
  }
});

export default router;