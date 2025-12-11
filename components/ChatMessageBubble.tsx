import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole, ChatMessage } from '../types';
import { User, BrainCircuit, Aperture, Volume2, Loader2, Sparkles } from 'lucide-react';
import CodeBlock from './CodeBlock';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onSpeak }) => {
  const isUser = message.role === MessageRole.USER;
  const isHailuo = message.modelName === "Hailuo AI"; // Still used for Images
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
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-xl
          ${isUser 
            ? 'bg-slate-700' 
            : isHailuo 
              ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/30' 
              : 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 shadow-purple-500/30'}
        `}>
          {isUser ? <User className="w-5 h-5 text-slate-300" /> : (
            isHailuo ? <Aperture className="w-5 h-5 text-white" /> : 
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className={`
          flex flex-col w-full min-w-0
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className="flex items-center gap-2 mb-2 px-1 opacity-80">
             <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
               {isUser ? 'You' : (message.modelName || 'AZ AI')}
             </span>
          </div>

          <div className={`
            overflow-hidden w-full relative group/bubble shadow-2xl
            ${isUser 
              ? 'rounded-2xl rounded-tr-sm bg-slate-700 text-slate-100 max-w-fit' 
              : 'rounded-2xl rounded-tl-sm bg-black/40 border border-white/10 backdrop-blur-md text-slate-100 w-full'}
          `}>
             {/* Media Attachment Display */}
             {message.attachment && (
               <div className="bg-black/50 border-b border-white/5 p-1">
                 {message.attachment.mimeType.startsWith('image/') ? (
                   <img 
                     src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                     alt="Attachment" 
                     className="max-w-full h-auto max-h-[400px] rounded-lg object-contain bg-transparent"
                   />
                 ) : message.attachment.mimeType.startsWith('video/') ? (
                   <video 
                     controls 
                     className="max-w-full h-auto max-h-[400px] rounded-lg bg-black"
                   >
                     <source src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} type={message.attachment.mimeType} />
                     Your browser does not support the video tag.
                   </video>
                 ) : null}
               </div>
             )}

             <div className="px-6 py-5 text-sm md:text-base leading-relaxed relative z-10 w-full">
               {/* Subtle background gradient for AI messages */}
               {!isUser && (
                   <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none"></div>
               )}
               
               <div className="prose prose-invert max-w-none prose-p:my-3 prose-headings:mb-3 prose-headings:mt-6 prose-headings:text-purple-200 prose-code:text-blue-300 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:border-none prose-strong:text-white">
                 <ReactMarkdown 
                   components={{
                     a: ({node, ...props}) => <a {...props} className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-4" target="_blank" rel="noopener noreferrer" />,
                     code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
                        ) : (
                          <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-200 font-mono text-sm" {...props}>
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
                        className="p-2 bg-slate-800/80 hover:bg-purple-600/80 backdrop-blur rounded-full text-slate-300 hover:text-white transition-colors shadow-lg border border-white/5"
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