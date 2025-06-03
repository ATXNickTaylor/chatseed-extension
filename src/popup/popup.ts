// src/popup/popup.ts
import { getContextBlocks, deleteContextBlock } from '../utils/storage';
import { ContextBlock } from '../types';

let allContexts: ContextBlock[] = [];
let filteredContexts: ContextBlock[] = [];
let activeTagFilter: string | null = null;
let activeFilter: { type: string; value: string } | null = null;
let isFilterPanelOpen: boolean = false;

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadContexts();
  setupEventListeners();
});

async function loadContexts(): Promise<void> {
  console.log('📚 Starting loadContexts...');
  try {
    allContexts = await getContextBlocks();
    console.log('📚 Raw contexts from storage:', allContexts);
    console.log('📚 Number of contexts loaded:', allContexts.length);
    
    // Sort contexts in descending order (most recent first)
    allContexts.sort((a, b) => b.dateSaved - a.dateSaved);
    filteredContexts = [...allContexts];
    
    console.log('📚 Contexts after sorting:', allContexts);
    console.log('📚 Filtered contexts:', filteredContexts);
    
    renderContexts();
  } catch (error) {
    console.error('📚 Failed to load contexts:', error);
    showError('Failed to load contexts');
  }
}

function setupEventListeners(): void {
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const refreshBtn = document.getElementById('refresh-btn') as HTMLElement;
  const summarizeBtn = document.getElementById('summarize-btn') as HTMLButtonElement;
  const filterToggleBtn = document.getElementById('filter-toggle-btn') as HTMLButtonElement;
  const filterContainer = document.getElementById('filter-container') as HTMLElement;
  const filterType = document.getElementById('filter-type') as HTMLSelectElement;
  const filterInput = document.getElementById('filter-input') as HTMLInputElement;
  const filterInputContainer = document.getElementById('filter-input-container') as HTMLElement;
  const clearFilterBtn = document.getElementById('clear-filter-btn') as HTMLButtonElement;
  const removeFilterBtn = document.getElementById('remove-filter-btn') as HTMLButtonElement;

  searchInput?.addEventListener('input', handleSearch);
  
  refreshBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loadContexts();
  });

  summarizeBtn?.addEventListener('click', () => {
    handleSummarizeChat();
  });

  filterToggleBtn?.addEventListener('click', () => {
    toggleFilterPanel();
  });

  filterType?.addEventListener('change', (e) => {
    const value = (e.target as HTMLSelectElement).value;
    if (value === 'all') {
      filterInputContainer.style.display = 'none';
      clearFilters();
    } else {
      filterInputContainer.style.display = 'block';
      filterInput.placeholder = getFilterPlaceholder(value);
      filterInput.focus();
    }
  });

  filterInput?.addEventListener('input', (e) => {
    const filterValue = (e.target as HTMLInputElement).value;
    const filterType = (document.getElementById('filter-type') as HTMLSelectElement).value;
    applyFilter(filterType, filterValue);
  });

  clearFilterBtn?.addEventListener('click', () => {
    clearFilters();
  });

  removeFilterBtn?.addEventListener('click', () => {
    clearFilters();
  });
}

async function handleSummarizeChat(): Promise<void> {
  console.log('Summarize chat button clicked');
  
  try {
    // Send message to content script to insert summarize prompt
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      console.log('Sending SUMMARIZE_CHAT message to tab:', tab.id);
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'SUMMARIZE_CHAT'
      });
      
      console.log('Summarize response:', response);
      
      if (response && response.success) {
        console.log('Summarize prompt inserted successfully, closing popup');
        // Close popup after successful insertion
        window.close();
      } else {
        console.error('Summarize failed:', response);
        alert('Failed to insert summarize prompt. Make sure you are on a ChatGPT page.');
      }
    } else {
      console.error('No active tab found');
      alert('No active tab found. Make sure you are on a ChatGPT page.');
    }
  } catch (error) {
    console.error('Failed to insert summarize prompt:', error);
    alert('Failed to insert summarize prompt. Make sure you are on a ChatGPT page and try again.');
  }
}

function toggleFilterPanel(): void {
  const filterContainer = document.getElementById('filter-container') as HTMLElement;
  const filterToggleBtn = document.getElementById('filter-toggle-btn') as HTMLButtonElement;
  
  isFilterPanelOpen = !isFilterPanelOpen;
  
  if (isFilterPanelOpen) {
    filterContainer.classList.add('show');
    filterToggleBtn.textContent = '🔍 Hide Filter';
  } else {
    filterContainer.classList.remove('show');
    filterToggleBtn.textContent = '🔍 Filter';
    // Clear filters when closing panel
    clearFilters();
  }
}

function getFilterPlaceholder(filterType: string): string {
  switch (filterType) {
    case 'keyword': return 'Enter keyword to search...';
    case 'tag': return 'Enter tag name...';
    case 'date': return 'Enter date (YYYY-MM-DD)...';
    default: return 'Enter filter value...';
  }
}

