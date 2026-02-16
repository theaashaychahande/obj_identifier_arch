
import React from 'react';

interface HeroProps {
  onGetStarted?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const scrollToTeam = () => {
    const teamSection = document.getElementById('team');
    if (teamSection) {
      const offset = 100; // Account for fixed navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = teamSection.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative pt-40 pb-24 px-8 md:px-16 overflow-hidden">
      <div className="max-w-[1600px] mx-auto text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-black mb-2 animate-pulse uppercase tracking-[0.3em]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Fine-Tuned YOLOv8-Nano Core
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
          Intelligent Sorting via <br />
          <span className="text-gradient">Neural Vision</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-5xl mx-auto leading-relaxed font-medium">
          The Microscale Autonomous Sorting Conveyor (MASC) showcases real-time <strong>Object Identification</strong> and <strong>Color Classification</strong> powered by custom-trained deep learning models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={scrollToTeam}
            className="w-full sm:w-auto px-10 py-4 bg-slate-900 border border-slate-800 hover:border-slate-600 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="mt-20 max-w-[1550px] mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden aspect-[21/8] shadow-2xl">
          <div className="h-10 border-b border-slate-800 flex items-center px-8 justify-between bg-slate-900/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
            </div>
            <div className="text-[10px] text-slate-600 font-mono tracking-[0.4em] uppercase font-black">SYSTEM_INTERFACE_ACTIVE</div>
            <div className="w-10"></div>
          </div>

          <div className="p-8 grid grid-cols-12 gap-8 h-full">
            <div className="col-span-3 space-y-6">
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-inner">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2">Confidence</div>
                <div className="text-2xl font-black text-green-400">98.7%</div>
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                </div>
              </div>
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-inner">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2">Latency</div>
                <div className="text-2xl font-black text-purple-400">38ms</div>
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-purple-500"></div>
                </div>
              </div>
            </div>
            <div className="col-span-6 bg-slate-900/40 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center">
              <div className="relative w-1/2 aspect-square border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-slate-900/90 rounded-2xl flex items-center justify-center text-[10px] font-mono text-slate-300 border border-slate-700 shadow-2xl">
                  OBJ_LIVE
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-purple-500 rounded-tl-sm"></div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-purple-500 rounded-br-sm"></div>
                </div>
              </div>
            </div>
            <div className="col-span-3 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-black mb-5 tracking-[0.2em]">Live Output</div>
              <div className="space-y-3 font-mono text-[10px] font-bold">
                <div className="text-green-400 bg-green-500/10 p-2 rounded border border-green-500/10 uppercase">Sharpener</div>
                <div className="text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/10 uppercase">CelloTape</div>
                <div className="text-blue-400 bg-blue-500/10 p-2 rounded border border-blue-500/10 uppercase">Pen</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
