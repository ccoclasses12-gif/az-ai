
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Paperclip, X, Image as ImageIcon, Settings, Ratio, MessageSquare, Palette, PlayCircle, Upload, Trash2, Gamepad2, Brain, Zap, PlusCircle, ArrowUpCircle, Code, Globe, Search, Terminal, Feather, Map as MapIcon, Compass } from 'lucide-react';
import { ChatMessage, MessageRole, ModelStatus, Attachment, GenerationConfig, ToolMode } from './types';
import { generateAzAiResponse, SUPPORTED_MODELS, generateSpeech } from './services/geminiService';
import ChatMessageBubble from './components/ChatMessageBubble';
import ProcessingIndicator from './components/ProcessingIndicator';
import TourOverlay from './components/TourOverlay';
import SplashScreen from './components/SplashScreen';

const THEMES = [
  { id: 'explorer', name: 'Explorer', class: 'bg-[#1a1510]' }, // Dark Wood
  { id: 'parchment', name: 'Parchment', class: 'bg-[#f5e6d3] text-slate-900' }, // Light Paper
  { id: 'cartographer', name: 'Cartographer', class: 'bg-[#2c3e50]' }, // Navy Blue
  { id: 'forest', name: 'Elder Wood', class: 'bg-[#0f1f0f]' }, // Deep Green
  { id: 'royal', name: 'Royal Court', class: 'bg-[#2b1b3d]' }, // Deep Purple/Gold
  { id: 'dungeon', name: 'Dungeon', class: 'bg-[#121212]' }, // Pitch Black
];

