// src/content/saveModal.ts
import { extractAllMessages, formatMessagesForSaving, ChatMessage } from '../utils/messageExtractor';
import { saveContextBlock } from '../utils/storage';
import { ContextBlock } from '../types';
import { detectCurrentPlatform, getPlatformDisplayName } from '../utils/platformDetection';
import { sendDataToBackgroundForDownload, formatContextForExport } from '../utils/file-management/fileSaver'; // Import updated function names

let currentModal: HTMLElement | null = null;
let selectedMessageIds: string[] = []; // Changed to store IDs for easier management

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

function createSaveModal(allMessages: ChatMessage[]): void {
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

  // Create modal content container
  const modalContent = document.createElement('div');
  modalContent.id = 'context-save-modal-content';
  modalContent.style.cssText = `
    background: #fff;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
  `;

  // Close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    line-height: 1;
    padding: 5px;
  `;
  closeButton.onclick = closeSaveModal;
  modalContent.appendChild(closeButton);

  // Title
  const titleHeader = document.createElement('h2');
  titleHeader.textContent = `Save Context from ${getPlatformDisplayName(detectCurrentPlatform() || 'ChatGPT')}`;
  titleHeader.style.cssText = `
    margin-top: 0;
    margin-bottom: 20px;
    color: #1A5445;
    font-size: 22px;
    text-align: center;
  `;
  modalContent.appendChild(titleHeader);

  // Message selection area
  const messagesContainer = document.createElement('div');
  messagesContainer.style.cssText = `
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    flex-grow: 1;
    overflow-y: auto;
    max-height: 250px;
  `;

  allMessages.forEach((msg, index) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.style.cssText = `
      padding: 10px;
      margin-bottom: 8px;
      border-bottom: 1px dashed #eee;
      display: flex;
      align-items: flex-start;
      background: #f9f9f9;
      border-radius: 6px;
    `;
    if (index === allMessages.length - 1) { // Pre-select the last message
      messageDiv.style.background = '#e6f3ed'; // Highlight pre-selected
      selectedMessageIds.push(msg.id);
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'message-checkbox';
    checkbox.value = msg.id;
    checkbox.checked = selectedMessageIds.includes(msg.id); // Set checked state based on selection
    checkbox.style.cssText = `
      margin-right: 10px;
      margin-top: 5px; /* Align checkbox with text */
      transform: scale(1.2);
    `;
    checkbox.onchange = (e) => {
      if ((e.target as HTMLInputElement).checked) {
        selectedMessageIds.push(msg.id);
        messageDiv.style.background = '#e6f3ed';
      } else {
        selectedMessageIds = selectedMessageIds.filter(id => id !== msg.id);
        messageDiv.style.background = '#f9f9f9';
      }
      console.log('Selected message IDs:', selectedMessageIds);
    };

    const messageContent = document.createElement('div');
    messageContent.style.flexGrow = '1';
    messageContent.style.fontSize = '14px';
    messageContent.innerHTML = `<strong style="color: #1A5445;">${msg.role}:</strong> ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}`;
    
    messageDiv.appendChild(checkbox);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
  });
  modalContent.appendChild(messagesContainer);

  // Title input
  const titleLabel = document.createElement('label');
  titleLabel.textContent = 'Context Title:';
  titleLabel.htmlFor = 'context-title-input';
  titleLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: bold;';
  modalContent.appendChild(titleLabel);

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.id = 'context-title-input';
  titleInput.placeholder = 'e.g., My AI Conversation Summary';
  titleInput.value = `ChatSeed Context ${new Date().toLocaleString()}`; // Default title
  titleInput.style.cssText = `
    width: calc(100% - 20px);
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
  `;
  modalContent.appendChild(titleInput);

  // Tags input
  const tagsLabel = document.createElement('label');
  tagsLabel.textContent = 'Tags (comma-separated):';
  tagsLabel.htmlFor = 'context-tags-input';
  tagsLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: bold;';
  modalContent.appendChild(tagsLabel);

  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.id = 'context-tags-input';
  tagsInput.placeholder = 'e.g., meeting-notes, important, projectX';
  tagsInput.style.cssText = `
    width: calc(100% - 20px);
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
  `;
  modalContent.appendChild(tagsInput);

  // Save as file checkbox (for user-selected save location)
  const saveAsFileCheckbox = document.createElement('input');
  saveAsFileCheckbox.type = 'checkbox';
  saveAsFileCheckbox.id = 'save-as-file-checkbox';
  saveAsFileCheckbox.checked = true; // Pre-select
  const saveAsFileLabel = document.createElement('label');
  saveAsFileLabel.htmlFor = 'save-as-file-checkbox';
  saveAsFileLabel.textContent = ' Save as file (choose location)';

  const checkboxContainer = document.createElement('div');
  checkboxContainer.style.cssText = `
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;
    color: #555;
  `;
  checkboxContainer.appendChild(saveAsFileCheckbox);
  checkboxContainer.appendChild(saveAsFileLabel);
  modalContent.appendChild(checkboxContainer);

  // Save button
  const saveButton = document.createElement('button');
  saveButton.id = 'save-context-button';
  saveButton.textContent = 'Save Context';
  saveButton.style.cssText = `
    background: #1A5445;
    color: white;
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
    margin-top: 10px;
  `;
  saveButton.onmouseover = (e) => (e.target as HTMLElement).style.backgroundColor = '#154135';
  saveButton.onmouseout = (e) => (e.target as HTMLElement).style.backgroundColor = '#1A5445';
  modalContent.appendChild(saveButton);

  // Append modal to overlay, and overlay to body
  overlay.appendChild(modalContent);
  document.body.appendChild(overlay);
  currentModal = overlay; // Store reference to the current modal

  // Event listener for the save button
  saveButton.addEventListener('click', async () => {
    const titleInput = document.getElementById('context-title-input') as HTMLInputElement;
    const tagsInput = document.getElementById('context-tags-input') as HTMLInputElement;
    const saveAsFileChecked = (document.getElementById('save-as-file-checkbox') as HTMLInputElement)?.checked;

    const title = titleInput.value.trim();
    if (!title) {
      alert('Please provide a title for your context!');
      return;
    }

    if (selectedMessageIds.length === 0) {
      alert('Please select at least one message to save!');
      return;
    }

    const selectedMessages = allMessages.filter(msg => selectedMessageIds.includes(msg.id));
    const tagsText = tagsInput?.value.trim() || '';
    const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const contextBlock: ContextBlock = {
      id: `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      body: formatMessagesForSaving(selectedMessages),
      tags,
      dateSaved: Date.now(),
      platform: (detectCurrentPlatform() || 'chatgpt') as 'chatgpt' | 'gemini'
    };

    if (saveAsFileChecked) {
      console.log('💾 Save as file checkbox checked. Preparing download...');
      const fileContent = formatContextForExport(contextBlock);
      const filename = `chatseed_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;

      try {
        await sendDataToBackgroundForDownload(fileContent, filename, 'text/plain'); // Use new function
        alert(`Context "${title}" will be downloaded to your selected location.`);
      } catch (error) {
        console.error('Failed to initiate file download from save modal:', error);
        alert('Failed to initiate file download. Please try again.');
      }
    } else {
      console.log('💾 Saving to local storage...');
      try {
        await saveContextBlock(contextBlock);
        alert(`Context "${title}" saved successfully!`);
      } catch (error) {
        console.error('Failed to save context to local storage:', error);
        alert('Failed to save context to local storage. Please try again.');
      }
    }

    closeSaveModal();
  });
}

function closeSaveModal(): void {
  if (currentModal && currentModal.parentNode) {
    currentModal.parentNode.removeChild(currentModal);
    currentModal = null;
    selectedMessageIds = []; // Clear selected messages
  }
}