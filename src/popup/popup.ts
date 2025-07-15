import './styles.css';
import { openOrganizeModal } from '../content/organizeModal';
import { getContextBlocks, deleteContextBlock, toggleFavorite, markAsUsed, updateContextBlock } from '../utils/storage';
import { ContextBlock } from '../types';

let allContexts: ContextBlock[] = [];
let currentFilter: 'context' | 'prompt' = 'context';
let currentModal: HTMLElement | null = null; // Modal state tracking

// Enhanced state for filtering
interface PopupState {
  platformFilter: 'all' | 'chatgpt' | 'gemini';
  searchQuery: string;
  searchVisible: boolean;
  selectedPlatform: 'all' | 'chatgpt' | 'gemini' | 'highlighted';
  dateSort: 'newest' | 'oldest';
  selectedTag: string | null;
}

let popupState: PopupState = {
  platformFilter: 'all',
  searchQuery: '',
  searchVisible: false,
  selectedPlatform: 'all',
  dateSort: 'newest',
  selectedTag: null
};

// Load contexts when popup opens
async function loadContexts() {
  try {
    allContexts = await getContextBlocks();
    renderContexts();
  } catch (error) {
    console.error('Error loading contexts:', error);
    allContexts = [];
    renderContexts();
  }
}

// Enhanced filtering - includes platform, search, tags, and sorting
function filterContexts(): ContextBlock[] {
  let filtered = allContexts;

  // Filter by context type (existing logic)
  if (currentFilter === 'context') {
    filtered = filtered.filter(ctx => ctx.contextType === 'context');
  } else {
    filtered = filtered.filter(ctx => ctx.contextType === 'prompt');
  }

  // Filter by platform
  if (popupState.selectedPlatform !== 'all') {
    if (popupState.selectedPlatform === 'highlighted') {
      filtered = filtered.filter(ctx => ctx.contextType === 'highlighted');
    } else {
      filtered = filtered.filter(ctx => (ctx.platform || 'chatgpt') === popupState.selectedPlatform);
    }
  }

  // Filter by search query
  if (popupState.searchQuery.trim()) {
    const query = popupState.searchQuery.toLowerCase();
    filtered = filtered.filter(ctx =>
      ctx.title.toLowerCase().includes(query) ||
      ctx.body.toLowerCase().includes(query) ||
      ctx.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Filter by tag
  if (popupState.selectedTag) {
    filtered = filtered.filter(ctx => ctx.tags.includes(popupState.selectedTag!));
  }

  // Sort by date
  filtered = filtered.sort((a, b) => {
    if (popupState.dateSort === 'newest') {
      return b.dateSaved - a.dateSaved;
    } else {
      return a.dateSaved - b.dateSaved;
    }
  });

  return filtered;
}

// Render contexts in popup body
function renderContexts() {
  const popupBody = document.querySelector('.popup-body');
  if (!popupBody) return;

  const filteredContexts = filterContexts();

  if (filteredContexts.length === 0) {
    popupBody.innerHTML = `
      <div class="popup-empty-state">
        <div class="popup-empty-icon">
          <img src="${chrome.runtime.getURL('icon-emptystate.png')}" alt="No contexts" style="width:48px;height:48px;">
        </div>
        <div class="popup-empty-subtitle">Save some ${currentFilter}s to see them here.</div>
      </div>
    `;
    return;
  }

  const contextsContainer = document.createElement('div');
  contextsContainer.style.cssText = `
    padding: 16px;
    overflow-y: auto;
    height: 100%;
  `;

  filteredContexts.forEach(context => {
    const card = createContextCard(context);
    contextsContainer.appendChild(card);
  });

  popupBody.innerHTML = '';
  popupBody.appendChild(contextsContainer);
}

// Enhanced context card with click-to-insert and context menu
function createContextCard(context: ContextBlock): HTMLElement {
  const card = document.createElement('div');
  card.className = 'context-card';

  // CLICK TO INSERT - Direct insertion on card click
  card.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.context-menu-btn')) {
      insertContextIntoChat(context);
    }
  });

  // Platform indicator
  const platformIndicator = document.createElement('div');
  platformIndicator.className = 'context-card-platform';

  // NEW LOGIC FOR ICON/LABEL
  if (context.contextType === 'highlighted') {
    if (context.platform === 'chatgpt') {
      const platformIcon = document.createElement('img');
      platformIcon.src = chrome.runtime.getURL('icon-gpt.png');
      platformIcon.alt = 'Highlighted (ChatGPT)';
      platformIcon.style.width = '40px';
      platformIcon.style.height = '40px';
      platformIndicator.appendChild(platformIcon);
      const label = document.createElement('span');
      label.textContent = 'Highlighted';
      label.style.marginLeft = '6px';
      label.style.fontWeight = 'bold';
      platformIndicator.appendChild(label);
    } else if (context.platform === 'gemini') {
      const platformIcon = document.createElement('img');
      platformIcon.src = chrome.runtime.getURL('icon-gemini.png');
      platformIcon.alt = 'Highlighted (Gemini)';
      platformIcon.style.width = '40px';
      platformIcon.style.height = '40px';
      platformIndicator.appendChild(platformIcon);
      const label = document.createElement('span');
      label.textContent = 'Highlighted';
      label.style.marginLeft = '6px';
      label.style.fontWeight = 'bold';
      platformIndicator.appendChild(label);
    } else {
      const label = document.createElement('span');
      label.textContent = 'Highlighted';
      label.style.fontWeight = 'bold';
      platformIndicator.appendChild(label);
    }
  } else {
    const platformIcon = document.createElement('img');
    platformIcon.src = context.platform === 'gemini'
      ? chrome.runtime.getURL('icon-gemini.png')
      : chrome.runtime.getURL('icon-gpt.png');
    platformIcon.alt = context.platform || 'chatgpt';
    platformIcon.style.width = '40px';
    platformIcon.style.height = '40px';
    platformIndicator.appendChild(platformIcon);
  }

  // Title
  const title = document.createElement('div');
  title.className = 'context-card-title';
  title.textContent = context.title;

  // Platform and date
  const metaInfo = document.createElement('div');
  metaInfo.className = 'context-card-meta';

  // --- UPDATED LOGIC ---
  let platformName = '';
  if (context.platform === 'gemini') {
    platformName = 'Gemini';
  } else if (context.platform === 'chatgpt') {
    platformName = 'ChatGPT';
  } else if (context.platform === 'external') {
    platformName = 'Highlighted Text';
  } else {
    platformName = context.platform || 'Unknown';
  }
  const date = new Date(context.dateSaved).toLocaleDateString();
  metaInfo.innerHTML = `
    <span>${platformName}</span>
    <span>•</span>
    <span>${date}</span>
  `;

  // Tags
  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'context-card-tags';

  context.tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.className = 'context-card-tag';
    tagElement.textContent = tag;
    tagsContainer.appendChild(tagElement);
  });

  // Assemble card
  card.appendChild(platformIndicator);
  card.appendChild(title);
  card.appendChild(metaInfo);
  card.appendChild(tagsContainer);

  return card;
}

