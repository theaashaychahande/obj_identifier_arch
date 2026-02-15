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

# Target classes mapping (from original app.py)
# 32: sports ball -> Cellotape
# 67: cell phone -> Sharpener
# 79: toothbrush -> Pen
TARGET_CLASSES = {
    32: "Cellotape",
    67: "Sharpener",
    79: "Pen"
}

def detect_color(image_crop):
    if image_crop is None or image_crop.size == 0:
        return "Unknown"

    hsv = cv2.cvtColor(image_crop, cv2.COLOR_BGR2HSV)
    
    # Color ranges
    lower_red1, upper_red1 = np.array([0, 120, 70]), np.array([10, 255, 255])
    lower_red2, upper_red2 = np.array([170, 120, 70]), np.array([180, 255, 255])
    lower_yellow, upper_yellow = np.array([20, 100, 100]), np.array([32, 255, 255])
    lower_green, upper_green = np.array([35, 80, 60]), np.array([90, 255, 255])

    mask_red = cv2.inRange(hsv, lower_red1, upper_red1) + cv2.inRange(hsv, lower_red2, upper_red2)
    mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)
    mask_green = cv2.inRange(hsv, lower_green, upper_green)

    counts = {
        "Red": cv2.countNonZero(mask_red),
        "Yellow": cv2.countNonZero(mask_yellow),
        "Green": cv2.countNonZero(mask_green)
    }

    dominant = max(counts, key=counts.get)
    
    # 1% threshold
    if counts[dominant] > (image_crop.shape[0] * image_crop.shape[1] * 0.01):
        return dominant
    return "Neutral"

@app.get("/")
async def root():
    return {"message": "MASC Detection API is running"}

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Invalid image"}

    results = model(frame, stream=True, verbose=False, classes=list(TARGET_CLASSES.keys()))
    detections = []

    for r in results:
        for box in r.boxes:
            coords = box.xyxy[0].cpu().numpy().astype(int)
            score = float(box.conf[0])
            cls_id = int(box.cls[0])
            
            if cls_id in TARGET_CLASSES:
                obj_label = TARGET_CLASSES[cls_id]
                x1, y1, x2, y2 = coords
                crop = frame[y1:y2, x1:x2]
                color_id = detect_color(crop)
                
                detections.append({
                    "label": obj_label,
                    "color": color_id,
                    "confidence": score,
                    "box": [int(x1), int(y1), int(x2), int(y2)]
                })

    return {"detections": detections}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
