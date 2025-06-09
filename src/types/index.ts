// src/types/index.ts

export interface ContextBlock {
  id: string;
  title: string;
  body: string;
  tags: string[];
  dateSaved: number;
  isFavorite?: boolean;
  lastUsed?: number;
  platform: 'chatgpt' | 'gemini'; // NEW FIELD
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

export interface NavigationState {
  activeSection: 'all' | 'recent' | 'favorites' | 'tags';
  searchQuery: string;
  tagFilter: string | null;
}

export interface ContextStats {
  total: number;
  recent: number;
  favorites: number;
  tags: string[];
}

// NEW INTERFACES FOR PLATFORM SUPPORT
export interface PlatformConfig {
  name: string;
  urlPattern: string;
  selectors: {
    input: string;
    inputAlt?: string;
    send: string;
    userMessage: string;
    aiMessage: string;
    chatContainer: string;
  };
  inputType: 'textarea' | 'contenteditable';
}

export interface PlatformSelectors {
  [key: string]: PlatformConfig;
}