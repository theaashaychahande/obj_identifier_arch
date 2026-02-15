import streamlit as st
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase, RTCConfiguration
import cv2
import numpy as np
import threading
import time

# --- CONFIGURATION ---
st.set_page_config(
    page_title="MASC Precision Vision",
    page_icon="🎯",
    layout="wide",
)

# Premium Dark CSS
st.markdown("""
<style>
    .stApp { background-color: #020617; color: #f8fafc; }
    [data-testid="stSidebar"] { background-color: #0f172a; border-right: 1px solid #1e293b; }
    .status-active { color: #10b981; font-weight: 900; background: rgba(16, 185, 129, 0.1); padding: 5px 15px; border-radius: 20px; border: 1px solid #10b981; }
    .info-box { background: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 12px; padding: 15px; margin-bottom: 20px; }
</style>
""", unsafe_allow_html=True)

# --- VISION ENGINE ---
class PrecisionVideoProcessor(VideoProcessorBase):
    def __init__(self):
        self.mode = "OBJECT ID"
        self.threshold = 100
        self.persistence = {} # {label: {"timestamp": time, "box": [x,y,w,h], "color": color}}
        self.last_results = []
        self._lock = threading.Lock()

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
            thresh_val = self.threshold

        # 1. Image Pre-processing (Advanced)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Use median blur to remove salt-and-pepper noise
        denoised = cv2.medianBlur(gray, 5)
        # Adaptive thresholding to handle lighting changes
        edged = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        
        # Cleanup small noise spikes
        kernel = np.ones((3,3), np.uint8)
        edged = cv2.morphologyEx(edged, cv2.MORPH_OPEN, kernel)

        temp_detections = []

        if "OBJECT" in current_mode:
            contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            frame_hits = {}

            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < 1500: continue # Ignore small debris

                # A. Get the Rotated Bounding Box (Much more accurate)
                rect = cv2.minAreaRect(cnt)
                box = cv2.boxPoints(rect)
                box = np.int64(box)
                
                # Get dimensions from the rotated rect
                (x_c, y_c), (w_r, h_r), angle = rect
                if w_r == 0 or h_r == 0: continue
                
                # Normalize aspect ratio (always longer side / shorter side)
                longer = max(w_r, h_r)
                shorter = min(w_r, h_r)
                aspect = longer / shorter
                
                # Circularity Check
                peri = cv2.arcLength(cnt, True)
                circularity = (4 * np.pi * area) / (peri * peri) if peri > 0 else 0
                
                label = None
                color = (255, 255, 255)

                # 1. SELLOTAPE (Highly Circular)
                if circularity > 0.75:
                    label = "Sellotape"
                    color = (22, 163, 74) # Green
                
                # 2. PEN (Extremely High Aspect Ratio)
                elif aspect > 4.5:
                    label = "Pen"
                    color = (37, 99, 235) # Blue
                
                # 3. SHARPENER (Rectangular but not thin)
                elif 1.1 < aspect < 2.5:
                    if circularity < 0.8: # Reject circles
                        label = "Sharpener"
                        color = (234, 179, 8) # Yellow

                if label:
                    # Target Locking: Draw the rotated box
                    cv2.drawContours(img, [box], 0, color, 3)
                    # Use standard x,y for text placement
                    sx, sy, sw, sh = cv2.boundingRect(cnt)
                    cv2.putText(img, label, (sx, sy-15), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 3)
                    
                    frame_hits[label] = {"timestamp": now, "color": color}

            # Update Persistence Logic (3s TTL)
            with self._lock:
                # Add new hits
                for l, d in frame_hits.items():
                    self.persistence[l] = d
                
                # Cleanup and prepare output
                final_labels = []
                expired = []
                for l, d in self.persistence.items():
                    if now - d['timestamp'] < 3.0:
                        final_labels.append(l)
                    else:
                        expired.append(l)
                
                for e in expired: del self.persistence[e]
                self.last_results = final_labels

        else:
            # COLOR MODE (User says it's already working, so we keep the logic clean)
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            color_ranges = {
                "Red": [([0, 150, 70], [10, 255, 255]), ([170, 150, 70], [180, 255, 255])],
                "Yellow": [([25, 120, 100], [35, 255, 255])],
                "Green": [([35, 100, 50], [85, 255, 255])],
                "Blue": [([95, 150, 50], [130, 255, 255])]
            }
            total = img.shape[0] * img.shape[1]
            found_colors = []
            for name, bounds in color_ranges.items():
                m = None
                for (ln, hn) in bounds:
                    mask = cv2.inRange(hsv, np.array(ln), np.array(hn))
                    m = mask if m is None else cv2.bitwise_or(m, mask)
                pc = (cv2.countNonZero(m) / total) * 100
                if pc > 4.0:
                    found_colors.append(f"{name} ({round(pc)}%)")
            with self._lock:
                self.last_results = found_colors

        return frame.from_ndarray(img, format="bgr24")

# --- UI INTERFACE ---
st.title("MASC Precision Core V5")
st.markdown("<span class='status-active'>● AI_ENGINE_ONLINE</span>", unsafe_allow_html=True)

with st.sidebar:
    st.image("https://img.icons8.com/nolan/128/artificial-intelligence.png", width=70)
    st.header("Vision Specs")
    app_mode = st.radio("Detector Hub", ["OBJECT ID", "COLOR ID"])
    st.markdown("---")
    st.subheader("Fine-Tuning")
    sensitivity = st.slider("Environmental Sensitivity", 50, 150, 100)
    st.markdown("---")
    st.info("Logic: Geometric minAreaRect Analysis\nStability: 3s Neural Lock")

st.markdown("""
<div class="info-box">
    <b>System Guidance:</b> Ensure your objects are placed on a <b>solid, contrasting background</b>. 
    The AI is currently tuned for <b>Sellotape</b> (Round), <b>Pens</b> (Long & Thin), and <b>Sharpeners</b> (Rectangular).
</div>
""", unsafe_allow_html=True)

# RTC Main
RTC_CONFIG = RTCConfiguration({"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]})

ctx = webrtc_streamer(
    key="masc-precision-v5",
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
    st.subheader("� Intelligence Log")
    if ctx.video_processor:
        res = ctx.video_processor.get_latest()
        if res:
            for r in sorted(list(set(res))):
                st.success(f"**LOCKED**: {r}")
        else:
            st.write("Awaiting target signal...")

with col2:
    st.subheader("� Process Diagnostics")
    if ctx.state.playing:
        st.write("🟢 STREAM_PLAYING")
        st.write("✔️ ADAPTIVE_THRESH_ACTIVE")
        st.write("✔️ GEOMETRIC_LOCK_ACTIVE")
    else:
        st.write("⚪ STANDBY_MODE")
