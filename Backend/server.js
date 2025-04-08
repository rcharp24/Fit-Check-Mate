const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Dummy database to store saved colors temporarily (in memory)
let savedColors = [];

// Image upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }

  // Simulated color extraction
  const dummyExtractedColor = '#8A4F7D'; // replace with actual logic later
  res.json({ extractedColor: dummyExtractedColor });
});

// Save extracted color
app.post('/api/save-color', (req, res) => {
  const { color } = req.body;
  if (!color) return res.status(400).json({ error: 'No color provided.' });

  savedColors.push(color);
  res.json({ message: 'Color saved successfully', savedColors });
});

// Get saved colors
app.get('/api/saved-colors', (req, res) => {
  res.json({ savedColors });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
