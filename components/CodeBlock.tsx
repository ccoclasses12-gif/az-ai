
import React, { useState } from 'react';
import { Copy, Check, Play, Terminal, Code, RotateCcw } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [key, setKey] = useState(0); 

  const isRunnable = ['html', 'javascript', 'js', 'css'].includes(language?.toLowerCase());
  const isJS = ['javascript', 'js'].includes(language?.toLowerCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
      setActiveTab('preview');
      setKey(prev => prev + 1); 
  };

  const getPreviewContent = () => {
    if (language === 'html') return value;
    if (language === 'css') return `<style>${value}</style><div style="padding:20px; color: #1a1510; font-family: sans-serif; background: #f5e6d3; height: 100vh;"><h3>CSS Preview</h3><div class="preview-box">Element with styles applied</div></div>`;
    
    if (isJS) {
       return `
         <html>
           <head>
             <style>
                body { margin: 0; padding: 0; background: #1a1510; color: #e5e5e5; font-family: 'Fira Code', monospace; }
                .console-line { padding: 4px 10px; border-bottom: 1px solid #2d241e; font-size: 13px; }
                .console-log { color: #94a3b8; }
                .console-error { color: #f87171; background: rgba(248,113,113,0.1); }
                .console-warn { color: #facc15; }
                #app { padding: 10px; border-bottom: 2px solid #2d241e; margin-bottom: 0; background: #0f0c0a; }
                #console-output { height: 100vh; overflow-y: auto; background: #0a0806; }
             </style>
           </head>
           <body>
             <div id="app"></div>
             <div id="console-output"></div>
             <script>
               const output = document.getElementById('console-output');
               const app = document.getElementById('app');
               
               function log(msg, type='log') {
                   const div = document.createElement('div');
                   div.className = 'console-line console-' + type;
                   if (typeof msg === 'object') {
                       div.textContent = '> ' + JSON.stringify(msg, null, 2);
                   } else {
                       div.textContent = '> ' + String(msg);
                   }
                   output.appendChild(div);
               }

               console.log = (msg) => log(msg, 'log');
               console.error = (msg) => log(msg, 'error');
               console.warn = (msg) => log(msg, 'warn');
               
               window.onerror = function(message, source, lineno, colno, error) {
                   log(message + ' (Line ' + lineno + ')', 'error');
               };

               try {
                 ${value}
               } catch(e) {
                 console.error(e);
               }
             </script>
           </body>
         </html>
       `;
    }
    return '';
  };

  return (
    <div className="rounded-sm overflow-hidden border border-amber-900/40 bg-[#0f0c0a] my-4 shadow-xl group transition-all hover:border-amber-700/60 font-serif">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1510] border-b border-amber-900/30">
        <div className="flex items-center gap-3">
           <div className="flex gap-1.5 opacity-50">
             <div className="w-2 h-2 rounded-full bg-slate-500"></div>
             <div className="w-2 h-2 rounded-full bg-slate-500"></div>
             <div className="w-2 h-2 rounded-full bg-slate-500"></div>
           </div>
           <span className="text-xs font-epic text-amber-700 uppercase tracking-widest ml-2 flex items-center gap-1">
             <Terminal className="w-3 h-3" /> {language || 'text'}
           </span>
        </div>
        <div className="flex items-center gap-2">
           {isRunnable && (
             <div className="flex bg-black/40 rounded-sm p-0.5 border border-amber-900/20 mr-2">
                <button 
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-sm flex items-center gap-1 transition-all uppercase tracking-wider ${activeTab === 'code' ? 'bg-amber-900/50 text-amber-100 shadow-sm' : 'text-amber-700 hover:text-amber-400'}`}
                >
                   <Code className="w-3 h-3" /> SCRIPT
                </button>
                <button 
                  onClick={handleRun}
                  className={`px-3 py-1 text-[10px] font-bold rounded-sm flex items-center gap-1 transition-all uppercase tracking-wider ${activeTab === 'preview' ? 'bg-green-900/50 text-green-100 shadow-sm border border-green-500/20' : 'text-amber-700 hover:text-green-400'}`}
                >
                   <Play className="w-3 h-3" /> EXECUTE
                </button>
             </div>
           )}
           
           <button 
             onClick={handleCopy} 
             className="text-amber-700 hover:text-amber-400 transition-colors p-1.5 hover:bg-amber-900/20 rounded-sm"
             title="Copy Rune"
           >
             {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === 'code' ? (
           <pre className="p-4 overflow-x-auto text-sm font-code leading-relaxed text-amber-100/90 scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent">
             <code>{value}</code>
           </pre>
        ) : (
           <div className="h-64 w-full bg-[#0a0806] flex flex-col">
              {/* Reset Bar */}
              <div className="h-8 bg-[#120f0d] border-b border-amber-900/20 flex items-center px-2 justify-end">
                  <button onClick={handleRun} className="text-[10px] flex items-center gap-1 text-amber-700 hover:text-amber-400 uppercase tracking-widest font-bold">
                      <RotateCcw className="w-3 h-3"/> Reset
                  </button>
              </div>
              <iframe 
                key={key}
                srcDoc={getPreviewContent()}
                className="w-full flex-1 border-none"
                title="Code Preview"
                sandbox="allow-scripts allow-modals"
              />
           </div>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
