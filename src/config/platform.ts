// src/config/platform.ts

import { PlatformConfig } from '../types/index';

export const PLATFORMS: Record<string, PlatformConfig> = {
  chatgpt: {
    name: 'ChatGPT',
    urlPattern: 'chatgpt.com',
    selectors: {
      input: '#prompt-textarea',
      send: '[data-testid="send-button"]',
      userMessage: '.text-base',
      aiMessage: '.markdown',
      chatContainer: '.flex.flex-col'
    },
    inputType: 'textarea'
  },
  gemini: {
    name: 'Gemini',
    urlPattern: 'gemini.google.com/app',
    selectors: {
      input: '.ql-editor.textarea[contenteditable="true"]',
      inputAlt: '[aria-label="Enter a prompt here"]',
      send: '.send-button.submit',
      userMessage: 'p.query-text-line',
      aiMessage: 'message-content',
      chatContainer: '.conversation-container'
    },
    inputType: 'contenteditable'
  }
};

export const PLATFORM_NAMES = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini'
} as const;

export type PlatformType = keyof typeof PLATFORMS;