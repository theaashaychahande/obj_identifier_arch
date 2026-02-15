
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { TeamSection } from './components/TeamSection';
import { ProjectContext } from './components/ProjectContext';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  const goToDashboard = () => {
    const visionAppUrl = import.meta.env.VITE_VISION_APP_URL || 'https://masc-vision.onrender.com';
    window.location.href = visionAppUrl;
  };
  const goToHome = () => setView('landing');

  if (view === 'dashboard') {
    return <Dashboard onBack={goToHome} />;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 selection:bg-purple-500/30">
      {/* Background Decorative Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-purple-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <Navbar onGetStarted={goToDashboard} />
      <main>
        <Hero onGetStarted={goToDashboard} />
        <ProjectContext />
        <Features />
        <TeamSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default App;
