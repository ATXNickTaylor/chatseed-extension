// src/content/helpModal.ts
// ChatSeed Help Modal - Dedicated module for help and support functionality

let currentHelpModal: HTMLElement | null = null;

/**
 * Opens the ChatSeed help modal with comprehensive user guidance
 */
export function openHelpModal(): void {
  // Close existing modal if open
  if (currentHelpModal) {
    closeHelpModal();
  }

  createHelpModal();
}

/**
 * Closes the help modal if it's currently open
 */
export function closeHelpModal(): void {
  if (currentHelpModal) {
    const overlay = currentHelpModal.querySelector('.help-modal-overlay') as HTMLElement;
    overlay.classList.remove('open');

    setTimeout(() => {
      if (currentHelpModal && currentHelpModal.parentNode) {
        currentHelpModal.parentNode.removeChild(currentHelpModal);
      }
      currentHelpModal = null;
    }, 300);
  }
}

/**
 * Creates and displays the help modal
 */
function createHelpModal(): void {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'chatseed-help-modal';
  modalContainer.innerHTML = getHelpModalHTML();

  // Apply styles
  applyHelpModalStyles();

  // Attach event listeners
  attachHelpModalEventListeners(modalContainer);

  // Add to page
  document.body.appendChild(modalContainer);
  currentHelpModal = modalContainer;

  // Show modal with animation
  setTimeout(() => {
    const overlay = modalContainer.querySelector('.help-modal-overlay') as HTMLElement;
    overlay.classList.add('open');
  }, 10);
}

/**
 * Returns the complete HTML structure for the help modal
 */
