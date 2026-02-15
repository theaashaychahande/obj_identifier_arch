
import React, { useState } from 'react';

const FAQS = [
  {
    question: "How does the sorting logic work?",
    answer: "The system uses a fine-tuned YOLOv8-Nano model. It classifies objects in the video stream and uses OpenCV's HSV color space analysis to filter by color properties, making a sorting decision in under 40 milliseconds."
  },
  {
    question: "Which objects can the system currently identify?",
    answer: "We have fine-tuned our model on a custom dataset specifically featuring Cellotape, Sharpeners, and Pens for this academic demonstration."
  },
  {
    question: "Does it use any physical sensors for detection?",
    answer: "No. The project is designed to be purely vision-based. We use high-tech image processing and AI to identify material and object types without relying on traditional IR or proximity sensors."
  },
  {
    question: "How was the AI model trained?",
    answer: "The model was trained in a Google Colab GPU environment using PyTorch. We curated a custom dataset, annotated it using standard formats, and performed hyperparameter tuning to ensure reliability on small-scale objects."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 bg-slate-950/30">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-4 text-white tracking-tighter">Technical <span className="text-gradient">Insights</span></h2>
          <p className="text-xl text-slate-500 font-medium">Details about the ML implementation and project methodology.</p>
        </div>

        <div className="space-y-6">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden transition-all hover:border-purple-500/30">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-8 text-left flex justify-between items-center group transition-colors hover:bg-slate-800/30"
              >
                <span className="text-xl font-black text-slate-100 group-hover:text-white transition-colors tracking-tight">{faq.question}</span>
                <div className={`w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center transition-all duration-300 ${openIndex === idx ? 'rotate-45 bg-purple-600 border-purple-600' : ''}`}>
                    <svg className={`w-6 h-6 ${openIndex === idx ? 'text-white' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
              </button>
              {openIndex === idx && (
                <div className="px-8 pb-8 text-slate-400 text-lg leading-relaxed animate-in fade-in slide-in-from-top-4 duration-500 font-medium">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