function applyFilter(filterType: string, filterValue: string): void {
  if (!filterValue.trim()) {
    activeFilter = null;
    filteredContexts = [...allContexts];
    updateFilterIndicator();
    renderContexts();
    return;
  }

  const searchTerm = filterValue.toLowerCase().trim();
  activeFilter = { type: filterType, value: filterValue };

  filteredContexts = allContexts.filter(context => {
    switch (filterType) {
      case 'keyword':
        return context.title.toLowerCase().includes(searchTerm) ||
               context.body.toLowerCase().includes(searchTerm);
      case 'tag':
        return context.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      case 'date':
        const contextDate = new Date(context.dateSaved).toISOString().split('T')[0];
        return contextDate.includes(searchTerm);
      default:
        return true;
    }
  });

  updateFilterIndicator();
  renderContexts();
}

function updateFilterIndicator(): void {
  const indicator = document.getElementById('active-filter-indicator') as HTMLElement;
  const description = document.getElementById('filter-description') as HTMLElement;
  
  if (activeFilter || activeTagFilter) {
    indicator.style.display = 'flex';
    if (activeTagFilter) {
      description.textContent = `Filtered by tag: "${activeTagFilter}"`;
    } else if (activeFilter) {
      description.textContent = `Filtered by ${activeFilter.type}: "${activeFilter.value}"`;
    }
  } else {
    indicator.style.display = 'none';
  }
}

function clearFilters(): void {
  activeTagFilter = null;
  activeFilter = null;
  filteredContexts = [...allContexts];
  
  // Reset all filter inputs
  const filterInput = document.getElementById('filter-input') as HTMLInputElement;
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const filterType = document.getElementById('filter-type') as HTMLSelectElement;
  const filterInputContainer = document.getElementById('filter-input-container') as HTMLElement;
  
  if (filterInput) filterInput.value = '';
  if (searchInput) searchInput.value = '';
  if (filterType) filterType.value = 'all';
  if (filterInputContainer) filterInputContainer.style.display = 'none';
  
  updateFilterIndicator();
  renderContexts();
}

function handleSearch(e: Event): void {
  const searchTerm = (e.target as HTMLInputElement).value.toLowerCase().trim();
  
  if (!searchTerm) {
    filteredContexts = [...allContexts];
  } else {
    filteredContexts = allContexts.filter(context =>
      context.title.toLowerCase().includes(searchTerm) ||
      context.body.toLowerCase().includes(searchTerm) ||
      context.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
    );
  }
  renderContexts();
}

function handleTagClick(tagName: string): void {
  // Open filter panel if not already open
  if (!isFilterPanelOpen) {
    toggleFilterPanel();
  }
  
  // Clear other filters first
  clearFilters();
  
  // Set up tag filter
  const filterType = document.getElementById('filter-type') as HTMLSelectElement;
  const filterInput = document.getElementById('filter-input') as HTMLInputElement;
  const filterInputContainer = document.getElementById('filter-input-container') as HTMLElement;
  
  filterType.value = 'tag';
  filterInput.value = tagName;
  filterInputContainer.style.display = 'block';
  
  activeTagFilter = tagName;
  activeFilter = { type: 'tag', value: tagName };
  
  filteredContexts = allContexts.filter(context =>
    context.tags.some(tag => tag.toLowerCase() === tagName.toLowerCase())
  );
  
  updateFilterIndicator();
  renderContexts();
}

function renderContexts(): void {
  console.log('📚 Starting renderContexts...');
  console.log('📚 filteredContexts.length:', filteredContexts.length);
  
  const contextList = document.getElementById('context-list');
  if (!contextList) {
    console.error('📚 Context list element not found!');
    return;
  }

  if (filteredContexts.length === 0) {
    console.log('📚 No contexts to display, showing empty state');
    contextList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div>No saved contexts found</div>
        <div style="font-size: 14px; margin-top: 8px;">
          ${activeTagFilter || activeFilter ? 
            'No contexts match your current filter. Try clearing the filter or searching for something else.' : 
            'Visit ChatGPT and click the floating save button to create your first context!'}
        </div>
      </div>
    `;
    return;
  }

  console.log('📚 Rendering', filteredContexts.length, 'contexts');

  contextList.innerHTML = filteredContexts.map((context, index) => {
    console.log('📚 Rendering context:', context.title, 'ID:', context.id);
    
    const isFirstContext = index === 0 && filteredContexts.length === allContexts.length;
    const recentIndicator = isFirstContext 
      ? '<div class="recent-indicator">This is your most recently saved context.</div>'
      : '';

    return `
      <div class="context-item ${isFirstContext ? 'most-recent' : ''}" data-context-id="${context.id}">
        <div class="context-title">${escapeHtml(context.title)}</div>
        <div class="context-preview">${escapeHtml(truncateText(context.body, 150))}</div>
        <div class="context-meta">
          <div class="context-tags">
            ${context.tags.map((tag: string) => 
              `<span class="tag ${activeTagFilter === tag ? 'active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`
            ).join('')}
          </div>
          <div>${formatDate(context.dateSaved)}</div>
        </div>
        ${recentIndicator}
        <div class="context-actions">
          <button class="btn btn-primary insert-btn" data-context-id="${context.id}">
            📋 Insert
          </button>
          <button class="btn btn-secondary view-btn" data-context-id="${context.id}">
            👁️ View
          </button>
          <button class="btn btn-success export-btn" data-context-id="${context.id}">
            📥 Export
          </button>
          <button class="btn btn-danger delete-btn" data-context-id="${context.id}">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }).join('');

  console.log('📚 Context HTML generated, setting up listeners...');

  // Add event listeners for buttons and tags
  setupContextButtonListeners();
  setupTagClickListeners();
  
  console.log('📚 renderContexts complete');
}

