// src/utils/messageExtractor.ts
import { DOMHelper } from './domUtils';
import { detectCurrentPlatform, getPlatformDisplayName } from './platformDetection';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  element: Element;
}

// ChatGPT uses different selectors depending on the version - FROM v1.2.2
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
  /clear conversation/i,
  /gemini can make mistakes/i,
  /double-check responses/i,
  /bard is now gemini/i
];

export function extractAllMessages(): ChatMessage[] {
  console.log('🔍 Starting message extraction...');
  
  const currentPlatform = detectCurrentPlatform();
  if (!currentPlatform) {
    console.error('❌ No supported platform detected');
    return [];
  }

  console.log(`🔍 Extracting messages for ${getPlatformDisplayName(currentPlatform)}`);
  
  const messages: ChatMessage[] = [];
  
  try {
    // For ChatGPT, use the working v1.2.2 approach with MESSAGE_SELECTORS
    if (currentPlatform === 'chatgpt') {
      return extractChatGPTMessagesWithWorkingOrder();
    }
    
    // For other platforms, use the existing DOMHelper approach
    const domHelper = new DOMHelper();
    
    // Get user and AI messages using DOMHelper
    const userMessages = domHelper.getUserMessages();
    const aiMessages = domHelper.getAIMessages();
    
    console.log(`🔍 DOMHelper found: ${userMessages.length} user messages, ${aiMessages.length} AI messages`);
    
    // Create combined array with all messages and their proper chronological positions
    const allMessageElements: { element: Element; role: 'user' | 'assistant'; chronologicalPosition: number }[] = [];
    
    // Add user messages with their chronological positions
    userMessages.forEach((element) => {
      allMessageElements.push({
        element,
        role: 'user',
        chronologicalPosition: getChronologicalPosition(element)
      });
    });
    
    // Add AI messages with their chronological positions
    aiMessages.forEach((element) => {
      allMessageElements.push({
        element,
        role: 'assistant', 
        chronologicalPosition: getChronologicalPosition(element)
      });
    });
    
    // Sort by chronological position (true temporal order)
    allMessageElements.sort((a, b) => a.chronologicalPosition - b.chronologicalPosition);
    
    console.log(`🔍 Processing ${allMessageElements.length} messages in chronological order`);
    
    // Process messages in correct chronological order
    allMessageElements.forEach((item, index) => {
      const messageId = `${item.role}-${index}-${Date.now()}`;
      const message = parseMessageElement(item.element, messageId, item.role, currentPlatform);
      
      if (message && isValidConversationMessage(message)) {
        messages.push(message);
        console.log(`✅ Added ${item.role} message: "${message.content.substring(0, 50)}..."`);
      } else {
        console.log(`❌ Skipped ${item.role} message (invalid or filtered)`);
      }
    });
    
    console.log(`🔍 Extraction complete: ${messages.length} total messages`);
    return messages;
    
  } catch (error) {
    console.error('❌ Error during message extraction:', error);
    return [];
  }
}

// NEW: Working ChatGPT message extraction from v1.2.2
function extractChatGPTMessagesWithWorkingOrder(): ChatMessage[] {
  const messages: ChatMessage[] = [];
  
  // Try different selectors to find messages - FROM v1.2.2
  for (const selector of MESSAGE_SELECTORS) {
    const messageElements = document.querySelectorAll(selector);
    
    if (messageElements.length > 0) {
      console.log(`Found ${messageElements.length} messages using selector: ${selector}`);
      
      Array.from(messageElements).forEach((element, index) => {
        const message = parseMessageElementV122(element, index);
        if (message && isValidConversationMessage(message)) {
          messages.push(message);
        }
      });
      
      break; // Use the first selector that finds messages
    }
  }
  
  return messages;
}

