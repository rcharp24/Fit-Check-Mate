from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/analyze", methods=["POST"])
def analyze():
    try:
        # Simulated response
        return jsonify({
            "topImage": {"extracted": "#FF5733"},
            "bottomImage": {"extracted": "#33FF57"},
            "shoeImage": {"extracted": "#3357FF"}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
