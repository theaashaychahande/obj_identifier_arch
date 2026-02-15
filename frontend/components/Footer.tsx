
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-20 pb-12 px-8 border-t border-slate-900 bg-slate-950">
      <div className="max-w-[1600px] mx-auto flex flex-col items-center text-center gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-center">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-2xl">
              <span className="text-white font-black text-lg">M</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-white uppercase">MASC.</span>
          </div>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase">
            Microscale Autonomous Sorting Conveyor
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-black text-purple-500 uppercase tracking-[0.6em] text-[10px]">Institution</h4>
          <p className="text-2xl md:text-3xl font-black text-white leading-tight">
            St. Vincent Pallotti College of Engineering and Technology, Nagpur
          </p>
          <p className="text-slate-600 text-xs uppercase tracking-[0.3em] font-black pt-1">Mechanical Engineering Department</p>
        </div>

        <div className="w-full pt-10 mt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-black text-slate-700">
          <p>&copy; {new Date().getFullYear()} MASC Project Team | SVPCET Nagpur</p>
          <p>Micro-Project Demo</p>
        </div>
      </div>
    </footer>
  );
};
