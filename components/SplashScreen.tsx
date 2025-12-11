import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, Terminal } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

// --- ROBOT COMPONENT ---
const NeuralDroid = ({ isActive, isTalking }: { isActive: boolean; isTalking: boolean }) => (
  <svg viewBox="0 0 200 200" className={`w-48 h-48 md:w-64 md:h-64 robot-float drop-shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all duration-1000 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
    <defs>
      <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>

    {/* Halo Rings */}
    <circle cx="100" cy="100" r="90" stroke="url(#glow)" strokeWidth="1" fill="none" className="animate-[spin_4s_linear_infinite] opacity-50" strokeDasharray="40 80" />
    <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="0.5" fill="none" className="animate-[spin_7s_linear_infinite_reverse] opacity-30" strokeDasharray="10 20" />
    <circle cx="100" cy="100" r="100" stroke="#a855f7" strokeWidth="0.5" fill="none" className="animate-pulse opacity-20" />

    {/* Head Shape */}
    <path d="M60,100 Q60,40 100,40 Q140,40 140,100 L130,140 Q100,160 70,140 Z" fill="url(#metal)" stroke="#334155" strokeWidth="2" />
    
    {/* Visor Area */}
    <path d="M70,90 Q100,90 130,90 L128,110 Q100,120 72,110 Z" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" className="drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />

    {/* Eyes */}
    <g className={`robot-eye ${isActive ? '' : 'opacity-20'}`}>
        <rect x="80" y="95" width="15" height="4" rx="2" fill="#38bdf8" className="drop-shadow-[0_0_10px_#38bdf8]" />
        <rect x="105" y="95" width="15" height="4" rx="2" fill="#38bdf8" className="drop-shadow-[0_0_10px_#38bdf8]" />
    </g>

    {/* Mouth / Voice Interface */}
    <g className={`transition-opacity duration-300 ${isTalking ? 'opacity-100' : 'opacity-30'}`}>
       <rect x="90" y="130" width="20" height="2" rx="1" fill="#a855f7" className={isTalking ? 'animate-pulse' : ''} />
       <rect x="85" y="125" width="4" height="12" rx="1" fill="#3b82f6" className={isTalking ? 'animate-[bounce_0.5s_infinite]' : ''} />
       <rect x="111" y="125" width="4" height="12" rx="1" fill="#3b82f6" className={isTalking ? 'animate-[bounce_0.6s_infinite]' : ''} />
    </g>

    {/* Side Ears */}
    <rect x="55" y="90" width="8" height="20" rx="2" fill="#64748b" />
    <rect x="137" y="90" width="8" height="20" rx="2" fill="#64748b" />
  </svg>
);

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'boot' | 'request' | 'scanning' | 'intro' | 'warp'>('boot');
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  // Background Starfield logic
  useEffect(() => {
    const starContainer = document.querySelector('.starfield');
    if (starContainer) {
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        starContainer.appendChild(star);
      }
    }
  }, []);

  // Boot Sequence
  useEffect(() => {
    if (phase === 'boot') {
        const lines = [
            "INITIALIZING KERNEL...",
            "LOADING NEURAL MODULES...",
            "CONNECTING TO GOOGLE CLOUD...",
            "OPTIMIZING LATENCY < 2000ms...",
            "COMPILER ENGINE... READY.",
            "SYSTEM BOOT COMPLETE."
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
        }, 150);
        return () => clearInterval(interval);
    }
  }, [phase]);

  // Robot Monologue
  const introLines = [
    "Identity verified.",
    "I am AZ-01.",
    "I serve your every command.",
    "Compiler & Interpreter Ready.",
    "Warp Speed Engaged."
  ];

  const typeText = async (text: string, speed = 25) => {
    setDisplayText("");
    for (let i = 0; i <= text.length; i++) {
      setDisplayText(text.slice(0, i));
      await new Promise(r => setTimeout(r, speed));
    }
    await new Promise(r => setTimeout(r, 600));
  };

  const handleGrantPermission = () => {
    setPhase('scanning');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
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
    
    // Add warp class to body for CSS effects
    document.body.classList.add('warp-active');
    
    setTimeout(() => {
        document.body.classList.remove('warp-active');
        onComplete();
    }, 1500);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-slate-950 transition-all duration-1000 ${phase === 'warp' ? 'opacity-0 scale-150 blur-3xl' : 'opacity-100'}`}>
      
      <div className="starfield"></div>
      <div className="cyber-grid"></div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl px-6 text-center w-full min-h-[400px] justify-center">
        
        {/* PHASE 0: BOOT SEQUENCE */}
        {phase === 'boot' && (
            <div className="font-mono text-left bg-black/80 border border-green-500/30 p-6 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.2)] w-full max-w-md animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-4 border-b border-green-900/50 pb-2">
                    <Terminal className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500 font-bold tracking-widest">SYSTEM CONSOLE</span>
                </div>
                {bootLines.map((line, i) => (
                    <div key={i} className="text-xs md:text-sm text-green-400 font-code mb-1">
                        <span className="text-green-700 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        {line}
                    </div>
                ))}
                <div className="animate-pulse text-green-500 mt-2">_</div>
            </div>
        )}

        {/* PHASE 1: PERMISSION */}
        {phase === 'request' && (
             <div className="animate-in slide-in-from-bottom-10 fade-in duration-700 flex flex-col items-center">
                <NeuralDroid isActive={true} isTalking={false} />
                <h1 className="text-4xl md:text-6xl font-black text-white mt-8 mb-4 font-tech tracking-wider uppercase glitch-text drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" data-text="SYSTEM LOCKED">
                    SYSTEM LOCKED
                </h1>
                <p className="text-blue-300 mb-12 font-tech tracking-[0.2em] text-sm animate-pulse">
                    AWAITING BIOMETRIC AUTHENTICATION
                </p>

                <button 
                  onClick={handleGrantPermission}
                  className="group relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-900/50 border-2 border-blue-500/50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:shadow-[0_0_50px_rgba(59,130,246,0.8)] transition-all duration-300 active:scale-90 backdrop-blur-md"
                >
                    <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-[ping_1.5s_infinite]"></div>
                    <Fingerprint className="w-8 h-8 md:w-10 md:h-10 text-blue-400 group-hover:text-white transition-colors" />
                </button>
            </div>
        )}

        {/* PHASE 2: SCANNING */}
        {phase === 'scanning' && (
            <div className="w-full max-w-md flex flex-col items-center">
                 <NeuralDroid isActive={true} isTalking={false} />
                 <h2 className="text-xl font-tech text-blue-400 mt-8 mb-4 animate-pulse uppercase tracking-widest">
                    Verifying DNA Sequence...
                 </h2>
                 <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
                     <div 
                        className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6]"
                        style={{ width: `${scanProgress}%` }}
                     ></div>
                 </div>
                 <div className="font-code text-blue-500/50 text-xs mt-2 tracking-widest">
                     {scanProgress}% COMPLETE
                 </div>
            </div>
        )}

        {/* PHASE 3: INTRO */}
        {phase === 'intro' && (
            <div className="flex flex-col items-center w-full">
                <NeuralDroid isActive={true} isTalking={true} />
                <div className="mt-8 bg-slate-900/50 border border-blue-500/30 backdrop-blur-md p-6 rounded-xl max-w-xl w-full shadow-[0_0_30px_rgba(59,130,246,0.2)] min-h-[100px] flex items-center justify-center relative overflow-hidden group">
                     {/* Scanning light effect inside box */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    
                    <p className="text-xl md:text-3xl text-blue-100 font-tech tracking-wide text-center">
                        {displayText}
                        <span className="inline-block w-2 h-6 bg-blue-400 ml-1 animate-pulse align-middle"></span>
                    </p>
                </div>
            </div>
        )}

      </div>
      
      <div className="absolute bottom-6 text-[10px] text-slate-500 font-mono tracking-[0.3em] uppercase opacity-50">
         AZ AI v2.5 • QUANTUM CORE ONLINE
      </div>

    </div>
  );
};

export default SplashScreen;