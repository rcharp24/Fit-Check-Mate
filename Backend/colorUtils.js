// utils/colorUtils.js

// Convert Hex to RGB
const hexToRgb = (hex) => {
    const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
    if (!hexPattern.test(hex)) return null;
  
    let c = hex.substring(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
  
    const rgb = parseInt(c, 16);
    return {
      r: (rgb >> 16) & 0xff,
      g: (rgb >>  8) & 0xff,
      b: rgb & 0xff,
    };
  };
  
  // Calculate the Euclidean distance between two colors
  const colorDistance = (rgb1, rgb2) => {
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
  
    const distance = colorDistance(rgb1, rgb2);
    return distance <= tolerance;
  };
  
  // Export the utility functions
  module.exports = { hexToRgb, colorDistance, isColorMatch };
  