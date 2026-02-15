
import React from 'react';

const FEATURE_DATA = [
  {
    title: "YOLOv8-Nano Core",
    description: "State-of-the-art object detection architecture fine-tuned on custom datasets for micro-scale accuracy.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
      </svg>
    ),
    color: "from-blue-500/20 to-blue-600/20"
  },
  {
    title: "OpenCV HSV Processing",
    description: "Advanced color detection using robust masking techniques to identify Red, Green, and Yellow variants.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.37-9.37a2.121 2.121 0 113 3l-9.37 9.37a4.5 4.5 0 01-2.24 1.324l-4.04.808.808-4.04a4.5 4.5 0 011.324-2.24z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.5L16.5 9.75" />
      </svg>
    ),
    color: "from-purple-500/20 to-purple-600/20"
  },
  {
    title: "Sensor-Less Flow",
    description: "Purely vision-driven. We use high-speed image processing to trigger sorting instead of physical sensors.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "from-green-500/20 to-green-600/20"
  },
  {
    title: "PyTorch Powered",
    description: "High-performance backend utilizing the PyTorch ecosystem for fast model inference and training.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: "from-indigo-500/20 to-indigo-600/20"
  },
  {
    title: "Custom Dataset Training",
    description: "Model fine-tuned on specific objects (Pen, Sharpener, Cellotape) to ensure zero false positives.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75m-16.5-3.75v3.75" />
      </svg>
    ),
    color: "from-red-500/20 to-red-600/20"
  },
  {
    title: "Real-time Metrics",
    description: "Live visualization of confidence scores and detection b-boxes using Matplotlib and Streamlit logic.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: "from-amber-500/20 to-amber-600/20"
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-8 md:px-16 bg-slate-950/50">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center max-w-5xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">
            Capabilities defined by <span className="text-gradient">ML Model</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-medium">Modern deep learning frameworks integrated with custom annotation workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {FEATURE_DATA.map((feature, idx) => (
            <div key={idx} className="group p-10 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-purple-400 mb-8 group-hover:scale-105 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-4 group-hover:text-purple-400 transition-colors text-white tracking-tight">{feature.title}</h3>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
