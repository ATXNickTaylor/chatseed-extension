// src/content/organizeModal.ts
// Organize Modal for ChatSeed - Download-Based Organization

import { getContextBlocks } from '../utils/storage';

interface OrganizeModalState {
    isOpen: boolean;
    selectedOrganizationType: 'none' | 'date' | 'platform' | 'tags' | 'all';
}

let organizeModalState: OrganizeModalState = {
    isOpen: false,
    selectedOrganizationType: 'none'
};

let organizeModalContainer: HTMLElement | null = null;

// Main function to open the organize modal
export async function openOrganizeModal(): Promise<void> {
    console.log('Opening organize modal with download-based organization');

    // Create modal if it doesn't exist
    if (!organizeModalContainer) {
        createOrganizeModal();
    }

    // Show modal
    showModal();
}

// Create the organize modal HTML structure
function createOrganizeModal(): void {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'chatseed-organize-modal';
    modalContainer.innerHTML = `
        <div class="organize-modal-overlay">
            <div class="organize-modal-content">
                <div class="organize-modal-header">
                    <h3>Export & Organize Contexts</h3>
                    <button class="organize-modal-close" id="organize-modal-close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
                
                <div class="organize-modal-body">
                    <div class="organization-intro">
                        <p>Export your saved contexts to any location on your device. Choose how you'd like to organize your exported files.</p>
                    </div>
                    
                    <div class="organization-options">
                        <h4>Export Organization Methods</h4>
                        
                        <!-- By Date -->
                        <div class="org-option" data-type="date">
                            <div class="org-option-header">
                                <div class="org-icon">📅</div>
                                <div class="org-content">
                                    <div class="org-title">Export by Date</div>
                                    <div class="org-subtitle">Separate files for each month/year</div>
                                </div>
                                <div class="org-action">
                                    <button class="org-btn" data-action="date">Export by Date</button>
                                </div>
                            </div>
                            <div class="org-preview">
                                <small>Example: "ChatSeed-2024-12.txt", "ChatSeed-2025-01.txt"</small>
                            </div>
                        </div>

                        <!-- By Platform -->
                        <div class="org-option" data-type="platform">
                            <div class="org-option-header">
                                <div class="org-icon">🤖</div>
                                <div class="org-content">
                                    <div class="org-title">Export by Platform</div>
                                    <div class="org-subtitle">Separate files for ChatGPT and Gemini</div>
                                </div>
                                <div class="org-action">
                                    <button class="org-btn" data-action="platform">Export by Platform</button>
                                </div>
                            </div>
                            <div class="org-preview">
                                <small>Example: "ChatSeed-ChatGPT.txt", "ChatSeed-Gemini.txt"</small>
                            </div>
                        </div>

                        <!-- By Tags -->
                        <div class="org-option" data-type="tags">
                            <div class="org-option-header">
                                <div class="org-icon">🏷️</div>
                                <div class="org-content">
                                    <div class="org-title">Export by Tags</div>
                                    <div class="org-subtitle">Separate files for each tag category</div>
                                </div>
                                <div class="org-action">
                                    <button class="org-btn" data-action="tags">Export by Tags</button>
                                </div>
                            </div>
                            <div class="org-preview">
                                <small>Example: "ChatSeed-coding.txt", "ChatSeed-research.txt"</small>
                            </div>
                        </div>

                        <!-- Complete Organized Export -->
                        <div class="org-option featured" data-type="all">
                            <div class="org-option-header">
                                <div class="org-icon">📦</div>
                                <div class="org-content">
                                    <div class="org-title">Complete Organized Export</div>
                                    <div class="org-subtitle">All organization methods combined</div>
                                </div>
                                <div class="org-action">
                                    <button class="org-btn primary" data-action="all">Export All Organized</button>
                                </div>
                            </div>
                            <div class="org-preview">
                                <small>Creates multiple organized files using all methods above</small>
                            </div>
                        </div>
                    </div>

                    <div class="quick-export-section">
                        <h4>Quick Export Options</h4>
                        <div class="quick-actions">
                            <button class="quick-action-btn" id="export-favorites">
                                <span class="quick-icon">⭐</span>
                                Export Favorites Only
                            </button>
                            <button class="quick-action-btn" id="export-recent">
                                <span class="quick-icon">⏰</span>
                                Export Recent (Last 30 days)
                            </button>
                            <button class="quick-action-btn" id="export-single-file">
                                <span class="quick-icon">📄</span>
                                Export All (Single File)
                            </button>
                        </div>
                    </div>

                    <div class="export-location-section">
                        <h4>Export Location</h4>
                        <div class="export-info">
                            <p>All exports will prompt you to choose where to save your files. You can save to Desktop, Documents, Downloads, or any folder you prefer.</p>
                        </div>
                    </div>
                </div>
                
                <div class="organize-modal-footer">
                    <div class="footer-info">
                        <small>Your contexts remain safely stored in Chrome. Exports create backup copies you can save anywhere on your device.</small>
                    </div>
                    <button class="modal-btn secondary" id="cancel-organize">Close</button>
                </div>
            </div>
        </div>
    `;

    // Apply styles
    applyOrganizeModalStyles();

    // Attach event listeners
    attachOrganizeModalEventListeners(modalContainer);

    // Add to page
    document.body.appendChild(modalContainer);
    organizeModalContainer = modalContainer;

    console.log('Organize modal created successfully');
}

