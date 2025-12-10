export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  thinkingSteps?: string[];
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