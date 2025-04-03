const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Jimp = require("jimp"); // Jimp for image processing (use other libraries if needed)

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render will provide this
  ssl: {
    rejectUnauthorized: false, // Required for Render-hosted PostgreSQL
  },
});

// ✅ Create Table if Not Exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    item_name TEXT NOT NULL,
    extracted_color TEXT NOT NULL,
    match_color TEXT NOT NULL
  )
`;

pool.query(createTableQuery)
  .then(() => console.log("✅ PostgreSQL connected and table ensured"))
  .catch((err) => console.error("❌ Error creating table:", err.message));

// ✅ Setup Multer for image uploads
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });

// ✅ API to Get Saved Colors
app.get("/api/saved-colors", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM colors");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ API to Save a Color
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
    console.error("❌ Error saving color:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ API to Analyze Images and Extract Colors (NEW)
app.post("/api/analyze", upload.fields([{ name: "topImage" }, { name: "bottomImage" }, { name: "shoeImage" }]), async (req, res) => {
  try {
    if (!req.files || !req.files["topImage"] || !req.files["bottomImage"] || !req.files["shoeImage"]) {
      return res.status(400).json({ error: "Missing image files" });
    }

    // Process the uploaded images
    const topImage = req.files["topImage"][0].buffer;
    const bottomImage = req.files["bottomImage"][0].buffer;
    const shoeImage = req.files["shoeImage"][0].buffer;

    // Extract colors (example: using Jimp to get dominant color)
    const extractColor = async (imageBuffer) => {
      const image = await Jimp.read(imageBuffer);
      const color = image.getPixelColor(image.bitmap.width / 2, image.bitmap.height / 2); // Grab color from center pixel
      const hexColor = Jimp.intToRGBA(color);
      return `#${hexColor.r.toString(16).padStart(2, '0')}${hexColor.g.toString(16).padStart(2, '0')}${hexColor.b.toString(16).padStart(2, '0')}`;
    };

    const topColor = await extractColor(topImage);
    const bottomColor = await extractColor(bottomImage);
    const shoeColor = await extractColor(shoeImage);

    // Prepare the extracted colors
    const extractedColors = {
      top: topColor,
      bottom: bottomColor,
      shoes: shoeColor,
    };

    res.json(extractedColors);
  } catch (error) {
    console.error("❌ Error analyzing images:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
