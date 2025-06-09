// src/content/content.ts
import { openSaveModal } from './saveModal';
import { detectCurrentPlatform, isSupportedPlatform, getPlatformDisplayName } from '../utils/platformDetection';
import { checkAndRunMigrations } from '../utils/migration';
import { DOMHelper } from '../utils/domUtils';

// This script runs on every supported AI platform page load
console.log('ChatSeed: Content script loaded - v1.3.0 Multi-Platform');

let currentPlatform: string | null = null;

// Initialize platform detection
function initializePlatform(): boolean {
  currentPlatform = detectCurrentPlatform();
  if (!currentPlatform) {
    console.log('ChatSeed: Platform not supported or not detected');
    return false;
  }

  console.log(`ChatSeed: Initialized for ${getPlatformDisplayName(currentPlatform)}`);
  return true;
}

// Check if we're on a supported platform (EXPANDED from original ChatGPT-only check)
function isSupportedPage(): boolean {
  return isSupportedPlatform();
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

// Wait for AI interface to be ready - UPDATED SELECTORS (PRESERVED original logic)
function waitForChatInterface(): Promise<void> {
  return new Promise((resolve) => {
    const checkForChat = () => {
      // Updated selectors for current AI interfaces (expanded from original)
      const chatContainer = document.querySelector('main') || 
                           document.querySelector('#main') ||
                           document.querySelector('body > div') ||
                           document.querySelector('[id*="app"]');
      
      if (chatContainer) {
        console.log(`${getPlatformDisplayName(currentPlatform!)} interface found:`, chatContainer);
        resolve();
      } else {
        setTimeout(checkForChat, 100);
      }
    };
    checkForChat();
  });
}

// Create floating toolbar HTML with SVG button
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
    " title="Save ${getPlatformDisplayName(currentPlatform!)} Context">
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

  // Add click handler
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
  if (!isSupportedPage()) {
    console.log('ChatSeed: Not on supported platform');
    return;
  }

  try {
    // Initialize platform detection (ADDED - but preserves original flow)
    if (!initializePlatform()) {
      return;
    }

    // Run any necessary migrations (ADDED)
    await checkAndRunMigrations();

    await waitForPageLoad();
    await waitForChatInterface();
    
    // Create and inject the floating toolbar
    createFloatingToolbar();
    console.log(`ChatSeed: Toolbar injected successfully for ${getPlatformDisplayName(currentPlatform!)}`);
    
    // Set up observer for dynamic content changes
    setupMutationObserver();
    
    console.log('ChatSeed: Initialization complete!');
    
  } catch (error) {
    console.error('ChatSeed: Failed to initialize:', error);
  }
}