// NEW: Message parsing from v1.2.2 that works with chronological order
function parseMessageElementV122(element: Element, fallbackIndex: number): ChatMessage | null {
  try {
    // Get message ID
    const messageId = element.getAttribute('data-message-id') || 
                     element.getAttribute('data-testid') ||
                     `message-${fallbackIndex}`;
    
    // Determine role (user or assistant) - FROM v1.2.2
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

// NEW: Working role determination from v1.2.2
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

// NEW: Content extraction with formatting from v1.2.2
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

// NEW: HTML to formatted text conversion from v1.2.2
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

function getChronologicalPosition(element: Element): number {
  // Use document order position instead of the flawed sibling-counting approach
  return getDocumentPosition(element);
}

function findConversationContainer(element: Element): Element | null {
  // Common selectors for conversation containers across platforms
  const conversationSelectors = [
    '[role="main"]',
    '.conversation',
    '.chat-container',
    '.messages-container',
    '.message-list',
    '[data-testid*="conversation"]',
    '[data-testid*="chat"]',
    '.chat-messages',
    '#conversation',
    '.conversation-container'
  ];
  
  // Start from the element and traverse up to find conversation container
  let current: Element | null = element;
  
  while (current && current !== document.body) {
    // Check if current element matches any conversation selector
    for (const selector of conversationSelectors) {
      try {
        if (current.matches(selector)) {
          console.log(`🎯 Found conversation container with selector: ${selector}`);
          return current;
        }
      } catch (e) {
        // Ignore CSS selector errors
      }
    }
    
    // Also check if this looks like a conversation container by content
    if (looksLikeConversationContainer(current)) {
      console.log('🎯 Found conversation container by content analysis');
      return current;
    }
    
    current = current.parentElement;
  }
  
  // Fallback: look for conversation container in the entire document
  for (const selector of conversationSelectors) {
    try {
      const container = document.querySelector(selector);
      if (container && container.contains(element)) {
        console.log(`🎯 Found conversation container globally with selector: ${selector}`);
        return container;
      }
    } catch (e) {
      // Ignore CSS selector errors
    }
  }
  
  console.log('⚠️ No conversation container found, using document body');
  return document.body;
}

function looksLikeConversationContainer(element: Element): boolean {
  // Check if element contains multiple message-like children
  const children = Array.from(element.children);
  let messageCount = 0;
  
  children.forEach(child => {
    if (couldBeMessageElement(child)) {
      messageCount++;
    }
  });
  
  // If it has multiple message-like children, it's likely a conversation container
  return messageCount >= 2;
}

function couldBeMessageElement(element: Element): boolean {
  const text = element.textContent?.trim() || '';
  
  // Must have substantial text content
  if (text.length < 10) return false;
  
  // Check for message-like characteristics
  const hasMessageClass = element.className.toLowerCase().includes('message') ||
                         element.className.toLowerCase().includes('chat') ||
                         element.className.toLowerCase().includes('response');
  
  const hasMessageAttributes = element.hasAttribute('data-message') ||
                              element.hasAttribute('data-testid') ||
                              element.hasAttribute('role');
  
  const hasSubstantialContent = text.length > 20;
  
  return hasMessageClass || hasMessageAttributes || hasSubstantialContent;
}

function getDocumentPosition(element: Element): number {
  // Use TreeWalker to get proper document order position
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    null
  );
  
  let position = 0;
  let currentNode: Element | null;
  
  while (currentNode = walker.nextNode() as Element) {
    if (currentNode === element) {
      return position;
    }
    position++;
  }
  
  // Fallback: if element not found in body, try from document root
  const allElements = Array.from(document.querySelectorAll('*'));
  const index = allElements.indexOf(element);
  return index >= 0 ? index : position;
}

function parseMessageElement(
  element: Element, 
  messageId: string, 
  role: 'user' | 'assistant',
  platform: string
): ChatMessage | null {
  try {
    console.log(`📝 Parsing ${role} message element:`, element);
    
    // Extract content with platform-specific handling
    const content = extractMessageContentForPlatform(element, platform);
    
    if (!content.trim()) {
      console.log('❌ Empty content, skipping message');
      return null;
    }
    
    const message: ChatMessage = {
      id: messageId,
      role,
      content: content.trim(),
      timestamp: new Date(),
      element
    };
    
    console.log(`📝 Parsed ${role} message: Content="${content.substring(0, 50)}..."`);
    return message;
    
  } catch (error) {
    console.error('❌ Failed to parse message element:', error);
    return null;
  }
}

function extractMessageContentForPlatform(element: Element, platform: string): string {
  console.log(`🔧 Extracting content for ${platform}:`, element);
  
  // Clone element to avoid modifying original
  const clonedElement = element.cloneNode(true) as Element;
  
  // Remove unwanted elements FIRST
  removeUnwantedElements(clonedElement);
  
  // Platform-specific content extraction
  let content = '';
  if (platform === 'gemini') {
    content = extractGeminiContent(clonedElement);
  } else {
    content = extractChatGPTContent(clonedElement);
  }
  
  console.log(`🔧 Extracted content: "${content.substring(0, 100)}..."`);
  return content;
}

function removeUnwantedElements(element: Element): void {
  // Remove script and style elements first
  element.querySelectorAll('script, style, noscript').forEach(el => el.remove());
  
  // Remove interactive and UI elements
  const selectorsToRemove = [
    'button',
    '.sr-only',
    '[aria-hidden="true"]',
    '.copy-button',
    '.message-actions', 
    '.text-xs',
    '.opacity-50',
    '[data-testid*="action"]',
    '.cursor-pointer',
    '[role="button"]',
    '[data-testid*="copy"]',
    '[data-testid*="edit"]',
    '[title*="Copy"]',
    '[title*="Edit"]',
    // More specific removals
    '.action-button',
    '.rating-buttons',
    '.feedback-buttons',
    '.flex.gap-1',
    '.flex.items-center.gap-1',
    // Remove any elements with onClick handlers or similar
    '[onclick]',
    '[onmousedown]',
    '[onmouseup]'
  ];
  
  selectorsToRemove.forEach(selector => {
    try {
      element.querySelectorAll(selector).forEach(el => el.remove());
    } catch (e) {
      // Ignore CSS selector errors
    }
  });
  
  // Remove elements that look like script content
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const text = el.textContent || '';
    if (text.includes('window.') || 
        text.includes('__oai_') || 
        text.includes('logHTML') ||
        text.includes('function(') ||
        text.includes('addEventListener') ||
        text.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/)) {
      el.remove();
    }
  });
}

