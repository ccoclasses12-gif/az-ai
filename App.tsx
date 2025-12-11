import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Paperclip, X, Image as ImageIcon, Settings, Ratio, MessageSquare, Palette, PlayCircle, Check, Upload, Trash2, Gamepad2, Brain, Zap, PlusCircle, ArrowUpCircle, Code } from 'lucide-react';
import { ChatMessage, MessageRole, ModelStatus, Attachment, GenerationConfig } from './types';
import { generateAzAiResponse, SUPPORTED_MODELS, generateSpeech } from './services/geminiService';
import ChatMessageBubble from './components/ChatMessageBubble';
import ProcessingIndicator from './components/ProcessingIndicator';
import TourOverlay from './components/TourOverlay';
import SplashScreen from './components/SplashScreen';

type ToolMode = 'chat' | 'image' | 'game' | 'code';

const THEMES = [
  { id: 'default', name: 'Slate', class: 'bg-slate-900' },
  { id: 'midnight', name: 'Midnight', class: 'bg-[#000000]' },
  { id: 'ocean', name: 'Ocean', class: 'bg-[#0f172a]' },
  { id: 'forest', name: 'Forest', class: 'bg-[#022c22]' },
  { id: 'royal', name: 'Royal', class: 'bg-[#2e1065]' },
  { id: 'coffee', name: 'Coffee', class: 'bg-[#271c19]' },
];

