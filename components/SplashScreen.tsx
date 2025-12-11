
import React, { useState, useEffect } from 'react';
import { Fingerprint, Key, Compass, Sun } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'boot' | 'request' | 'scanning' | 'intro' | 'warp'>('boot');
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  // Background Dust
  useEffect(() => {
    const starContainer = document.querySelector('.dust-field');
    if (starContainer && starContainer.innerHTML === '') {
       // Only populate if empty (handled in global CSS usually but safe here)
    }
  }, []);

  // Boot Sequence
  useEffect(() => {
    if (phase === 'boot') {
        const lines = [
            "UNLOCKING ARCHIVES...",
            "DUSTING OFF SCROLLS...",
            "LIGHTING THE LANTERNS...",
            "SUMMONING THE GUILD...",
            "MAPS UNFOLDED.",
            "JOURNEY PREPARED."
        ];
        let currentLine = 0;
        const interval = setInterval(() => {
            if (currentLine < lines.length) {
                setBootLines(prev => [...prev, lines[currentLine]]);
                currentLine++;
            } else {
                clearInterval(interval);
                setTimeout(() => setPhase('request'), 500);
            }
        }, 300);
        return () => clearInterval(interval);
    }
  }, [phase]);

  const introLines = [
    "Identity Verified.",
    "Welcome, Traveler.",
    "The Guild Awaits.",
    "Let the journey begin."
  ];

  const typeText = async (text: string, speed = 40) => {
    setDisplayText("");
    for (let i = 0; i <= text.length; i++) {
      setDisplayText(text.slice(0, i));
      await new Promise(r => setTimeout(r, speed));
    }
    await new Promise(r => setTimeout(r, 800));
  };

  const handleGrantPermission = () => {
    setPhase('scanning');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        setScanProgress(progress);
        if (progress >= 100) {
            clearInterval(interval);
            startIntroSequence();
        }
    }, 20);
  };

  const startIntroSequence = async () => {
    setPhase('intro');
    for (const line of introLines) {
        await typeText(line);
    }
    setPhase('warp');
    
    setTimeout(() => {
        onComplete();
    }, 1500);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0a0806] transition-all duration-1000 ${phase === 'warp' ? 'opacity-0 scale-110 blur-xl' : 'opacity-100'}`}>
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl px-6 text-center w-full min-h-[400px] justify-center">
        
        {/* PHASE 0: BOOT SEQUENCE */}
        {phase === 'boot' && (
            <div className="font-mono text-left bg-black/40 border border-amber-900/30 p-8 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full max-w-md animate-in zoom-in-95 duration-500 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500"></div>
                
                <div className="flex items-center gap-2 mb-6 border-b border-amber-900/30 pb-2">
                    <Compass className="w-5 h-5 text-amber-600 animate-[spin_10s_linear_infinite]" />
                    <span className="text-xs text-amber-600 font-bold tracking-[0.2em] font-epic">CHRONICLE LOG</span>
                </div>
                {bootLines.map((line, i) => (
                    <div key={i} className="text-sm text-amber-800/80 font-serif italic mb-2 animate-in slide-in-from-left-2 fade-in">
                        <span className="text-amber-900/40 mr-3 not-italic font-sans text-xs">IXX.IV</span>
                        {line}
                    </div>
                ))}
            </div>
        )}

        {/* PHASE 1: PERMISSION */}
        {phase === 'request' && (
             <div className="animate-in slide-in-from-bottom-10 fade-in duration-1000 flex flex-col items-center">
                <div className="w-32 h-32 mb-8 relative flex items-center justify-center group cursor-pointer" onClick={handleGrantPermission}>
                    <div className="absolute inset-0 border-2 border-amber-900/30 rounded-full animate-[spin_30s_linear_infinite]"></div>
                    <div className="absolute inset-3 border border-amber-600/20 rounded-full animate-[spin_20s_linear_infinite_reverse] border-dashed"></div>
                    
                    {/* Glowing Sigil Button */}
                    <div className="w-20 h-20 rounded-full bg-amber-900/20 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/20 to-amber-500/0 translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000"></div>
                         <Fingerprint className="w-10 h-10 text-amber-500 group-hover:text-amber-200 transition-colors" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-amber-100 mb-6 font-epic tracking-widest uppercase drop-shadow-md">
                    The Guild Gate
                </h1>
                <p className="text-amber-800/60 mb-8 font-serif italic tracking-wide text-lg">
                    Touch the seal to enter the archives.
                </p>
            </div>
        )}

        {/* PHASE 2: SCANNING */}
        {phase === 'scanning' && (
            <div className="w-full max-w-md flex flex-col items-center">
                 <div className="w-24 h-24 mb-8 border-4 border-double border-amber-700/30 rounded-full flex items-center justify-center bg-black/20 relative">
                     <div className="absolute inset-0 rounded-full border-t-2 border-amber-500 animate-spin"></div>
                     <Sun className="w-10 h-10 text-amber-500 animate-pulse" />
                 </div>
                 <h2 className="text-xl font-epic text-amber-200 mt-4 mb-4 uppercase tracking-widest">
                    Unlocking Seals...
                 </h2>
                 <div className="w-full h-1 bg-[#1a1510] border border-amber-900/30 rounded-full overflow-hidden relative">
                     <div 
                        className="h-full bg-amber-600 shadow-[0_0_10px_#d97706]"
                        style={{ width: `${scanProgress}%` }}
                     ></div>
                 </div>
            </div>
        )}

        {/* PHASE 3: INTRO */}
        {phase === 'intro' && (
            <div className="flex flex-col items-center w-full">
                <div className="mb-8 opacity-80">
                    <Compass className="w-16 h-16 text-amber-500 animate-pulse" />
                </div>
                <div className="max-w-xl w-full text-center min-h-[100px] flex items-center justify-center">
                    <p className="text-3xl md:text-5xl text-amber-100 font-epic tracking-wide leading-relaxed drop-shadow-lg">
                        {displayText}
                        <span className="inline-block w-1 h-8 bg-amber-500/50 ml-2 animate-pulse align-middle"></span>
                    </p>
                </div>
            </div>
        )}

      </div>
      
      <div className="absolute bottom-8 text-[10px] text-amber-900/40 font-epic tracking-[0.5em] uppercase">
         Est. 2024 • The Guild of AZ
      </div>

    </div>
  );
};

export default SplashScreen;
