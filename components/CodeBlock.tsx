import React, { useState } from 'react';
import { Copy, Check, Play, Terminal, Code, RotateCcw } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [key, setKey] = useState(0); // To reset iframe

  // Determine if code is runnable in browser
  const isRunnable = ['html', 'javascript', 'js', 'css'].includes(language?.toLowerCase());
  const isJS = ['javascript', 'js'].includes(language?.toLowerCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
      setActiveTab('preview');
      setKey(prev => prev + 1); // Force re-render of iframe to re-run code
  };

  const getPreviewContent = () => {
    if (language === 'html') return value;
    if (language === 'css') return `<style>${value}</style><div style="padding:20px; color: white; font-family: sans-serif;"><h3>CSS Preview</h3><div class="preview-box">Element with styles applied</div></div>`;
    
    if (isJS) {
       // Advanced JS Interpreter with Console Capture
       return `
         <html>
           <head>
             <style>
                body { margin: 0; padding: 0; background: #0f172a; color: #f8fafc; font-family: 'Fira Code', monospace; }
                .console-line { padding: 4px 10px; border-bottom: 1px solid #1e293b; font-size: 13px; }
                .console-log { color: #cbd5e1; }
                .console-error { color: #f87171; background: rgba(248,113,113,0.1); }
                .console-warn { color: #facc15; }
                #app { padding: 10px; border-bottom: 2px solid #334155; margin-bottom: 0; }
                #console-output { height: 100vh; overflow-y: auto; }
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
                   // Handle objects/arrays
                   if (typeof msg === 'object') {
                       div.textContent = '> ' + JSON.stringify(msg, null, 2);
                   } else {
                       div.textContent = '> ' + String(msg);
                   }
                   output.appendChild(div);
               }

               // Override standard console methods
               console.log = (msg) => log(msg, 'log');
               console.error = (msg) => log(msg, 'error');
               console.warn = (msg) => log(msg, 'warn');
               
               // Capture errors
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
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 my-4 shadow-2xl group transition-all hover:border-slate-500">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
           <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
           </div>
           <span className="text-xs font-code text-slate-400 uppercase tracking-wider ml-2 flex items-center gap-1">
             <Terminal className="w-3 h-3" /> {language || 'text'}
           </span>
        </div>
        <div className="flex items-center gap-2">
           {isRunnable && (
             <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700 mr-2">
                <button 
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all ${activeTab === 'code' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                   <Code className="w-3 h-3" /> EDITOR
                </button>
                <button 
                  onClick={handleRun}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all ${activeTab === 'preview' ? 'bg-green-600 text-white shadow-sm shadow-green-900/50' : 'text-slate-500 hover:text-green-400'}`}
                >
                   <Play className="w-3 h-3" /> RUN
                </button>
             </div>
           )}
           
           <button 
             onClick={handleCopy} 
             className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-700 rounded-md"
             title="Copy Code"
           >
             {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative bg-[#0d1117]">
        {activeTab === 'code' ? (
           <pre className="p-4 overflow-x-auto text-sm font-code leading-relaxed text-blue-100 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
             <code>{value}</code>
           </pre>
        ) : (
           <div className="h-64 w-full bg-slate-950 flex flex-col">
              {/* Reset Bar */}
              <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-2 justify-end">
                  <button onClick={handleRun} className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-white">
                      <RotateCcw className="w-3 h-3"/> Rerun
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