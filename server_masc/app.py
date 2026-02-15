import streamlit as st
cv2 = None
try:
    import cv2
except ImportError:
    st.error("OpenCV is not installed. Please install 'opencv-python-headless'.")
import numpy as np
from ultralytics import YOLO
from PIL import Image
import time
import os

# --- CONFIGURATION ---
st.set_page_config(
    page_title="MASC Neural Vision Pro",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Premium Dark Theme
st.markdown("""
<style>
    .stApp {
        background-color: #020617;
        color: #f8fafc;
    }
    [data-testid="stSidebar"] {
        background-color: #0f172a;
        border-right: 1px solid #1e293b;
    }
    .stButton>button {
        width: 100%;
        border-radius: 12px;
        height: 3.5em;
        background-color: #7c3aed;
        color: white;
        font-weight: 800;
        border: none;
        transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    .stButton>button:hover {
        background-color: #8b5cf6;
        box-shadow: 0 0 25px rgba(124, 58, 237, 0.4);
        transform: translateY(-2px);
    }
    .status-live {
        color: #4ade80;
        font-weight: 900;
        font-size: 0.85em;
        background: rgba(74, 222, 128, 0.1);
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(74, 222, 128, 0.2);
    }
    .instruction-card {
        background: rgba(124, 58, 237, 0.05);
        padding: 15px;
        border-radius: 12px;
        border: 1px dashed rgba(124, 58, 237, 0.3);
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# --- MODELS & LOGIC ---
@st.cache_resource
def load_model():
    # Attempt to find model file
    model_path = "yolov8n.pt"
    if not os.path.exists(model_path):
        # Local fallback if run from root
        model_path = os.path.join("server_masc", "yolov8n.pt")
        if not os.path.exists(model_path):
            model_path = "yolov8n.pt" # YOLO will download it automatically
    return YOLO(model_path)

model = load_model()

# User-specified target classes (might need custom weight if not in COCO)
TARGET_CLASSES = {
    32: "Cellotape",
    67: "Sharpener",
    79: "Pen"
}

# DEBUG: Show what standard COCO thinks these are if detection fails
COCO_FALLBACK = {
    32: "tie",
    67: "cell phone",
    79: "toothbrush"
}

COLOR_RANGES = {
    "Red": [([0, 100, 100], [10, 255, 255]), ([160, 100, 100], [180, 255, 255])],
    "Orange": [([11, 100, 100], [25, 255, 255])],
    "Yellow": [([26, 100, 100], [34, 255, 255])],
    "Green": [([35, 50, 50], [85, 255, 255])],
    "Blue": [([101, 50, 50], [130, 255, 255])],
    "White": [([0, 0, 200], [180, 50, 255])],
    "Black": [([0, 0, 0], [180, 255, 50])]
}

def identify_colors(frame):
    if cv2 is None: return []
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    detected = []
    total_pixels = frame.shape[0] * frame.shape[1]
    
    for color, boundaries in COLOR_RANGES.items():
        mask = None
        for (lower, upper) in boundaries:
            curr = cv2.inRange(hsv, np.array(lower), np.array(upper))
            mask = curr if mask is None else cv2.bitwise_or(mask, curr)
        
        perc = (cv2.countNonZero(mask) / total_pixels) * 100
        if perc > 1.5:
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                c = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(c)
                detected.append({"label": color, "percentage": round(perc, 1), "box": [x, y, x+w, y+h]})
    return sorted(detected, key=lambda x: x['percentage'], reverse=True)

# --- UI LAYOUT ---
with st.sidebar:
    st.image("https://img.icons8.com/nolan/128/artificial-intelligence.png", width=80)
    st.title("MASC SYSTEM")
    st.markdown("---")
    mode = st.radio("OPERATIONAL MODE", ["📦 OBJECT IDENTIFICATION", "🎨 COLOR CLASSIFICATION"])
    st.markdown("---")
    st.subheader("DEBUG SETTINGS")
    debug_mode = st.toggle("Show All Detected Objects", value=False)
    st.markdown("---")
    st.info("System Ver: 3.1.0\nEngine: YOLOv8-Nano")

st.title("MASC Neural Vision Dashboard")
st.markdown("<span class='status-live'>● SYSTEM_CORE_READY</span>", unsafe_allow_html=True)

st.markdown("""
<div class="instruction-card">
    <b>How to use:</b><br>
    1. Align the object in the camera frame below.<br>
    2. Click the <b>[Take Photo]</b> button inside the camera widget.<br>
    3. The AI will process that snapshot instantly and show results here.
</div>
""", unsafe_allow_html=True)

col1, col2 = st.columns([1.5, 1])

with col1:
    img_file = st.camera_input("OPTIC FEED")

with col2:
    st.subheader("Neural Analysis")
    if img_file:
        start_time = time.time()
        img = Image.open(img_file)
        frame = np.array(img)
        # Handle alpha if present
        if frame.shape[-1] == 4:
            frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2RGB)
        
        bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        if "OBJECT" in mode:
            # If debug mode is off, only filter for user's target classes
            classes_to_detect = None if debug_mode else list(TARGET_CLASSES.keys())
            results = model(bgr_frame, verbose=False, classes=classes_to_detect, conf=0.25)
            
            found = False
            for r in results:
                # Draw boxes for visual feedback
                annotated_frame = r.plot()
                st.image(annotated_frame, caption="AI Analysis Overlay", use_container_width=True)
                
                for box in r.boxes:
                    found = True
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    label = TARGET_CLASSES.get(cls_id, r.names[cls_id])
                    
                    if cls_id in TARGET_CLASSES:
                        st.success(f"🎯 **TARGET**: {label} ({round(conf*100)}%)")
                    else:
                        st.info(f"🔍 **AUTO-ID**: {label} ({round(conf*100)}%)")
            
            if not found:
                st.warning("⚠️ No objects matched the recognition profile.")
                if not debug_mode:
                    st.caption("Tip: Enable 'Show All Detected Objects' in the sidebar to see what the AI sees.")
        
        else:
            colors = identify_colors(bgr_frame)
            # Show original image for reference
            st.image(img, caption="Captured Frame", use_container_width=True)
            
            if colors:
                for c in colors:
                    st.write(f"🌈 **{c['label']}**: {c['percentage']}% coverage")
                    st.progress(min(c['percentage']/20, 1.0)) # Visual bar
            else:
                st.warning("⚠️ No dominant colors found in range.")
        
        latency = round((time.time() - start_time) * 1000)
        st.markdown(f"---")
        st.code(f"Latency: {latency}ms | Status: SUCCESS")
    else:
        st.info("Waiting for optic signal. Please click **'Take Photo'** above.")

st.markdown("---")
st.caption("MASC Project | Designed for Microscale Autonomous Sorting")
