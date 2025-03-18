from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/analyze', methods=['POST'])
def analyze_colors():
    return jsonify({"message": "API is working!"})

if __name__ == '__main__':
    app.run(debug=True)

