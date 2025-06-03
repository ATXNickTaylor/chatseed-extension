// src/content/content.ts
import { openSaveModal } from './saveModal';

// This script runs on every ChatGPT page load
console.log('ChatGPT Context Saver: Content script loaded - UPDATED VERSION');

// Check if we're on ChatGPT
function isChatGPTPage(): boolean {
  return window.location.hostname === 'chat.openai.com' || 
         window.location.hostname === 'chatgpt.com';
}

// Wait for page to fully load
function waitForPageLoad(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', () => resolve());
    }
  });
}

// Wait for ChatGPT interface to be ready - UPDATED SELECTORS
function waitForChatInterface(): Promise<void> {
  return new Promise((resolve) => {
    const checkForChat = () => {
      // Updated selectors for current ChatGPT interface
      const chatContainer = document.querySelector('main') || 
                           document.querySelector('#main') ||
                           document.querySelector('body > div') ||
                           document.querySelector('[id*="app"]');
      
      if (chatContainer) {
        console.log('ChatGPT interface found:', chatContainer);
        resolve();
      } else {
        setTimeout(checkForChat, 100);
      }
    };
    checkForChat();
  });
}

// Create floating toolbar HTML with custom image
function createFloatingToolbar(): void {
  // Check if toolbar already exists
  if (document.getElementById('chatgpt-context-saver-toolbar')) {
    return;
  }

  // Create toolbar container
  const toolbar = document.createElement('div');
  toolbar.id = 'chatgpt-context-saver-toolbar';
  toolbar.innerHTML = `
    <button id="context-saver-btn" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: transparent;
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      background-image: url('${chrome.runtime.getURL('floating-button.png')}');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    " title="Save ChatGPT Context">
    </button>
  `;

  // Add hover effects
  const button = toolbar.querySelector('#context-saver-btn') as HTMLButtonElement;
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1) translateY(-2px)';
    button.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
    button.style.filter = 'brightness(1.1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1) translateY(0)';
    button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    button.style.filter = 'brightness(1)';
  });

  // Add click handler - now uses the real save modal
  button.addEventListener('click', () => {
    console.log('Context saver button clicked');
    try {
      openSaveModal();
    } catch (error) {
      console.error('Error opening save modal:', error);
      alert('Error opening save modal. Please try again.');
    }
  });

  // Append to body
  document.body.appendChild(toolbar);
  console.log('Floating toolbar created successfully!');
}

// Main initialization function
async function initializeExtension(): Promise<void> {
  if (!isChatGPTPage()) {
    console.log('ChatGPT Context Saver: Not on ChatGPT page');
    return;
  }

  try {
    await waitForPageLoad();
    await waitForChatInterface();
    
    // Create and inject the floating toolbar
    createFloatingToolbar();
    console.log('ChatGPT Context Saver: Toolbar injected successfully');
    
    // Set up observer for dynamic content changes
    setupMutationObserver();
    
    console.log('ChatGPT Context Saver: Initialization complete!');
    
  } catch (error) {
    console.error('ChatGPT Context Saver: Failed to initialize:', error);
  }
}

// Watch for dynamic changes in the ChatGPT interface
function setupMutationObserver(): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check if new messages were added
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Look for new message containers
            if (element.matches('[data-message-id]') || 
                element.querySelector('[data-message-id]')) {
              console.log('New message detected');
              // Could trigger UI updates here if needed
            }
          }
        });
      }
    });
  });

  // Start observing the main chat area
  const chatArea = document.querySelector('main') || document.body;
  observer.observe(chatArea, {
    childList: true,
    subtree: true,
    attributes: false
  });
}