// Watch for dynamic changes in the AI interface (EXPANDED from original)
function setupMutationObserver(): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check if new messages were added
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Look for new message containers (EXPANDED from original)
            if (element.matches('[data-message-id]') || 
                element.querySelector('[data-message-id]') ||
                element.matches('.user-query') ||
                element.matches('.markdown')) {
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
      const result = insertSummarizePrompt(
        message.summaryType || 'quick',
        message.persona || 'default'
      );
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
  
  // Use DOMHelper to find platform-specific input element
  const domHelper = new DOMHelper();
  const textarea = domHelper.getInputElement();

  if (!textarea) {
    console.error(`Could not find ${getPlatformDisplayName(currentPlatform!)} input field`);
    alert(`Could not find ${getPlatformDisplayName(currentPlatform!)} input field. Make sure you are in a chat.`);
    return false;
  }

  // Prepare context text with memory update instruction
  const contextText = `Please update your memory with the following information and do not address me directly:

[Saved Context: ${context.title}]

${context.body}`;
  
  try {
    if (textarea.tagName.toLowerCase() === 'textarea') {
      const textareaEl = textarea as HTMLTextAreaElement;
      const currentValue = textareaEl.value.trim();
      
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
    
    console.log(`Successfully inserted context "${context.title}" into ${getPlatformDisplayName(currentPlatform!)} input`);
    return true;
    
  } catch (error) {
    console.error('Error during insertion:', error);
    return false;
  }
}

// Enhanced getSummarizePrompt with persona support (PRESERVED ALL ORIGINAL LOGIC)
function getSummarizePrompt(summaryType: string, persona: string = 'default'): string {
  // Base content based on summary type (what to include)
  let baseContent = '';

  switch (summaryType) {
    case 'quick':
      baseContent = 'summarize our conversation above focusing only on the main topics discussed. Keep it concise and organized.';
      break;

    case 'detailed':
      baseContent = 'provide a detailed summary of our conversation above including: 1) Main topics discussed, 2) Action items mentioned, 3) Important things to remember. Present this in a well-organized format.';
      break;

    case 'business':
      baseContent = 'create a comprehensive business summary of our conversation above with the following sections: 1) Executive Summary, 2) Key Insights, 3) Action Items, 4) To-Do List, 5) Important Notes. Format this professionally for future reference.';
      break;

    default:
      baseContent = 'summarize our entire conversation above. Provide a comprehensive summary covering the main topics discussed, key points and insights, any action items mentioned, and important context for future reference. Present this as a clear, organized summary.';
      break;
  }

  // Persona-based tone and structure modifications (how to present)
  let personaPrefix = '';
  let personaSuffix = '';

  switch (persona) {
    case 'executive':
      personaPrefix = 'Acting as an executive assistant, ';
      personaSuffix = ' Present this in a clean, high-level format suitable for stakeholders who need key decisions and takeaways at a glance.';
      break;

    case 'teammate':
      personaPrefix = 'Acting as a helpful teammate, ';
      personaSuffix = ' Write this in a conversational and friendly tone, prioritizing context and clarity for async collaboration or handoff.';
      break;

    case 'analyst':
      personaPrefix = 'Acting as a business analyst, ';
      personaSuffix = ' Structure this logically with clear bullet points, focusing on causality, decisions, and actionable insights.';
      break;

    case 'default':
    default:
      personaPrefix = '';
      personaSuffix = '';
      break;
  }

  // Combine persona tone with base content and trim any whitespace
  const result = `Without addressing me directly, ${personaPrefix}${baseContent}${personaSuffix}`;
  
  // Ensure no leading/trailing whitespace in the final prompt
  return result.trim();
}

// Enhanced insertSummarizePrompt with better whitespace handling (PRESERVED ALL ORIGINAL LOGIC)
function insertSummarizePrompt(summaryType: string = 'quick', persona: string = 'default'): boolean {
  console.log('Attempting to insert summarize prompt with type:', summaryType, 'and persona:', persona);
  
  // Use DOMHelper to find platform-specific input element
  const domHelper = new DOMHelper();
  const textarea = domHelper.getInputElement();

  if (!textarea) {
    console.error(`Could not find ${getPlatformDisplayName(currentPlatform!)} input field`);
    alert(`Could not find ${getPlatformDisplayName(currentPlatform!)} input field. Make sure you are in a chat.`);
    return false;
  }

  const summarizePrompt = getSummarizePrompt(summaryType, persona);
  
  // Debug: Log the exact prompt being generated
  console.log('Generated summarize prompt:', JSON.stringify(summarizePrompt));

  try {
    if (textarea.tagName.toLowerCase() === 'textarea') {
      const textareaEl = textarea as HTMLTextAreaElement;
      
      // Get current value and handle whitespace more aggressively
      let currentValue = textareaEl.value;
      
      // Debug: Log current value
      console.log('Current textarea value:', JSON.stringify(currentValue));
      
      // Remove all trailing whitespace from current content
      currentValue = currentValue.replace(/\s+$/, '');
      
      // Remove any leading whitespace from the prompt
      const cleanPrompt = summarizePrompt.replace(/^\s+/, '');
      
      // Debug: Log cleaned values
      console.log('Cleaned current value:', JSON.stringify(currentValue));
      console.log('Cleaned prompt:', JSON.stringify(cleanPrompt));
      
      // Build new value with proper spacing
      let newValue;
      if (currentValue.length > 0) {
        // Add exactly two newlines between existing content and new prompt
        newValue = currentValue + '\n\n' + cleanPrompt;
      } else {
        // If no existing content, just use the clean prompt
        newValue = cleanPrompt;
      }
      
      // Debug: Log final value
      console.log('Final textarea value:', JSON.stringify(newValue));

      textareaEl.value = newValue;

      // Trigger events
      textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
      textareaEl.dispatchEvent(new Event('change', { bubbles: true }));
      textareaEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

      textareaEl.focus();
      textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);

    } else if (textarea.contentEditable === 'true') {
      // Handle contenteditable (AI platform's current implementation)
      let currentContent = textarea.innerHTML;
      
      // Debug: Log current content
      console.log('Current contenteditable content:', JSON.stringify(currentContent));
      
      // Check if content is just the placeholder
      const isPlaceholderOnly = currentContent.includes('data-placeholder') && 
                              currentContent.includes('class="placeholder"') &&
                              !currentContent.replace(/<[^>]*>/g, '').trim();
      
      console.log('Is placeholder only:', isPlaceholderOnly);
      
      let cleanedContent;
      if (isPlaceholderOnly) {
        // If it's just the placeholder, start fresh
        cleanedContent = '';
        console.log('Removed placeholder content');
      } else {
        // Clean existing content but preserve actual text
        cleanedContent = currentContent.replace(/(<br\s*\/?>|\s)+$/, '');
        console.log('Cleaned current content:', JSON.stringify(cleanedContent));
      }
      
      // Convert prompt to HTML and remove leading whitespace
      let formattedPrompt = convertTextToHtml(summarizePrompt);
      formattedPrompt = formattedPrompt.replace(/^(<br\s*\/?>|\s)+/, '');
      
      // Debug: Log formatted prompt
      console.log('Formatted prompt:', JSON.stringify(formattedPrompt));
      
      // Build new content with proper spacing
      let newContent;
      if (cleanedContent.length > 0) {
        newContent = cleanedContent + '<br><br>' + formattedPrompt;
      } else {
        newContent = formattedPrompt;
      }
      
      // Debug: Log final content
      console.log('Final contenteditable content:', JSON.stringify(newContent));

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
    
    console.log(`Successfully inserted ${summaryType} summarize prompt with ${persona} persona into ${getPlatformDisplayName(currentPlatform!)} input`);
    return true;
    
  } catch (error) {
    console.error('Error during summarize prompt insertion:', error);
    return false;
  }
}

function insertContextSummaryPrompt(context: { title: string; body: string }): boolean {
  console.log('Attempting to insert context summary prompt for:', context.title);
  
  // Use DOMHelper to find platform-specific input element
  const domHelper = new DOMHelper();
  const textarea = domHelper.getInputElement();

  if (!textarea) {
    console.error(`Could not find ${getPlatformDisplayName(currentPlatform!)} input field`);
    alert(`Could not find ${getPlatformDisplayName(currentPlatform!)} input field. Make sure you are in a chat.`);
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
    
    console.log(`Successfully inserted context summary prompt for "${context.title}" into ${getPlatformDisplayName(currentPlatform!)} input`);
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