function setupTagClickListeners(): void {
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const tagName = (e.target as HTMLElement).getAttribute('data-tag');
      if (tagName) {
        handleTagClick(tagName);
      }
    });
  });
}

function setupContextButtonListeners(): void {
  console.log('Setting up context button listeners');
  
  // Insert buttons
  document.querySelectorAll('.insert-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const contextId = (e.target as HTMLElement).getAttribute('data-context-id');
      console.log('Insert button clicked for context:', contextId);
      if (contextId) {
        await insertContext(contextId);
      }
    });
  });

  // View buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const contextId = (e.target as HTMLElement).getAttribute('data-context-id');
      console.log('View button clicked for context:', contextId);
      if (contextId) {
        viewContext(contextId);
      }
    });
  });

  // Export buttons
  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const contextId = (e.target as HTMLElement).getAttribute('data-context-id');
      console.log('Export button clicked for context:', contextId);
      if (contextId) {
        exportContext(contextId);
      }
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const contextId = (e.target as HTMLElement).getAttribute('data-context-id');
      console.log('Delete button clicked for context:', contextId);
      if (contextId) {
        await deleteContext(contextId);
      }
    });
  });
}

async function insertContext(contextId: string): Promise<void> {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) {
    console.error('Context not found:', contextId);
    return;
  }

  console.log('Attempting to insert context:', context.title);

  try {
    // Send message to content script to insert context
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      console.log('Sending INSERT_CONTEXT message to tab:', tab.id);
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'INSERT_CONTEXT',
        context: context
      });
      
      console.log('Insert response:', response);
      
      if (response && response.success) {
        console.log('Context inserted successfully, closing popup');
        // Close popup after successful insertion
        window.close();
      } else {
        console.error('Insert failed:', response);
        alert('Failed to insert context. Make sure you are on a ChatGPT page.');
      }
    } else {
      console.error('No active tab found');
      alert('No active tab found. Make sure you are on a ChatGPT page.');
    }
  } catch (error) {
    console.error('Failed to insert context:', error);
    alert('Failed to insert context. Make sure you are on a ChatGPT page and try again.');
  }
}

function exportContext(contextId: string): void {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) {
    console.error('Context not found:', contextId);
    return;
  }

  console.log('Exporting context:', context.title);

  try {
    // Create human-readable text content
    const exportContent = `CHAT SEED EXPORT
==================

Title: ${context.title}
Date Saved: ${formatDate(context.dateSaved)}
Tags: ${context.tags.length > 0 ? context.tags.join(', ') : 'None'}

Content:
--------
${context.body}

==================
Exported from Chat Seeds Extension
${new Date().toLocaleString()}`;

    // Create a safe filename from the title
    const safeTitle = context.title
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 50);
    
    const filename = `chat-seed-${safeTitle}.txt`;

    // Create blob and download
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log(`Successfully exported context "${context.title}" to ${filename}`);
    
  } catch (error) {
    console.error('Failed to export context:', error);
    alert('Failed to export context. Please try again.');
  }
}

function viewContext(contextId: string): void {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) {
    console.error('Context not found:', contextId);
    return;
  }

  console.log('Viewing context:', context.title);

  // Create a simple view modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 90%;
      max-height: 90%;
      overflow-y: auto;
      position: relative;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; color: #333;">${escapeHtml(context.title)}</h3>
        <button id="close-view-modal" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        ">×</button>
      </div>
      <div style="white-space: pre-wrap; line-height: 1.6; color: #333; margin-bottom: 16px;">
        ${escapeHtml(context.body)}
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${context.tags.map((tag: string) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Add close button listener
  const closeBtn = modal.querySelector('#close-view-modal');
  closeBtn?.addEventListener('click', () => {
    console.log('Closing view modal');
    modal.remove();
  });
  
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      console.log('Clicking outside modal to close');
      modal.remove();
    }
  });
}

async function deleteContext(contextId: string): Promise<void> {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) {
    console.error('Context not found:', contextId);
    return;
  }

  console.log('Attempting to delete context:', context.title);

  if (confirm(`Are you sure you want to delete "${context.title}"?`)) {
    try {
      await deleteContextBlock(contextId);
      await loadContexts(); // Refresh the list
      console.log('Context deleted successfully');
    } catch (error) {
      console.error('Failed to delete context:', error);
      alert('Failed to delete context. Please try again.');
    }
  }
}

// Utility functions
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showError(message: string): void {
  const contextList = document.getElementById('context-list');
  if (contextList) {
    contextList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div>${message}</div>
      </div>
    `;
  }
}