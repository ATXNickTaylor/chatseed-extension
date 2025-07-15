// src/content/commandCenter.ts
// ChatSeed Action Center - V3 Command Center Implementation

// Define ContextBlock interface locally
interface ContextBlock {
  id: string;
  title: string;
  body: string;
  tags: string[];
  dateSaved: number;
  isFavorite?: boolean;
  lastUsed?: number;
  platform?: string;
}

import { openSaveModal } from './saveModal';
import { getContextBlocks } from '../utils/storage';
import { openOrganizeModal } from './organizeModal';
import { openHelpModal } from './helpModal';
import { openSummarizeModal } from './summarizeModal';
import { openEditSavedContentModal } from './editSavedContent';

// Command Center State Management
interface CommandCenterState {
  isOpen: boolean;
  savedContexts: ContextBlock[];
  totalContexts: number;
}

let commandCenterState: CommandCenterState = {
  isOpen: false,
  savedContexts: [],
  totalContexts: 0
};

let commandCenterContainer: HTMLElement | null = null;

// Initialize the Command Center
export function initializeCommandCenter(): void {
  console.log('ChatSeed: Initializing Command Center v3');

  // Remove any existing command center
  if (commandCenterContainer) {
    commandCenterContainer.remove();
  }

  createCommandCenterButton();
  loadContextData();

  // Listen for storage changes to update context count
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.contexts) {
      loadContextData();
    }
  });
}

// Create the main floating command center button
function createCommandCenterButton(): void {
  const container = document.createElement('div');
  container.id = 'chatseed-command-center';
  container.innerHTML = `
    <div class="command-center-trigger" id="command-center-trigger">
      <div class="center-icon">
        <img src="${chrome.runtime.getURL('floating-button.png')}" alt="ChatSeed" style="width: 60px; height: 60px;">
      </div>
    </div>
    
    <div class="command-center-panel" id="command-center-panel">
<div class="panel-header">
        <div class="header-content">
          <div class="header-icon">
            <img src="${chrome.runtime.getURL('floating-button.png')}" alt="ChatSeed" style="width: 20px; height: 20px;">
          </div>
          <h3>ChatSeed Action Center</h3>
        </div>
        <div class="header-actions">
          <button class="help-button" id="help-button" title="Help & Support">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="close-panel" id="close-panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="panel-content">
        <div class="action-grid">
          <!-- Save/Overwrite Context -->
          <div class="action-item primary" id="save-context-action">
            <div class="action-icon save-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" 
                      stroke="currentColor" stroke-width="2" fill="none"/>
                <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">Save/Overwrite Context</div>
              <div class="action-subtitle">Capture this conversation</div>
            </div>
          </div>

          <!-- Insert Last Saved Content -->
          <div class="action-item insert-last-content" id="insert-last-content-action">
            <div class="action-icon insert-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">Insert Last Saved Content</div>
              <div class="action-subtitle">Quickly reuse your most recent content</div>
            </div>
          </div>

          <!-- Start Code Session -->
          <div class="action-item code-session" id="code-session-action" style="position: relative;">
            <div class="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">Start a Code Session</div>
              <div class="action-subtitle">Begin coding workflow</div>
              <div class="coffee-expedite-text">Buy us coffee to expedite this feature!</div>
            </div>
            <span class="coming-soon-badge">Coming Soon</span>
          </div>

<!-- Summarize Current Chat -->
<div class="action-item" id="summarize-chat-action">
  <div class="action-icon">
    <img src="${chrome.runtime.getURL('icon-plus.png')}" alt="Summarize" style="width: 20px; height: 20px;">
  </div>
  <div class="action-content">
    <div class="action-title">Summarize Current Chat</div>
    <div class="action-subtitle">Generate conversation summary</div>
  </div>
</div>

          <!-- Reference Library -->
          <div class="action-item" id="reference-library-action">
            <div class="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" 
                      stroke="currentColor" stroke-width="2" fill="none"/>
                <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">Edit Saved Content</div>
              <div class="action-subtitle">Edit Your Contexts and Prompts</div>
              <div class="context-prompt-counts" style="color: #176548; font-size: 10px;">
                <span id="total-contexts">0</span> saved contexts. <span id="total-prompts">0</span> saved prompts.
              </div>
            </div>
          </div>

          <!-- Export Saved Contexts -->
          <div class="action-item" id="export-contexts-action">
            <div class="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" 
                      stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <div class="action-title">Export Saved Content</div>
              <div class="action-subtitle">Download all contexts</div>
            </div>
          </div>
        </div>

        <!-- Bottom Status -->
        <div class="panel-footer">
          <div class="version-info" id="version-info">
            <!-- Version info will be set dynamically -->
          </div>
          <div class="support-section">
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
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  commandCenterContainer = container;

  // Add this line to call the version info update:
  updateVersionInfo(container, 'odidbkfijbkniijmcmfnadibpcfhmgoo');

  applyCommandCenterStyles();
  attachEventListeners(container);
  setupActionListeners(container);

  console.log('ChatSeed: Command Center created successfully');
}

// Apply comprehensive styling for the command center
function applyCommandCenterStyles(): void {
  if (document.getElementById('chatseed-command-center-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'chatseed-command-center-styles';
  styles.textContent = `
    #chatseed-command-center {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

.command-center-trigger {
  width: 60px;
  height: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.command-center-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%);
  border-radius: 50%;
  transform: translateX(-100%);
  transition: transform 0.6s;
  mask: url('${chrome.runtime.getURL('floating-button.png')}');
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

    .command-center-trigger:hover::before {
      transform: translateX(100%);
    }

.command-center-trigger:hover {
  /* No direct hover effect here, the shimmer is handled by ::before */
}

    .command-center-trigger:active {
      transform: scale(0.95);
    }

.center-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}


    .command-center-panel {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid #e9ecef;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      max-height: 80vh;
      overflow: hidden;
    }

    .command-center-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f0f0f0;
      background: linear-gradient(90deg, #f8fffe 0%, #ffffff 100%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-content h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      background: linear-gradient(90deg, #176548 0%, #1a7a52 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .close-panel {
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

    .close-panel:hover {
      background: #f8f9fa;
      color: #333;
      transform: scale(1.1);
    }

    .panel-content {
      padding: 20px 24px;
    }

    .action-grid {
      display: grid;
      gap: 12px;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e9ecef;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #ffffff;
      position: relative;
      overflow: hidden;
    }

    .action-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(23, 101, 72, 0.05), transparent);
      transition: left 0.5s;
    }

    .action-item:hover::before {
      left: 100%;
    }

    .action-item:hover {
      border-color: #176548;
      box-shadow: 0 4px 12px rgba(23, 101, 72, 0.1);
      transform: translateY(-2px);
    }

