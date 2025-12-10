import React from 'react';
import { ModelStatus } from '../types';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface ProcessingIndicatorProps {
  statuses: ModelStatus[];
  isSynthesizing: boolean;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ statuses, isSynthesizing }) => {
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 w-full max-w-md animate-in fade-in duration-300">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        AZ AI Engine Status
      </div>
      
      <div className="space-y-2">
        {statuses.map((model) => (
          <div key={model.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${model.status === 'idle' ? 'bg-slate-600' : model.color} transition-colors duration-300`}></div>
              <span className={`text-sm ${model.status === 'complete' ? 'text-slate-300' : 'text-slate-500'}`}>
                {model.name}
              </span>
            </div>
            
            <div className="text-slate-500">
              {model.status === 'querying' && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
              {model.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {model.status === 'idle' && <Circle className="w-4 h-4 text-slate-700" />}
            </div>
          </div>
        ))}
      </div>

      {isSynthesizing && (
        <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-3 text-purple-300">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Synthesizing Unified Response...</span>
        </div>
      )}
    </div>
  );
};

export default ProcessingIndicator;