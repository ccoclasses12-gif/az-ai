import React from 'react';
import { ModelStatus } from '../types';
import { Sparkles, Zap } from 'lucide-react';

interface ProcessingIndicatorProps {
  statuses: ModelStatus[]; 
  isSynthesizing: boolean;
  mode: 'text' | 'image' | 'game' | 'code';
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ isSynthesizing, mode }) => {
  
  if (mode === 'image') {
    return (
      <div className="flex items-center gap-4 p-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-pink-500/20 w-full max-w-md animate-in fade-in duration-500 shadow-[0_0_30px_rgba(236,72,153,0.15)]">
         <div className="relative w-12 h-12 flex-shrink-0">
             <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-lg animate-pulse"></div>
             <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_4s_linear_infinite]">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#ec4899', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#a855f7', stopOpacity:1}} />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="40" stroke="url(#grad1)" strokeWidth="8" fill="none" strokeDasharray="60 140" strokeLinecap="round" />
                <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="2" fill="none" strokeDasharray="40 40" strokeOpacity="0.5" className="animate-[spin_2s_linear_infinite_reverse]" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white drop-shadow-[0_0_5px_rgba(255,255,255,1)]" />
             </div>
         </div>
         <div className="flex flex-col">
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tracking-wide">
                Rendering Reality...
            </span>
            <span className="text-[10px] text-pink-200/60 uppercase tracking-widest">High Fidelity Synthesis</span>
         </div>
      </div>
    );
  }

  // Quantum Tesseract for Text/Game/Code
  return (
    <div className="flex items-center gap-5 p-5 bg-black/50 backdrop-blur-2xl rounded-2xl border border-blue-500/20 w-full max-w-md animate-in fade-in duration-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] group">
      
      {/* Tesseract Animation */}
      <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center perspective-1000">
        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full animate-pulse"></div>
        
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <g className="animate-[spin_10s_linear_infinite] origin-center">
                <rect x="25" y="25" width="50" height="50" stroke="#3b82f6" strokeWidth="1" fill="none" className="opacity-60" />
                <rect x="25" y="25" width="50" height="50" stroke="#a855f7" strokeWidth="1" fill="none" transform="rotate(45 50 50)" className="opacity-60" />
                <circle cx="50" cy="50" r="35" stroke="url(#blue-grad)" strokeWidth="2" fill="none" strokeDasharray="10 10" className="animate-[spin_3s_linear_infinite_reverse]" />
            </g>
            <defs>
                <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
            </defs>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
             <Zap className="w-5 h-5 text-white fill-white animate-[pulse_0.5s_ease-in-out_infinite] drop-shadow-[0_0_10px_cyan]" />
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between">
            <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 uppercase">
                {mode === 'game' ? 'Game Engine 🎮' : mode === 'code' ? 'Compiler Engine 🛠️' : 'Neural Core ⚡'}
            </span>
        </div>
        
        <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
            {isSynthesizing ? (
                <span className="text-purple-300 animate-pulse flex items-center gap-1">
                     Fusing Logic & Creativity...
                </span>
            ) : (
                <span className="text-slate-400 flex items-center gap-1">
                     Accessing Quantum Lattice...
                </span>
            )}
        </div>

        {/* Dynamic Progress Line */}
        <div className="w-full h-0.5 bg-slate-800 rounded-full mt-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent w-[50%] animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: '200% 100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingIndicator;