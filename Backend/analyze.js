const Jimp = require("jimp");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  // Add actual logic later — simulate for now
  const dummyColor = "#8A4F7D";
  res.status(200).json({ extractedColor: dummyColor });
}
