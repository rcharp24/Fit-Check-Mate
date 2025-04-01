import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function UploadPage() {
  const [topImage, setTopImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [shoeImage, setShoeImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const predefinedColors = [
    
    { name: "Alice Blue", "hex": "#F0F8FF" },
    { name: "Antique White", "hex": "#FAEBD7" },
    { name: "Aqua", "hex": "#00FFFF" },
    { name: "Aqua marine", "hex": "#7FFFD4" },
    { name: "Azure", "hex": "#F0FFFF" },
    { name: "Beige", "hex": "#F5F5DC" },
    { name: "Bisque", "hex": "#FFE4C4" },
    { name: "Black", "hex": "#000000" },
    { name: "Blanched Almond", "hex": "#FFEBCD" },
    { name: "Blue", "hex": "#0000FF" },
    { name: "Blue Violet", "hex": "#8A2BE2" },
    { name: "Brown", "hex": "#A52A2A" },
    { name: "Burly Wood", "hex": "#DEB887" },
    { name: "Cadet Blue", "hex": "#5F9EA0" },
    { name: "Chartreuse", "hex": "#7FFF00" },
    { name: "Chocolate", "hex": "#D2691E" },
    { name: "Coral", "hex": "#FF7F50" },
    { name: "Cornflower Blue", "hex": "#6495ED" },
    { name: "Cornsilk", "hex": "#FFF8DC" },
    { name: "Crimson", "hex": "#DC143C" },
    { name: "Cyan", "hex": "#00FFFF" },
    { name: "Dark Blue", "hex": "#00008B" },
    { name: "Dark Cyan", "hex": "#008B8B" },
    { name: "Dark Golden Rod", "hex": "#B8860B" },
    { name: "Dark Gray", "hex": "#A9A9A9" },
    { name: "Dark Green", "hex": "#006400" },
    { name: "Dark Khaki", "hex": "#BDB76B" },
    { name: "Dark Magenta", "hex": "#8B008B" },
    { name: "Dark Olive Green", "hex": "#556B2F" },
    { name: "Dark Orange", "hex": "#FF8C00" },
    { name: "Dark Orchid", "hex": "#9932CC" },
    { name: "Dark Red", "hex": "#8B0000" },
    { name: "Dark Salmon", "hex": "#E9967A" },
    { name: "Dark Sea Green", "hex": "#8FBC8F" },
    { name: "Dark Slate Blue", "hex": "#483D8B" },
    { name: "Dark Slate Gray", "hex": "#2F4F4F" },
    { name: "Dark Turquoise", "hex": "#00CED1" },
    { name: "Dark Violet", "hex": "#9400D3" },
    { name: "Deep Pink", "hex": "#FF1493" },
    { name: "Deep Sky Blue", "hex": "#00BFFF" },
    { name: "Dim Gray", "hex": "#696969" },
    { name: "Dodger Blue", "hex": "#1E90FF" },
    { name: "Fire Brick", "hex": "#B22222" },
    { name: "Floral White", "hex": "#FFFAF0" },
    { name: "Forest Green", "hex": "#228B22" },
    { name: "Fuchsia", "hex": "#FF00FF" },
    { name: "Gainsboro", "hex": "#DCDCDC" },
    { name: "Green", "hex": "#00FF00" },
    { name: "Red", "hex": "#FF0000" }
  ];

  const hexToRgb = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const colorDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  const findClosestColor = (hex) => {
    const inputRgb = hexToRgb(hex);
    let bestMatch = null;
    let smallestDistance = Infinity;

    predefinedColors.forEach((color) => {
      const predefinedRgb = hexToRgb(color.hex);
      const distance = colorDistance(inputRgb, predefinedRgb);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        bestMatch = color;
      }
    });

    return bestMatch;
  };

  const handleFileChange = (event, setImage) => {
    const file = event.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]; // Allowed MIME types
  
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a JPG, JPEG or PNG image.");
        return;
      }
  
      setError(""); // Clear error if the file is valid
      setImage(file);
    }
  };
  

  const navigate = useNavigate(); // Added navigate hook
  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");

    if (!topImage || !bottomImage || !shoeImage) {
      setError("Please upload images for all clothing items.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("topImage", topImage);
    formData.append("bottomImage", bottomImage);
    formData.append("shoeImage", shoeImage);

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const matchedColors = {};
      for (const item in response.data) {
        const extractedHex = response.data[item];
        const match = findClosestColor(extractedHex);
        matchedColors[item] = {
          extracted: extractedHex,
          closestMatch: match.name,
          matchHex: match.hex
        };
      }

      setExtractedColors(matchedColors);

      // Navigate to the results page and pass the extracted colors
      navigate('/results', { state: { extractedColors: matchedColors } });

      const userId = "test_user_123"; // Replace with actual user ID from authentication
    await axios.post("http://127.0.0.1:5000/api/save-colors", {
      userId,
      extractedColors: matchedColors
    });

    } catch (error) {
      console.error("Analysis Error:", error);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Navigation Bar */}
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button variant="primary">About</Button></Link>
            <Link to="/home"><Button variant="primary">Home</Button></Link>
            <Link to="/savedcolors"><Button variant="primary">Saved Colors</Button></Link>
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>
      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
      <Card className="shadow-lg text-center mb-4" style={{ width: '30%', backgroundColor: 'rgba(10, 10, 40, 0.9)', color: 'white'}}>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: "3rem" }}>Upload Pictures</h2>
        </Card> 
        <Row className="w-100 justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg text-white" style={{ backgroundColor: "rgba(10, 10, 40, 0.9)" }}>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <form onSubmit={handleAnalyze}>
                  <Row className="mt-4">
                    {["Tops", "Bottoms", "Shoes"].map((category, index) => {
                      const setImage = index === 0 ? setTopImage : index === 1 ? setBottomImage : setShoeImage;
                      const image = index === 0 ? topImage : index === 1 ? bottomImage : shoeImage;
                      return (
                        <Col md={4} key={category}>
                          <Card className="p-3" style={{ backgroundColor: "#1A1A40" }}>
                            <h3 style={{ color: "white" }}>Upload {category}</h3>
                            <label className="custom-file-upload">
                                <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg" 
                                onChange={(event) => handleFileChange(event, setImage)} 
                            />
                            Choose file
                            </label>

                            {image && (
                              <>
                                <img src={URL.createObjectURL(image)} alt={`${category} preview`} style={{ width: "100%", height: "auto", marginTop: "10px" }} />
                                <Button variant="outline-danger" onClick={() => setImage(null)} className="mt-2">Remove</Button> 
                              </>
                            )}
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                  <div className="text-center mt-4">
                    <Button type="submit" className="btn-warning" disabled={loading || !topImage || !bottomImage || !shoeImage}>
                      {loading ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default UploadPage;
