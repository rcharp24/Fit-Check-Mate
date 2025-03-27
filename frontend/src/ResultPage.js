import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function ResultsPage() {
  const location = useLocation();
  const { extractedColors } = location.state || {};

  return (
    <div>
        <Row className="text-center pt-4">
            <nav>
            <div className="d-flex justify-content-center gap-3">
                <Link to="/about"><Button variant="primary">About</Button></Link>
                <Link to="/home"><Button variant="primary">Home</Button></Link>
                <Link to="/logout"><Button variant="primary">Logout</Button></Link>
            </div>
            </nav>
        </Row>
        <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Row className="w-100 justify-content-center">
            <Col md={8} lg={6}>
            <Card className="w-100 shadow-lg text-white" style={{ backgroundColor: "rgba(10, 10, 40, 0.9)" }}>
                <Card.Body>
                <h4 className="text-center mb-4">Analysis Results</h4>

                {extractedColors ? (
                    <Row>
                    {["topImage", "bottomImage", "shoeImage"].map((item) => (
                        <Col key={item} md={4}>
                        <Card className="p-3 text-center">
                            <div
                            style={{ backgroundColor: extractedColors[item]?.extracted, height: "50px" }}
                            ></div>
                            <p><strong>Extracted: </strong> {extractedColors[item]?.extracted}</p>
                            <div
                            style={{ backgroundColor: extractedColors[item]?.matchHex, height: "50px" }}
                            ></div>
                            <p><strong> Closest Match: </strong> {extractedColors[item]?.closestMatch} : {extractedColors[item]?.matchHex}</p>
                        </Card>
                        </Col>
                    ))}
                    </Row>
                ) : (
                    <p>No data available. Please go back and try again.</p>
                )}

                <div className="text-center mt-4">
                    <Button variant="outline-warning" href="/upload">
                    Go Back to Upload
                    </Button>
                </div>
                </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
    </div>
  );
}

export default ResultsPage;