// Apply styling for the organize modal
function applyOrganizeModalStyles(): void {
    if (document.getElementById('chatseed-organize-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'chatseed-organize-modal-styles';
    styles.textContent = `
        #chatseed-organize-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .organize-modal-overlay {
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

        .organize-modal-overlay.open {
            opacity: 1;
        }

        .organize-modal-content {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 650px;
            max-height: 85vh;
            overflow: hidden;
            transform: scale(0.9) translateY(20px);
            transition: transform 0.3s ease;
        }

        .organize-modal-overlay.open .organize-modal-content {
            transform: scale(1) translateY(0);
        }

        .organize-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 24px 16px;
            border-bottom: 1px solid #f0f0f0;
            background: linear-gradient(90deg, #f8fffe 0%, #ffffff 100%);
        }

        .organize-modal-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #333;
            background: linear-gradient(90deg, #176548 0%, #1a7a52 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .organize-modal-close {
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

        .organize-modal-close:hover {
            background: #f8f9fa;
            color: #333;
            transform: scale(1.1);
        }

        .organize-modal-body {
            padding: 24px;
            overflow-y: auto;
            max-height: 60vh;
        }

        .organization-intro {
            margin-bottom: 24px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #176548;
        }

        .organization-intro p {
            margin: 0;
            color: #333;
            line-height: 1.5;
        }

        .organization-options h4,
        .quick-export-section h4,
        .export-location-section h4 {
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }

        .org-option {
            border: 1px solid #e9ecef;
            border-radius: 12px;
            margin-bottom: 12px;
            transition: all 0.2s ease;
            overflow: hidden;
        }

        .org-option:hover {
            border-color: #176548;
            box-shadow: 0 4px 12px rgba(23, 101, 72, 0.1);
        }

        .org-option.featured {
            border-color: #176548;
            background: linear-gradient(135deg, rgba(23, 101, 72, 0.05) 0%, rgba(26, 122, 82, 0.02) 100%);
        }

        .org-option-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
        }

        .org-icon {
            font-size: 24px;
            width: 40px;
            text-align: center;
        }

        .org-content {
            flex: 1;
        }

        .org-title {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }

        .org-subtitle {
            font-size: 13px;
            color: #6c757d;
        }

        .org-action {
            flex-shrink: 0;
        }

        .org-btn {
            padding: 8px 16px;
            border: 1px solid #176548;
            border-radius: 6px;
            background: #ffffff;
            color: #176548;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .org-btn:hover {
            background: #176548;
            color: white;
        }

        .org-btn.primary {
            background: #176548;
            color: white;
        }

        .org-btn.primary:hover {
            background: #1a7a52;
        }

        .org-preview {
            padding: 0 16px 12px 72px;
            color: #8e9297;
            font-size: 12px;
        }

        .quick-export-section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #f0f0f0;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
        }

        .quick-action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            background: #ffffff;
            color: #333;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quick-action-btn:hover {
            border-color: #176548;
            background: #f8fffe;
        }

        .quick-icon {
            font-size: 16px;
        }

        .export-location-section {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #f0f0f0;
        }

        .export-info {
            padding: 16px;
            background: #e8f5e8;
            border-radius: 8px;
            border-left: 4px solid #176548;
        }

        .export-info p {
            margin: 0;
            color: #333;
            font-size: 13px;
            line-height: 1.4;
        }

        .organize-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #f0f0f0;
            background: #fafafa;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .footer-info {
            flex: 1;
        }

        .footer-info small {
            color: #6c757d;
            line-height: 1.4;
        }

        .modal-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
        }

        .modal-btn.secondary {
            background: #f8f9fa;
            color: #6c757d;
            border: 1px solid #e9ecef;
        }

        .modal-btn.secondary:hover {
            background: #e9ecef;
            color: #495057;
        }
    `;

    document.head.appendChild(styles);
}

// Attach event listeners to modal elements
function attachOrganizeModalEventListeners(container: HTMLElement): void {
    const overlay = container.querySelector('.organize-modal-overlay') as HTMLElement;
    const closeBtn = container.querySelector('#organize-modal-close') as HTMLElement;
    const cancelBtn = container.querySelector('#cancel-organize') as HTMLElement;

    // Close modal handlers
    const closeModal = () => hideModal();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // Organization method buttons
    const orgButtons = container.querySelectorAll('.org-btn');
    orgButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = (e.target as HTMLElement).getAttribute('data-action');
            if (action) {
                handleOrganizedExport(action as 'date' | 'platform' | 'tags' | 'all');
            }
        });
    });

    // Quick action buttons
    const favoritesBtn = container.querySelector('#export-favorites');
    const recentBtn = container.querySelector('#export-recent');
    const singleFileBtn = container.querySelector('#export-single-file');

    favoritesBtn?.addEventListener('click', () => handleQuickExport('favorites'));
    recentBtn?.addEventListener('click', () => handleQuickExport('recent'));
    singleFileBtn?.addEventListener('click', () => handleQuickExport('single'));

    // ESC key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && organizeModalState.isOpen) {
            closeModal();
        }
    });
}

