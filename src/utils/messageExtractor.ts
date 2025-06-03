// src/utils/messageExtractor.ts

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element: Element;
}

// ChatGPT uses different selectors depending on the version
const MESSAGE_SELECTORS = [
  '[data-message-id]',  // New ChatGPT interface
  '.group.w-full',      // Alternative selector
  '[data-testid^="conversation-turn"]' // Another possible selector
];

// Patterns to identify system/meta messages to filter out
const SYSTEM_MESSAGE_PATTERNS = [
  /this conversation was started/i,
  /chatgpt can make mistakes/i,
  /consider checking important information/i,
  /free research preview/i,
  /chatgpt may produce inaccurate information/i,
  /regenerate response/i,
  /stop generating/i,
  /continue generating/i,
  /model upgraded/i,
  /conversation archived/i,
  /new chat/i,
  /clear conversation/i
];

export function extractAllMessages(): ChatMessage[] {
  const messages: ChatMessage[] = [];
  
  // Try different selectors to find messages
  for (const selector of MESSAGE_SELECTORS) {
    const messageElements = document.querySelectorAll(selector);
    
    if (messageElements.length > 0) {
      console.log(`Found ${messageElements.length} messages using selector: ${selector}`);
      
      Array.from(messageElements).forEach((element, index) => {
        const message = parseMessageElement(element, index);
        if (message && isValidConversationMessage(message)) {
          messages.push(message);
        }
      });
      
      break; // Use the first selector that finds messages
    }
  }
  
  return messages;
}

function parseMessageElement(element: Element, fallbackIndex: number): ChatMessage | null {
  try {
    // Get message ID
    const messageId = element.getAttribute('data-message-id') || 
                     element.getAttribute('data-testid') ||
                     `message-${fallbackIndex}`;
    
    // Determine role (user or assistant)
    const role = determineMessageRole(element);
    
    // Extract content with formatting preserved
    const content = extractMessageContentWithFormatting(element);
    
    if (!content.trim()) {
      return null; // Skip empty messages
    }
    
    return {
      id: messageId,
      role,
      content: content.trim(),
      timestamp: new Date(),
      element
    };
    
  } catch (error) {
    console.error('Failed to parse message element:', error);
    return null;
  }
}

function determineMessageRole(element: Element): 'user' | 'assistant' {
  // Look for indicators of user vs assistant messages
  const elementText = element.textContent?.toLowerCase() || '';
  const classList = element.className.toLowerCase();
  
  // Check for user indicators
  if (classList.includes('user') || 
      element.querySelector('[data-testid*="user"]') ||
      element.querySelector('.user-message') ||
      element.querySelector('[aria-label*="user"]')) {
    return 'user';
  }
  
  // Check for assistant indicators  
  if (classList.includes('assistant') || 
      element.querySelector('[data-testid*="assistant"]') ||
      element.querySelector('.assistant-message') ||
      element.querySelector('svg[class*="icon"]') ||
      element.querySelector('[aria-label*="assistant"]')) {
    return 'assistant';
  }
  
  // Look for ChatGPT avatar or branding
  if (element.querySelector('img[alt*="ChatGPT"]') ||
      element.querySelector('[data-testid*="bot"]')) {
    return 'assistant';
  }
  
  // Fallback: alternate between user and assistant based on position
  const allMessages = document.querySelectorAll('[data-message-id], .group.w-full');
  const messageIndex = Array.from(allMessages).indexOf(element);
  return messageIndex % 2 === 0 ? 'user' : 'assistant';
}

