import requests
import base64

print("Starting test...")

image_path = "test.jpg"

try:
    with open(image_path, "rb") as f:
        img = base64.b64encode(f.read()).decode()
    print("Image loaded")
except Exception as e:
    print("Image error:", e)
    exit()

try:
    print("Sending request...")
    res = requests.post(
        "http://127.0.0.1:5002/predict",
        json={"image_url": img},
        headers={"Content-Type": "application/json"},
        timeout=10
    )

    print("Response received")
    print("Status:", res.status_code)
    print("Output:", res.text)

except Exception as e:
    print("Request error:", e)