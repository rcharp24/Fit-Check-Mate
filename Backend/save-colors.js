let savedColors = []; // You can move this to a database later

export default function handler(req, res) {
  if (req.method === "POST") {
    const { color } = req.body;
    if (!color) return res.status(400).json({ error: "No color provided" });

    savedColors.push(color);
    res.status(200).json({ message: "Color saved", savedColors });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}
