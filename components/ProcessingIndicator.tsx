import React from 'react';
import { ModelStatus } from '../types';
import { Sparkles, Zap, Globe, Compass, Feather, Hammer, Map } from 'lucide-react';

interface ProcessingIndicatorProps {
  statuses: ModelStatus[]; 
  isSynthesizing: boolean;
  mode: 'chat' | 'image' | 'game' | 'code' | 'research';
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ isSynthesizing, mode }) => {
  
  if (mode === 'image') {
    return (
      <div className="flex items-center gap-4 p-4 bg-[#1a1510]/80 backdrop-blur-md rounded-sm border border-purple-900/40 w-full max-w-md animate-in fade-in duration-500 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
         <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
             <div className="absolute inset-0 bg-purple-900/20 rounded-full blur-md animate-pulse"></div>
             <Feather className="w-6 h-6 text-purple-400 animate-[bounce_2s_infinite]" />
             <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite] border-dashed"></div>
         </div>
         <div className="flex flex-col">
            <span className="text-sm font-bold font-epic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-amber-200 tracking-wide">
                Painting Vision...
            </span>
            <span className="text-[10px] text-purple-400/60 uppercase tracking-widest font-serif">Applying pigments</span>
         </div>
      </div>
    );
  }

  if (mode === 'research') {
    return (
      <div className="flex items-center gap-4 p-4 bg-[#1a1510]/80 backdrop-blur-md rounded-sm border border-cyan-900/40 w-full max-w-md animate-in fade-in duration-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
         <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
             <div className="absolute inset-0 bg-cyan-900/20 rounded-full blur-md animate-pulse"></div>
             <Map className="w-6 h-6 text-cyan-400 animate-pulse" />
             <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
         </div>
         <div className="flex flex-col">
            <span className="text-sm font-bold font-epic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-amber-200 tracking-wide">
                Consulting Maps...
            </span>
            <span className="text-[10px] text-cyan-400/60 uppercase tracking-widest font-serif">Surveying the lands</span>
         </div>
      </div>
    );
  }

  // Text/Game/Code - Default Adventure
  return (
    <div className="flex items-center gap-5 p-5 bg-[#1a1510]/90 backdrop-blur-md rounded-sm border border-amber-900/30 w-full max-w-md animate-in fade-in duration-500 shadow-xl group">
      
      {/* Compass/Gear Animation */}
      <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-500/5 blur-xl rounded-full animate-pulse"></div>
        
        {/* Outer Ring */}
        <div className="absolute inset-0 border-2 border-amber-800/40 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
        
        {/* Inner Gear */}
        <div className="absolute w-10 h-10 border border-amber-600/30 rounded-full animate-[spin_5s_linear_infinite_reverse]"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
             {mode === 'code' ? <Hammer className="w-5 h-5 text-green-400 animate-pulse" /> : 
              mode === 'game' ? <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" /> : 
              <Compass className="w-6 h-6 text-amber-500 animate-[spin_3s_ease-in-out_infinite]" />}
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between">
            <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 uppercase font-epic">
                {mode === 'game' ? 'Dungeon Master 🎲' : mode === 'code' ? 'Royal Engineer 🛠️' : 'Grand Archivist 📜'}
            </span>
        </div>
        
        <div className="text-xs text-amber-700 font-medium flex items-center gap-2 font-serif italic">
            {isSynthesizing ? (
                <span className="text-amber-400 animate-pulse flex items-center gap-1">
                     Inscribing the answer...
                </span>
            ) : (
                <span className="text-amber-600 flex items-center gap-1">
                     Searching the scrolls...
                </span>
            )}
        </div>

        {/* Dynamic Progress Line */}
        <div className="w-full h-0.5 bg-amber-900/30 rounded-full mt-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-[50%] animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: '200% 100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingIndicator;