// Insert functionality
function insertContextIntoChat(context: ContextBlock): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      showInsertError();
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'INSERT_CONTEXT',
      context: { title: context.title, body: context.body, contextType: context.contextType }
    }, (response) => {
      if (response && response.success) {
        showInsertFeedback(context.title);
        markAsUsed(context.id);
        window.close(); // Close popup after successful insertion
      } else {
        showInsertError();
      }
    });
  });
}

// Success feedback
function showInsertFeedback(title: string): void {
  const feedback = document.createElement('div');
  feedback.className = 'insert-feedback';
  feedback.textContent = `"${title}" inserted!`;
  document.body.appendChild(feedback);

  setTimeout(() => feedback.classList.add('show'), 10);
  setTimeout(() => {
    feedback.classList.remove('show');
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

function showInsertError(): void {
  const feedback = document.createElement('div');
  feedback.className = 'insert-feedback error';
  feedback.textContent = 'Insert failed. Make sure you\'re in a chat.';
  document.body.appendChild(feedback);

  setTimeout(() => feedback.classList.add('show'), 10);
  setTimeout(() => {
    feedback.classList.remove('show');
    setTimeout(() => feedback.remove(), 300);
  }, 3000);
}

// Context menu system
function showContextMenu(context: ContextBlock, x: number, y: number): void {
  // Remove any existing menu
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.cssText = `position: fixed; top: ${y}px; left: ${x}px; z-index: 10000;`;

  menu.innerHTML = `
    <div class="context-menu-item" data-action="view">
      <img src="${chrome.runtime.getURL('icon-edit.png')}" alt="View">
      View & Edit
    </div>
    <div class="context-menu-item" data-action="export">
      <img src="${chrome.runtime.getURL('icon-export-single.png')}" alt="Export">
      Export as Text
    </div>
    <div class="context-menu-item" data-action="favorite">
      <img src="${chrome.runtime.getURL('icon-favorite.png')}" alt="Favorite">
      ${context.isFavorite ? 'Unfavorite' : 'Favorite'}
    </div>
    <div class="context-menu-item" data-action="delete">
      <img src="${chrome.runtime.getURL('icon-trash.png')}" alt="Delete">
      Delete
    </div>
  `;

  document.body.appendChild(menu);

  // Position adjustment to stay in viewport
  const rect = menu.getBoundingClientRect();

  // Check right edge
  if (rect.right > window.innerWidth) {
    menu.style.left = `${x - rect.width}px`;
  }

  // Check bottom edge
  if (rect.bottom > window.innerHeight) {
    menu.style.top = `${y - rect.height}px`;
  }

  // Check left edge (in case we moved it too far left)
  const newRect = menu.getBoundingClientRect();
  if (newRect.left < 0) {
    menu.style.left = '0px';
  }

  // Check top edge (in case we moved it too far up)
  if (newRect.top < 0) {
    menu.style.top = '0px';
  }

  menu.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.context-menu-item');
    if (!item) return;

    const action = item.getAttribute('data-action');
    handleContextMenuAction(action, context);
    menu.remove();
  });

  // Close menu on outside click
  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 0);
}