function extractMessageContentWithFormatting(element: Element): string {
  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as Element;
  
  // Remove UI elements we don't want in the content
  const selectorsToRemove = [
    'button',           // Action buttons
    '.sr-only',         // Screen reader only content
    '[aria-hidden="true"]', // Hidden elements
    '.copy-button',     // Copy buttons
    '.message-actions', // Message action buttons
    '.text-xs',         // Small text (usually metadata)
    '.opacity-50',      // Faded text
    '[data-testid*="action"]', // Action elements
    '.cursor-pointer'   // Interactive elements
  ];
  
  selectorsToRemove.forEach(selector => {
    clonedElement.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // Get the main content area
  const contentSelectors = [
    '.message-content',
    '[data-message-content]',
    '.prose',
    '.markdown',
    'div:not([class*="button"]):not([class*="action"])'
  ];
  
  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = clonedElement.querySelector(selector);
    if (contentElement && contentElement.textContent?.trim()) {
      break;
    }
  }
  
  if (!contentElement) {
    contentElement = clonedElement;
  }
  
  // Convert HTML to markdown-like formatting
  return convertHtmlToFormattedText(contentElement);
}

function convertHtmlToFormattedText(element: Element): string {
  // Create a formatted text version that preserves structure
  let result = '';
  
  function processNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      result += text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      
      switch (tagName) {
        case 'br':
          result += '\n';
          break;
        case 'p':
          if (result && !result.endsWith('\n')) result += '\n';
          Array.from(el.childNodes).forEach(processNode);
          result += '\n';
          break;
        case 'div':
          if (result && !result.endsWith('\n')) result += '\n';
          Array.from(el.childNodes).forEach(processNode);
          if (!result.endsWith('\n')) result += '\n';
          break;
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
          if (result && !result.endsWith('\n')) result += '\n';
          result += '# ';
          Array.from(el.childNodes).forEach(processNode);
          result += '\n\n';
          break;
        case 'ul': case 'ol':
          if (result && !result.endsWith('\n')) result += '\n';
          Array.from(el.childNodes).forEach(processNode);
          result += '\n';
          break;
        case 'li':
          result += '• ';
          Array.from(el.childNodes).forEach(processNode);
          result += '\n';
          break;
        case 'pre':
          result += '\n```\n';
          Array.from(el.childNodes).forEach(processNode);
          result += '\n```\n';
          break;
        case 'code':
          if (el.parentElement?.tagName.toLowerCase() !== 'pre') {
            result += '`';
            Array.from(el.childNodes).forEach(processNode);
            result += '`';
          } else {
            Array.from(el.childNodes).forEach(processNode);
          }
          break;
        case 'strong': case 'b':
          result += '**';
          Array.from(el.childNodes).forEach(processNode);
          result += '**';
          break;
        case 'em': case 'i':
          result += '*';
          Array.from(el.childNodes).forEach(processNode);
          result += '*';
          break;
        default:
          Array.from(el.childNodes).forEach(processNode);
          break;
      }
    }
  }
  
  Array.from(element.childNodes).forEach(processNode);
  
  // Clean up extra whitespace while preserving intentional formatting
  return result
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
    .replace(/^\s+|\s+$/g, '')        // Trim start/end whitespace
    .replace(/[ \t]+/g, ' ');         // Normalize spaces
}

function isValidConversationMessage(message: ChatMessage): boolean {
  const content = message.content.toLowerCase();
  
  // Filter out system messages
  for (const pattern of SYSTEM_MESSAGE_PATTERNS) {
    if (pattern.test(content)) {
      console.log('Filtering out system message:', content.substring(0, 50));
      return false;
    }
  }
  
  // Filter out very short messages that are likely UI elements
  if (content.length < 10) {
    return false;
  }
  
  // Filter out messages that are just timestamps or metadata
  if (/^\d{1,2}:\d{2}/.test(content) || /^(today|yesterday|\d+\s+(second|minute|hour|day)s?\s+ago)/i.test(content)) {
    return false;
  }
  
  return true;
}

export function getSelectedMessages(messageIds: string[]): ChatMessage[] {
  const allMessages = extractAllMessages();
  return allMessages.filter(message => messageIds.includes(message.id));
}

export function formatMessagesForSaving(messages: ChatMessage[]): string {
  return messages.map(message => {
    const roleLabel = message.role === 'user' ? 'User' : 'Assistant';
    return `${roleLabel}:\n${message.content}`;
  }).join('\n\n---\n\n');
}