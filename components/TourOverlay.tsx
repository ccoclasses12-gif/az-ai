
import React from 'react';
import { ArrowRight, X, Sparkles, ChevronRight, Compass, Map, Feather } from 'lucide-react';

interface TourOverlayProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const TourOverlay: React.FC<TourOverlayProps> = ({ step, onNext, onSkip }) => {
  const steps = [
    {
      title: "Welcome to The Guild",
      description: "You have entered the AZ AI Guild Hall. A sanctuary where ancient wisdom meets future intelligence.",
      position: "center"
    },
    {
      title: "Your Toolkit",
      description: "Chat with the wise, research the world, paint visions, or engineer code from this control panel.",
      position: "bottom-center"
    },
    {
      title: "Chart Your Course",
      description: "Change the atmosphere. Select a map or theme that suits your adventure.",
      position: "top-right"
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col relative font-serif">
      {/* Dark overlay backdrop for focus */}
      <div className={`absolute inset-0 bg-[#0a0806]/80 backdrop-blur-[2px] transition-opacity duration-500`} />

      {/* Step 0: Center Welcome */}
      {step === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto p-4 animate-in zoom-in-95 fade-in duration-500">
           <div className="bg-[#1a1510] border-2 border-amber-600/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 rounded-sm max-w-md text-center relative overflow-visible group">
              
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>
              
              <div className="w-20 h-20 bg-black/40 border border-amber-500/20 rounded-full mx-auto flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500">
                 <Compass className="w-10 h-10 text-amber-500 animate-[spin_20s_linear_infinite]" />
              </div>

              <h2 className="text-3xl font-bold text-amber-100 mb-3 tracking-widest font-epic uppercase">The Guild</h2>
              <p className="text-amber-200/70 mb-8 leading-relaxed text-lg italic">
                {currentStep.description}
              </p>

              <div className="flex gap-3 justify-center">
                 <button onClick={onSkip} className="px-6 py-3 rounded-sm text-amber-700 hover:text-amber-500 hover:bg-black/20 transition-colors font-bold font-epic text-xs uppercase tracking-widest">
                    Depart
                 </button>
                 <button onClick={onNext} className="px-8 py-3 rounded-sm bg-amber-800 hover:bg-amber-700 text-amber-100 font-bold shadow-lg border border-amber-500/30 flex items-center gap-2 transform hover:scale-105 transition-all font-epic text-xs uppercase tracking-widest">
                    Begin Tour <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Step 1: Bottom Center (Input Area) */}
      {step === 1 && (
         <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex flex-col items-center">
               <div className="bg-[#f5e6d3] text-slate-900 border-2 border-amber-800/20 shadow-2xl p-6 rounded-sm max-w-sm text-center mb-4 relative">
                  <Feather className="w-8 h-8 text-amber-800 mx-auto mb-2 opacity-50" />
                  <h3 className="text-xl font-bold text-amber-900 mb-2 font-epic uppercase">{currentStep.title}</h3>
                  <p className="text-slate-700 text-base mb-4 italic">{currentStep.description}</p>
                  <div className="flex justify-between items-center border-t border-amber-900/10 pt-2">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                    </div>
                    <button onClick={onNext} className="text-sm font-bold text-amber-800 hover:text-amber-600 flex items-center gap-1 font-epic uppercase">
                        Next <ChevronRight className="w-4 h-4"/>
                    </button>
                  </div>
               </div>
               {/* Giant Bouncing Arrow Down */}
               <div className="animate-bounce drop-shadow-md">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200 fill-amber-500/20">
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
             <div className="animate-bounce mb-2 mr-2 drop-shadow-md">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200 fill-amber-500/20 transform rotate-180">
                    <path d="M12 5v14M19 12l-7 7-7-7"/>
                  </svg>
             </div>

             <div className="bg-[#1a1510] border-2 border-amber-600/30 shadow-2xl p-6 rounded-sm max-w-xs text-right relative">
                  <Map className="w-8 h-8 text-amber-500 mb-2 ml-auto opacity-80" />
                  <h3 className="text-xl font-bold text-amber-100 mb-2 font-epic uppercase">{currentStep.title}</h3>
                  <p className="text-amber-200/60 text-base mb-4 italic">{currentStep.description}</p>
                  <div className="flex justify-between items-center flex-row-reverse border-t border-amber-500/20 pt-3">
                    <button onClick={onNext} className="px-6 py-2 bg-amber-700 hover:bg-amber-600 rounded-sm text-white font-bold font-epic uppercase text-xs tracking-wider shadow-lg">
                        Finish
                    </button>
                    <button onClick={onSkip} className="text-xs text-amber-700 hover:text-amber-500 font-bold uppercase">
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
            className="absolute top-6 right-6 pointer-events-auto p-2 bg-black/60 hover:bg-amber-900/50 rounded-full text-amber-500 transition-colors z-[60] border border-amber-500/20"
          >
            <X className="w-6 h-6" />
          </button>
      )}
    </div>
  );
};

export default TourOverlay;
