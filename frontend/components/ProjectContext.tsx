
import React from 'react';

export const ProjectContext: React.FC = () => {
  return (
    <section id="project" className="py-24 px-8 md:px-16 relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Project Specification
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-white tracking-tighter">
              Bridging Mechanical Design <br />
              with Deep Learning
            </h2>
            <div className="space-y-6 max-w-3xl">
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                  Developed by <strong>4th Semester Mechanical Engineering students</strong> of 
                  <span className="text-white"> St. Vincent Pallotti College of Engineering and Technology, Nagpur</span>.
                </p>
                <p className="text-base text-slate-400 leading-relaxed">
                  Our project leverages high-performance Computer Vision (OpenCV) and fine-tuned YOLOv8 models to identify and sort objects based on visual characteristics, completely bypassing the need for physical sensors.
                </p>
            </div>
            <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-3xl shadow-xl relative group overflow-hidden max-w-2xl">
               <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <h4 className="text-sm font-black text-white mb-3 flex items-center gap-3 uppercase tracking-widest">
                 <span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span>
                 Stack Implementation
               </h4>
               <p className="text-sm text-slate-400 leading-relaxed font-mono font-bold">
                 Python, YOLOv8 (Ultralytics), PyTorch, OpenCV, NumPy, Pandas, Matplotlib, Google Colab
               </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[120px] rounded-full"></div>
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-white uppercase tracking-tighter">
                <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12h9.75" />
                </svg>
                Processing Workflow
             </h3>
             <div className="space-y-8 relative">
                {[
                  { step: "01", title: "Select Mode", desc: "Choose between Color Detection or Object Detection modes." },
                  { step: "02", title: "Target Identification", desc: "Select specific target (e.g. Red/Yellow or Pen/Sharpener)." },
                  { step: "03", title: "Visual Observation", desc: "System captures real-time frames from the conveyor line." },
                  { step: "04", title: "AI Inference", desc: "Fine-tuned YOLOv8-Nano model processes pixels for detection." },
                  { step: "05", title: "Sorting Decision", desc: "Logic identifies matches and triggers diverter pathways." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start group/step">
                    <div className="text-sm font-mono text-purple-500 font-black bg-purple-500/10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/step:bg-purple-500 group-hover/step:text-white transition-all shadow-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-100 text-lg mb-0.5 tracking-tight">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