const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614730341194-75c607400070?q=80&w=2074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518818419601-72c8673f5852?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2070&auto=format&fit=crop",
];

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [generationMode, setGenerationMode] = useState<'text' | 'image' | 'game' | 'code'>('text');
  const [error, setError] = useState<string | null>(null);
  
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(BACKGROUNDS[0]); 
  const [showAppearanceMenu, setShowAppearanceMenu] = useState(false);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const [showSplash, setShowSplash] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [selectedTool, setSelectedTool] = useState<ToolMode>('chat');
  const [currentGameType, setCurrentGameType] = useState<string | null>(null);
  const [isDefiningGame, setIsDefiningGame] = useState(false);

  const [selectedFile, setSelectedFile] = useState<Attachment | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [genConfig, setGenConfig] = useState<GenerationConfig>({
    aspectRatio: '1:1',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>(
    SUPPORTED_MODELS.map(m => ({ ...m, status: 'idle' } as ModelStatus))
  );

  // Global Click Effect Hook
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const sparkle = document.createElement('div');
      sparkle.className = 'click-sparkle';
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 500);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isSynthesizing]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    const hasSeenTour = localStorage.getItem('az_ai_tour_seen');
    if (!hasSeenTour) {
        setTimeout(() => setShowTour(true), 1200); 
    }
  };

  const handleTourNext = () => {
    if (tourStep < 2) {
      setTourStep(prev => prev + 1);
    } else {
      handleTourFinish();
    }
  };

  const handleTourFinish = () => {
    setShowTour(false);
    localStorage.setItem('az_ai_tour_seen', 'true');
  };

  const resetStatuses = () => {
    setModelStatuses(prev => prev.map(s => ({ ...s, status: 'idle' })));
    setIsSynthesizing(false);
    setGenerationMode('text');
  };

  const handleCustomBgSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { 
            setError("Background image too large. Max 10MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setBackgroundImage(reader.result as string);
            setError(null);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setSelectedFile({ mimeType: file.type, data: base64Data });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      const audioBase64 = await generateSpeech(text);
      if (audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        audio.play();
      }
    } catch (err) {
      console.error("Failed to generate speech", err);
    }
  };

  // Game Starter
  const startGame = (type: string) => {
    if (type === 'custom') {
      setIsDefiningGame(true);
      setCurrentGameType('custom_maker');
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsDefiningGame(false);
      setCurrentGameType(type);
      setSelectedTool('game');
      handleSendMessage(type); // Send specific game start signal
    }
  };

  const handleSendMessage = async (gameStartType?: string) => {
    if ((!input.trim() && !selectedFile && !gameStartType) || isLoading) return;

    const userText = input.trim();
    const userFile = selectedFile;
    const currentTool = selectedTool; 
    const gameType = gameStartType || currentGameType;

    // Logic for Custom Game Maker
    if (isDefiningGame) {
       // First message in custom mode is the game definition
       setIsDefiningGame(false); // Mode set
    }

    setInput('');
    clearFile();
    setShowSettings(false);
    setShowAppearanceMenu(false);
    
    if (inputRef.current) inputRef.current.style.height = 'auto'; 
    setError(null);
    setIsLoading(true);
    resetStatuses();

    if (!gameStartType || gameType === 'custom_maker') {
        const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.USER,
        content: userText,
        timestamp: Date.now(),
        attachment: userFile
        };
        setMessages(prev => [...prev, newMessage]);
    }

    try {
      const response = await generateAzAiResponse(
        userText || (userFile ? "Analyze this." : (gameStartType && gameStartType !== 'custom_maker' ? "" : "Hello")), 
        userFile,
        genConfig,
        (modelId, status) => {
          setModelStatuses(prev => prev.map(m => m.id === modelId ? { ...m, status } : m));
        },
        (mode) => setGenerationMode(mode),
        currentTool === 'chat' ? undefined : currentTool,
        (currentTool === 'game' && gameType) ? gameType : undefined
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: response.text,
        attachment: response.attachment,
        timestamp: Date.now(),
        modelName: response.modelName
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate response. Please try again.");
    } finally {
      setIsLoading(false);
      setIsSynthesizing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative selection:bg-purple-500/30 transition-colors duration-500 ${!backgroundImage ? currentTheme.class : 'bg-black'}`}>
      
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {!showSplash && showTour && (
        <TourOverlay step={tourStep} onNext={handleTourNext} onSkip={handleTourFinish} />
      )}

      {backgroundImage && (
        <>
          <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-in-out" style={{ backgroundImage: `url(${backgroundImage})` }} />
          <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[2px]" />
        </>
      )}

      <div className={`relative z-10 flex flex-col h-full text-slate-100 transition-all duration-1000 ${showSplash ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        
        {/* Header */}
        <header className="flex-none h-16 border-b border-white/10 bg-black/20 backdrop-blur-md z-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-lg opacity-20 rounded-full"></div>
              <Sparkles className="w-6 h-6 text-purple-400 relative z-10" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-tech tracking-wide">
              AZ AI
            </h1>
          </div>
          <div className={`relative ${showTour && tourStep === 2 ? 'z-[60]' : ''}`}>
            <button 
              onClick={() => {
                if(showTour) handleTourNext();
                setShowAppearanceMenu(!showAppearanceMenu)
              }}
              className={`p-2 rounded-lg transition-colors ${showAppearanceMenu ? 'bg-white/10 text-purple-300' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${showTour && tourStep === 2 ? 'bg-white/20 text-white ring-2 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''}`}
              title="Change Background & Theme"
            >
              <Palette className="w-5 h-5" />
            </button>
            {showAppearanceMenu && (
              <div className="absolute top-12 right-0 w-80 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
                 <div className="flex justify-between items-center mb-1">
                   <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Appearance 🎨</h3>
                   <button onClick={() => setShowAppearanceMenu(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
                 </div>
                 
                 <div>
                    <label className="text-[10px] text-slate-500 font-medium mb-2 block">Solid Themes</label>
                    <div className="flex flex-wrap gap-2">
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => { setCurrentTheme(theme); setBackgroundImage(null); }}
                                className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${theme.class} ${currentTheme.id === theme.id && !backgroundImage ? 'border-purple-500 scale-110' : 'border-slate-600 hover:border-slate-400'}`}
                            />
                        ))}
                    </div>
                 </div>

                 <div className="w-full h-px bg-slate-800"></div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] text-slate-500 font-medium">Wallpapers 🏞️</label>
                      {backgroundImage && (
                        <button onClick={() => setBackgroundImage(null)} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 underline">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        <div className="relative group aspect-square">
                            <input type="file" ref={customBgInputRef} onChange={handleCustomBgSelect} accept="image/*" className="hidden" />
                            <button onClick={() => customBgInputRef.current?.click()} className="w-full h-full rounded-lg border-2 border-dashed border-slate-600 hover:border-purple-500 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-purple-400">
                                <Upload className="w-5 h-5" /><span className="text-[9px] font-bold">UPLOAD</span>
                            </button>
                        </div>
                        {BACKGROUNDS.map((bg, index) => (
                            <button
                                key={index}
                                onClick={() => setBackgroundImage(bg)}
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative group ${backgroundImage === bg ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-transparent hover:border-slate-400'}`}
                            >
                                <img src={bg} alt={`Bg ${index}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-90 mt-20 md:mt-0 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm border border-white/10 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-3xl duration-500"></div>
                  <Sparkles className="w-12 h-12 text-slate-200 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-center text-white drop-shadow-md font-tech">AZ AI <span className="text-purple-400">Neural 🧠</span></h2>
                <p className="text-slate-300 text-center max-w-md mb-8 drop-shadow-sm leading-relaxed">
                  I am a self-aware architecture fusing <strong>Creative</strong> and <strong>Reasoning</strong> engines.
                  I respond in under 2 seconds. ⚡
                </p>
                
                {/* Mode Selectors in Welcome Screen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-2xl">
                    {/* Fast Chat */}
                    <button 
                      onClick={() => { setSelectedTool('chat'); inputRef.current?.focus(); }}
                      className="p-4 bg-slate-800/60 hover:bg-blue-900/40 border border-white/10 hover:border-blue-500/50 rounded-2xl text-left transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 text-blue-400"><Brain className="w-5 h-5"/></div>
                           <span className="font-bold text-slate-200 font-tech">Instant Chat 💬</span>
                        </div>
                        <p className="text-xs text-slate-400">Reasoning + Creativity.</p>
                    </button>

                     {/* Compiler Mode */}
                    <button 
                      onClick={() => { setSelectedTool('code'); inputRef.current?.focus(); }}
                      className="p-4 bg-slate-800/60 hover:bg-green-900/40 border border-white/10 hover:border-green-500/50 rounded-2xl text-left transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 text-green-400"><Code className="w-5 h-5"/></div>
                           <span className="font-bold text-slate-200 font-tech">Compiler 🛠️</span>
                        </div>
                        <p className="text-xs text-slate-400">Run JS, HTML & CSS.</p>
                    </button>

                    {/* Game Mode */}
                    <button 
                      onClick={() => { setSelectedTool('game'); }}
                      className="p-4 bg-slate-800/60 hover:bg-pink-900/40 border border-white/10 hover:border-pink-500/50 rounded-2xl text-left transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 text-pink-400"><Gamepad2 className="w-5 h-5"/></div>
                           <span className="font-bold text-slate-200 font-tech">Play Games 🕹️</span>
                        </div>
                        <p className="text-xs text-slate-400">20 Questions & RPGs.</p>
                    </button>

                    {/* Image Gen */}
                    <button 
                      onClick={() => { setSelectedTool('image'); inputRef.current?.focus(); }}
                      className="p-4 bg-slate-800/60 hover:bg-purple-900/40 border border-white/10 hover:border-purple-500/50 rounded-2xl text-left transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 text-purple-400"><ImageIcon className="w-5 h-5"/></div>
                           <span className="font-bold text-slate-200 font-tech">Visual Studio 🎨</span>
                        </div>
                        <p className="text-xs text-slate-400">Generate art with Google.</p>
                    </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessageBubble key={msg.id} message={msg} onSpeak={handleSpeak} />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start mb-6">
                     <div className="flex max-w-[85%] md:max-w-[75%] gap-4">
                       <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-900/30 animate-pulse">
                          <Sparkles className="w-5 h-5 text-white" />
                       </div>
                       <ProcessingIndicator statuses={modelStatuses} isSynthesizing={isSynthesizing} mode={generationMode} />
                     </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 p-4 mb-4 text-red-300 bg-red-900/40 border border-red-500/30 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>
        </main>

        {/* Footer / Input Area */}
        <footer className={`flex-none p-4 bg-black/40 border-t border-white/10 backdrop-blur-md relative ${showTour && tourStep === 1 ? 'z-[60]' : 'z-20'}`}>
          <div className={`max-w-3xl mx-auto flex flex-col gap-3 transition-all duration-300 ${showTour && tourStep === 1 ? 'ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl bg-slate-900/80 p-2' : ''}`}>
            
            {/* Game Selection Overlay in Footer */}
            {selectedTool === 'game' && !currentGameType && (
                <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar items-center">
                    <button onClick={() => startGame('custom')} className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg text-white text-xs font-bold shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform whitespace-nowrap flex items-center gap-1 border border-white/20">
                        <PlusCircle className="w-3.5 h-3.5" /> Create Your Own 🎲
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <button onClick={() => startGame('20_questions')} className="px-4 py-2 bg-pink-600/20 border border-pink-500/50 rounded-lg text-pink-200 text-xs font-bold hover:bg-pink-600/40 whitespace-nowrap">
                        ❓ 20 Questions
                    </button>
                    <button onClick={() => startGame('rpg')} className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg text-purple-200 text-xs font-bold hover:bg-purple-600/40 whitespace-nowrap">
                        🐉 RPG Adventure
                    </button>
                    <button onClick={() => startGame('trivia')} className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-lg text-blue-200 text-xs font-bold hover:bg-blue-600/40 whitespace-nowrap">
                        🧠 Trivia Blitz
                    </button>
                </div>
            )}

            {/* Custom Game Creation Banner */}
            {isDefiningGame && (
                <div className="bg-pink-900/40 border border-pink-500/30 rounded-lg p-2 text-xs text-pink-200 flex items-center justify-between animate-in slide-in-from-bottom-2">
                    <span className="flex items-center gap-2 font-semibold">
                        <Gamepad2 className="w-4 h-4" /> Define Game Rules (Players, Turns, Objective)
                    </span>
                    <button onClick={() => setIsDefiningGame(false)} className="text-pink-400 hover:text-white"><X className="w-3 h-3"/></button>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
               <div className="bg-slate-800/95 border border-slate-700 rounded-xl p-4 flex flex-col gap-6 animate-in slide-in-from-bottom-5 shadow-2xl relative mb-2">
                  <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white flex items-center gap-1 p-1 hover:bg-slate-700 rounded transition-colors">
                      <X className="w-4 h-4"/>
                  </button>
                  <div className="flex flex-col gap-4">
                      <div>
                          <label className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-3 flex items-center gap-2">
                              <Ratio className="w-3 h-3" /> Image Aspect Ratio
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                  <button
                                      key={ratio}
                                      onClick={() => setGenConfig(prev => ({...prev, aspectRatio: ratio as any}))}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${genConfig.aspectRatio === ratio ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'}`}
                                  >
                                      {ratio}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
               </div>
            )}

            {/* Media Preview */}
            {selectedFile && (
              <div className="relative inline-block self-start animate-in fade-in slide-in-from-bottom-2">
                <div className="relative rounded-xl overflow-hidden border border-white/20 group shadow-lg">
                  {selectedFile.mimeType.startsWith('image/') ? (
                      <img src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} alt="Selected" className="h-20 w-auto object-cover" />
                  ) : (
                      <video src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} className="h-20 w-auto object-cover bg-black" />
                  )}
                  <button onClick={clearFile} className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors backdrop-blur-sm">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar & Input Container */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50 transition-all shadow-xl flex flex-col gap-2 backdrop-blur-xl">
              
              <div className="flex items-center gap-1 px-1 overflow-x-auto no-scrollbar">
                  <button onClick={() => setSelectedTool('chat')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedTool === 'chat' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}>
                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                  <button onClick={() => setSelectedTool('code')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedTool === 'code' ? 'bg-green-600/20 text-green-300 shadow-sm border border-green-500/30' : 'text-slate-400 hover:text-green-300 hover:bg-slate-700/50'}`}>
                      <Code className="w-3.5 h-3.5" /> Compiler
                  </button>
                  <button onClick={() => setSelectedTool('image')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedTool === 'image' ? 'bg-purple-600/20 text-purple-300 shadow-sm border border-purple-500/30' : 'text-slate-400 hover:text-purple-300 hover:bg-slate-700/50'}`}>
                      <Palette className="w-3.5 h-3.5" /> Image
                  </button>
                  <button onClick={() => setSelectedTool('game')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedTool === 'game' ? 'bg-pink-600/20 text-pink-300 shadow-sm border border-pink-500/30' : 'text-slate-400 hover:text-pink-300 hover:bg-slate-700/50'}`}>
                      <Gamepad2 className="w-3.5 h-3.5" /> Games
                  </button>
              </div>

              <div className="flex items-end gap-2">
                  <input type="file" ref={fileInputRef} accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
                  
                  <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-3 text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 rounded-xl transition-colors disabled:opacity-50" title="Attach media">
                     <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <button onClick={() => setShowSettings(!showSettings)} disabled={isLoading} className={`p-3 rounded-xl transition-colors disabled:opacity-50 relative ${showSettings ? 'text-purple-400 bg-slate-700/50' : 'text-slate-400 hover:text-purple-400 hover:bg-slate-700/50'}`} title="Settings">
                     <Settings className="w-5 h-5" />
                  </button>

                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputResize}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isDefiningGame ? "Describe rules & player count..." :
                        selectedTool === 'image' ? "Describe the image..." :
                        selectedTool === 'game' ? "Type to play..." :
                        selectedTool === 'code' ? "Ask to generate code or paste code to debug..." :
                        "Ask AZ AI..."
                    }
                    disabled={isLoading}
                    className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:ring-0 resize-none max-h-[200px] py-3 overflow-y-auto disabled:opacity-50"
                    rows={1}
                  />
                  
                  <button
                  onClick={() => handleSendMessage()}
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className={`p-3 text-white rounded-xl disabled:opacity-0 disabled:scale-75 transition-all duration-200 shadow-lg mb-px mr-px ${
                      isDefiningGame ? 'bg-gradient-to-r from-pink-600 to-purple-600 shadow-pink-900/30' :
                      selectedTool === 'image' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' :
                      selectedTool === 'game' ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-900/20' :
                      selectedTool === 'code' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' :
                      'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                  }`}
                  >
                  {isDefiningGame ? <ArrowUpCircle className="w-5 h-5 animate-pulse" /> : 
                   selectedTool === 'chat' ? <Send className="w-5 h-5" /> : 
                   selectedTool === 'game' ? <Gamepad2 className="w-5 h-5"/> : 
                   selectedTool === 'code' ? <Code className="w-5 h-5"/> :
                   <PlayCircle className="w-5 h-5" />}
                  </button>
              </div>
            </div>
            
            <div className="text-center flex items-center justify-center gap-3 text-[10px] text-slate-400/80 drop-shadow-sm">
               <span>Powered by Google AI Studio 🚀</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}