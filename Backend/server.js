const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./saved_colors.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    db.run(
      "CREATE TABLE IF NOT EXISTS colors (id INTEGER PRIMARY KEY AUTOINCREMENT, item_name TEXT, extracted_color TEXT, match_color TEXT)"
    );
  }
});

// API to get saved colors
app.get("/api/saved-colors", (req, res) => {
  db.all("SELECT * FROM colors", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post("/api/save-color", (req, res) => {
  const { item_name, extracted_color, match_color } = req.body;

  if (!item_name || !extracted_color || !match_color) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("Saving color:", req.body);

  db.run(
    "INSERT INTO colors (item_name, extracted_color, match_color) VALUES (?, ?, ?)",
    [item_name, extracted_color, match_color],
    function (err) {
      if (err) {
        console.error("Error saving color:", err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("Saved color with ID:", this.lastID);
      res.json({ id: this.lastID, item_name, extracted_color, match_color });
    }
  );
});


// ✅ **Fix: Add DELETE API for removing colors from the database**
app.delete("/api/delete-color/:id", (req, res) => {
  const colorId = req.params.id;
  console.log(`Deleting color with ID: ${colorId}`);

  db.run("DELETE FROM colors WHERE id = ?", [colorId], function (err) {
    if (err) {
      console.error("Error deleting color:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`Deleted color with ID: ${colorId}`);
    res.json({ message: "Color deleted successfully!", deletedId: colorId });
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