// Listen for messages from popup to insert context
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.action === 'INSERT_CONTEXT') {
    try {
      const result = insertContextIntoChat(message.context);
      console.log('Insert context result:', result);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error inserting context:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }
  
  if (message.action === 'SUMMARIZE_CHAT') {
    try {
      const result = insertSummarizePrompt(message.summaryType || 'quick');
      console.log('Insert summarize prompt result:', result);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error inserting summarize prompt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }

  if (message.action === 'SUMMARIZE_CONTEXT') {
    try {
      const result = insertContextSummaryPrompt(message.context);
      console.log('Insert context summary result:', result);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error inserting context summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }

  if (message.action === 'OPEN_SAVE_MODAL') {
    try {
      openSaveModal();
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error opening save modal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }
  
  return true; // Keep message channel open for async response
});

function insertContextIntoChat(context: { title: string; body: string }): boolean {
  console.log('Attempting to insert context:', context.title);
  
  // Find ChatGPT's textarea input with updated selectors
  const textareaSelectors = [
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]', 
    'textarea[data-id="root"]',
    '#prompt-textarea',
    'textarea',
    'div[contenteditable="true"]'
  ];

  let textarea: HTMLTextAreaElement | HTMLElement | null = null;
  
  // Try to find textarea first - FIXED VERSION
  for (const selector of textareaSelectors) {
    const elements = document.querySelectorAll(selector);
    const elementsArray = Array.from(elements); // Convert NodeList to Array
    
    for (const element of elementsArray) {
      const el = element as HTMLTextAreaElement | HTMLElement;
      
      // Check if element is visible and editable
      if (el.offsetParent !== null && 
          !('disabled' in el && el.disabled) && 
          !('readOnly' in el && el.readOnly)) {
        textarea = el;
        console.log('Found input element with selector:', selector);
        break;
      }
    }
    if (textarea) break;
  }

  if (!textarea) {
    console.error('Could not find ChatGPT input field');
    alert('Could not find ChatGPT input field. Make sure you are in a chat.');
    return false;
  }

  // Prepare context text with hardcoded memory update instruction
  const contextText = `Please update your memory with the following information and do not address me directly:

[Saved Context: ${context.title}]

${context.body}`;
  
  try {
    if (textarea.tagName.toLowerCase() === 'textarea') {
      const textareaEl = textarea as HTMLTextAreaElement;
      const currentValue = textareaEl.value.trim(); // Trim existing content
      
      // Only add spacing if there's existing content
      const newValue = currentValue ? `${currentValue}\n\n${contextText}` : contextText;
      
      textareaEl.value = newValue;
      
      // Trigger events
      textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
      textareaEl.dispatchEvent(new Event('change', { bubbles: true }));
      textareaEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
      textareaEl.focus();
      textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);
      
    } else if (textarea.contentEditable === 'true') {
      // For contenteditable, preserve more formatting
      const currentContent = textarea.innerHTML.trim();
      const formattedContext = convertTextToHtml(contextText);
      
      // Only add spacing if there's existing content
      const newContent = currentContent ? 
        `${currentContent}<br><br>${formattedContext}` : 
        formattedContext;
      
      textarea.innerHTML = newContent;
      
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
      textarea.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textarea);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    console.log(`Successfully inserted context "${context.title}" into chat input`);
    return true;
    
  } catch (error) {
    console.error('Error during insertion:', error);
    return false;
  }
}

function getSummarizePrompt(summaryType: string): string {
  switch (summaryType) {
    case 'quick':
      return 'Without addressing me directly, summarize our conversation above focusing only on the main topics discussed. Keep it concise and organized.';
    
    case 'detailed':
      return 'Without addressing me directly, provide a detailed summary of our conversation above including: 1) Main topics discussed, 2) Action items mentioned, 3) Important things to remember. Present this in a well-organized format.';
    
    case 'business':
      return 'Without addressing me directly, create a comprehensive business summary of our conversation above with the following sections: 1) Executive Summary, 2) Key Insights, 3) Action Items, 4) To-Do List, 5) Important Notes. Format this professionally for future reference.';
    
    default:
      return 'Without addressing me directly, summarize our entire conversation above. Provide a comprehensive summary covering the main topics discussed, key points and insights, any action items mentioned, and important context for future reference. Present this as a clear, organized summary without addressing me directly.';
  }
}

