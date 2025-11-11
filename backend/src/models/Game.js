import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  steamId: { type: String, unique: true },
  genre: { type: String },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  image: { type: String },
  votes: { type: Number, default: 0 }, // 👈 Nuevo campo para votos
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Game", gameSchema);
