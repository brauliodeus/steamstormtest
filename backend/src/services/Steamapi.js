import axios from "axios";
import Game from "../models/Game.js";

// Obtener información de un juego desde la API de Steam por su AppID
export async function fetchSteamGame(appId) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
    const response = await axios.get(url);

    const data = response.data[appId];
    if (!data.success) return null;

    const game = data.data;

    // Estructurar los datos para MongoDB
    const newGame = {
      name: game.name,
      steamId: appId,
      genre: game.genres ? game.genres.map((g) => g.description).join(", ") : "Desconocido",
      price: game.price_overview ? game.price_overview.final / 100 : 0,
      image: game.header_image,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 5000) + 100,
    };

    // Guardar o actualizar en MongoDB
    const savedGame = await Game.findOneAndUpdate(
      { steamId: appId },
      newGame,
      { upsert: true, new: true }
    );

    return savedGame;
  } catch (error) {
    console.error(`Error obteniendo juego ${appId}:`, error.message);
    return null;
  }
}
