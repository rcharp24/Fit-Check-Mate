const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.postgresql://fit_check_mate_db_user:yo5jFj5Ut2cndzpnH3iG80F3mgSKY7nD@dpg-cvmqdua4d50c73aodt3g-a.virginia-postgres.render.com/fit_check_mate_db, // Render will provide this
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

// ✅ API to Delete a Color
app.delete("/api/delete-color/:id", async (req, res) => {
  const colorId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM colors WHERE id = $1 RETURNING id", [colorId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Color not found" });
    }

    res.json({ message: "Color deleted successfully!", deletedId: colorId });
  } catch (err) {
    console.error("❌ Error deleting color:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
