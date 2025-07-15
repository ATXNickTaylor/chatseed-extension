// src/content/saveModal.ts
import { detectCurrentPlatform, getPlatformDisplayName } from '../utils/platformDetection';
import { extractAllMessages, formatMessagesForSaving, ChatMessage } from '../utils/messageExtractor';
import { saveContextBlock } from '../utils/storage';
import { ContextBlock } from '../types'; // Add this import

let currentModal: HTMLElement | null = null;
let selectedMessages: ChatMessage[] = [];

export function openSaveModal(): void {
  // Close existing modal if open
  if (currentModal) {
    closeSaveModal();
  }

  // Extract all messages from the current chat
  const allMessages = extractAllMessages();

  if (allMessages.length === 0) {
    alert('No messages found in this chat!');
    return;
  }

  createSaveModal(allMessages);
}

function createSaveModal(messages: ChatMessage[]): void {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'context-save-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 20000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  `;

  // Create modal content with new structure
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #ffffff;
    border-radius: 16px;
    max-width: 480px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    position: relative;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    border: 1px solid #e9ecef;
  `;

  modal.innerHTML = `
    <!-- Modal Header -->
    <div class="modal-header" style="
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 32px 16px;
      background: linear-gradient(90deg, #f8fffe 0%, #ffffff 100%);
      border-bottom: 1px solid #f0f0f0;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${chrome.runtime.getURL('icon-logo.png')}" alt="ChatSeed" style="
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        ">
        <h2 style="
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #176548;
          letter-spacing: -0.01em;
        ">Save Context</h2>
      </div>
      <button id="close-modal-btn" style="
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        color: #6c757d;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
    
    <!-- Green Divider -->
    <div style="
      height: 2px;
      background: linear-gradient(90deg, #176548 0%, #1a7a52 100%);
      margin: 0;
    "></div>

    <!-- Modal Body -->
    <div class="modal-body" style="
      padding: 24px 32px;
      flex: 1;
      overflow-y: auto;
      max-height: calc(80vh - 180px);
    ">
      <!-- Title Input -->
      <div style="margin-bottom: 24px;">
        <label style="
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          letter-spacing: 0.01em;
        ">
          Title *
        </label>
        <input type="text" id="context-title" placeholder="Enter a title for this context..." style="
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
          background: white;
          color: #333;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          font-family: inherit;
          outline: none;
        ">
      </div>

      <!-- Tags Input -->
      <div style="margin-bottom: 24px;">
        <label style="
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          letter-spacing: 0.01em;
        ">
          Tags (comma-separated)
        </label>
        <input type="text" id="context-tags" placeholder="tag1, tag2, tag3..." style="
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
          background: white;
          color: #333;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          font-family: inherit;
          outline: none;
        ">
      </div>

      <!-- Type Selection -->
      <div style="margin-bottom: 24px;">
        <label style="
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          letter-spacing: 0.01em;
        ">
          Type
        </label>
        <div style="display: flex; gap: 16px;">
          <label style="font-size: 14px; font-weight: 400; cursor: pointer; color: #176548;">
            <input type="radio" name="context-type" id="context-type-context" value="context" checked>
            Context
          </label>
          <label style="font-size: 14px; font-weight: 400; cursor: pointer; color: #176548;">
            <input type="radio" name="context-type" id="context-type-prompt" value="prompt">
            Prompt
          </label>
        </div>
      </div>

      <!-- Message Selection -->
      <div style="margin-bottom: 0;">
        <label style="
          display: block;
          margin-bottom: 12px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
          letter-spacing: 0.01em;
        ">
          Select Messages to Save:
        </label>
        <div id="message-list" style="
          border: 1px solid #e9ecef;
          border-radius: 8px;
          max-height: 300px;
          overflow-y: auto;
          padding: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background: #fafafa;
        ">
          ${generateMessageList(messages)}
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <div class="modal-footer" style="
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 20px 32px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
    ">
      <button id="cancel-save-btn" style="
        padding: 12px 24px;
        border: 1px solid #e9ecef;
        background: #f8f9fa;
        color: #333;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        font-family: inherit;
        outline: none;
      ">Cancel</button>
      <button id="save-context-btn" style="
        padding: 12px 24px;
        background: linear-gradient(135deg, #176548 0%, #1a7a52 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 700;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        font-family: inherit;
        outline: none;
        letter-spacing: 0.01em;
      ">Save Context</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  currentModal = overlay;

  // Add enhanced hover effects and interactions
  setupEnhancedInteractions();

  // Add event listeners
  setupModalEventListeners(messages);
}

// ENHANCED: Setup sophisticated hover effects and micro-interactions
function setupEnhancedInteractions(): void {
  if (!currentModal) return;

  // FIX: Search within modal content, not overlay
  const modalContent = currentModal.querySelector('div') as HTMLElement;
  if (!modalContent) return;

  const closeBtn = modalContent.querySelector('#close-modal-btn') as HTMLElement;
  const cancelBtn = modalContent.querySelector('#cancel-save-btn') as HTMLElement;
  const saveBtn = modalContent.querySelector('#save-context-btn') as HTMLElement;
  const titleInput = modalContent.querySelector('#context-title') as HTMLInputElement;
  const tagsInput = modalContent.querySelector('#context-tags') as HTMLInputElement;

  // Enhanced close button interactions
  if (closeBtn) {
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#f8f9fa';
      closeBtn.style.color = '#333';
      closeBtn.style.transform = 'scale(1.1)';
      closeBtn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
      closeBtn.style.color = '#6c757d';
      closeBtn.style.transform = 'scale(1)';
      closeBtn.style.boxShadow = 'none';
    });
  }

  // Enhanced cancel button interactions
  if (cancelBtn) {
    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#e9ecef';
      cancelBtn.style.borderColor = '#dee2e6';
      cancelBtn.style.transform = 'translateY(-1px)';
      cancelBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = '#f8f9fa';
      cancelBtn.style.borderColor = '#e9ecef';
      cancelBtn.style.transform = 'translateY(0)';
      cancelBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
  }

  // Enhanced save button with gradient hover
  if (saveBtn) {
    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.background = 'linear-gradient(135deg, #1a7a52 0%, #1e8a5a 100%)';
      saveBtn.style.transform = 'translateY(-2px)';
      saveBtn.style.boxShadow = '0 6px 20px rgba(23, 101, 72, 0.3)';
    });
    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.background = 'linear-gradient(135deg, #176548 0%, #1a7a52 100%)';
      saveBtn.style.transform = 'translateY(0)';
      saveBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
  }

  // Enhanced input focus effects with green highlights
  if (titleInput) {
    titleInput.addEventListener('focus', () => {
      titleInput.style.borderColor = '#176548';
      titleInput.style.boxShadow = '0 0 0 3px rgba(23, 101, 72, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15)';
    });
    titleInput.addEventListener('blur', () => {
      titleInput.style.borderColor = '#e9ecef';
      titleInput.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
  }

  if (tagsInput) {
    tagsInput.addEventListener('focus', () => {
      tagsInput.style.borderColor = '#176548';
      tagsInput.style.boxShadow = '0 0 0 3px rgba(23, 101, 72, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15)';
    });
    tagsInput.addEventListener('blur', () => {
      tagsInput.style.borderColor = '#e9ecef';
      tagsInput.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
  }

  // Add subtle entrance animation to modal
  const modal = currentModal.querySelector('.modal-header')?.parentElement as HTMLElement;
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95) translateY(20px)';
    modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    // Trigger animation
    setTimeout(() => {
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1) translateY(0)';
    }, 10);
  }
}

