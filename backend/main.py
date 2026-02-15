from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from ultralytics import YOLO
import io
from PIL import Image

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model
model = YOLO('backend/yolov8n.pt')

# Target classes mapping
TARGET_CLASSES = {
    32: "Cellotape",
    67: "Sharpener",
    79: "Pen"
}

@app.get("/")
async def root():
    return {"message": "MASC Detection API V2.3.0 is running"}

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Invalid image"}

    # Run detection with high confidence for accuracy
    results = model(frame, stream=True, verbose=False, classes=list(TARGET_CLASSES.keys()), conf=0.4)
    detections = []

    for r in results:
        for box in r.boxes:
            coords = box.xyxy[0].cpu().numpy().astype(int)
            score = float(box.conf[0])
            cls_id = int(box.cls[0])
            
            if cls_id in TARGET_CLASSES:
                detections.append({
                    "label": TARGET_CLASSES[cls_id],
                    "confidence": score,
                    "box": [int(x) for x in coords]
                })

    return {"detections": detections}

@app.post("/detect-colors")
async def identify_colors(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Invalid image"}

    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Comprehensive color ranges in HSV
    color_ranges = {
        "Red": [([0, 100, 100], [10, 255, 255]), ([160, 100, 100], [180, 255, 255])],
        "Orange": [([11, 100, 100], [25, 255, 255])],
        "Yellow": [([26, 100, 100], [34, 255, 255])],
        "Green": [([35, 50, 50], [85, 255, 255])],
        "Cyan": [([86, 50, 50], [100, 255, 255])],
        "Blue": [([101, 50, 50], [130, 255, 255])],
        "Violet": [([131, 50, 50], [145, 255, 255])],
        "Magenta": [([146, 50, 50], [165, 255, 255])],
        "Pink": [([166, 50, 50], [180, 100, 255])],
        "Brown": [([10, 100, 20], [20, 255, 200])],
        "White": [([0, 0, 200], [180, 30, 255])],
        "Gray": [([0, 0, 50], [180, 30, 199])],
        "Black": [([0, 0, 0], [180, 255, 49])]
    }

    detected_colors = []
    total_pixels = frame.shape[0] * frame.shape[1]

    for color_name, boundaries in color_ranges.items():
        mask = None
        for (lower, upper) in boundaries:
            curr_mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            mask = curr_mask if mask is None else cv2.bitwise_or(mask, curr_mask)
        
        count = cv2.countNonZero(mask)
        percentage = (count / total_pixels) * 100
        
        if percentage > 1.0:
            # Find the largest region of this color
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(largest_contour)
                detected_colors.append({
                    "label": color_name,
                    "percentage": round(percentage, 2),
                    "box": [int(x), int(y), int(x+w), int(y+h)]
                })

    detected_colors.sort(key=lambda x: x["percentage"], reverse=True)
    return {"colors": detected_colors}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
