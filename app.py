import streamlit as st
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
import time

st.set_page_config(
    page_title="Sorting Conveyor AI Demo",
    layout="wide"
)

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    
    .main {
        background-color: #0f172a;
        font-family: 'Inter', sans-serif;
        color: #f8fafc;
    }
    .stApp {
        background-color: #0f172a;
    }
    header[data-testid="stHeader"] {
        background: rgba(15, 23, 42, 0.8);
    }
    .header-title {
        color: #38bdf8;
        font-weight: 700;
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
    }
    .result-card {
        padding: 1.5rem;
        border-radius: 12px;
        background-color: #1e293b;
        border: 1px solid #334155;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    }
    .result-card:hover {
        border-color: #38bdf8;
        transform: translateY(-2px);
    }
    .result-title {
        font-weight: 600;
        font-size: 1.1rem;
        color: #38bdf8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
    }
    .result-detail {
        font-size: 1rem;
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
        margin-top: 0.25rem;
    }
    .result-value {
        color: #f1f5f9;
        font-weight: 600;
    }
    .sidebar-section-title {
        color: #38bdf8;
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 1rem;
        margin-top: 2rem;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("<h1 class='header-title'>Microscale Autonomous Sorting Conveyor AI – Software Demo</h1>", unsafe_allow_html=True)
st.markdown("<p style='color: #64748b; font-size: 1.1rem;'>Software intelligence layer for automated object identification and sorting.</p>", unsafe_allow_html=True)
st.markdown("---")

@st.cache_resource
def load_model():
    try:
        return YOLO('yolov8n.pt') 
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

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

with st.sidebar:
    st.markdown("<p class='sidebar-section-title'>Control Dashboard</p>", unsafe_allow_html=True)
    st.file_uploader("Image Analysis", type=["jpg", "png"])
    
    input_tape = st.text_input("Object 1 Name", value="Cellotape")
    input_sharpener = st.text_input("Object 2 Name", value="Sharpener")
    input_pen = st.text_input("Object 3 Name", value="Pen")
    
    st.text_input("Custom Scale Reference (mm)")
    
    st.markdown("<p class='sidebar-section-title'>System Features</p>", unsafe_allow_html=True)
    st.info("Future Feature Coming Soon")
    st.markdown("---")
    st.markdown("<p style='color: #10b981; font-weight: 600;'>System Status: Online</p>", unsafe_allow_html=True)

# 32: sports ball, 67: cell phone, 79: toothbrush
TARGET_CLASSES = {
    32: input_tape,
    67: input_sharpener,
    79: input_pen
}

model = load_model()

col1, col2 = st.columns([1.8, 1])

with col1:
    st.markdown("<h3 style='font-size: 1.2rem; color: #94a3b8;'>Live Vision Intelligence Feed</h3>", unsafe_allow_html=True)
    frame_placeholder = st.empty()
    stop_op = st.button("Terminate Session")

with col2:
    st.markdown("<h3 style='font-size: 1.2rem; color: #94a3b8;'>Sort Processor Output</h3>", unsafe_allow_html=True)
    output_area = st.empty()

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    st.error("Hardware Alert: Unable to initialize primary camera interface.")
else:
    while not stop_op:
        success, frame = cap.read()
        if not success: break

        results = model(frame, stream=True, verbose=False, classes=list(TARGET_CLASSES.keys()))
        current_detections = []

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
                    
                    current_detections.append({
                        "label": obj_label,
                        "color": color_id,
                        "score": score
                    })

                    line_color = (192, 132, 252)
                    if color_id == "Red": line_color = (0, 0, 255)
                    elif color_id == "Yellow": line_color = (0, 255, 255)
                    elif color_id == "Green": line_color = (0, 255, 0)

                    cv2.rectangle(frame, (x1, y1), (x2, y2), line_color, 2)
                    cv2.putText(frame, f"{obj_label} | {color_id}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, line_color, 2)

        display_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame_placeholder.image(display_frame, use_container_width=True)

        with output_area.container():
            if not current_detections:
                st.markdown("<p style='color: #475569;'>Monitoring environment for target signatures...</p>", unsafe_allow_html=True)
            else:
                for obj in current_detections:
                    st.markdown(f"""
                    <div class="result-card">
                        <div class="result-title">{obj['label']}</div>
                        <div class="result-detail">
                            <span>Detected Color</span>
                            <span class="result-value">{obj['color']}</span>
                        </div>
                        <div class="result-detail">
                            <span>Confidence</span>
                            <span class="result-value">{obj['score']:.2%}</span>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
        
        time.sleep(0.01)

    cap.release()
    st.info("Session terminated.")