function handleContextMenuAction(action: string | null, context: ContextBlock): void {
  switch (action) {
    case 'view':
      showEditModal(context);
      break;
    case 'export':
      exportContext(context);
      break;
    case 'favorite':
      toggleFavorite(context.id).then(() => loadContexts());
      break;
    case 'delete':
      if (confirm(`Delete "${context.title}"?`)) {
        deleteContextBlock(context.id).then(() => loadContexts());
      }
      break;
  }
}

function exportContext(context: ContextBlock): void {
  const content = `Title: ${context.title}\nDate Saved: ${new Date(context.dateSaved).toLocaleString()}\nTags: ${context.tags.join(', ')}\n\n${context.body}`;

  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Sanitize filename
    const sanitizedTitle = context.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `chatseed_${sanitizedTitle}_${context.id.substring(0, 8)}.txt`;

    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    }, () => {
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  }
}

// Edit modal system
function showEditModal(context: ContextBlock): void {
  if (currentModal) closeEditModal();

  const overlay = document.createElement('div');
  overlay.className = 'edit-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'edit-modal-content';
  modal.innerHTML = `
    <div class="edit-modal-header">
      <div class="modal-title-section">
        <img src="${chrome.runtime.getURL(context.platform === 'gemini' ? 'icon-gemini.png' : 'icon-gpt.png')}" 
             alt="${context.platform}" class="modal-platform-icon">
        <h3>Edit Context</h3>
      </div>
      <button class="modal-close-btn" id="modal-close-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
    <div class="edit-modal-body">
      <div class="edit-field">
        <label>Title</label>
        <input type="text" id="edit-title" value="${escapeHtml(context.title)}">
      </div>
      <div class="edit-field">
        <label>Content</label>
        <textarea id="edit-body" rows="8">${escapeHtml(context.body)}</textarea>
      </div>
      <div class="edit-field">
        <label>Tags (comma-separated)</label>
        <input type="text" id="edit-tags" value="${escapeHtml(context.tags.join(', '))}">
      </div>
    </div>
    <div class="edit-modal-footer">
      <button class="modal-action-btn" id="insert-edit-btn">
        <img src="${chrome.runtime.getURL('icon-insert.png')}" alt="Insert">
        Insert into Chat
      </button>
      <button class="modal-action-btn" id="save-edit-btn">
        <img src="${chrome.runtime.getURL('icon-edit.png')}" alt="Save">
        Save Changes
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  currentModal = overlay;

  setupEditModalEventListeners(context);
}

function closeEditModal(): void {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
}

function setupEditModalEventListeners(context: ContextBlock): void {
  if (!currentModal) return;

  const closeBtn = currentModal.querySelector('#modal-close-btn');
  closeBtn?.addEventListener('click', closeEditModal);

  const insertBtn = currentModal.querySelector('#insert-edit-btn');
  insertBtn?.addEventListener('click', () => {
    insertContextIntoChat(context);
    closeEditModal();
  });

  const saveBtn = currentModal.querySelector('#save-edit-btn');
  saveBtn?.addEventListener('click', async () => {
    const titleInput = currentModal!.querySelector('#edit-title') as HTMLInputElement;
    const bodyInput = currentModal!.querySelector('#edit-body') as HTMLTextAreaElement;
    const tagsInput = currentModal!.querySelector('#edit-tags') as HTMLInputElement;

    const updatedContext = {
      ...context,
      title: titleInput.value.trim(),
      body: bodyInput.value.trim(),
      tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      await updateContextBlock(context.id, updatedContext);
      closeEditModal();
      loadContexts();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save changes');
    }
  });

  // Close on outside click
  currentModal.addEventListener('click', (e) => {
    if (e.target === currentModal) closeEditModal();
  });

  // Close on Escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeEditModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Utility functions for filter menu
function getAllTags(): string[] {
  const tagSet = new Set<string>();
  allContexts.forEach(ctx => ctx.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

// Filter menu functionality (only works if elements exist in HTML)
function renderFilterMenu() {
  const filterMenu = document.getElementById('filter-menu');
  if (!filterMenu) return; // Skip if no filter menu in HTML

  // Remove tag chips entirely
  // const tags = getAllTags();
  // const tagChips = tags.length
  //   ? tags.map(tag => `
  //     <span class="tag-chip${popupState.selectedTag === tag ? ' selected' : ''}" data-tag="${tag}">${tag}</span>
  //   `).join('')
  //   : '<span style="color:#aaa;font-size:12px;">No tags</span>';

  filterMenu.innerHTML = `
    <div style="margin-bottom:8px;">
      <input type="text" id="filter-search" placeholder="Search by title or tag…" value="${popupState.searchQuery || ''}" style="width:100%;padding:6px 10px;border-radius:8px;border:1px solid #e0e0e0;">
    </div>
    <div style="display:flex;gap:8px;justify-content:space-between;">
      <!-- Platform filter as text labels styled like context card tags -->
      <span class="platform-label${popupState.selectedPlatform === 'chatgpt' ? ' selected' : ''}" data-platform="chatgpt">ChatGPT</span>
      <span class="platform-label${popupState.selectedPlatform === 'gemini' ? ' selected' : ''}" data-platform="gemini">Gemini</span>
      <span class="platform-label${popupState.selectedPlatform === 'highlighted' ? ' selected' : ''}" data-platform="highlighted">Highlighted</span>
    </div>
    <div style="margin:10px 0 0 0;">
      <label style="margin-right:10px;">
        <input type="radio" name="date-sort" value="newest" ${popupState.dateSort === 'newest' ? 'checked' : ''}/> Newest
      </label>
      <label>
        <input type="radio" name="date-sort" value="oldest" ${popupState.dateSort === 'oldest' ? 'checked' : ''}/> Oldest
      </label>
    </div>
    <!-- Remove tag chips section entirely -->
    <button id="clear-filters-btn" style="margin-top:12px;width:100%;padding:6px 0;border-radius:8px;border:none;background:#e0e0e0;color:#176548;font-weight:600;cursor:pointer;">Clear filters</button>
  `;

  // Add event listeners for filter controls
  const searchInput = document.getElementById('filter-search') as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    popupState.searchQuery = (e.target as HTMLInputElement).value;
    renderContexts();
  });

  // Update platform label event listeners
  filterMenu.querySelectorAll('.platform-label').forEach(label => {
    label.addEventListener('click', () => {
      popupState.selectedPlatform = (label as HTMLElement).getAttribute('data-platform') as any;
      renderFilterMenu();
      renderContexts();
    });
  });

  filterMenu.querySelectorAll('input[name="date-sort"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      popupState.dateSort = (e.target as HTMLInputElement).value as any;
      renderContexts();
    });
  });

  // Remove tag chip event listeners

  document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
    popupState.searchQuery = '';
    popupState.selectedPlatform = 'all';
    popupState.dateSort = 'newest';
    popupState.selectedTag = null;
    renderFilterMenu();
    renderContexts();
  });
}

