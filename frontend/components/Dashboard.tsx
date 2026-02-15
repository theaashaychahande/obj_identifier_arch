import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DashboardProps {
  onBack: () => void;
}

type Tab = 'object' | 'color';

interface Detection {
  label: string;
  confidence: number;
  box: [number, number, number, number];
  lastSeen: number;
}

interface ColorDetection {
  label: string;
  percentage: number;
  box: [number, number, number, number];
  lastSeen: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('object');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [colorDetections, setColorDetections] = useState<ColorDetection[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const STABILITY_TTL = 2000; // Keep detections on screen for 2 seconds after last seen

  const colorsConfig: Record<string, string> = {
    "Red": "#ef4444",
    "Orange": "#f97316",
    "Yellow": "#eab308",
    "Green": "#22c55e",
    "Cyan": "#06b6d4",
    "Blue": "#3b82f6",
    "Violet": "#8b5cf6",
    "Magenta": "#d946ef",
    "Pink": "#f472b6",
    "Brown": "#78350f",
    "White": "#ffffff",
    "Gray": "#94a3b8",
    "Black": "#000000"
  };

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setIsVisionEnabled(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access to use the vision system.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setIsVisionEnabled(false);
      setDetections([]);
      setColorDetections([]);
    }
  };

  const sendFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive || !isVisionEnabled) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');

        const startTime = performance.now();
        const endpoint = activeTab === 'object' ? 'detect' : 'detect-colors';

        try {
          const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          const now = Date.now();

          if (!isBackendConnected) setIsBackendConnected(true);

          if (activeTab === 'object') {
            setDetections(prev => {
              const newDetections = (data.detections || []).map((d: any) => ({ ...d, lastSeen: now }));
              // Merge with persistence: Update existing ones, keep older ones if within TTL
              const updated = [...newDetections];
              prev.forEach(old => {
                const isExpired = now - old.lastSeen > STABILITY_TTL;
                const alreadyUpdated = updated.some(u => u.label === old.label);
                if (!isExpired && !alreadyUpdated) {
                  updated.push(old);
                }
              });
              return updated;
            });
          } else {
            setColorDetections(prev => {
              const newColors = (data.colors || []).map((c: any) => ({ ...c, lastSeen: now }));
              const updated = [...newColors];
              prev.forEach(old => {
                const isExpired = now - old.lastSeen > STABILITY_TTL / 2; // Color prevalence changes faster
                const alreadyUpdated = updated.some(u => u.label === old.label);
                if (!isExpired && !alreadyUpdated) {
                  updated.push(old);
                }
              });
              return updated;
            });
          }

          setInferenceTime(Math.round(performance.now() - startTime));
        } catch (err) {
          console.error("Backend unreachable:", err);
        }
      }, 'image/jpeg', 0.8);
    }
  }, [isCameraActive, isVisionEnabled, activeTab]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCameraActive && isVisionEnabled) {
      interval = setInterval(sendFrame, 250); // Steady 4 FPS for stability
    }
    return () => clearInterval(interval);
  }, [isCameraActive, isVisionEnabled, sendFrame]);

  // Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        setIsBackendConnected(res.ok);
      } catch {
        setIsBackendConnected(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [API_URL]);

  useEffect(() => {
    const cleaner = setInterval(() => {
      const now = Date.now();
      setDetections(prev => prev.filter(d => now - d.lastSeen <= STABILITY_TTL));
      setColorDetections(prev => prev.filter(c => now - c.lastSeen <= STABILITY_TTL / 2));
    }, 500);
    return () => clearInterval(cleaner);
  }, []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-8 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">M</span>
          </div>
          <span className="font-black text-2xl tracking-tight text-white uppercase">MASC</span>
        </div>

        <nav className="flex-grow p-6 space-y-2">
          <button
            onClick={() => { setActiveTab('object'); setDetections([]); setColorDetections([]); }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold uppercase tracking-widest text-xs ${activeTab === 'object' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Object ID
          </button>
          <button
            onClick={() => { setActiveTab('color'); setDetections([]); setColorDetections([]); }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold uppercase tracking-widest text-xs ${activeTab === 'color' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Color ID
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button
            onClick={onBack}
            className="w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-12 bg-slate-950 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">
              {activeTab === 'object' ? 'Object Identification' : 'Color Identification'}
            </h2>
            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
              MASC Neural Engine V2.3.0
            </p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Backend Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isBackendConnected === true ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                isBackendConnected === false ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                  'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isBackendConnected === true ? 'bg-green-400' : isBackendConnected === false ? 'bg-red-400' : 'bg-slate-600'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                {isBackendConnected === true ? 'Backend Live' : isBackendConnected === false ? 'Backend Offline' : 'Checking...'}
              </span>
            </div>

            {!isVisionEnabled ? (
              <button
                onClick={startCamera}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Initialize Vision System
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-8 py-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Stop Vision System
              </button>
            )}
          </div>
        </header>

        <div className="max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Vision Feed */}
            <div className="lg:col-span-2 space-y-8">
              <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-auto ${!isCameraActive ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay for Object/Color Bounding Boxes */}
                {isVisionEnabled && (
                  <div className="absolute inset-0 pointer-events-none">
                    {activeTab === 'object' ? (
                      detections.map((det, i) => {
                        const box = det.box;
                        const isStale = Date.now() - det.lastSeen > 500;
                        return (
                          <div
                            key={i}
                            className={`absolute border-2 rounded-lg border-purple-500 transition-opacity duration-300 ${isStale ? 'opacity-40' : 'opacity-100'}`}
                            style={{
                              left: `${(box[0] / 640) * 100}%`,
                              top: `${(box[1] / 480) * 100}%`,
                              width: `${((box[2] - box[0]) / 640) * 100}%`,
                              height: `${((box[3] - box[1]) / 480) * 100}%`,
                            }}
                          >
                            <div className="absolute -top-6 left-0 bg-slate-900/80 text-[10px] font-black px-2 py-0.5 rounded-t-md text-white whitespace-nowrap uppercase tracking-tighter">
                              {det.label} | STABLE
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      colorDetections.map((color, i) => {
                        const box = color.box;
                        const colorHex = colorsConfig[color.label] || '#fff';
                        if (!box) return null;
                        return (
                          <div
                            key={i}
                            className="absolute border-2 rounded-xl transition-all duration-500"
                            style={{
                              left: `${(box[0] / 640) * 100}%`,
                              top: `${(box[1] / 480) * 100}%`,
                              width: `${((box[2] - box[0]) / 640) * 100}%`,
                              height: `${((box[3] - box[1]) / 480) * 100}%`,
                              borderColor: colorHex,
                              boxShadow: `0 0 15px ${colorHex}40`
                            }}
                          >
                            <div
                              className="absolute -top-6 left-0 text-[10px] font-black px-2 py-0.5 rounded-t-md text-white whitespace-nowrap uppercase tracking-widest"
                              style={{ backgroundColor: `${colorHex}CC` }}
                            >
                              {color.label} REGION
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {!isVisionEnabled && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-center p-12">
                    <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 mb-8 border border-slate-700">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Vision Interface Ready</h3>
                    <p className="text-slate-500 font-bold max-w-sm leading-relaxed uppercase text-[10px] tracking-widest">
                      Neural stability layer is active. Press initialize to begin high-precision scanning.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Stats and Results */}
            <div className="space-y-6">
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-xl">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-4">Neural Metrics</div>
                <div className={`text-sm font-black flex items-center gap-3 ${isVisionEnabled ? 'text-green-400' : 'text-slate-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${isVisionEnabled ? 'bg-green-400 animate-pulse' : 'bg-slate-700'}`} />
                  {isVisionEnabled ? 'STABLE_TRACKING' : 'IDLE_WAIT'}
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Persistence</span>
                    <span className="text-[10px] font-black uppercase text-purple-400">{STABILITY_TTL}ms TTL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Latency</span>
                    <span className="text-[10px] font-black uppercase text-white">{inferenceTime}ms</span>
                  </div>
                </div>
              </div>

              {activeTab === 'object' ? (
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4">Tracking Log</div>
                  {detections.length > 0 ? (
                    detections.sort((a, b) => b.lastSeen - a.lastSeen).map((det, i) => (
                      <div key={i} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 group hover:border-purple-500/30 transition-all">
                        <h4 className="text-sm font-black text-white uppercase tracking-tighter mb-1">{det.label}</h4>
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Status: {Date.now() - det.lastSeen < 300 ? 'Live' : 'Cached (TTL)'}</span>
                          <span className="text-[10px] font-black text-purple-400">{Math.round(det.confidence * 100)}% PRESENCE</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 border border-dashed border-slate-800 rounded-3xl text-center">
                      <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">No signals in queue</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 sticky top-0 bg-slate-950 py-2">Color Vectors</div>
                  {colorDetections.length > 0 ? (
                    colorDetections.map((color, i) => {
                      const colorHex = colorsConfig[color.label] || '#fff';
                      return (
                        <div key={i} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 mb-2">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: colorHex }} />
                            <h4 className="text-xs font-black text-white uppercase tracking-tighter">{color.label}</h4>
                            <span className="ml-auto text-[10px] font-black text-slate-400">{color.percentage}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full" style={{ width: `${color.percentage}%`, backgroundColor: colorHex }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 border border-dashed border-slate-800 rounded-3xl text-center">
                      <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Awaiting chroma feed...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
