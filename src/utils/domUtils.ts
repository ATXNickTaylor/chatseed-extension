// src/utils/domUtils.ts

import { getCurrentPlatformConfig } from './platformDetection';

export class DOMHelper {
  private config = getCurrentPlatformConfig();

  getInputElement(): HTMLElement | null {
    if (!this.config) return null;

    let input = document.querySelector(this.config.selectors.input) as HTMLElement;
    
    // Try alternative selector if primary fails
    if (!input && this.config.selectors.inputAlt) {
      input = document.querySelector(this.config.selectors.inputAlt) as HTMLElement;
    }
    
    return input;
  }

  getSendButton(): HTMLElement | null {
    if (!this.config) return null;
    return document.querySelector(this.config.selectors.send) as HTMLElement;
  }

  getUserMessages(): NodeListOf<HTMLElement> {
    if (!this.config) return document.querySelectorAll('');
    return document.querySelectorAll(this.config.selectors.userMessage);
  }

  getAIMessages(): NodeListOf<HTMLElement> {
    if (!this.config) return document.querySelectorAll('');
    return document.querySelectorAll(this.config.selectors.aiMessage);
  }

  getChatContainer(): HTMLElement | null {
    if (!this.config) return null;
    return document.querySelector(this.config.selectors.chatContainer) as HTMLElement;
  }

  insertText(text: string): boolean {
    const input = this.getInputElement();
    if (!input) return false;

    if (this.config?.inputType === 'textarea') {
      (input as HTMLTextAreaElement).value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable
      input.textContent = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    return true;
  }

  focusInput(): boolean {
    const input = this.getInputElement();
    if (!input) return false;
    
    input.focus();
    return true;
  }
}