// src/content/summarizeModal.ts
// ChatSeed Summarize Modal - Dedicated module for summarization functionality

interface SummarizeOption {
  id: string;
  title: string;
  description: string;
  type: string;
  persona: string;
  icon: string;
  prompt: string;
}

const summarizeOptions: SummarizeOption[] = [
  {
    id: 'executive-brief',
    title: 'Executive Brief',
    description: 'Acting as an executive assistant, please provide a concise summary of our conversation focusing on the main topics discussed. Present this in a high-level format suitable for stakeholders.',
    type: 'quick',
    persona: 'executive',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="#176548" stroke-width="2"/>
    </svg>`,
    prompt: 'Acting as an executive assistant, please provide a concise summary of our conversation focusing on the main topics discussed. Present this in a high-level format suitable for stakeholders.'
  },
  {
    id: 'teammate-summary',
    title: 'Teammate Summary',
    description: 'Acting as a helpful teammate, please provide a detailed summary of our conversation including main topics, key insights, and action items. Write this in a conversational tone for collaboration.',
    type: 'detailed',
    persona: 'teammate',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#176548" stroke-width="2"/>
      <circle cx="9" cy="7" r="4" stroke="#176548" stroke-width="2"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#176548" stroke-width="2"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#176548" stroke-width="2"/>
    </svg>`,
    prompt: 'Acting as a helpful teammate, please provide a detailed summary of our conversation including main topics, key insights, and action items. Write this in a conversational tone for collaboration.'
  },
  {
    id: 'analyst-report',
    title: 'Analyst Report',
    description: 'Acting as a business analyst, please provide a detailed summary of our conversation including main topics, key insights, and action items. Structure this with clear bullet points and actionable insights.',
    type: 'detailed',
    persona: 'analyst',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="#176548" stroke-width="2"/>
    </svg>`,
    prompt: 'Acting as a business analyst, please provide a detailed summary of our conversation including main topics, key insights, and action items. Structure this with clear bullet points and actionable insights.'
  },
  {
    id: 'business-summary',
    title: 'Business Summary',
    description: 'Please create a business summary with: 1) Executive Summary, 2) Key Insights, 3) Action Items, 4) Next Steps.',
    type: 'business',
    persona: 'default',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#176548" stroke-width="2"/>
      <polyline points="14,2 14,8 20,8" stroke="#176548" stroke-width="2"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="#176548" stroke-width="2"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="#176548" stroke-width="2"/>
      <polyline points="10,9 9,9 8,9" stroke="#176548" stroke-width="2"/>
    </svg>`,
    prompt: 'Please create a business summary with: 1) Executive Summary, 2) Key Insights, 3) Action Items, 4) Next Steps.'
  }
];

let currentSummarizeModal: HTMLElement | null = null;

/**
 * Opens the ChatSeed summarize modal with summarization options
 */
export function openSummarizeModal(): void {
  console.log('ChatSeed: Opening summarize modal');

  // Close existing modal if open
  if (currentSummarizeModal) {
    closeSummarizeModal();
  }

  createSummarizeModal();
}

/**
 * Closes the summarize modal if it's currently open
 */
export function closeSummarizeModal(): void {
  if (currentSummarizeModal) {
    document.removeEventListener('keydown', handleEscapeKey);
    currentSummarizeModal.remove();
    currentSummarizeModal = null;
  }
}

/**
 * Creates and displays the summarize modal
 */
function createSummarizeModal(): void {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'chatseed-summarize-modal';
  modalContainer.innerHTML = getSummarizeModalHTML();

  // Apply styles
  applySummarizeModalStyles();

  // Attach event listeners
  attachSummarizeModalEventListeners(modalContainer);

  // Add to page
  document.body.appendChild(modalContainer);
  currentSummarizeModal = modalContainer;

  // Show modal with animation
  setTimeout(() => {
    const overlay = modalContainer.querySelector('.summarize-modal-overlay') as HTMLElement;
    overlay.classList.add('open');
  }, 10);

  console.log('ChatSeed: Summarize modal created');
}

/**
 * Returns the complete HTML structure for the summarize modal
 */
