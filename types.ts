export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  attachment?: Attachment;
  isThinking?: boolean;
  thinkingSteps?: string[];
  modelName?: string; // To distinguish AZ AI vs Hailuo AI
}

export interface ModelStatus {
  id: string;
  name: string;
  status: 'idle' | 'querying' | 'complete' | 'error';
  color: string;
}

export interface AzAiConfig {
  models: string[];
}

export interface GenerationConfig {
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}