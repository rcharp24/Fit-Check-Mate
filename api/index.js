const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const Jimp = require("jimp");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3001", "https://fit-checkmate.vercel.app"], // Add your frontend URLs
}));
app.use(express.json());

// PostgreSQL Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Analyze images and extract color
app.post("/api/analyze", upload.fields([
  { name: "topImage" },
  { name: "bottomImage" },
  { name: "shoeImage" },
]), async (req, res) => {
  try {
    if (!req.files || !req.files["topImage"] || !req.files["bottomImage"] || !req.files["shoeImage"]) {
      return res.status(400).json({ error: "Missing image files" });
    }

    const extractColor = async (buffer) => {
      const img = await Jimp.read(buffer);
      const color = img.getPixelColor(img.bitmap.width / 2, img.bitmap.height / 2);
      const { r, g, b } = Jimp.intToRGBA(color);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const topColor = await extractColor(req.files["topImage"][0].buffer);
    const bottomColor = await extractColor(req.files["bottomImage"][0].buffer);
    const shoeColor = await extractColor(req.files["shoeImage"][0].buffer);

    res.json({ top: topColor, bottom: bottomColor, shoes: shoeColor });
  } catch (err) {
    console.error("Error analyzing images:", err.message);
    res.status(500).json({ error: "Failed to analyze images" });
  }
});

// Save extracted colors
app.post("/api/save-color", async (req, res) => {
  const { item_name, extracted_color, match_color } = req.body;
  if (!item_name || !extracted_color || !match_color) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO colors (item_name, extracted_color, match_color) VALUES ($1, $2, $3) RETURNING *",
      [item_name, extracted_color, match_color]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get saved colors
app.get("/api/saved-colors", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM colors");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