function getSummarizeModalHTML(): string {
  return `
    <div class="summarize-modal-overlay">
      <div class="summarize-modal-content">
        <div class="summarize-modal-header">
          <div class="header-content">
            <div class="header-icon">
              <img src="${chrome.runtime.getURL('icon-logo.png')}" alt="ChatSeed" style="width: 24px; height: 24px;">
            </div>
            <h3>Summarize Current Chat</h3>
          </div>
          <div class="header-actions">
            <button class="marketplace-btn" id="marketplace-btn" aria-label="Prompt Marketplace" title="Prompt Marketplace">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v18H3z" stroke="#22c55e" stroke-width="2"/>
                <path d="M9 9h6v6H9z" fill="#22c55e"/>
                <path d="M12 6v12M6 12h12" stroke="#22c55e" stroke-width="2"/>
              </svg>
            </button>
            <button class="summarize-modal-close" id="summarize-modal-close" aria-label="Close summarize modal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="summarize-modal-body">
          <p class="modal-description">
            Choose how you'd like to summarize this conversation:
          </p>
          
          ${getSummarizeOptionsSection()}
          ${getCustomSummarySection()}
          ${getFormalitySection()}
        </div>
        
        <div class="summarize-modal-footer">
          <button class="modal-btn secondary" id="close-summarize-modal">Close</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns the summarize options section HTML
 */
function getSummarizeOptionsSection(): string {
  return `
    <div class="summarize-options">
      ${summarizeOptions.map(option => `
        <div class="summarize-option" data-id="${option.id}" data-type="${option.type}" data-persona="${option.persona}" data-prompt="${option.prompt}">
          <div class="option-icon">${option.icon}</div>
          <div class="option-content">
            <div class="option-title">${option.title}</div>
            <div class="option-description">${option.description}</div>
          </div>
          <div class="option-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#176548" stroke-width="2"/>
            </svg>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Returns the custom summary section HTML
 */
function getCustomSummarySection(): string {
  return `
    <div class="custom-summary-section">
      <div class="section-divider">
        <span>Or create a custom summary</span>
      </div>
      <div class="custom-prompt-container">
        <div class="input-group">
          <textarea 
            id="custom-prompt-input" 
            placeholder="Enter your custom summarization prompt..."
            rows="3"
            class="custom-prompt-textarea"
          ></textarea>
          <button class="insert-custom-btn" id="insert-custom-btn" title="Insert custom prompt">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#176548" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns the formality section HTML
 */
function getFormalitySection(): string {
  return `
    <div class="formality-section">
      <div class="section-divider">
        <span>Additional Options</span>
      </div>
      <div class="formality-option">
        <label class="checkbox-label">
          <input type="checkbox" id="no-formal-address" class="formality-checkbox">
          <span class="checkmark"></span>
          <span class="checkbox-text">Don't address me formally (skip "Dear User", "Hello", etc.)</span>
        </label>
      </div>
    </div>
  `;
}

/**
 * Applies the summarize modal styles to the page
 */
function applySummarizeModalStyles(): void {
  if (document.getElementById('chatseed-summarize-modal-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'chatseed-summarize-modal-styles';
  styles.textContent = getSummarizeModalCSS();
  document.head.appendChild(styles);
}

/**
 * Returns the complete CSS for the summarize modal
 */
function getSummarizeModalCSS(): string {
  return `
    /* Summarize Modal Styles */
    #chatseed-summarize-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .summarize-modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .summarize-modal-overlay.open {
      opacity: 1;
    }

    .summarize-modal-content {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 500px;
      max-height: 85vh;
      overflow: hidden;
      transform: scale(0.9) translateY(20px);
      transition: transform 0.3s ease;
    }

    .summarize-modal-overlay.open .summarize-modal-content {
      transform: scale(1) translateY(0);
    }

    .summarize-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #f0f0f0;
      background: #ffffff;
      position: relative;
      z-index: 1;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header-content h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #000000;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .marketplace-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: #22c55e;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .marketplace-btn:hover {
      background: rgba(34, 197, 94, 0.1);
      transform: scale(1.1);
    }

    .summarize-modal-close {
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
    }

    .summarize-modal-close:hover {
      background: #f8f9fa;
      color: #333;
      transform: scale(1.1);
    }

    /* Marketplace Popup Styles */
    .marketplace-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 24px;
      z-index: 10003;
      max-width: 300px;
      text-align: center;
      animation: popupFadeIn 0.3s ease;
    }

    .marketplace-popup h4 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .marketplace-popup p {
      margin: 0 0 20px 0;
      color: #6c757d;
      font-size: 14px;
      line-height: 1.5;
    }

    .marketplace-popup .popup-close {
      background: #176548;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s ease;
    }

    .marketplace-popup .popup-close:hover {
      background: #145c3d;
    }

    @keyframes popupFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .summarize-modal-body {
      padding: 24px;
      overflow-y: auto;
      max-height: 60vh;
      position: relative;
      z-index: 2;
    }

    .modal-description {
      margin: 0 0 20px 0;
      color: #6c757d;
      font-size: 14px;
      line-height: 1.5;
    }

    .summarize-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summarize-option {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #ffffff;
      position: relative;
    }

    .summarize-option:hover {
      border-color: #176548;
      box-shadow: 0 4px 12px rgba(23, 101, 72, 0.2);
      transform: translateY(-2px);
    }

    .summarize-option::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #176548;
      border-radius: 0 0 10px 10px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .summarize-option:hover::after {
      opacity: 1;
    }

    .option-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border-radius: 8px;
      flex-shrink: 0;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-top: 2px;
    }

    .option-content {
      flex: 1;
    }

    .option-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .option-description {
      font-size: 13px;
      color: #6c757d;
      line-height: 1.5;
      font-style: italic;
    }

    .option-arrow {
      transition: transform 0.2s ease;
      margin-top: 2px;
    }

    .summarize-option:hover .option-arrow {
      transform: translateX(4px);
    }

    .custom-summary-section {
      margin-top: 24px;
    }

    .section-divider {
      text-align: center;
      margin-bottom: 16px;
      position: relative;
    }

    .section-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e9ecef;
      z-index: 1;
    }

    .section-divider span {
      background: #ffffff;
      padding: 0 16px;
      color: #6c757d;
      font-size: 12px;
      font-weight: 500;
      position: relative;
      z-index: 2;
    }

    .custom-prompt-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .input-group {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .custom-prompt-textarea {
      flex: 1;
      padding: 12px;
      border: 2px solid #176548;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      min-height: 80px;
      background: #ffffff;
      color: #000000;
      transition: box-shadow 0.2s ease;
    }

    .custom-prompt-textarea:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(23, 101, 72, 0.1);
    }

    .insert-custom-btn {
      width: 40px;
      height: 40px;
      border: 1px solid #176548;
      border-radius: 8px;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 8px;
    }

    .insert-custom-btn:hover {
      background: #176548;
      color: #ffffff;
    }

    .insert-custom-btn:hover svg path {
      stroke: #ffffff;
    }

    .formality-section {
      margin-top: 24px;
    }

    .formality-option {
      margin-top: 12px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 12px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .checkbox-label:hover {
      background: #f8f9fa;
    }

    .formality-checkbox {
      display: none;
    }

    .checkmark {
      width: 20px;
      height: 20px;
      border: 2px solid #e9ecef;
      border-radius: 4px;
      position: relative;
      transition: all 0.2s ease;
      background: #ffffff;
    }

    .formality-checkbox:checked + .checkmark {
      background: #176548;
      border-color: #176548;
    }

    .formality-checkbox:checked + .checkmark::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .checkbox-text {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
    }

    .summarize-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .summarize-modal-footer .modal-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .summarize-modal-footer .modal-btn.secondary {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #e9ecef;
    }

    .summarize-modal-footer .modal-btn.secondary:hover {
      background: #e9ecef;
      color: #495057;
    }

    .buy-coffee-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #ff6b35;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(255, 107, 53, 0.1);
      border: 1px solid rgba(255, 107, 53, 0.2);
      transition: all 0.2s ease;
      position: relative;
      margin-top: 8px;
    }
    .buy-coffee-link:hover {
      background: rgba(255, 107, 53, 0.15);
      border-color: rgba(255, 107, 53, 0.3);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
    }
    .buy-coffee-link:active {
      transform: translateY(0);
    }
    .buy-coffee-link svg {
      flex-shrink: 0;
    }
    .buy-coffee-link::before {
      content: attr(title);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 11px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: 10001;
      margin-bottom: 8px;
      width: auto;
      min-width: 120px;
      text-align: center;
      line-height: 1.3;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .buy-coffee-link::after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: #333;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      margin-bottom: 4px;
    }
    .buy-coffee-link:hover::before,
    .buy-coffee-link:hover::after {
      opacity: 1;
    }
  `;
}

/**
 * Attaches event listeners to the summarize modal
 */
function attachSummarizeModalEventListeners(container: HTMLElement): void {
  // Close button (X)
  const closeBtn = container.querySelector('#summarize-modal-close') as HTMLElement;
  closeBtn?.addEventListener('click', closeSummarizeModal);

  // Cancel button
  const closeFooterBtn = container.querySelector('#close-summarize-modal') as HTMLElement;
  closeFooterBtn?.addEventListener('click', closeSummarizeModal);

  // Marketplace button
  const marketplaceBtn = container.querySelector('#marketplace-btn') as HTMLElement;
  marketplaceBtn?.addEventListener('click', showMarketplacePopup);

  // Click outside to close
  const overlay = container.querySelector('.summarize-modal-overlay') as HTMLElement;
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeSummarizeModal();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', handleEscapeKey);

  // Insert summary when clicking a card
  container.querySelectorAll('.summarize-option').forEach(option => {
    option.addEventListener('click', () => {
      const prompt = option.getAttribute('data-prompt');
      const noFormalAddress = (container.querySelector('#no-formal-address') as HTMLInputElement)?.checked;
      if (prompt) {
        let finalPrompt = prompt;
        if (noFormalAddress) {
          finalPrompt = `Please do not address me formally (skip greetings like "Dear User", "Hello", etc.). ${prompt}`;
        }
        insertCustomSummarizePrompt(finalPrompt);
        closeSummarizeModal();
      }
    });
  });

  // Insert custom summary on button click
  const customBtn = container.querySelector('#insert-custom-btn') as HTMLElement;
  const customInput = container.querySelector('#custom-prompt-input') as HTMLTextAreaElement;
  customBtn?.addEventListener('click', () => {
    const customPrompt = customInput?.value.trim();
    const noFormalAddress = (container.querySelector('#no-formal-address') as HTMLInputElement)?.checked;
    if (customPrompt) {
      let finalPrompt = customPrompt;
      if (noFormalAddress) {
        finalPrompt = `Please do not address me formally (skip greetings like "Dear User", "Hello", etc.). ${customPrompt}`;
      }
      insertCustomSummarizePrompt(finalPrompt);
      closeSummarizeModal();
    } else {
      showNotification('Please enter a custom prompt', 'error');
    }
  });

  // Insert custom summary on Enter in textarea
  customInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      customBtn?.click();
    }
  });
}

function handleEscapeKey(e: KeyboardEvent): void {
  if (e.key === 'Escape' && currentSummarizeModal) {
    closeSummarizeModal();
  }
}

/**
 * Detects which AI platform we're on
 */
function detectPlatform(): 'chatgpt' | 'gemini' | 'unknown' {
  const hostname = window.location.hostname;

  if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
    return 'chatgpt';
  } else if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) {
    return 'gemini';
  }

  return 'unknown';
}

