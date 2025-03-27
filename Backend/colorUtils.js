// utils/colorUtils.js

// Convert Hex to RGB
const hexToRgb = (hex) => {
  const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
  if (!hexPattern.test(hex)) {
    console.error(`Invalid hex color: ${hex}`);
    return null;
  }

  let c = hex.slice(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');

  const rgb = parseInt(c, 16);
  return {
    r: (rgb >> 16) & 0xff,
    g: (rgb >> 8) & 0xff,
    b: rgb & 0xff,
  };
};

// Convert RGB to Hex
const rgbToHex = (rgb) => {
  if (!rgb || typeof rgb.r !== "number" || typeof rgb.g !== "number" || typeof rgb.b !== "number") {
    console.error("Invalid RGB object:", rgb);
    return null;
  }

  return `#${((1 << 24) | (rgb.r << 16) | (rgb.g << 8) | rgb.b).toString(16).slice(1).toUpperCase()}`;
};

// Calculate the Euclidean distance between two colors
const colorDistance = (rgb1, rgb2) => {
  if (!rgb1 || !rgb2) return Infinity;

  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

// Compare two colors to see if they match within a tolerance
const isColorMatch = (color1, color2, tolerance = 50) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return false;

  return colorDistance(rgb1, rgb2) <= tolerance;
};

// Export the utility functions
module.exports = { hexToRgb, rgbToHex, colorDistance, isColorMatch };
