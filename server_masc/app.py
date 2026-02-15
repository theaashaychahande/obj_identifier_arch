import streamlit as st
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image
import time

# --- CONFIGURATION ---
st.set_page_config(
    page_title="MASC Neural Vision",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Premium Dark Theme
st.markdown("""
<style>
    .main {
        background-color: #020617;
        color: #f8fafc;
    }
    .stButton>button {
        width: 100%;
        border-radius: 12px;
        height: 3em;
        background-color: #7c3aed;
        color: white;
        font-weight: bold;
        border: none;
        transition: 0.3s;
    }
    .stButton>button:hover {
        background-color: #8b5cf6;
        box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
    }
    .metric-card {
        background-color: #0f172a;
        padding: 20px;
        border-radius: 15px;
        border: 1px solid #1e293b;
    }
    .status-live {
        color: #4ade80;
        font-weight: 900;
        font-size: 0.8em;
    }
</style>
""", unsafe_allow_html=True)

# --- MODELS & LOGIC ---
@st.cache_resource
def load_model():
    return YOLO("yolov8n.pt")

model = load_model()

TARGET_CLASSES = {
    32: "Cellotape",
    67: "Sharpener",
    79: "Pen"
}

COLOR_RANGES = {
    "Red": [([0, 100, 100], [10, 255, 255]), ([160, 100, 100], [180, 255, 255])],
    "Orange": [([11, 100, 100], [25, 255, 255])],
    "Yellow": [([26, 100, 100], [34, 255, 255])],
    "Green": [([35, 50, 50], [85, 255, 255])],
    "Blue": [([101, 50, 50], [130, 255, 255])],
    "Purple": [([131, 50, 50], [160, 255, 255])],
    "White": [([0, 0, 200], [180, 30, 255])],
    "Black": [([0, 0, 0], [180, 255, 40])]
}

def identify_colors(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    detected = []
    total_pixels = frame.shape[0] * frame.shape[1]
    
    for color, boundaries in COLOR_RANGES.items():
        mask = None
        for (lower, upper) in boundaries:
            curr = cv2.inRange(hsv, np.array(lower), np.array(upper))
            mask = curr if mask is None else cv2.bitwise_or(mask, curr)
        
        perc = (cv2.countNonZero(mask) / total_pixels) * 100
        if perc > 1.0:
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                c = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(c)
                detected.append({"label": color, "percentage": round(perc, 1), "box": [x, y, x+w, y+h]})
    return detected

# --- UI LAYOUT ---
with st.sidebar:
    st.title("MASC ⚙️")
    st.markdown("---")
    mode = st.radio("SELECT MODE", ["OBJECT ID", "COLOR ID"])
    st.markdown("---")
    st.info("Vision Engine: V3.0 (Cloud Optimized)")

st.title("MASC Neural Vision Dashboard")
st.markdown("<span class='status-live'>● SYSTEM_LIVE</span>", unsafe_allow_html=True)

col1, col2 = st.columns([2, 1])

with col1:
    img_file = st.camera_input("INITIALIZE OPTIC SCANNER")

with col2:
    st.markdown("### NEURAL LOG")
    if img_file:
        start_time = time.time()
        img = Image.open(img_file)
        frame = np.array(img)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        if mode == "OBJECT ID":
            results = model(frame, verbose=False, classes=list(TARGET_CLASSES.keys()), conf=0.3)
            found = False
            for r in results:
                for box in r.boxes:
                    found = True
                    label = TARGET_CLASSES[int(box.cls[0])]
                    conf = float(box.conf[0])
                    st.success(f"**TARGET ACQUIRED**: {label} ({round(conf*100)}%)")
            if not found:
                st.warning("NO KNOWN OBJECTS IN FRAME")
        
        else:
            colors = identify_colors(frame)
            if colors:
                for c in colors:
                    st.info(f"**CHROMA DETECTED**: {c['label']} ({c['percentage']}%)")
            else:
                st.warning("NO DOMINANT COLORS DETECTED")
        
        latency = round((time.time() - start_time) * 1000)
        st.markdown(f"**INFERENCE TIME**: `{latency}ms`")
    else:
        st.write("Awaiting camera signal...")

st.markdown("---")
st.caption("Microscale Autonomous Sorting Conveyor AI - Powered by YOLOv8 & Streamlit")