/**
 * Gets the AI platform message input textarea with universal selectors
 */
function getChatGPTTextArea(): HTMLElement | null {
  const platform = detectPlatform();
  console.log(`ChatSeed: Detected platform: ${platform}`);

  // Universal selectors in order of preference
  const selectors = [
    // Platform-specific primary selectors
    ...(platform === 'chatgpt' ? [
      'textarea[data-id="root"]',                    // ChatGPT primary
      'div[contenteditable="true"][data-id="root"]', // ChatGPT alternative
      'textarea[placeholder*="Message ChatGPT"]',    // ChatGPT current
    ] : []),
    ...(platform === 'gemini' ? [
      'textarea[placeholder*="Enter a prompt here"]', // Gemini common placeholder
      'textarea[placeholder*="Ask Gemini"]',         // Gemini alternative
      'textarea[placeholder*="Message Gemini"]',     // Gemini current
      'div[contenteditable="true"][aria-label*="prompt"]', // Gemini contenteditable
    ] : []),

    // Universal selectors that work on both platforms
    'textarea[placeholder*="Send a message"]',     // Generic
    'textarea[placeholder*="Message"]',            // Generic
    'textarea[placeholder*="Type a message"]',     // Generic
    'textarea[placeholder*="Ask anything"]',       // Generic
    '#prompt-textarea',                            // Generic ID
    'main textarea',                               // Main content area
    'form textarea',                               // Form-based
    'div[contenteditable="true"]',                 // Any contenteditable
    'textarea'                                     // Last resort
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.offsetParent !== null && isElementVisible(element)) {
      console.log(`ChatSeed: Found input using selector: ${selector} on ${platform}`);
      return element;
    }
  }

  console.warn(`ChatSeed: No suitable input element found on ${platform}`);
  return null;
}

