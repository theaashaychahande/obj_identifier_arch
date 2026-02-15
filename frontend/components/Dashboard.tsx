import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DashboardProps {
  onBack: () => void;
}

type Tab = 'object' | 'color';

interface Detection {
  label: string;
  color: string;
  confidence: number;
  box: [number, number, number, number];
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('object');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [inferenceTime, setInferenceTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);

  const colors = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Purple', hex: '#a855f7' }
  ];

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'object') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const sendFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

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
        try {
          const response = await fetch('http://localhost:8000/detect', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          setDetections(data.detections || []);
          setInferenceTime(Math.round(performance.now() - startTime));
        } catch (err) {
          console.error("Backend unreachable:", err);
        }
      }, 'image/jpeg', 0.8);
    }
  }, [isCameraActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCameraActive && activeTab === 'object') {
      interval = setInterval(sendFrame, 100); // 10 FPS
    }
    return () => clearInterval(interval);
  }, [isCameraActive, activeTab, sendFrame]);

  // Draw detection boxes on video overlay if needed
  // For simplicity, we'll just show the detections in cards below/beside

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
            onClick={() => setActiveTab('object')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold uppercase tracking-widest text-xs ${
              activeTab === 'object' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Object Identification
          </button>
          <button 
            onClick={() => setActiveTab('color')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold uppercase tracking-widest text-xs ${
              activeTab === 'color' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Color Identification
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
        
        <header className="mb-12">
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase mb-2">
            {activeTab === 'object' ? 'Object Identification' : 'Color Identification'}
          </h2>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
            MASC Deep Learning Engine V2.0.1
          </p>
        </header>

        <div className="max-w-5xl">
          {activeTab === 'object' ? (
            <div className="space-y-8">
              {/* Camera Feed Container */}
              <div className="relative bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Overlay for Detections (Visualized Boxes) */}
                <div className="absolute inset-0 pointer-events-none">
                  {detections.map((det, i) => {
                    const box = det.box;
                    // Note: This coordinate mapping assumes the video displays at its native resolution inside the container.
                    // For a truly responsive overlay, we'd need to scale the box coords based on video display vs native size.
                    return (
                      <div 
                        key={i}
                        className="absolute border-2 rounded-lg"
                        style={{
                          left: `${(box[0] / 640) * 100}%`,
                          top: `${(box[1] / 480) * 100}%`,
                          width: `${((box[2] - box[0]) / 640) * 100}%`,
                          height: `${((box[3] - box[1]) / 480) * 100}%`,
                          borderColor: det.color === 'Red' ? '#ef4444' : det.color === 'Yellow' ? '#eab308' : det.color === 'Green' ? '#22c55e' : '#a855f7'
                        }}
                      >
                        <div className="absolute -top-6 left-0 bg-slate-900/80 text-[10px] font-bold px-2 py-0.5 rounded-t-md text-white whitespace-nowrap">
                          {det.label} | {Math.round(det.confidence * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90">
                     <div className="w-20 h-20 bg-purple-600/10 rounded-3xl flex items-center justify-center text-purple-400 mb-6">
                        <svg className="w-10 h-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Initializing Vision Interface</h3>
                      <p className="text-slate-500 font-medium">Requesting camera access...</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2">Detection Status</div>
                  <div className="text-xl font-black text-green-400">
                    {detections.length > 0 ? `${detections.length} OBJECTS DETECTED` : isCameraActive ? 'MONITORING...' : 'INITIALIZING...'}
                  </div>
                </div>
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2">Inference Latency</div>
                  <div className="text-xl font-black text-white">{inferenceTime}ms</div>
                </div>
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2">Target Categories</div>
                  <div className="text-sm font-bold text-slate-400">Cellotape, Sharpener, Pen</div>
                </div>
              </div>

              {detections.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detections.map((det, i) => (
                    <div key={i} className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 group hover:border-purple-500/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-purple-400">{det.label}</span>
                        <span className="text-[10px] font-black bg-slate-800 px-2 py-1 rounded-lg text-slate-400">ID #{i+1}</span>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs">
                           <span className="text-slate-500 font-bold">Detected Color</span>
                           <span className="text-white font-black" style={{ color: det.color === 'Neutral' ? 'inherit' : det.color }}>{det.color}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-slate-500 font-bold">Confidence</span>
                           <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{ width: `${det.confidence * 100}%` }} />
                              </div>
                              <span className="text-white font-black">{Math.round(det.confidence * 100)}%</span>
                           </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full" />
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Select Target Identification Color</h3>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`group flex flex-col items-center gap-4 transition-all duration-300 ${
                        selectedColor === color.name ? 'scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div 
                        className="w-16 h-16 rounded-2xl shadow-xl border-4 transition-all duration-300"
                        style={{ 
                          backgroundColor: color.hex,
                          borderColor: selectedColor === color.name ? 'white' : 'transparent'
                        }}
                      />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedColor === color.name ? 'text-white' : 'text-slate-500'}`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] border-dashed flex flex-col items-center justify-center text-center">
                 {selectedColor ? (
                   <div className="space-y-4">
                     <div className="text-xs font-black text-purple-500 uppercase tracking-widest">Selected Target</div>
                     <h4 className="text-5xl font-black text-white uppercase tracking-tighter">MODE: {selectedColor}</h4>
                     <p className="text-slate-500 font-bold">Waiting for conveyor line visual feed to trigger sorting.</p>
                   </div>
                 ) : (
                   <p className="text-slate-600 font-bold uppercase tracking-[0.3em]">Please select a color to begin classification</p>
                 )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