// Utility function for HTML escaping
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadContexts();

  // Platform filter
  const platformFilter = document.getElementById('platform-filter') as HTMLSelectElement;
  platformFilter?.addEventListener('change', (e) => {
    popupState.platformFilter = (e.target as HTMLSelectElement).value as 'all' | 'chatgpt' | 'gemini';
    renderContexts();
  });

  // Filter menu toggle
  const filterBtn = document.getElementById('filter-menu-btn');
  const filterMenu = document.getElementById('filter-menu');

  if (filterBtn && filterMenu) {
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (filterMenu.style.display === 'flex') {
        filterMenu.style.display = 'none';
      } else {
        filterMenu.style.display = 'flex';
        renderFilterMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        filterMenu &&
        filterMenu.style.display === 'flex' &&
        !filterMenu.contains(e.target as Node) &&
        e.target !== filterBtn
      ) {
        filterMenu.style.display = 'none';
      }
    });
  }

  // Search toggle
  const searchToggle = document.getElementById('search-toggle');
  const searchBar = document.getElementById('search-bar');
  const searchInput = document.getElementById('search-input') as HTMLInputElement;

  searchToggle?.addEventListener('click', () => {
    popupState.searchVisible = !popupState.searchVisible;
    searchBar?.classList.toggle('visible', popupState.searchVisible);
    if (popupState.searchVisible) {
      searchInput?.focus();
    } else {
      searchInput.value = '';
      popupState.searchQuery = '';
      renderContexts();
    }
  });

  // Search input with debouncing
  let searchTimeout: NodeJS.Timeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      popupState.searchQuery = (e.target as HTMLInputElement).value;
      renderContexts();
    }, 300);
  });

  // Existing toggle functionality
  const toggle = document.getElementById('toggle-radio') as HTMLInputElement;
  toggle?.addEventListener('change', () => {
    currentFilter = toggle.checked ? 'prompt' : 'context';
    renderContexts();
  });

  // Help icon logic
  const helpIcon = document.getElementById('help-icon');
  const helpModal = document.getElementById('help-modal');

  if (helpIcon && helpModal) {
    helpIcon.addEventListener('click', () => {
      helpModal.style.display = 'flex';
    });

    // Close modal on click outside content
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        helpModal.style.display = 'none';
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (helpModal.style.display === 'flex' && e.key === 'Escape') {
        helpModal.style.display = 'none';
      }
    });
  }
});