function getHelpModalHTML(): string {
  return `
    <div class="help-modal-overlay">
      <div class="help-modal-content">
        <div class="help-modal-header">
          <h3>ChatSeed Help & Support</h3>
          <button class="help-modal-close" id="help-modal-close" aria-label="Close help modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <div class="help-modal-body">
          ${getWhatIsChatSeedSection()}
          ${getHowToSaveSection()}
          ${getHowToUseSection()}
          ${getKeyFeaturesSection()}
        </div>
        
        <div class="help-modal-footer">
          <a href="https://revlytiq.fillout.com/chatseed-support" target="_blank" class="support-button">
            <svg class="support-icon" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
              <path d="M8 9h8M8 13h6" stroke="currentColor" stroke-width="2"/>
            </svg>
            Get Support
          </a>
          <button class="modal-btn secondary" id="close-help-modal">Close</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * What is ChatSeed section
 */
function getWhatIsChatSeedSection(): string {
  return `
    <div class="help-section">
      <h4>
        <svg class="help-section-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2"/>
        </svg>
        What is ChatSeed?
      </h4>
      <p>ChatSeed is an AI context manager that lets you save conversation contexts from ChatGPT and Gemini, then use them seamlessly across different chat sessions. Save from one platform, use in the other!</p>
    </div>
  `;
}

/**
 * How to save contexts section
 */
function getHowToSaveSection(): string {
  return `
    <div class="help-section">
      <h4>
        <svg class="help-section-icon" viewBox="0 0 24 24" fill="none">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="2" fill="none"/>
          <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
          <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
        </svg>
        How to Save Contexts
      </h4>
      <div class="help-steps">
        <div class="help-step">
          <div class="step-number">1</div>
          <div>Click the floating ChatSeed button during a conversation</div>
        </div>
        <div class="help-step">
          <div class="step-number">2</div>
          <div>Select the messages you want to save</div>
        </div>
        <div class="help-step">
          <div class="step-number">3</div>
          <div>Add a descriptive title (required)</div>
        </div>
        <div class="help-step">
          <div class="step-number">4</div>
          <div>Add optional tags (e.g., "coding, javascript")</div>
        </div>
        <div class="help-step">
          <div class="step-number">5</div>
          <div>Click "Save Context" to store it locally</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * How to use saved contexts section
 */
function getHowToUseSection(): string {
  return `
    <div class="help-section">
      <h4>
        <svg class="help-section-icon" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
        </svg>
        How to Use Saved Contexts
      </h4>
      <div class="help-steps">
        <div class="help-step">
          <div class="step-number">1</div>
          <div>Open the ChatSeed extension popup (toolbar icon)</div>
        </div>
        <div class="help-step">
          <div class="step-number">2</div>
          <div>Find your saved context using search or browsing</div>
        </div>
        <div class="help-step">
          <div class="step-number">3</div>
          <div>Click the "Insert" button on the context card</div>
        </div>
        <div class="help-step">
          <div class="step-number">4</div>
          <div>The context appears in your current chat input</div>
        </div>
        <div class="help-step">
          <div class="step-number">5</div>
          <div>Continue your conversation with full context!</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Key features section
 */
function getKeyFeaturesSection(): string {
  return `
    <div class="help-section">
      <h4>
        <svg class="help-section-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Key Features
      </h4>
      <div class="help-features">
        <div class="help-feature">
          <div class="help-feature-title">Cross-Platform Support</div>
          <div class="help-feature-desc">Save from ChatGPT, use in Gemini (and vice versa)</div>
        </div>
        <div class="help-feature">
          <div class="help-feature-title">Smart Organization</div>
          <div class="help-feature-desc">Search, filter, and tag your contexts for easy finding</div>
        </div>
        <div class="help-feature">
          <div class="help-feature-title">Export Capabilities</div>
          <div class="help-feature-desc">Download individual contexts or export all as text files</div>
        </div>
        <div class="help-feature">
          <div class="help-feature-title">100% Private</div>
          <div class="help-feature-desc">All data stored locally - no external servers</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Applies the help modal styles to the page
 */
function applyHelpModalStyles(): void {
  if (document.getElementById('chatseed-help-modal-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'chatseed-help-modal-styles';
  styles.textContent = getHelpModalCSS();
  document.head.appendChild(styles);
}

/**
 * Returns the complete CSS for the help modal
 */
function getHelpModalCSS(): string {
  return `
    /* Help Modal Styles */
    #chatseed-help-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .help-modal-overlay {
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

    .help-modal-overlay.open {
      opacity: 1;
    }

    .help-modal-content {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 600px;
      max-height: 85vh;
      overflow: hidden;
      transform: scale(0.9) translateY(20px);
      transition: transform 0.3s ease;
    }

    .help-modal-overlay.open .help-modal-content {
      transform: scale(1) translateY(0);
    }

    .help-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #f0f0f0;
      background: linear-gradient(90deg, #f8fffe 0%, #ffffff 100%);
    }

    .help-modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      background: linear-gradient(90deg, #176548 0%, #1a7a52 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .help-modal-close {
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

    .help-modal-close:hover {
      background: #f8f9fa;
      color: #333;
      transform: scale(1.1);
    }

    .help-modal-body {
      padding: 24px;
      overflow-y: auto;
      max-height: 60vh;
    }

    .help-section {
      margin-bottom: 24px;
    }

    .help-section:last-child {
      margin-bottom: 0;
    }

    .help-section h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .help-section-icon {
      width: 20px;
      height: 20px;
      color: #176548;
    }

    .help-section p {
      margin: 0 0 12px 0;
      color: #555;
      line-height: 1.6;
      font-size: 14px;
    }

    .help-steps {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
      border-left: 4px solid #176548;
    }

    .help-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #555;
    }

    .help-step:last-child {
      margin-bottom: 0;
    }

    .step-number {
      background: #176548;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .help-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin: 12px 0;
    }

    .help-feature {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid #e9ecef;
    }

    .help-feature-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .help-feature-desc {
      color: #666;
      font-size: 13px;
      line-height: 1.4;
    }

    .help-modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .support-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #176548;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .support-button:hover {
      background: #1a7a52;
      transform: translateY(-1px);
    }

    .support-icon {
      width: 16px;
      height: 16px;
    }

    .help-modal-footer .modal-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .help-modal-footer .modal-btn.secondary {
      background: #f8f9fa;
      color: #6c757d;
      border: 1px solid #e9ecef;
    }

    .help-modal-footer .modal-btn.secondary:hover {
      background: #e9ecef;
      color: #495057;
    }
  `;
}

/**
 * Attaches event listeners to the help modal
 */
function attachHelpModalEventListeners(container: HTMLElement): void {
  const overlay = container.querySelector('.help-modal-overlay') as HTMLElement;
  const closeBtn = container.querySelector('#help-modal-close') as HTMLElement;
  const closeFooterBtn = container.querySelector('#close-help-modal') as HTMLElement;

  closeBtn.addEventListener('click', closeHelpModal);
  closeFooterBtn.addEventListener('click', closeHelpModal);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeHelpModal();
    }
  });

  // Close on Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeHelpModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
}