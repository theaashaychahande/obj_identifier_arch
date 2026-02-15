
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onGetStarted?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-slate-800 py-3' : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-8 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-black text-2xl tracking-tight text-white">MASC<span className="text-purple-500">.</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-16 text-sm font-bold text-white uppercase tracking-[0.25em]">
          <a 
            href="#features" 
            onClick={(e) => handleNavClick(e, 'features')}
            className="hover:text-purple-400 transition-colors"
          >
            Features
          </a>
          <a 
            href="#project" 
            onClick={(e) => handleNavClick(e, 'project')}
            className="hover:text-purple-400 transition-colors"
          >
            Project
          </a>
          <a 
            href="#team" 
            onClick={(e) => handleNavClick(e, 'team')}
            className="hover:text-purple-400 transition-colors"
          >
            Team
          </a>
          <a 
            href="#faq" 
            onClick={(e) => handleNavClick(e, 'faq')}
            className="hover:text-purple-400 transition-colors"
          >
            FAQ
          </a>
        </div>

        <div>
          <button 
            onClick={onGetStarted}
            className="px-10 py-3 bg-white text-slate-950 rounded-full text-base font-black hover:bg-purple-50 hover:scale-105 transition-all shadow-xl active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};
