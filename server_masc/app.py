import streamlit as st
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase, RTCConfiguration
import cv2
import numpy as np
import threading
import time
import os
from ultralytics import YOLO

# --- CONFIGURATION ---
st.set_page_config(
    page_title="MASC Precision Core",
    page_icon="🎯",
    layout="wide",
)

# Robust STUN Servers for Cloud Connectivity
RTC_CONFIG = RTCConfiguration(
    {"iceServers": [
        {"urls": ["stun:stun.l.google.com:19302"]},
        {"urls": ["stun:stun1.l.google.com:19302"]},
        {"urls": ["stun:stun2.l.google.com:19302"]},
        {"urls": ["stun:stun3.l.google.com:19302"]},
        {"urls": ["stun:stun4.l.google.com:19302"]},
        {"urls": ["stun:global.stun.twilio.com:3478"]}
    ]}
)

# Custom Styling
st.markdown("""
<style>
    .stApp { background-color: #020617; color: #f8fafc; }
    [data-testid="stSidebar"] { background-color: #0f172a; border-right: 1px solid #1e293b; }
    .status-active { color: #10b981; font-weight: 900; background: rgba(16, 185, 129, 0.1); padding: 5px 15px; border-radius: 20px; border: 1px solid #10b981; }
    .info-box { background: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 12px; padding: 15px; margin-bottom: 20px; }
</style>
""", unsafe_allow_html=True)

# TARGET CLASSES MAPPING
TARGET_CLASSES = {
    32: "Cellotape",
    67: "Sharpener",
    79: "Pen"
}

# --- VISION ENGINE ---
class PrecisionVideoProcessor(VideoProcessorBase):
    def __init__(self):
        self.mode = "OBJECT ID"
        self.threshold = 100
        self.persistence = {} 
        self.last_results = []
        self._lock = threading.Lock()
        
        # Load YOLO Model
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yolov8n.pt')
        if not os.path.exists(model_path):
             model_path = 'yolov8n.pt' # Fallback
        self.model = YOLO(model_path)

    def update_params(self, mode, threshold):
        with self._lock:
            self.mode = mode
            self.threshold = threshold

    def get_latest(self):
        with self._lock:
            return self.last_results

    def recv(self, frame):
        img = frame.to_ndarray(format="bgr24")
        now = time.time()
        
        with self._lock:
            current_mode = self.mode

        if "OBJECT" in current_mode:
            results = self.model(img, stream=True, verbose=False, classes=list(TARGET_CLASSES.keys()), conf=0.3)
            frame_hits = {}
            for r in results:
                for box in r.boxes:
                    coords = box.xyxy[0].cpu().numpy().astype(int)
                    score = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    
                    if cls_id in TARGET_CLASSES:
                        label = TARGET_CLASSES[cls_id]
                        color = (37, 99, 235) if label == "Pen" else (22, 163, 74) if label == "Cellotape" else (234, 179, 8)
                        
                        cv2.rectangle(img, (coords[0], coords[1]), (coords[2], coords[3]), color, 3)
                        cv2.putText(img, f"{label} {score:.2f}", (coords[0], coords[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 3)
                        frame_hits[label] = {"timestamp": now, "color": color}

            with self._lock:
                for l, d in frame_hits.items(): self.persistence[l] = d
                final_labels = []
                expired = []
                for l, d in self.persistence.items():
                    if now - d['timestamp'] < 3.0: final_labels.append(l)
                    else: expired.append(l)
                for e in expired: del self.persistence[e]
                self.last_results = final_labels
        else:
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
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
                "White": [([0, 0, 200], [180, 30, 255])],
                "Black": [([0, 0, 0], [180, 255, 40])]
            }
            total = img.shape[0] * img.shape[1]
            found_colors = []
            for name, bounds in color_ranges.items():
                m = None
                for (ln, hn) in bounds:
                    mask = cv2.inRange(hsv, np.array(ln), np.array(hn))
                    m = mask if m is None else cv2.bitwise_or(m, mask)
                pc = (cv2.countNonZero(m) / total) * 100
                if pc > 2.0: 
                    found_colors.append(f"{name} ({round(pc)}%)")
                    # Draw highlight for the color
                    contours, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    if contours:
                        largest = max(contours, key=cv2.contourArea)
                        if cv2.contourArea(largest) > 500:
                            x, y, w, h = cv2.boundingRect(largest)
                            cv2.rectangle(img, (x, y), (x+w, y+h), (255, 255, 255), 1)
                            cv2.putText(img, name, (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            with self._lock: self.last_results = found_colors

        return frame.from_ndarray(img, format="bgr24")

        return frame.from_ndarray(img, format="bgr24")

# --- UI INTERFACE ---
st.title("MASC Precision Core V6")
st.markdown("<span class='status-active'>● ENGINE_STATUS_STABLE</span>", unsafe_allow_html=True)

with st.sidebar:
    st.image("https://img.icons8.com/nolan/128/artificial-intelligence.png", width=70)
    st.header("Vision Specs")
    app_mode = st.radio("Detector Hub", ["OBJECT ID", "COLOR ID"])
    st.markdown("---")
    sensitivity = st.slider("Environmental Sensitivity", 50, 150, 100)
    st.markdown("---")
    st.info("System: Full WebRTC Stack\nConnectivity: Multi-STUN Enabled")

# UNIQUE KEY PER SESSION TO PREVENT CRASH
ctx = webrtc_streamer(
    key=f"masc-v6-{st.session_state.get('run_id', 0)}",
    video_processor_factory=PrecisionVideoProcessor,
    rtc_configuration=RTC_CONFIG,
    media_stream_constraints={"video": True, "audio": False},
    async_processing=True
)

if ctx.video_processor:
    ctx.video_processor.update_params(app_mode, sensitivity)

st.divider()
col1, col2 = st.columns(2)
with col1:
    st.subheader("🧠 Intelligence Log")
    if ctx.video_processor:
        res = ctx.video_processor.get_latest()
        if res:
            for r in sorted(list(set(res))): st.success(f"**LOCKED**: {r}")
        else: st.write("Awaiting target signal...")
with col2:
    st.subheader("📊 System Telemetry")
    if ctx.state.playing:
        st.write("🟢 STREAM_PLAYING")
    else:
        st.write("⚪ STANDBY_MODE")
        if st.button("🔄 Reset Stream Session"):
            st.session_state['run_id'] = st.session_state.get('run_id', 0) + 1
            st.rerun()
