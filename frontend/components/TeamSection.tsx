
import React from 'react';

const TEAM_MEMBERS = [
  { name: "Aashay Chahande", role: " Mechanical 4th sem " },
  { name: "Ved Manapure", role: " Mechanical 4th sem " },
  { name: "Vansh Ramteke", role: " Mechanical 4th sem " },
  { name: "Uday chaudhary", role: " Mechanical 4th sem " },
  { name: "Vivek Bhelkar", role: " Mechanical 4th sem " }
];

export const TeamSection: React.FC = () => {
  return (
    <section id="team" className="py-24 px-8 md:px-16">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
          <div className="max-w-4xl space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase">Project <span className="text-gradient">Team</span></h2>
            <p className="text-lg md:text-xl text-slate-400 font-medium">The 4th SEM Mechanical Engineering students behind MASC.</p>
          </div>
          <div className="hidden lg:block text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black mb-1">SVPCET Nagpur</p>
             <p className="text-xl font-black text-white uppercase tracking-tighter">Mechanical Dept.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className="relative group p-8 md:p-10 rounded-3xl bg-slate-900 border border-slate-800 hover:bg-slate-800/50 transition-all text-center hover:scale-105">
              <div className="w-14 h-14 bg-purple-600/10 text-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center font-black text-xl transition-all group-hover:bg-purple-600 group-hover:text-white">
                {member.name.charAt(0)}
              </div>
              <h4 className="font-black text-lg mb-1 text-white tracking-tight">{member.name}</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">{member.role}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 p-12 md:p-16 rounded-[3.5rem] bg-gradient-to-br from-indigo-600/10 via-slate-900/40 to-purple-600/10 border border-indigo-500/20 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10"></div>
            <h3 className="text-[10px] text-purple-400 uppercase tracking-[0.5em] font-black mb-4">Under the Guidance of</h3>
            <p className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter group-hover:text-purple-300 transition-colors">Prof. Pramod Borle</p>
            <p className="text-xl md:text-2xl text-slate-400 italic font-medium mb-3">Department of Mechanical Engineering</p>
            <p className="text-sm md:text-base text-slate-500 mt-6 max-w-4xl mx-auto leading-relaxed">St. Vincent Pallotti College of Engineering and Technology, Nagpur</p>
        </div>
      </div>
    </section>
  );
};