function generateMessageList(messages: ChatMessage[]): string {
  // ENHANCED: Get current platform for proper labeling and icons (ADDED FUNCTIONALITY)
  const currentPlatform = detectCurrentPlatform();
  const platformName = getPlatformDisplayName(currentPlatform || 'chatgpt');

  // ENHANCED: Get platform-specific icon (ADDED FUNCTIONALITY)
  const getAIIcon = () => {
    if (currentPlatform === 'gemini') {
      return chrome.runtime.getURL('icon-gemini.png');
    } else {
      return chrome.runtime.getURL('icon-gpt-transp.png');
    }
  };

  const aiIconUrl = getAIIcon();

  // PRESERVED: Sort messages in descending order (most recent first)
  const sortedMessages = [...messages].reverse();

  return sortedMessages.map((message, index) => {
    // ENHANCED: Platform-aware icon and label (MODIFIED FROM ORIGINAL)
    const isUser = message.role === 'user';
    const roleIcon = isUser
      ? '<div style="width: 20px; height: 20px; background: #176548; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">U</div>'
      : `<img src="${aiIconUrl}" style="width: 20px; height: 20px; border-radius: 4px; vertical-align: middle;" alt="${platformName}">`;
    const roleLabel = isUser ? 'User Message' : `${platformName} Reply`; // CHANGED FROM: 'ChatGPT Reply'

    // PRESERVED: Original preview logic
    const preview = message.content.length > 100
      ? message.content.substring(0, 100) + '...'
      : message.content;

    // PRESERVED: Add "most recent" indicator to the first message (index 0)
    const isFirstMessage = index === 0;
    const recentIndicator = isFirstMessage
      ? '<div style="font-style: italic; color: #176548; font-size: 11px; margin-top: 6px; font-weight: 500;">✨ Most recent message in your current chat</div>'
      : '';

    // ENHANCED: Platform-specific background colors with better styling
    const backgroundColor = isUser
      ? '#f8f9ff'  // Light blue for user (PRESERVED)
      : (currentPlatform === 'gemini' ? '#f0f7ff' : '#f0fff4'); // ENHANCED: Platform-specific colors

    return `
      <div style="
        border: 1px solid ${isFirstMessage ? '#176548' : '#e9ecef'};
        border-radius: 8px;
        padding: 14px 16px;
        margin-bottom: 8px;
        background: ${backgroundColor};
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      " onmouseenter="this.style.borderColor='#176548'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(23, 101, 72, 0.15)'" 
         onmouseleave="this.style.borderColor='${isFirstMessage ? '#176548' : '#e9ecef'}'; this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0, 0, 0, 0.08)'">
        <label style="display: flex; align-items: flex-start; cursor: pointer; gap: 12px;">
          <input type="checkbox" data-message-id="${message.id}" style="
            margin: 2px 0 0 0;
            transform: scale(1.3);
            accent-color: #176548;
            cursor: pointer;
          ">
          <div style="flex: 1;">
            <div style="
              font-weight: 600; 
              margin-bottom: 6px; 
              color: #333; 
              display: flex; 
              align-items: center; 
              gap: 8px;
              font-size: 13px;
              letter-spacing: 0.01em;
            ">
              ${roleIcon} ${roleLabel}
            </div>
            <div style="
              color: #666; 
              font-size: 14px; 
              line-height: 1.5;
              letter-spacing: 0.01em;
            ">
              ${preview}
            </div>
            ${recentIndicator}
          </div>
        </label>
      </div>
    `;
  }).join('');
}