const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop", // Books
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop", // Mountains
  "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=2070&auto=format&fit=crop", // Dark Map
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=2076&auto=format&fit=crop", // Deep Forest
  "https://images.unsplash.com/photo-1507842217153-e51f40d615e4?q=80&w=2070&auto=format&fit=crop", // Train/Travel
  "https://images.unsplash.com/photo-1533282960533-51328aa49826?q=80&w=2042&auto=format&fit=crop", // Stars
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=2070&auto=format&fit=crop", // Foggy Sea
  "https://images.unsplash.com/photo-1518557984649-7b16d929314c?q=80&w=2070&auto=format&fit=crop", // Stone Ruins
  "https://images.unsplash.com/photo-1513639776629-c2611a9dd9e4?q=80&w=2070&auto=format&fit=crop", // Hearth/Fire
  "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2022&auto=format&fit=crop", // Nebula
  "https://images.unsplash.com/photo-1596387430161-0b8c08975815?q=80&w=2070&auto=format&fit=crop", // Old Paper Texture
  "https://images.unsplash.com/photo-1542259681-d4cd71d18f59?q=80&w=2069&auto=format&fit=crop", // Foggy Forest Path
];

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [generationMode, setGenerationMode] = useState<ToolMode>('chat');
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

  // Global Click Effect
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

  const handleTourFinish = () => {
    setShowTour(false);
    localStorage.setItem('az_ai_tour_seen', 'true');
  };

  const handleTourNext = () => {
    if (tourStep < 2) {
      setTourStep(prev => prev + 1);
    } else {
      handleTourFinish();
    }
  };

  const resetStatuses = () => {
    setModelStatuses(prev => prev.map(s => ({ ...s, status: 'idle' })));
    setIsSynthesizing(false);
    setGenerationMode('chat');
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

  const handleCustomBgSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { 
            setError("The map is too large for the archives (Max 5MB).");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setBackgroundImage(reader.result as string);
            setError(null);
            setShowAppearanceMenu(false);
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
      handleSendMessage(type); 
    }
  };

  const handleSendMessage = async (gameStartType?: string) => {
    if ((!input.trim() && !selectedFile && !gameStartType) || isLoading) return;

    const userText = input.trim();
    const userFile = selectedFile;
    const currentTool = selectedTool; 
    const gameType = gameStartType || currentGameType;

    if (isDefiningGame) setIsDefiningGame(false);

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
        userText || (userFile ? "Examine this artifact." : (gameStartType && gameStartType !== 'custom_maker' ? "" : "Hail")), 
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
      setError("The scroll could not be deciphered. Please try again.");
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

  const isLightMode = currentTheme.id === 'parchment';
  const textColor = isLightMode ? 'text-slate-900' : 'text-slate-100';
  const subTextColor = isLightMode ? 'text-slate-600' : 'text-slate-400';
  const borderColor = isLightMode ? 'border-amber-900/20' : 'border-amber-100/10';
  const cardBg = isLightMode ? 'bg-[#f0e6d2]/90' : 'bg-[#1a1510]/80';
  const accentColor = 'text-amber-500';

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative selection:bg-amber-500/30 transition-colors duration-500 ${!backgroundImage ? currentTheme.class : 'bg-black'}`}>
      
      {/* Texture Overlay for that paper/classic feel */}
      <div className="texture-overlay pointer-events-none"></div>
      
      {/* Ambient Particles */}
      <div className="dust-field">
         {[...Array(20)].map((_, i) => (
             <div key={i} className="mote" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s` }}></div>
         ))}
      </div>

      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {!showSplash && showTour && (
        <TourOverlay step={tourStep} onNext={handleTourNext} onSkip={handleTourFinish} />
      )}

      {backgroundImage && (
        <>
          <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-in-out" style={{ backgroundImage: `url(${backgroundImage})` }} />
          <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[1px]" />
          {isLightMode && <div className="absolute inset-0 z-0 bg-amber-100/10 mix-blend-multiply" />}
        </>
      )}

      <div className={`relative z-10 flex flex-col h-full ${textColor} transition-all duration-1000 ${showSplash ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        
        {/* Header */}
        <header className={`flex-none h-16 border-b ${borderColor} bg-black/30 backdrop-blur-md z-20 flex items-center justify-between px-6 shadow-lg`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Compass className={`w-8 h-8 ${accentColor} animate-[spin_10s_linear_infinite] opacity-80`} />
            </div>
            <h1 className="text-2xl font-bold font-epic tracking-widest text-amber-100 drop-shadow-md">
              AZ AI <span className="text-[10px] text-amber-500 ml-2 border border-amber-500/30 px-2 py-0.5 rounded-sm uppercase tracking-widest font-sans">The Guild</span>
            </h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowAppearanceMenu(!showAppearanceMenu)}
              className={`p-2 rounded-lg transition-colors ${subTextColor} hover:text-amber-200 hover:bg-white/5 border border-transparent hover:border-amber-500/30`}
              title="Map & Theme"
            >
              <MapIcon className="w-6 h-6" />
            </button>
            {showAppearanceMenu && (
              <div className={`absolute top-14 right-0 w-80 ${cardBg} border border-amber-500/30 rounded-sm shadow-2xl backdrop-blur-xl p-4 flex flex-col gap-4 z-50 animate-in fade-in zoom-in-95`}>
                 <div className="flex justify-between items-center mb-1 border-b border-amber-500/20 pb-2">
                   <h3 className={`text-sm font-bold font-epic uppercase tracking-widest ${accentColor}`}>Cartography 🗺️</h3>
                   <button onClick={() => setShowAppearanceMenu(false)} className={`${subTextColor} hover:text-red-400`}><X className="w-4 h-4"/></button>
                 </div>
                 
                 <div>
                    <label className={`text-[10px] ${subTextColor} font-bold uppercase mb-2 block`}>Atmosphere</label>
                    <div className="flex flex-wrap gap-2">
                        {THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => { setCurrentTheme(theme); setBackgroundImage(null); }}
                                className={`w-8 h-8 rounded-full border-2 transition-all shadow-md ${theme.class} ${currentTheme.id === theme.id && !backgroundImage ? 'border-amber-500 scale-110 ring-2 ring-amber-500/30' : 'border-slate-600 hover:border-amber-400'}`}
                                title={theme.name}
                            />
                        ))}
                    </div>
                 </div>

                 {/* Upload Custom BG */}
                 <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className={`text-[10px] ${subTextColor} font-bold uppercase`}>World Map</label>
                        <input type="file" ref={customBgInputRef} onChange={handleCustomBgSelect} accept="image/*" className="hidden" />
                        <button 
                            onClick={() => customBgInputRef.current?.click()}
                            className="text-[9px] flex items-center gap-1 bg-amber-900/20 px-2 py-0.5 rounded-sm text-amber-600 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/50 transition-colors uppercase font-bold tracking-wider"
                        >
                            <Upload className="w-3 h-3" /> Upload Chart
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {BACKGROUNDS.map((bg, index) => (
                            <button
                                key={index}
                                onClick={() => setBackgroundImage(bg)}
                                className={`aspect-video rounded-sm overflow-hidden border-2 transition-all relative group ${backgroundImage === bg ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-transparent hover:border-amber-300'}`}
                            >
                                <img src={bg} alt={`Loc ${index}`} className="w-full h-full object-cover sepia-[.5] group-hover:sepia-0 transition-all" />
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
          <div className="max-w-5xl mx-auto flex flex-col min-h-full">
            
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-90 mt-10 md:mt-0 animate-in fade-in duration-1000">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto mb-4 border-2 border-amber-500/30 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                         <Feather className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-3 text-amber-100 drop-shadow-lg font-epic uppercase tracking-widest">
                      The Guild Hall
                    </h2>
                    <p className={`${subTextColor} text-sm md:text-base tracking-[0.3em] font-serif italic`}>
                       Where knowledge meets adventure
                    </p>
                </div>
                
                {/* Module Cards Grid (Guild Style) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 max-w-6xl">
                    
                    {/* Chat Card */}
                    <button 
                      onClick={() => { setSelectedTool('chat'); inputRef.current?.focus(); }}
                      className={`group relative h-48 rounded-sm ${cardBg} border ${borderColor} hover:border-blue-500/50 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col p-6 text-left hover:-translate-y-1`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex justify-between items-start mb-4">
                             <div className="p-3 bg-blue-900/20 rounded-full border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                                 <Brain className="w-6 h-6 text-blue-400" />
                             </div>
                             <span className="text-[10px] font-epic tracking-widest text-blue-400/70 uppercase">Wisdom</span>
                        </div>
                        <div className="mt-auto relative z-10">
                            <h3 className="text-xl font-bold text-amber-100 group-hover:text-blue-200 transition-colors font-epic mb-1">Neural Chat</h3>
                            <p className={`text-xs ${subTextColor} font-serif italic`}>Consult the ancient logic engines.</p>
                        </div>
                    </button>

                     {/* Research Card */}
                    <button 
                      onClick={() => { setSelectedTool('research'); inputRef.current?.focus(); }}
                      className={`group relative h-48 rounded-sm ${cardBg} border ${borderColor} hover:border-cyan-500/50 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col p-6 text-left hover:-translate-y-1`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex justify-between items-start mb-4">
                             <div className="p-3 bg-cyan-900/20 rounded-full border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors">
                                 <Globe className="w-6 h-6 text-cyan-400" />
                             </div>
                             <span className="text-[10px] font-epic tracking-widest text-cyan-400/70 uppercase">Discovery</span>
                        </div>
                        <div className="mt-auto relative z-10">
                            <h3 className="text-xl font-bold text-amber-100 group-hover:text-cyan-200 transition-colors font-epic mb-1">Deep Research</h3>
                            <p className={`text-xs ${subTextColor} font-serif italic`}>Scour the world wide web for truth.</p>
                        </div>
                    </button>

                    {/* Image Card */}
                    <button 
                      onClick={() => { setSelectedTool('image'); inputRef.current?.focus(); }}
                      className={`group relative h-48 rounded-sm ${cardBg} border ${borderColor} hover:border-purple-500/50 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col p-6 text-left hover:-translate-y-1`}
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex justify-between items-start mb-4">
                             <div className="p-3 bg-purple-900/20 rounded-full border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                                 <ImageIcon className="w-6 h-6 text-purple-400" />
                             </div>
                             <span className="text-[10px] font-epic tracking-widest text-purple-400/70 uppercase">Artistry</span>
                        </div>
                        <div className="mt-auto relative z-10">
                            <h3 className="text-xl font-bold text-amber-100 group-hover:text-purple-200 transition-colors font-epic mb-1">Visual Arts</h3>
                            <p className={`text-xs ${subTextColor} font-serif italic`}>Manifest visions upon the canvas.</p>
                        </div>
                    </button>
                    
                    {/* Technical Card */}
                    <button 
                      onClick={() => { setSelectedTool('code'); inputRef.current?.focus(); }}
                      className={`group relative h-48 rounded-sm ${cardBg} border ${borderColor} hover:border-green-500/50 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col p-6 text-left hover:-translate-y-1`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex justify-between items-start mb-4">
                             <div className="p-3 bg-green-900/20 rounded-full border border-green-500/20 group-hover:border-green-500/50 transition-colors">
                                 <Terminal className="w-6 h-6 text-green-400" />
                             </div>
                             <span className="text-[10px] font-epic tracking-widest text-green-400/70 uppercase">Engineering</span>
                        </div>
                        <div className="mt-auto relative z-10">
                            <h3 className="text-xl font-bold text-amber-100 group-hover:text-green-200 transition-colors font-epic mb-1">Code Foundry</h3>
                            <p className={`text-xs ${subTextColor} font-serif italic`}>Forge and repair logic structures.</p>
                        </div>
                    </button>
                    
                     {/* Games Card */}
                     <button 
                      onClick={() => { setSelectedTool('game'); }}
                      className={`group relative h-48 rounded-sm ${cardBg} border ${borderColor} hover:border-pink-500/50 overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] flex flex-col p-6 text-left hover:-translate-y-1 md:col-span-2`}
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-pink-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex justify-between items-start mb-4">
                             <div className="p-3 bg-pink-900/20 rounded-full border border-pink-500/20 group-hover:border-pink-500/50 transition-colors">
                                 <Gamepad2 className="w-6 h-6 text-pink-400" />
                             </div>
                             <span className="text-[10px] font-epic tracking-widest text-pink-400/70 uppercase">Recreation</span>
                        </div>
                        <div className="mt-auto relative z-10 flex justify-between items-end">
                            <div>
                                <h3 className="text-xl font-bold text-amber-100 group-hover:text-pink-200 transition-colors font-epic mb-1">The Arcade</h3>
                                <p className={`text-xs ${subTextColor} font-serif italic`}>RPGs, Riddles, and Wits.</p>
                            </div>
                            <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] bg-black/30 px-2 py-1 rounded border border-white/10">RPG</span>
                                <span className="text-[10px] bg-black/30 px-2 py-1 rounded border border-white/10">Trivia</span>
                            </div>
                        </div>
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
                       <div className="flex-shrink-0 w-10 h-10 bg-amber-900/50 rounded-full border border-amber-500/30 flex items-center justify-center shadow-lg animate-pulse">
                          <Feather className="w-5 h-5 text-amber-400" />
                       </div>
                       <ProcessingIndicator statuses={modelStatuses} isSynthesizing={isSynthesizing} mode={generationMode} />
                     </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 p-4 mb-4 text-red-200 bg-red-900/40 border border-red-500/30 rounded-sm backdrop-blur-sm font-serif italic">
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
        <footer className={`flex-none p-4 bg-black/40 border-t ${borderColor} backdrop-blur-md relative ${showTour && tourStep === 1 ? 'z-[60]' : 'z-20'}`}>
          <div className={`max-w-4xl mx-auto flex flex-col gap-3 transition-all duration-300 ${showTour && tourStep === 1 ? 'ring-2 ring-amber-500 shadow-[0_0_30px_rgba(212,175,55,0.4)] rounded-xl bg-black/80 p-2' : ''}`}>
            
            {/* Game Selection Overlay in Footer */}
            {selectedTool === 'game' && !currentGameType && (
                <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar items-center animate-in slide-in-from-bottom-2">
                    <button onClick={() => startGame('custom')} className="px-4 py-2 bg-gradient-to-r from-pink-900 to-purple-900 rounded-sm text-pink-100 text-xs font-bold shadow-lg border border-pink-500/40 hover:scale-105 transition-transform whitespace-nowrap flex items-center gap-1 font-epic">
                        <PlusCircle className="w-3.5 h-3.5" /> New Quest
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                    <button onClick={() => startGame('20_questions')} className="px-4 py-2 bg-pink-950/40 border border-pink-500/30 rounded-sm text-pink-200 text-xs font-serif hover:bg-pink-900/60 whitespace-nowrap">
                        ❓ 20 Riddles
                    </button>
                    <button onClick={() => startGame('rpg')} className="px-4 py-2 bg-purple-950/40 border border-purple-500/30 rounded-sm text-purple-200 text-xs font-serif hover:bg-purple-900/60 whitespace-nowrap">
                        🐉 Fantasy RPG
                    </button>
                    <button onClick={() => startGame('trivia')} className="px-4 py-2 bg-blue-950/40 border border-blue-500/30 rounded-sm text-blue-200 text-xs font-serif hover:bg-blue-900/60 whitespace-nowrap">
                        🧠 Trivia Challenge
                    </button>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
               <div className={`absolute bottom-full left-0 mb-2 w-full max-w-sm ${cardBg} border ${borderColor} rounded-sm p-4 flex flex-col gap-4 animate-in slide-in-from-bottom-2 shadow-2xl`}>
                  <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
                     <span className={`text-xs font-bold font-epic tracking-widest ${accentColor}`}>Configuration</span>
                     <button onClick={() => setShowSettings(false)} className={`${subTextColor} hover:text-white`}><X className="w-3 h-3"/></button>
                  </div>
                  <div>
                      <label className={`text-[10px] ${subTextColor} uppercase font-semibold tracking-wider mb-2 flex items-center gap-2`}>
                          <Ratio className="w-3 h-3" /> Canvas Ratio
                      </label>
                      <div className="flex flex-wrap gap-2">
                          {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                              <button
                                  key={ratio}
                                  onClick={() => setGenConfig(prev => ({...prev, aspectRatio: ratio as any}))}
                                  className={`px-3 py-1 rounded-sm text-xs font-serif border transition-colors ${genConfig.aspectRatio === ratio ? 'bg-amber-900 border-amber-500 text-amber-100' : 'bg-transparent border-slate-600 text-slate-400 hover:border-amber-400'}`}
                              >
                                  {ratio}
                              </button>
                          ))}
                      </div>
                  </div>
               </div>
            )}

            {/* Media Preview */}
            {selectedFile && (
              <div className="relative inline-block self-start animate-in fade-in slide-in-from-bottom-2">
                <div className="relative rounded-sm overflow-hidden border border-amber-500/40 group shadow-lg p-1 bg-black/40">
                  <img src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} alt="Selected" className="h-16 w-auto object-cover sepia-[.2]" />
                  <button onClick={clearFile} className="absolute top-0 right-0 bg-red-900/80 hover:bg-red-600 text-white p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar & Input Container */}
            <div className={`${cardBg} border ${borderColor} rounded-sm p-2 focus-within:ring-1 focus-within:ring-amber-500/50 shadow-xl flex flex-col gap-2 backdrop-blur-xl relative overflow-hidden`}>
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/40"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/40"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/40"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/40"></div>

              <div className="flex items-center gap-1 px-1 overflow-x-auto no-scrollbar relative z-10">
                  <button onClick={() => setSelectedTool('chat')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold font-epic transition-all whitespace-nowrap ${selectedTool === 'chat' ? 'bg-slate-800 text-amber-100 shadow-sm border border-amber-500/30' : 'text-slate-500 hover:text-amber-200 hover:bg-black/20'}`}>
                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                  <button onClick={() => setSelectedTool('research')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold font-epic transition-all whitespace-nowrap ${selectedTool === 'research' ? 'bg-cyan-950/40 text-cyan-200 shadow-sm border border-cyan-500/30' : 'text-slate-500 hover:text-cyan-200 hover:bg-black/20'}`}>
                      <Search className="w-3.5 h-3.5" /> Research
                  </button>
                  <button onClick={() => setSelectedTool('code')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold font-epic transition-all whitespace-nowrap ${selectedTool === 'code' ? 'bg-green-950/40 text-green-200 shadow-sm border border-green-500/30' : 'text-slate-500 hover:text-green-200 hover:bg-black/20'}`}>
                      <Code className="w-3.5 h-3.5" /> Code
                  </button>
                  <button onClick={() => setSelectedTool('image')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold font-epic transition-all whitespace-nowrap ${selectedTool === 'image' ? 'bg-purple-950/40 text-purple-200 shadow-sm border border-purple-500/30' : 'text-slate-500 hover:text-purple-200 hover:bg-black/20'}`}>
                      <Palette className="w-3.5 h-3.5" /> Art
                  </button>
                  <button onClick={() => setSelectedTool('game')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold font-epic transition-all whitespace-nowrap ${selectedTool === 'game' ? 'bg-pink-950/40 text-pink-200 shadow-sm border border-pink-500/30' : 'text-slate-500 hover:text-pink-200 hover:bg-black/20'}`}>
                      <Gamepad2 className="w-3.5 h-3.5" /> Game
                  </button>
              </div>

              <div className="flex items-end gap-2 relative z-10">
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                  
                  <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className={`p-3 ${subTextColor} hover:text-amber-400 hover:bg-black/20 rounded-sm transition-colors disabled:opacity-50`} title="Attach Artifact">
                     <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <button onClick={() => setShowSettings(!showSettings)} disabled={isLoading} className={`p-3 rounded-sm transition-colors disabled:opacity-50 ${showSettings ? 'text-amber-400 bg-black/20' : `${subTextColor} hover:text-amber-400 hover:bg-black/20`}`} title="Options">
                     <Settings className="w-5 h-5" />
                  </button>

                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputResize}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isDefiningGame ? "Inscribe the rules of the realm..." :
                        selectedTool === 'image' ? "Describe the vision to capture..." :
                        selectedTool === 'research' ? "What knowledge do you seek?" :
                        selectedTool === 'game' ? "Your move..." :
                        selectedTool === 'code' ? "Describe the mechanism to forge..." :
                        "Speak your mind, traveler..."
                    }
                    disabled={isLoading}
                    className={`w-full bg-transparent border-none ${textColor} placeholder-slate-500 focus:ring-0 resize-none max-h-[200px] py-3 overflow-y-auto disabled:opacity-50 font-serif`}
                    rows={1}
                  />
                  
                  <button
                  onClick={() => handleSendMessage()}
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className={`p-3 text-white rounded-sm disabled:opacity-0 disabled:scale-75 transition-all duration-300 shadow-md mb-px mr-px border border-white/10 ${
                      isDefiningGame ? 'bg-pink-800 hover:bg-pink-700' :
                      selectedTool === 'image' ? 'bg-purple-800 hover:bg-purple-700' :
                      selectedTool === 'game' ? 'bg-pink-800 hover:bg-pink-700' :
                      selectedTool === 'code' ? 'bg-green-800 hover:bg-green-700' :
                      selectedTool === 'research' ? 'bg-cyan-800 hover:bg-cyan-700' :
                      'bg-amber-700 hover:bg-amber-600'
                  }`}
                  >
                  {isDefiningGame ? <ArrowUpCircle className="w-5 h-5 animate-pulse" /> : 
                   selectedTool === 'chat' ? <Send className="w-5 h-5" /> : 
                   selectedTool === 'game' ? <Gamepad2 className="w-5 h-5"/> : 
                   selectedTool === 'code' ? <Code className="w-5 h-5"/> :
                   selectedTool === 'research' ? <Search className="w-5 h-5" /> :
                   <PlayCircle className="w-5 h-5" />}
                  </button>
              </div>
            </div>
            
            <div className="text-center flex items-center justify-center gap-3 text-[10px] text-slate-500/50 drop-shadow-sm font-epic tracking-[0.2em] uppercase">
               <span>Forged in the Google AI Studio</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