function insertSummarizePrompt(summaryType: string = 'quick'): boolean {
  console.log('Attempting to insert summarize prompt with type:', summaryType);
  
  // Find ChatGPT's textarea input
  const textareaSelectors = [
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]', 
    'textarea[data-id="root"]',
    '#prompt-textarea',
    'textarea',
    'div[contenteditable="true"]'
  ];

  let textarea: HTMLTextAreaElement | HTMLElement | null = null;
  
  for (const selector of textareaSelectors) {
    const elements = document.querySelectorAll(selector);
    const elementsArray = Array.from(elements);
    
    for (const element of elementsArray) {
      const el = element as HTMLTextAreaElement | HTMLElement;
      
      if (el.offsetParent !== null && 
          !('disabled' in el && el.disabled) && 
          !('readOnly' in el && el.readOnly)) {
        textarea = el;
        console.log('Found input element with selector:', selector);
        break;
      }
    }
    if (textarea) break;
  }

  if (!textarea) {
    console.error('Could not find ChatGPT input field');
    alert('Could not find ChatGPT input field. Make sure you are in a chat.');
    return false;
  }

  const summarizePrompt = getSummarizePrompt(summaryType);

  try {
    if (textarea.tagName.toLowerCase() === 'textarea') {
      const textareaEl = textarea as HTMLTextAreaElement;
      const currentValue = textareaEl.value.trim();
      
      // Only add spacing if there's existing content
      const newValue = currentValue ? `${currentValue}\n${summarizePrompt}` : summarizePrompt;
      
      textareaEl.value = newValue;
      
      // Trigger events
      textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
      textareaEl.dispatchEvent(new Event('change', { bubbles: true }));
      textareaEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
      textareaEl.focus();
      textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);
      
    } else if (textarea.contentEditable === 'true') {
      const currentContent = textarea.innerHTML.trim();
      const formattedPrompt = convertTextToHtml(summarizePrompt);
      
      const newContent = currentContent ? 
        `${currentContent}<br>${formattedPrompt}` : 
        formattedPrompt;
      
      textarea.innerHTML = newContent;
      
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
      textarea.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textarea);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    console.log(`Successfully inserted ${summaryType} summarize prompt into chat input`);
    return true;
    
  } catch (error) {
    console.error('Error during summarize prompt insertion:', error);
    return false;
  }
}

function insertContextSummaryPrompt(context: { title: string; body: string }): boolean {
  console.log('Attempting to insert context summary prompt for:', context.title);
  
  // Find ChatGPT's textarea input
  const textareaSelectors = [
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="message"]', 
    'textarea[data-id="root"]',
    '#prompt-textarea',
    'textarea',
    'div[contenteditable="true"]'
  ];

  let textarea: HTMLTextAreaElement | HTMLElement | null = null;
  
  for (const selector of textareaSelectors) {
    const elements = document.querySelectorAll(selector);
    const elementsArray = Array.from(elements);
    
    for (const element of elementsArray) {
      const el = element as HTMLTextAreaElement | HTMLElement;
      
      if (el.offsetParent !== null && 
          !('disabled' in el && el.disabled) && 
          !('readOnly' in el && el.readOnly)) {
        textarea = el;
        console.log('Found input element with selector:', selector);
        break;
      }
    }
    if (textarea) break;
  }

  if (!textarea) {
    console.error('Could not find ChatGPT input field');
    alert('Could not find ChatGPT input field. Make sure you are in a chat.');
    return false;
  }

  const contextSummaryPrompt = `Please provide a summary of this saved context:

[Context: ${context.title}]

${context.body}

Summarize the key points, main topics, and important information from this context in a clear and organized way.`;

  try {
    if (textarea.tagName.toLowerCase() === 'textarea') {
      const textareaEl = textarea as HTMLTextAreaElement;
      const currentValue = textareaEl.value.trim();
      
      const newValue = currentValue ? `${currentValue}\n\n${contextSummaryPrompt}` : contextSummaryPrompt;
      
      textareaEl.value = newValue;
      
      // Trigger events
      textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
      textareaEl.dispatchEvent(new Event('change', { bubbles: true }));
      textareaEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
      textareaEl.focus();
      textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);
      
    } else if (textarea.contentEditable === 'true') {
      const currentContent = textarea.innerHTML.trim();
      const formattedPrompt = convertTextToHtml(contextSummaryPrompt);
      
      const newContent = currentContent ? 
        `${currentContent}<br><br>${formattedPrompt}` : 
        formattedPrompt;
      
      textarea.innerHTML = newContent;
      
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
      textarea.focus();
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textarea);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    console.log(`Successfully inserted context summary prompt for "${context.title}" into chat input`);
    return true;
    
  } catch (error) {
    console.error('Error during context summary prompt insertion:', error);
    return false;
  }
}

function convertTextToHtml(text: string): string {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
}

// Start the extension
initializeExtension();