// Show the modal
function showModal(): void {
    if (!organizeModalContainer) return;

    const overlay = organizeModalContainer.querySelector('.organize-modal-overlay') as HTMLElement;
    organizeModalState.isOpen = true;

    organizeModalContainer.style.display = 'block';

    // Trigger animation
    setTimeout(() => {
        overlay.classList.add('open');
    }, 10);
}

// Hide the modal
function hideModal(): void {
    if (!organizeModalContainer) return;

    const overlay = organizeModalContainer.querySelector('.organize-modal-overlay') as HTMLElement;
    organizeModalState.isOpen = false;

    overlay.classList.remove('open');

    setTimeout(() => {
        organizeModalContainer!.style.display = 'none';
    }, 300);
}

// Handle organized export based on method
async function handleOrganizedExport(method: 'date' | 'platform' | 'tags' | 'all'): Promise<void> {
    try {
        showNotification('Preparing organized export...', 'info');

        const contexts = await getContextBlocks();
        if (contexts.length === 0) {
            showNotification('No contexts to export', 'info');
            return;
        }

        // Send message to background script for organized export
        chrome.runtime.sendMessage({
            action: 'EXPORT_ORGANIZED_CONTEXTS',
            method: method,
            contexts: contexts
        });

        hideModal();
        showNotification(`Organized export (${method}) initiated! Choose where to save your files.`, 'success');

    } catch (error) {
        console.error('Error in organized export:', error);
        showNotification('Error preparing organized export', 'error');
    }
}

// Handle quick export actions
async function handleQuickExport(type: 'favorites' | 'recent' | 'single'): Promise<void> {
    try {
        showNotification('Preparing export...', 'info');

        const allContexts = await getContextBlocks();
        if (allContexts.length === 0) {
            showNotification('No contexts to export', 'info');
            return;
        }

        let contexts = allContexts;
        let filename = 'ChatSeed-export';

        // Filter contexts based on type
        switch (type) {
            case 'favorites':
                contexts = allContexts.filter(ctx => ctx.isFavorite);
                filename = 'ChatSeed-favorites';
                if (contexts.length === 0) {
                    showNotification('No favorite contexts to export', 'info');
                    return;
                }
                break;

            case 'recent':
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                contexts = allContexts.filter(ctx => ctx.dateSaved > thirtyDaysAgo);
                filename = 'ChatSeed-recent-30days';
                if (contexts.length === 0) {
                    showNotification('No recent contexts (last 30 days) to export', 'info');
                    return;
                }
                break;

            case 'single':
                // All contexts in single file
                filename = 'ChatSeed-all-contexts';
                break;
        }

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'EXPORT_QUICK_CONTEXTS',
            type: type,
            contexts: contexts,
            filename: filename
        });

        hideModal();
        showNotification(`${type} export initiated! Choose where to save your files.`, 'success');

    } catch (error) {
        console.error('Error in quick export:', error);
        showNotification('Error preparing export', 'error');
    }
}

// Show notification (reusing existing notification system)
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
        z-index: 10002;
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

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Clean up modal
export function cleanupOrganizeModal(): void {
    if (organizeModalContainer) {
        organizeModalContainer.remove();
        organizeModalContainer = null;
    }

    const styles = document.getElementById('chatseed-organize-modal-styles');
    if (styles) {
        styles.remove();
    }

    organizeModalState = {
        isOpen: false,
        selectedOrganizationType: 'none'
    };
}