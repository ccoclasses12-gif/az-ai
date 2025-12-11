
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole, ChatMessage } from '../types';
import { User, Feather, Scroll, Volume2, Loader2, Sparkles } from 'lucide-react';
import CodeBlock from './CodeBlock';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onSpeak }) => {
  const isUser = message.role === MessageRole.USER;
  const isAssistant = !isUser;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakClick = () => {
    if (onSpeak && message.content) {
      setIsSpeaking(true);
      onSpeak(message.content);
      setTimeout(() => setIsSpeaking(false), 3000); 
    }
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 glorious-entrance`}>
      <div className={`flex max-w-[95%] md:max-w-[80%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center shadow-lg border
          ${isUser 
            ? 'bg-slate-800 border-slate-600' 
            : 'bg-[#1a1510] border-amber-900/50'}
        `}>
          {isUser ? <User className="w-5 h-5 text-slate-400" /> : (
            <Scroll className="w-5 h-5 text-amber-500" />
          )}
        </div>

        {/* Content */}
        <div className={`
          flex flex-col w-full min-w-0
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className="flex items-center gap-2 mb-2 px-1 opacity-80">
             <span className={`text-xs font-bold tracking-[0.2em] uppercase font-epic ${isUser ? 'text-slate-400' : 'text-amber-500/70'}`}>
               {isUser ? 'Traveler' : (message.modelName || 'The Guild')}
             </span>
          </div>

          <div className={`
            overflow-hidden w-full relative group/bubble shadow-2xl
            ${isUser 
              ? 'rounded-sm bg-slate-800 border border-slate-700 text-slate-200 max-w-fit' 
              : 'rounded-sm bg-[#f5e6d3] text-slate-900 border border-amber-900/20 w-full'}
          `}>
             {/* Media Attachment Display */}
             {message.attachment && message.attachment.mimeType.startsWith('image/') && (
               <div className="bg-black/10 border-b border-black/5 p-1">
                   <img 
                     src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                     alt="Attachment" 
                     className="max-w-full h-auto max-h-[400px] rounded-sm object-contain bg-transparent border border-black/10 shadow-inner"
                   />
               </div>
             )}

             <div className="px-6 py-5 text-sm md:text-base leading-relaxed relative z-10 w-full font-serif">
               {/* Paper Texture Overlay for AI */}
               {!isUser && (
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
               )}
               
               <div className={`prose prose-sm md:prose-base max-w-none prose-p:my-3 prose-headings:font-epic prose-headings:uppercase prose-headings:tracking-wide prose-code:font-code ${isUser ? 'prose-invert' : 'prose-headings:text-amber-900 prose-p:text-slate-900 prose-strong:text-amber-900'}`}>
                 <ReactMarkdown 
                   components={{
                     a: ({node, ...props}) => <a {...props} className="text-blue-600 hover:text-blue-800 underline decoration-blue-400/30 underline-offset-4" target="_blank" rel="noopener noreferrer" />,
                     code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                        ) : (
                          <code className={`px-1 py-0.5 rounded font-mono text-sm ${isUser ? 'bg-black/30 text-amber-200' : 'bg-amber-900/10 text-amber-900'}`} {...props}>
                            {children}
                          </code>
                        )
                     },
                     pre: ({children}) => <div className="not-prose">{children}</div>
                   }}
                 >
                  {message.content}
                 </ReactMarkdown>
               </div>
            </div>
            
            {/* TTS Button (only for AI) */}
            {!isUser && onSpeak && (
                <div className="absolute bottom-3 right-3 opacity-0 group-hover/bubble:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/bubble:translate-y-0">
                    <button 
                        onClick={handleSpeakClick}
                        disabled={isSpeaking}
                        className="p-2 bg-amber-100/50 hover:bg-amber-200/50 backdrop-blur rounded-full text-amber-900 transition-colors shadow-sm border border-amber-900/10"
                        title="Read Aloud"
                    >
                        {isSpeaking ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
