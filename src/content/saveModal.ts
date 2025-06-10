// src/content/saveModal.ts
import { extractAllMessages, formatMessagesForSaving, ChatMessage } from '../utils/messageExtractor';
import { saveContextBlock } from '../utils/storage';
import { ContextBlock } from '../types';
import { detectCurrentPlatform, getPlatformDisplayName } from '../utils/platformDetection';

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
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    position: relative;
  `;

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #333; font-size: 24px;">Save Context</h2>
      <button id="close-modal-btn" style="
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 4px;
        border-radius: 6px;
        transition: all 0.2s ease;
      ">×</button>
    </div>
    
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        Title *
      </label>
      <input type="text" id="context-title" placeholder="Enter a title for this context..." style="
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
        background: white;
        color: #333;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      ">
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        Tags (comma-separated)
      </label>
      <input type="text" id="context-tags" placeholder="tag1, tag2, tag3..." style="
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
        background: white;
        color: #333;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      ">
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 12px; font-weight: bold; color: #333;">
        Select Messages to Save:
      </label>
      <div id="message-list" style="
        border: none;
        border-radius: 8px;
        max-height: 300px;
        overflow-y: auto;
        padding: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      ">
        ${generateMessageList(messages)}
      </div>
    </div>

    <div style="display: flex; gap: 12px; justify-content: flex-end;">
      <button id="cancel-save-btn" style="
        padding: 12px 24px;
        border: none;
        background: #f8f9fa;
        color: #333;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      ">Cancel</button>
      <button id="save-context-btn" style="
        padding: 12px 24px;
        background: #10a37f;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      ">Save Context</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  currentModal = overlay;

  // Add hover effects for modal buttons
  const closeBtn = overlay.querySelector('#close-modal-btn') as HTMLElement;
  const cancelBtn = overlay.querySelector('#cancel-save-btn') as HTMLElement;
  const saveBtn = overlay.querySelector('#save-context-btn') as HTMLElement;
  const titleInput = overlay.querySelector('#context-title') as HTMLElement;
  const tagsInput = overlay.querySelector('#context-tags') as HTMLElement;

  if (closeBtn) {
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = '#f0f0f0';
      closeBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
      closeBtn.style.boxShadow = 'none';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#e9ecef';
      cancelBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      cancelBtn.style.transform = 'translateY(-1px)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = '#f8f9fa';
      cancelBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      cancelBtn.style.transform = 'translateY(0)';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.background = '#0e8c6b';
      saveBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      saveBtn.style.transform = 'translateY(-1px)';
    });
    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.background = '#10a37f';
      saveBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      saveBtn.style.transform = 'translateY(0)';
    });
  }

  if (titleInput) {
    titleInput.addEventListener('focus', () => {
      titleInput.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    });
    titleInput.addEventListener('blur', () => {
      titleInput.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
  }

  if (tagsInput) {
    tagsInput.addEventListener('focus', () => {
      tagsInput.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
    });
    tagsInput.addEventListener('blur', () => {
      tagsInput.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    });
  }

  // Add event listeners
  setupModalEventListeners(messages);
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
      return chrome.runtime.getURL('icon-gpt.png');
    }
  };
  
  const aiIconUrl = getAIIcon();
  
  // PRESERVED: Sort messages in descending order (most recent first)
  const sortedMessages = [...messages].reverse();
  
  return sortedMessages.map((message, index) => {
    // ENHANCED: Platform-aware icon and label (MODIFIED FROM ORIGINAL)
    const isUser = message.role === 'user';
    const roleIcon = isUser ? '👤' : `<img src="${aiIconUrl}" style="width: 20px; height: 20px; border-radius: 4px; vertical-align: middle;" alt="${platformName}">`;
    const roleLabel = isUser ? 'User Message' : `${platformName} Reply`; // CHANGED FROM: 'ChatGPT Reply'
    
    // PRESERVED: Original preview logic
    const preview = message.content.length > 100 
      ? message.content.substring(0, 100) + '...' 
      : message.content;
    
    // PRESERVED: Add "most recent" indicator to the first message (index 0)
    const isFirstMessage = index === 0;
    const recentIndicator = isFirstMessage 
      ? '<div style="font-style: italic; color: #666; font-size: 12px; margin-top: 4px;">This is the most recent message in your current chat.</div>'
      : '';
    
    // ENHANCED: Platform-specific background colors (ADDED FUNCTIONALITY)
    const backgroundColor = isUser 
      ? '#f8f9ff'  // Light blue for user (PRESERVED)
      : (currentPlatform === 'gemini' ? '#f0f7ff' : '#f0fff4'); // ENHANCED: Platform-specific colors
    
    return `
      <div style="
        border: none;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        background: ${backgroundColor};
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
      ">
        <label style="display: flex; align-items: flex-start; cursor: pointer;">
          <input type="checkbox" data-message-id="${message.id}" style="
            margin-right: 12px;
            margin-top: 2px;
            transform: scale(1.2);
          ">
          <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 4px; color: #333; display: flex; align-items: center; gap: 8px;">
              ${roleIcon} ${roleLabel}
            </div>
            <div style="color: #666; font-size: 14px; line-height: 1.4;">
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
  // Close button
  const closeBtn = document.getElementById('close-modal-btn');
  closeBtn?.addEventListener('click', closeSaveModal);

  // Cancel button
  const cancelBtn = document.getElementById('cancel-save-btn');
  cancelBtn?.addEventListener('click', closeSaveModal);

  // Save button
  const saveBtn = document.getElementById('save-context-btn');
  saveBtn?.addEventListener('click', () => handleSaveContext(messages));

  // Click outside to close
  currentModal?.addEventListener('click', (e) => {
    if (e.target === currentModal) {
      closeSaveModal();
    }
  });

  // Escape key to close
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

const titleInput = document.getElementById('context-title') as HTMLInputElement;
// ... rest of the existing code continues
  
  const tagsInput = document.getElementById('context-tags') as HTMLInputElement;
  
  const title = titleInput?.value.trim();
  if (!title) {
    alert('Please enter a title for your context!');
    return;
  }

  // Get selected messages
  const checkboxes = document.querySelectorAll('#message-list input[type="checkbox"]:checked');
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
    id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    body: formatMessagesForSaving(selectedMessages),
    tags,
    dateSaved: Date.now(),
    platform: (detectCurrentPlatform() || 'chatgpt') as 'chatgpt' | 'gemini'
  };

  console.log('💾 Created context block:', contextBlock);

  try {
    // Save to storage
    await saveContextBlock(contextBlock);
    
    // Show success message
    alert(`Context "${title}" saved successfully!`);
    
    // Close modal
    closeSaveModal();
    
    console.log('💾 Save process completed successfully!');
    
  } catch (error) {
    console.error('💾 Failed to save context:', error);
    alert('Failed to save context. Please try again.');
  }
}

function closeSaveModal(): void {
  if (currentModal) {
    document.removeEventListener('keydown', handleEscapeKey);
    currentModal.remove();
    currentModal = null;
    selectedMessages = [];
  }
}