function extractChatGPTContent(element: Element): string {
  console.log('🔧 ChatGPT content extraction');
  
  // ChatGPT specific content selectors (most specific first)
  const contentSelectors = [
    '.prose',
    '[data-message-content]',
    '.message-content',
    '.markdown',
    'div.whitespace-pre-wrap',
    'div[class*="prose"]',
    'div[class*="markdown"]',
    // User input specific
    'div[contenteditable]',
    'div[data-slate-node]'
  ];
  
  // Try to find the main content container
  let contentElement = findBestContentElement(element, contentSelectors);
  
  if (!contentElement) {
    // Fallback: try to find any div with substantial text content
    const divs = element.querySelectorAll('div');
    let bestDiv: Element | null = null;
    let maxLength = 0;
    
    divs.forEach(div => {
      const text = div.textContent?.trim() || '';
      if (text.length > maxLength && text.length > 10 && !text.includes('window.')) {
        maxLength = text.length;
        bestDiv = div;
      }
    });
    
    contentElement = bestDiv || element;
  }
  
  return extractCleanText(contentElement);
}

function extractGeminiContent(element: Element): string {
  console.log('🔧 Gemini content extraction');
  
  // Gemini specific content selectors
  const contentSelectors = [
    '[data-message-content]',
    '.message-content',
    '.response-content',
    '.markdown',
    '.prose',
    'div[class*="response"]',
    'div[class*="message"]',
    'div[class*="content"]'
  ];
  
  let contentElement = findBestContentElement(element, contentSelectors);
  
  if (!contentElement) {
    // Gemini fallback - find the div with the most text
    const divs = element.querySelectorAll('div');
    let bestDiv: Element | null = null;
    let maxLength = 0;
    
    divs.forEach(div => {
      const text = div.textContent?.trim() || '';
      if (text.length > maxLength && text.length > 10) {
        maxLength = text.length;
        bestDiv = div;
      }
    });
    
    contentElement = bestDiv || element;
  }
  
  return extractCleanText(contentElement);
}

function findBestContentElement(parent: Element, selectors: string[]): Element | null {
  for (const selector of selectors) {
    const found = parent.querySelector(selector);
    if (found) {
      const text = found.textContent?.trim() || '';
      // Make sure it has substantial content and isn't script
      if (text.length > 10 && !text.includes('window.') && !text.includes('function(')) {
        console.log(`🎯 Found content with selector: ${selector}`);
        return found;
      }
    }
  }
  return null;
}

function extractCleanText(element: Element): string {
  // Get just the clean text content, preserving basic formatting
  const text = element.textContent || '';
  
  // Clean up the text
  return text
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/\n\s*\n/g, '\n')      // Remove excessive line breaks
    .trim();                        // Remove leading/trailing whitespace
}

function isValidConversationMessage(message: ChatMessage): boolean {
  const content = message.content.toLowerCase().trim();
  
  // Filter out system messages
  for (const pattern of SYSTEM_MESSAGE_PATTERNS) {
    if (pattern.test(content)) {
      console.log(`🚫 Filtering out system message: "${content.substring(0, 50)}..."`);
      return false;
    }
  }
  
  // Filter out very short messages
  if (content.length < 3) {
    console.log(`🚫 Filtering out short message: "${content}"`);
    return false;
  }
  
  // Filter out script-like content
  if (content.includes('window.') || 
      content.includes('function(') || 
      content.includes('__oai_') ||
      content.includes('loghtml') ||
      content.match(/^[a-z_$][a-z0-9_$]*\s*\(/i)) {
    console.log(`🚫 Filtering out script content: "${content.substring(0, 50)}..."`);
    return false;
  }
  
  // Filter out timestamp-only messages
  if (/^\d{1,2}:\d{2}/.test(content) || 
      /^(today|yesterday|\d+\s+(second|minute|hour|day)s?\s+ago)$/i.test(content)) {
    console.log(`🚫 Filtering out metadata message: "${content}"`);
    return false;
  }
  
  return true;
}

export function getSelectedMessages(messageIds: string[]): ChatMessage[] {
  const allMessages = extractAllMessages();
  return allMessages.filter(message => messageIds.includes(message.id));
}

export function formatMessagesForSaving(messages: ChatMessage[]): string {
  const currentPlatform = detectCurrentPlatform();
  const platformName = getPlatformDisplayName(currentPlatform || 'chatgpt');
  
  return messages.map(message => {
    const roleLabel = message.role === 'user' ? 'User' : platformName;
    return `${roleLabel}:\n${message.content}`;
  }).join('\n\n---\n\n');
}