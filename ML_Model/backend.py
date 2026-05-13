from flask import Flask, request, jsonify
from flask_cors import CORS

from ultralytics import YOLO

import numpy as np
from PIL import Image
import base64
from io import BytesIO
import os

print("🚀 Flask starting...")

app = Flask(__name__)
CORS(app)

print("Files in current directory:", os.listdir())

# 🔥 Load YOLOv8 model
model = YOLO("model/best.pt")

@app.route("/")
def home():
    return "✅ DermAI YOLO Backend Running"


@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("📩 Request received")

        data = request.get_json()

        if not data or 'image_url' not in data:
            return jsonify({"error": "No image provided"}), 400

        image_data = data['image_url']

        # Remove base64 header
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]

        # Decode image
        image_bytes = base64.b64decode(image_data)

        # Open image
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

        # Convert to numpy array
        img = np.array(image)

        print("🧠 Running prediction...")

        # YOLO prediction
        results = model.predict(img, verbose=False)

        probs = results[0].probs

        disease = results[0].names[probs.top1]
        confidence = float(probs.top1conf) * 100

        print("✅ Prediction complete")

        return jsonify({
            "disease": disease,
            "confidence": round(confidence, 1)
        })

    except Exception as e:
        print("❌ Error:", e)

        return jsonify({
            "error": str(e)
        }), 500


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)