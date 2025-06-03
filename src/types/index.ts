// src/types/index.ts

export interface ContextBlock {
  id: string;
  title: string;
  body: string;
  tags: string[];
  dateSaved: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element: Element;
}

export interface SaveModalData {
  selectedMessages: ChatMessage[];
  title: string;
  tags: string[];
}

export interface ExtensionConfig {
  openaiApiKey?: string;
  autoSummarize: boolean;
  toolbarPosition: 'top-right' | 'bottom-right' | 'bottom-left';
}