/**
 * Checks if element is actually visible and usable
 */
function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 &&
    getComputedStyle(element).visibility !== 'hidden' &&
    getComputedStyle(element).display !== 'none';
}

/**
 * Inserts text into AI platform's input area with better event handling
 */
function insertTextIntoChatGPT(text: string): void {
  const platform = detectPlatform();
  const inputElement = getChatGPTTextArea();

  if (!inputElement) {
    throw new Error(`Could not find ${platform} message input area`);
  }

  // Clear any existing content first
  clearInputElement(inputElement);

  // Wait a moment for clearing to complete
  setTimeout(() => {
    insertTextIntoElement(inputElement, text);
  }, 50);
}

/**
 * Clears the input element
 */
function clearInputElement(element: HTMLElement): void {
  if (element.tagName.toLowerCase() === 'textarea') {
    (element as HTMLTextAreaElement).value = '';
  } else {
    element.textContent = '';
    element.innerHTML = '';
  }

  // Trigger clear events
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Inserts text into the specific element type
 */
function insertTextIntoElement(element: HTMLElement, text: string): void {
  element.focus();

  if (element.tagName.toLowerCase() === 'textarea') {
    insertIntoTextarea(element as HTMLTextAreaElement, text);
  } else {
    insertIntoContentEditable(element, text);
  }

  // Trigger comprehensive events for React/Angular
  triggerReactEvents(element);

  showNotification('Prompt inserted successfully', 'success');
}

/**
 * Handles textarea insertion
 */
function insertIntoTextarea(textarea: HTMLTextAreaElement, text: string): void {
  textarea.value = text;
  textarea.setSelectionRange(text.length, text.length);

  // Trigger resize if needed
  if (textarea.style.height) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

/**
 * Handles contenteditable insertion
 */
function insertIntoContentEditable(element: HTMLElement, text: string): void {
  element.textContent = text;

  // Set cursor to end
  const range = document.createRange();
  const selection = window.getSelection();

  if (element.childNodes.length > 0) {
    range.setStart(element.childNodes[element.childNodes.length - 1], element.textContent.length);
  } else {
    range.setStart(element, 0);
  }
  range.collapse(true);

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * Triggers events that React/Angular/AI platforms expect
 */
function triggerReactEvents(element: HTMLElement): void {
  const platform = detectPlatform();
  const events = [
    new Event('input', { bubbles: true }),
    new Event('change', { bubbles: true }),
    new Event('keydown', { bubbles: true }),
    new Event('keyup', { bubbles: true }),
    new Event('focus', { bubbles: true }),
    new Event('blur', { bubbles: true }),
    new InputEvent('input', { bubbles: true, inputType: 'insertText' })
  ];

  // Add platform-specific events
  if (platform === 'gemini') {
    events.push(
      new Event('compositionend', { bubbles: true }),
      new Event('paste', { bubbles: true })
    );
  }

  events.forEach(event => {
    try {
      element.dispatchEvent(event);
    } catch (e) {
      console.warn(`ChatSeed: Could not dispatch event on ${platform}:`, event.type);
    }
  });

  // Final focus
  setTimeout(() => element.focus(), 100);
}

/**
 * Inserts a predefined summarize prompt based on type and persona
 */
function insertSummarizePrompt(summaryType: string, persona: string): void {
  try {
    let prompt = '';

    switch (summaryType) {
      case 'quick':
        prompt = 'Please provide a concise summary of our conversation focusing on the main topics discussed.';
        break;
      case 'detailed':
        prompt = 'Please provide a detailed summary of our conversation including main topics, key insights, and action items.';
        break;
      case 'business':
        prompt = 'Please create a business summary with: 1) Executive Summary, 2) Key Insights, 3) Action Items, 4) Next Steps.';
        break;
      default:
        prompt = 'Please summarize our conversation highlighting key points and decisions made.';
    }

    switch (persona) {
      case 'executive':
        prompt = `Acting as an executive assistant, ${prompt} Present this in a high-level format suitable for stakeholders.`;
        break;
      case 'teammate':
        prompt = `Acting as a helpful teammate, ${prompt} Write this in a conversational tone for collaboration.`;
        break;
      case 'analyst':
        prompt = `Acting as a business analyst, ${prompt} Structure this with clear bullet points and actionable insights.`;
        break;
    }

    insertTextIntoChatGPT(prompt);
  } catch (error) {
    console.error('Error inserting summarize prompt:', error);
    showNotification('Could not insert summary prompt', 'error');
  }
}

/**
 * Inserts a custom summarize prompt
 */
function insertCustomSummarizePrompt(customPrompt: string): void {
  try {
    insertTextIntoChatGPT(customPrompt);
  } catch (error) {
    console.error('Error inserting custom prompt:', error);
    showNotification('Could not insert custom prompt', 'error');
  }
}

/**
 * Enhanced debug function to analyze AI platform's DOM structure
 */
function debugTextAreas(): void {
  const platform = detectPlatform();
  console.log(`ChatSeed Debug: Analyzing ${platform} DOM structure...`);

  // Log all textareas
  const allTextAreas = document.querySelectorAll('textarea');
  console.log('Found textareas:', allTextAreas.length);
  allTextAreas.forEach((textarea, index) => {
    console.log(`Textarea ${index}:`, {
      element: textarea,
      placeholder: textarea.placeholder,
      dataId: textarea.getAttribute('data-id'),
      ariaLabel: textarea.getAttribute('aria-label'),
      visible: isElementVisible(textarea),
      value: textarea.value
    });
  });

  // Log all contenteditable elements
  const allContentEditable = document.querySelectorAll('[contenteditable="true"]');
  console.log('Found contenteditable elements:', allContentEditable.length);
  allContentEditable.forEach((element, index) => {
    console.log(`ContentEditable ${index}:`, {
      element: element,
      dataId: element.getAttribute('data-id'),
      ariaLabel: element.getAttribute('aria-label'),
      visible: isElementVisible(element as HTMLElement),
      content: element.textContent
    });
  });

  // Test our selector
  const selectedElement = getChatGPTTextArea();
  console.log('Selected element:', selectedElement);

  // Log page URL to confirm platform
  console.log('Current page:', window.location.href);
  console.log('Detected platform:', platform);
}

/**
 * Shows a notification message to the user
 */
function showNotification(message: string, type: 'success' | 'error' | 'info'): void {
  const existingNotification = document.querySelector('#chatseed-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'chatseed-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10003;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * Shows the marketplace popup
 */
function showMarketplacePopup(): void {
  // Remove existing popup if any
  const existingPopup = document.querySelector('.marketplace-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement('div');
  popup.className = 'marketplace-popup';
  popup.innerHTML = `
    <h4>Prompt Marketplace</h4>
    <p>Prompt Marketplace will be in a future update. Buy us coffee to expedite this feature!</p>
    <div class="support-section" style="margin-bottom: 16px;">
      <a href="https://buymeacoffee.com/chatseed" target="_blank" class="buy-coffee-link" id="buy-coffee-link" title="Contribute to ChatSeed">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="#ff6b35" stroke-width="2"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="#ff6b35" stroke-width="2"/>
          <line x1="6" y1="1" x2="6" y2="4" stroke="#ff6b35" stroke-width="2"/>
          <line x1="10" y1="1" x2="10" y2="4" stroke="#ff6b35" stroke-width="2"/>
          <line x1="14" y1="1" x2="14" y2="4" stroke="#ff6b35" stroke-width="2"/>
        </svg>
        <span>Buy us a coffee</span>
      </a>
    </div>
    <button class="popup-close">OK</button>
  `;

  // Add event listener to close button
  const closeBtn = popup.querySelector('.popup-close') as HTMLElement;
  closeBtn.addEventListener('click', () => {
    popup.remove();
  });

  // Add click outside to close
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  // Add to page
  document.body.appendChild(popup);

  // Auto-close on Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      popup.remove();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Cleans up the summarize modal and removes all related elements
 */
export function cleanupSummarizeModal(): void {
  if (currentSummarizeModal) {
    currentSummarizeModal.remove();
    currentSummarizeModal = null;
  }

  const styles = document.getElementById('chatseed-summarize-modal-styles');
  if (styles) {
    styles.remove();
  }
} 