from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from colorthief import ColorThief

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def extract_primary_color(image_path):
    """Extracts the primary color from an image."""
    try:
        color_thief = ColorThief(image_path)
        dominant_color = color_thief.get_color(quality=1)  # (R, G, B)
        return "#{:02x}{:02x}{:02x}".format(*dominant_color)  # Convert to HEX
    except Exception as e:
        print("Color extraction error:", e)
        return None

@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "topImage" not in request.files or "bottomImage" not in request.files or "shoeImage" not in request.files:
        return jsonify({"error": "Missing one or more images"}), 400

    uploaded_colors = {}
    for clothing_item in ["topImage", "bottomImage", "shoeImage"]:
        image_file = request.files[clothing_item]
        if image_file:
            filename = secure_filename(image_file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            image_file.save(filepath)

            extracted_color = extract_primary_color(filepath)
            if extracted_color:
                uploaded_colors[clothing_item] = extracted_color

    return jsonify(uploaded_colors)

if __name__ == "__main__":
    app.run(debug=True)