.action-item.primary {
  background: rgba(23, 101, 72, 0.5);
  color: black;
  border-color: #176548;
}

    .action-item.primary:hover {
      background: linear-gradient(135deg, #1a7a52 0%, #1e8a5a 100%);
      box-shadow: 0 6px 20px rgba(23, 101, 72, 0.3);
    }

    .action-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #176548;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

.action-item.primary .action-icon {
  background: rgba(255, 255, 255, 0.2);
  color: black;
}

    .action-item:hover .action-icon {
      transform: scale(1.1);
    }

    .action-content {
      flex: 1;
    }

    .action-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      line-height: 1.2;
    }

.action-item.primary .action-title {
  color: black;
}

    .action-subtitle {
      font-size: 13px;
      color: #6c757d;
      line-height: 1.3;
    }

    .action-item.primary .action-subtitle {
      color: rgba(255, 255, 255, 0.9);
    }

    .panel-footer {
      padding: 16px 24px 20px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
      text-align: center;
    }

    .status-text {
      font-size: 13px;
      color: #6c757d;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .organize-link {
      background: none;
      border: none;
      color: #176548;
      text-decoration: underline;
      cursor: pointer;
      font-size: 13px;
      padding: 0;
      font-family: inherit;
    }

    .organize-link:hover {
      color: #1a7a52;
    }

    .version-info {
      font-size: 11px;
      color: #8e9297;
      font-style: italic;
      line-height: 1.3;
      margin-bottom: 12px;
    }

    .platform-info {
      color: #176548;
      font-weight: 500;
    }

    .support-section {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e9ecef;
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

    /* Tooltip styles */
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

    /* Animation for action items on first load */
    .action-item {
      animation: slideInUp 0.3s ease-out forwards;
      opacity: 0;
      transform: translateY(20px);
    }

    .action-item:nth-child(1) { animation-delay: 0.1s; }
    .action-item:nth-child(2) { animation-delay: 0.15s; }
    .action-item:nth-child(3) { animation-delay: 0.2s; }
    .action-item:nth-child(4) { animation-delay: 0.25s; }
    .action-item:nth-child(5) { animation-delay: 0.3s; }
    .action-item:nth-child(6) { animation-delay: 0.35s; }

    @keyframes slideInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Help Button Styles */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .help-button {
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

    .help-button:hover {
      background: #f8f9fa;
      color: #176548;
      transform: scale(1.1);
    }

    .action-item.insert-last-content {
      background: #fff5f5;
      color: #b91c1c;
      border-color: #fca5a5;
    }
    .action-item.insert-last-content .action-title {
      color: #b91c1c;
    }
    .action-item.insert-last-content .action-icon {
      background: #fee2e2;
      color: #b91c1c;
    }
    .action-item.insert-last-content:hover {
      background: linear-gradient(135deg, #fca5a5 0%, #fecaca 100%);
      box-shadow: 0 6px 20px rgba(185, 28, 28, 0.08);
      border-color: #b91c1c;
      color: #7f1d1d;
    }
    .action-item.insert-last-content:hover .action-title {
      color: #7f1d1d;
    }
    .action-item.insert-last-content:hover .action-icon {
      background: #fecaca;
      color: #7f1d1d;
    }
    .coffee-expedite-text {
      color: #ff6b35;
      font-size: 11px;
      margin-top: 6px;
      text-decoration: none;
      font-weight: 500;
      line-height: 1.3;
    }
    .coming-soon-badge {
      position: absolute;
      top: 8px;
      right: 12px;
      background: linear-gradient(90deg, #ff6b35 60%, #ffb385 100%);
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 999px;
      box-shadow: 0 2px 8px rgba(255, 107, 53, 0.10);
      pointer-events: none;
      z-index: 2;
      letter-spacing: 0.5px;
      line-height: 1.2;
      /* Remove transform/rotation to keep it readable and inside the card */
    }
  `;

  document.head.appendChild(styles);
}

// Attach all event listeners
function attachEventListeners(container: HTMLElement): void {
  const trigger = container.querySelector('#command-center-trigger') as HTMLElement;
  const panel = container.querySelector('#command-center-panel') as HTMLElement;
  const closeBtn = container.querySelector('#close-panel') as HTMLElement;
  const helpBtn = container.querySelector('#help-button') as HTMLElement;

  // Toggle panel
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCommandCenter();
  });

  // Close panel
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeCommandCenter();
  });

  // Help button
  helpBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeCommandCenter();
    openHelpModal();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    const target = e.target as Node;
    if (!container.contains(target)) {
      closeCommandCenter();
    }
  });

  // Action item listeners
  setupActionListeners(container);
}

// Setup listeners for all action items
function setupActionListeners(container: HTMLElement): void {
  // Save/Overwrite Context
  const saveAction = container.querySelector('#save-context-action');
  saveAction?.addEventListener('click', () => {
    console.log('Save context action triggered');
    closeCommandCenter();
    openSaveModal();
  });

  // Insert Last Saved Content
  const insertLastContentAction = container.querySelector('#insert-last-content-action');
  insertLastContentAction?.addEventListener('click', async () => {
    console.log('Insert last saved content action triggered');
    closeCommandCenter();
    try {
      const contexts = await getContextBlocks();
      if (!contexts.length) {
        showNotification('No saved content found', 'info');
        return;
      }
      // Find the most recent context by dateSaved
      const lastContext = contexts.reduce((latest, ctx) =>
        !latest || ctx.dateSaved > latest.dateSaved ? ctx : latest, null as ContextBlock | null
      );
      if (!lastContext) {
        showNotification('No saved content found', 'info');
        return;
      }
      // Send message to content script to insert into chat input
      chrome.runtime.sendMessage({
        action: 'INSERT_CONTENT_TO_CHAT',
        payload: { content: lastContext.body }
      });
      showNotification('Inserted last saved content', 'success');
    } catch (err) {
      showNotification('Error inserting content', 'error');
    }
  });

  // Start Code Session
  const codeAction = container.querySelector('#code-session-action');
  codeAction?.addEventListener('click', () => {
    console.log('Code session action triggered');
    closeCommandCenter();
    showNotification('Code session feature coming soon!', 'info');
  });

  // Summarize Current Chat - Updated to use modal
  const summarizeAction = container.querySelector('#summarize-chat-action');
  summarizeAction?.addEventListener('click', () => {
    console.log('ChatSeed: Summarize chat action triggered');
    closeCommandCenter();
    openSummarizeModal();
  });

  // Reference Library
  const libraryAction = container.querySelector('#reference-library-action');
  libraryAction?.addEventListener('click', () => {
    console.log('Reference library action triggered');
    closeCommandCenter();
    openEditSavedContentModal();
  });

  // Export Saved Contexts
  const exportAction = container.querySelector('#export-contexts-action');
  exportAction?.addEventListener('click', () => {
    console.log('Export contexts action triggered');
    closeCommandCenter();
    // openOrganizeModal() instead of exportAllContexts()
    openOrganizeModal();
  });

  // Organize link
  const organizeLink = container.querySelector('#organize-link');
  organizeLink?.addEventListener('click', () => {
    console.log('Organize link triggered');
    closeCommandCenter();
    openOrganizeModal();
  });

  // Buy Coffee link
  const buyCoffeeLink = container.querySelector('#buy-coffee-link');
  buyCoffeeLink?.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Buy coffee link clicked');
    window.open('https://buymeacoffee.com/chatseed', '_blank');
  });
}

// Toggle the command center panel
function toggleCommandCenter(): void {
  const panel = document.querySelector('#command-center-panel') as HTMLElement;
  if (!panel) return;

  commandCenterState.isOpen = !commandCenterState.isOpen;

  if (commandCenterState.isOpen) {
    panel.classList.add('open');
    loadContextData(); // Refresh data when opening
  } else {
    panel.classList.remove('open');
  }
}

// Close the command center
function closeCommandCenter(): void {
  const panel = document.querySelector('#command-center-panel') as HTMLElement;
  if (!panel) return;

  commandCenterState.isOpen = false;
  panel.classList.remove('open');
}

// Load context data from storage
async function loadContextData(): Promise<void> {
  try {
    const contexts = await getContextBlocks();

    commandCenterState.savedContexts = contexts;
    commandCenterState.totalContexts = contexts.length;

    updateContextDisplay();
  } catch (error) {
    console.error('Error loading context data:', error);
    commandCenterState.totalContexts = 0;
    updateContextDisplay();
  }
}

// Update the context count display
function updateContextDisplay(): void {
  const contextCountElement = document.querySelector('#context-count');
  const totalContextsElement = document.querySelector('#total-contexts');
  const totalPromptsElement = document.querySelector('#total-prompts');

  if (contextCountElement) {
    if (commandCenterState.totalContexts === 0) {
      contextCountElement.textContent = 'No saved contexts yet';
    } else if (commandCenterState.totalContexts === 1) {
      contextCountElement.textContent = '1 saved context';
    } else {
      contextCountElement.textContent = `${commandCenterState.totalContexts} saved contexts`;
    }
  }

  if (totalContextsElement) {
    totalContextsElement.textContent = commandCenterState.savedContexts.length.toString();
  }

  if (totalPromptsElement) {
    const promptCount = commandCenterState.savedContexts.filter(ctx =>
      ctx.tags && ctx.tags.includes('prompt')
    ).length;
    totalPromptsElement.textContent = promptCount.toString();
  }
}

// Open extension popup
function openExtensionPopup(): void {
  try {
    // Send message to background script to open popup
    chrome.runtime.sendMessage({ action: 'OPEN_POPUP' });
  } catch (error) {
    console.error('Error opening extension popup:', error);
    showNotification('Could not open extension popup', 'error');
  }
}

// Export all contexts
async function exportAllContexts(): Promise<void> {
  try {
    const contexts = await getContextBlocks();

    if (contexts.length === 0) {
      showNotification('No contexts to export', 'info');
      return;
    }

    const exportData = contexts.map(context => {
      return `Title: ${context.title}\nDate: ${new Date(context.dateSaved).toLocaleDateString()}\nTags: ${context.tags.join(', ')}\n\n${context.body}\n\n${'='.repeat(50)}\n\n`;
    }).join('');

    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `chatseed-contexts-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification(`Exported ${contexts.length} contexts successfully`, 'success');
  } catch (error) {
    console.error('Error exporting contexts:', error);
    showNotification('Error exporting contexts', 'error');
  }
}

// Show notification
function showNotification(message: string, type: 'success' | 'error' | 'info'): void {
  // Remove any existing notification
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
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Clean up command center
export function cleanupCommandCenter(): void {
  if (commandCenterContainer) {
    commandCenterContainer.remove();
    commandCenterContainer = null;
  }

  const styles = document.getElementById('chatseed-command-center-styles');
  if (styles) {
    styles.remove();
  }

  commandCenterState = {
    isOpen: false,
    savedContexts: [],
    totalContexts: 0
  };
}

async function getLatestWebStoreVersion(extensionId: string): Promise<string | null> {
  const url = `https://clients2.google.com/service/update2/crx?response=updatecheck&x=id%3D${extensionId}%26uc`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/version="([\d.]+)"/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

async function updateVersionInfo(container: HTMLElement, extensionId?: string) {
  const versionInfoDiv = container.querySelector('#version-info');
  if (!versionInfoDiv) return;

  const localVersion = chrome.runtime.getManifest().version;

  if (extensionId) {
    const latestVersion = await getLatestWebStoreVersion(extensionId);
    const isCurrent = latestVersion === localVersion;
    versionInfoDiv.innerHTML = `
      ChatSeed Version ${localVersion} ${isCurrent ? '(current)' : ''}<br>
      <span class="platform-info">Current Platform: ChatGPT</span>
    `;
  } else {
    // Fallback when extension ID is not available
    versionInfoDiv.innerHTML = `
      ChatSeed Version ${localVersion}<br>
      <span class="platform-info">Current Platform: ChatGPT</span>
    `;
  }
}