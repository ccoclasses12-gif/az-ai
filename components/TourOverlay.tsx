import React from 'react';
import { ArrowRight, X, Sparkles, ChevronRight, Star } from 'lucide-react';

interface TourOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const FloatingStars = () => (
  <div className="absolute inset-0 pointer-events-none overflow-visible">
    <Star className="absolute -top-6 -left-6 w-8 h-8 text-yellow-400 animate-[spin_3s_linear_infinite] fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
    <Star className="absolute -bottom-6 -right-6 w-6 h-6 text-purple-400 animate-pulse fill-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
    <Sparkles className="absolute top-1/2 -right-10 w-8 h-8 text-blue-400 animate-bounce delay-100" />
    <Sparkles className="absolute -top-8 left-1/2 w-6 h-6 text-pink-400 animate-pulse delay-300" />
  </div>
);

const TourOverlay: React.FC<TourOverlayProps> = ({ step, onNext, onSkip }) => {
  const steps = [
    {
      title: "Welcome to AZ AI",
      description: "Experience the ultimate creativity of Google AI Studio. Unified intelligence at your fingertips.",
      position: "center"
    },
    {
      title: "Your Creative Hub",
      description: "Chat, analyze, or generate stunning visuals using our advanced engines.",
      position: "bottom-center"
    },
    {
      title: "Design Your Universe",
      description: "Customize your experience with glorious themes and scenic backdrops.",
      position: "top-right"
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col relative">
      {/* Dark overlay backdrop for focus */}
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-500`} />

      {/* Step 0: Center Welcome */}
      {step === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto p-4 animate-in zoom-in-95 fade-in duration-300">
           <div className="bg-slate-900/95 border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.3)] backdrop-blur-xl p-8 rounded-3xl max-w-md text-center relative overflow-visible group">
              <FloatingStars />
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/20">
                 <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">AZ AI</h2>
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                {currentStep.description}
              </p>

              <div className="flex gap-3 justify-center">
                 <button onClick={onSkip} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
                    Skip
                 </button>
                 <button onClick={onNext} className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/40 flex items-center gap-2 transform hover:scale-105 transition-all">
                    Start Tour <ArrowRight className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Step 1: Bottom Center (Input Area) */}
      {step === 1 && (
         <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex flex-col items-center">
               <div className="bg-slate-900/95 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-xl p-6 rounded-2xl max-w-sm text-center mb-4 relative overflow-visible">
                  <FloatingStars />
                  <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                  <p className="text-slate-300 text-base mb-4">{currentStep.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    </div>
                    <button onClick={onNext} className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        Next <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>
               </div>
               {/* Giant Bouncing Arrow Down */}
               <div className="animate-bounce drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 fill-purple-400/20">
                    <path d="M12 5v14M19 12l-7 7-7-7"/>
                  </svg>
               </div>
            </div>
         </div>
      )}

      {/* Step 2: Top Right (Appearance) */}
      {step === 2 && (
         <div className="absolute top-24 right-8 pointer-events-auto animate-in slide-in-from-top-5 fade-in duration-500 flex flex-col items-end">
             {/* Giant Bouncing Arrow Up */}
             <div className="animate-bounce mb-2 mr-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 fill-purple-400/20 transform rotate-180">
                    <path d="M12 5v14M19 12l-7 7-7-7"/>
                  </svg>
             </div>

             <div className="bg-slate-900/95 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-xl p-6 rounded-2xl max-w-xs text-right relative overflow-visible">
                  <FloatingStars />
                  <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                  <p className="text-slate-300 text-base mb-4">{currentStep.description}</p>
                  <div className="flex justify-between items-center flex-row-reverse">
                    <button onClick={onNext} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold shadow-lg">
                        Finish
                    </button>
                    <button onClick={onSkip} className="text-xs text-slate-500 hover:text-slate-300 font-medium">
                        Close
                    </button>
                  </div>
             </div>
         </div>
      )}
      
      {/* Global Skip Button (visible on steps > 0) */}
      {step > 0 && (
          <button 
            onClick={onSkip}
            className="absolute top-6 right-6 pointer-events-auto p-2 bg-black/40 hover:bg-white/10 rounded-full text-slate-400 transition-colors z-[60] border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
      )}
    </div>
  );
};

export default TourOverlay;