// PRESERVED: All original event listener functions unchanged
function setupModalEventListeners(messages: ChatMessage[]): void {
  if (!currentModal) return;

  const modalContent = currentModal.querySelector('div') as HTMLElement;
  if (!modalContent) return;

  // Simple button handlers - no need for preventDefault/stopPropagation
  const closeBtn = modalContent.querySelector('#close-modal-btn') as HTMLElement;
  if (closeBtn) {
    closeBtn.onclick = closeSaveModal;
  }

  const cancelBtn = modalContent.querySelector('#cancel-save-btn') as HTMLElement;
  if (cancelBtn) {
    cancelBtn.onclick = closeSaveModal;
  }

  const saveBtn = modalContent.querySelector('#save-context-btn') as HTMLElement;
  if (saveBtn) {
    saveBtn.onclick = () => handleSaveContext(messages);
  }

  // Keep the click outside and escape key handlers as they are
  if (currentModal) {
    currentModal.addEventListener('click', (e) => {
      if (e.target === currentModal) {
        closeSaveModal();
      }
    });
  }

  document.addEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && currentModal) {
    closeSaveModal();
  }
}

// PRESERVED: All original save logic unchanged
async function handleSaveContext(allMessages: ChatMessage[]): Promise<void> {
  console.log('💾 Starting save context process...');

  // ADD THIS DEBUGGING CODE HERE:
  const detectedPlatform = detectCurrentPlatform();
  console.log('🔍 Platform Detection:');
  console.log('  URL:', window.location.href);
  console.log('  Hostname:', window.location.hostname);
  console.log('  Pathname:', window.location.pathname);
  console.log('  Detected:', detectedPlatform);
  console.log('  Final platform:', detectedPlatform || 'chatgpt');

  // FIX: Search within modal content instead of entire document
  const modalContent = currentModal?.querySelector('div') as HTMLElement;
  if (!modalContent) {
    console.error('💾 Modal content not found');
    return;
  }

  const titleInput = modalContent.querySelector('#context-title') as HTMLInputElement;
  const tagsInput = modalContent.querySelector('#context-tags') as HTMLInputElement;
  const typeRadio = modalContent.querySelector('input[name="context-type"]:checked') as HTMLInputElement;
  const contextType = typeRadio ? (typeRadio.value as 'context' | 'prompt') : 'context';

  const title = titleInput?.value.trim();
  if (!title) {
    alert('Please enter a title for your context!');
    return;
  }

  // Get selected messages - search within modal content
  const checkboxes = modalContent.querySelectorAll('#message-list input[type="checkbox"]:checked');
  const selectedMessageIds = Array.from(checkboxes).map(cb =>
    (cb as HTMLInputElement).getAttribute('data-message-id')
  ).filter(Boolean) as string[];

  if (selectedMessageIds.length === 0) {
    alert('Please select at least one message to save!');
    return;
  }

  const selectedMessages = allMessages.filter(msg =>
    selectedMessageIds.includes(msg.id)
  );

  console.log('💾 Selected messages:', selectedMessages);

  // Parse tags
  const tagsText = tagsInput?.value.trim() || '';
  const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  // Create context block with platform field
  const contextBlock: ContextBlock = {
    id: `context_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    title,
    body: formatMessagesForSaving(selectedMessages),
    tags: [...tags],
    dateSaved: Date.now(),
    platform: (detectCurrentPlatform() || 'chatgpt') as 'chatgpt' | 'gemini',
    contextType: contextType // Use the selected radio button value
  };

  console.log('💾 Created context block:', contextBlock);

  try {
    // Save to storage
    await saveContextBlock(contextBlock);

    // Show success message
    alert(`Context "${title}" saved successfully!`);

  } catch (error) {
    console.error('💾 Failed to save context:', error);
    alert('Failed to save context. Please try again.');
  }

  // Always close modal regardless of success/failure
  closeSaveModal();
}

function closeSaveModal(): void {
  if (currentModal) {
    document.removeEventListener('keydown', handleEscapeKey);
    currentModal.remove();
    currentModal = null;
    selectedMessages = [];
  }
}