import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage, MessageRole, ModelStatus } from './types';
import { generateAzAiResponse, SUPPORTED_MODELS } from './services/geminiService';
import ChatMessageBubble from './components/ChatMessageBubble';
import ProcessingIndicator from './components/ProcessingIndicator';

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize model statuses
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>(
    SUPPORTED_MODELS.map(m => ({ ...m, status: 'idle' } as ModelStatus))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isSynthesizing]);

  const resetStatuses = () => {
    setModelStatuses(prev => prev.map(s => ({ ...s, status: 'idle' })));
    setIsSynthesizing(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    if (inputRef.current) {
        inputRef.current.style.height = 'auto'; 
    }
    setError(null);
    setIsLoading(true);
    resetStatuses();

    // Add user message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: userText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      // Execute the Multi-Model Flow
      const responseText = await generateAzAiResponse(
        userText,
        (modelId, status) => {
          setModelStatuses(prev => 
            prev.map(m => m.id === modelId ? { ...m, status } : m)
          );
        }
      );

      setIsSynthesizing(true);
      // Artificial delay for synthesis visualization to feel "heavy" and impressive
      await new Promise(resolve => setTimeout(resolve, 1500));

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: responseText,
        timestamp: Date.now(),
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
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden selection:bg-purple-500/30">
      
      {/* Header */}
      <header className="flex-none h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="absolute inset-0 bg-purple-500 blur-lg opacity-20 rounded-full"></div>
             <Sparkles className="w-6 h-6 text-purple-400 relative z-10" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AZ AI
          </h1>
        </div>
        <div className="text-xs text-slate-500 font-mono hidden md:block">
          MULTI-MODEL AGGREGATION ENGINE V1.0
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-80 mt-20 md:mt-0">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-black/50 border border-slate-700 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-3xl duration-500"></div>
                <Sparkles className="w-10 h-10 text-slate-200" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-center">How can AZ AI help you?</h2>
              <p className="text-slate-400 text-center max-w-md mb-8">
                I synthesize intelligence from ChatGPT, Gemini, DeepSeek, and more to provide the single best answer.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "Explain quantum entanglement simply",
                  "Compare React vs Vue for enterprise",
                  "Draft a professional email to a client",
                  "Debug a Python recursion error"
                ].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                        setInput(suggestion);
                        // Optional: auto-send or just fill
                    }}
                    className="p-3 text-sm text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all hover:border-slate-600 text-slate-300"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              
              {/* Status Indicator during loading */}
              {isLoading && (
                <div className="flex justify-start mb-6">
                   <div className="flex max-w-[85%] md:max-w-[75%] gap-4">
                     <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Sparkles className="w-5 h-5 text-white" />
                     </div>
                     <ProcessingIndicator statuses={modelStatuses} isSynthesizing={isSynthesizing} />
                   </div>
                </div>
              )}
              
              {error && (
                <div className="flex items-center gap-2 p-4 mb-4 text-red-400 bg-red-900/10 border border-red-900/50 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none p-4 bg-slate-900/90 border-t border-slate-800 backdrop-blur">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none max-h-[200px] overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-0 disabled:scale-75 transition-all duration-200 shadow-lg shadow-purple-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-3">
            <p className="text-[10px] text-slate-600">
                AZ AI synthesizes responses. Data may be inaccurate.
            </p>
        </div>
      </footer>
    </div>
  );
}
