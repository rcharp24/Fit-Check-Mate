const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend-backend communication
app.use(cors());
app.use(express.json()); // For parsing JSON request bodies

// Test route to check if server is running
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// If the backend logic is handled by Flask, no need to process images here
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
