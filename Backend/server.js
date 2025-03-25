const express = require("express");
const multer = require("multer");
const path = require("path");
const colorThief = require("colorthief");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 5000;

// Set up database
const db = new sqlite3.Database('./fit_check_mate.db');

// Set up file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Define the color database
const colorDatabase = [
 "#FF5733",  // Orange-red
  "#33FF57",  // Green
  "#3357FF",  // Blue
  "#F0F0F0",  // Light gray
  "#000000",  // Black
  "#FFFFFF",  // White
  "#FFD700",  // Gold
  "#800080",  // Purple
  "#FF6347",  // Tomato red
  "#008080",  // Teal
  "#FFFF00",  // Yellow
  "#C0C0C0",  // Silver
  "#A52A2A",  // Brown
  "#20B2AA",  // Light Sea Green
  "#D2691E",  // Chocolate
  "#FF1493",  // Deep Pink
  "#00CED1",  // Dark Turquoise
  "#7FFF00",  // Chartreuse
  "#0000FF",  // Blue
  "#8A2BE2",  // Blue Violet
  "#E6E6FA",  // Lavender
  "#98FB98",  // Pale Green
  "#FF8C00",  // Dark Orange
  "#6A5ACD",  // Slate Blue
  "#FF00FF",  // Magenta
  "#00FF00",  // Lime Green
  "#00FFFF",  // Aqua
  "#FF4500",  // Orange Red
  "#2E8B57",  // Sea Green
  "#B8860B",  // Dark Goldenrod
  "#DC143C",  // Crimson
  "#556B2F",  // Dark Olive Green
];

// Function to calculate color distance (Euclidean)
const colorDistance = (rgb1, rgb2) => {
  const rDiff = rgb1[0] - rgb2[0];
  const gDiff = rgb1[1] - rgb2[1];
  const bDiff = rgb1[2] - rgb2[2];
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

// Compare if two colors are a match based on a threshold (e.g., 100)
const isColorMatch = (color1, color2) => {
  const threshold = 100;
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  return colorDistance(rgb1, rgb2) < threshold;
};

// Convert hex to RGB
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return [((bigint >> 16) & 255), ((bigint >> 8) & 255), (bigint & 255)];
};

// Analyze colors from the uploaded image
app.post("/api/analyze", upload.fields([{ name: "topImage" }, { name: "bottomImage" }, { name: "shoeImage" }]), (req, res) => {
  const files = req.files;
  let dominantColors = {};

  const analyzeImage = async (imagePath) => {
    const dominantColor = await colorThief.getColor(imagePath);
    return rgbToHex(dominantColor);
  };

  const rgbToHex = (rgb) => {
    return "#" + rgb.map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  Promise.all([
    analyzeImage(files.topImage[0].path),
    analyzeImage(files.bottomImage[0].path),
    analyzeImage(files.shoeImage[0].path),
  ])
    .then(([topColor, bottomColor, shoeColor]) => {
      const colorsMatch = {
        topImage: findMatch(topColor),
        bottomImage: findMatch(bottomColor),
        shoeImage: findMatch(shoeColor),
      };

      res.json({
        topImage: topColor,
        bottomImage: bottomColor,
        shoeImage: shoeColor,
        colorsMatch: colorsMatch,
      });
    })
    .catch((error) => {
      console.error("Error analyzing images:", error);
      res.status(500).send("Error analyzing images");
    });
});

// Function to check if a color matches any from the database
const findMatch = (color) => {
  for (let i = 0; i < colorDatabase.length; i++) {
    if (isColorMatch(color, colorDatabase[i])) {
      return { extracted: color, match: colorDatabase[i] };
    }
  }
  return { extracted: color, match: null };
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});