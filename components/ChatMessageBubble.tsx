import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole, ChatMessage } from '../types';
import { Bot, User, BrainCircuit } from 'lucide-react';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isUser ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-purple-900/20'}
        `}>
          {isUser ? <User className="w-6 h-6 text-slate-300" /> : <BrainCircuit className="w-6 h-6 text-white" />}
        </div>

        {/* Content */}
        <div className={`
          flex flex-col
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className="flex items-center gap-2 mb-1 px-1">
             <span className="text-xs font-semibold text-slate-400">
               {isUser ? 'You' : 'AZ AI'}
             </span>
             {!isUser && (
               <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/50">
                 Unified Response
               </span>
             )}
          </div>

          <div className={`
            px-5 py-3.5 rounded-2xl text-sm md:text-base leading-relaxed overflow-hidden
            ${isUser 
              ? 'bg-slate-700 text-slate-100 rounded-tr-none' 
              : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none shadow-sm'}
          `}>
             <ReactMarkdown 
               className="prose prose-invert prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-code:text-blue-300 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700"
               components={{
                 a: ({node, ...props}) => <a {...props} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" />
               }}
             >
              {message.content}
             </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;