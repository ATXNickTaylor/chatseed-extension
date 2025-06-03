// src/popup/popup.ts
import './styles.css';
import { 
  getContextBlocks, 
  deleteContextBlock, 
  toggleFavorite, 
  markAsUsed, 
  getContextStats,
  getRecentContexts,
  getFavoriteContexts,
  exportAllContexts 
} from '../utils/storage';
import { ContextBlock, NavigationState } from '../types';

let allContexts: ContextBlock[] = [];
let filteredContexts: ContextBlock[] = [];
let navigationState: NavigationState = {
  activeSection: 'all',
  searchQuery: '',
  tagFilter: null
};

interface FilterState {
  keyword: string;
  tag: string;
  date: string;
  isVisible: boolean;
}

let filterState: FilterState = {
  keyword: '',
  tag: '',
  date: '',
  isVisible: false
};

// Initialize popup when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadContexts();
  setupEventListeners();
  updateStats();
});

async function loadContexts(): Promise<void> {
  console.log('📚 Starting loadContexts...');
  try {
    allContexts = await getContextBlocks();
    console.log('📚 Raw contexts from storage:', allContexts);
    console.log('📚 Number of contexts loaded:', allContexts.length);
    
    // Sort contexts in descending order (most recent first)
    allContexts.sort((a, b) => b.dateSaved - a.dateSaved);
    
    console.log('📚 Contexts after sorting:', allContexts);
    
    applyCurrentFilters();
  } catch (error) {
    console.error('📚 Failed to load contexts:', error);
    showError('Failed to load contexts');
  }
}

function setupEventListeners(): void {
  // Search functionality
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', handleSearch);

  // Banner action buttons
  const exportAllBtn = document.getElementById('export-all-btn');
  const filterToggleBtn = document.getElementById('filter-toggle-btn');

  exportAllBtn?.addEventListener('click', handleExportAllIndividual);
  filterToggleBtn?.addEventListener('click', toggleFilterSection);

  // Filter inputs
  const filterKeyword = document.getElementById('filter-keyword') as HTMLInputElement;
  const filterTag = document.getElementById('filter-tag') as HTMLInputElement;
  const filterDate = document.getElementById('filter-date') as HTMLSelectElement;

  filterKeyword?.addEventListener('input', handleFilterChange);
  filterTag?.addEventListener('input', handleFilterChange);
  filterDate?.addEventListener('change', handleFilterChange);

  // Plus button and menus
  const plusBtn = document.getElementById('plus-btn');
  const summarizeCurrentBtn = document.getElementById('summarize-current-btn');

  plusBtn?.addEventListener('click', togglePlusMenu);
  summarizeCurrentBtn?.addEventListener('click', showSummarizeMenu);

  // Summarize menu items
  document.querySelectorAll('[data-summary-type]').forEach(item => {
    item.addEventListener('click', handleSummarizeOption);
  });

  // Navigation items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', handleNavigation);
  });

  // Close menus when clicking outside
  document.addEventListener('click', handleOutsideClick);
}

function handleNavigation(e: Event): void {
  const target = e.currentTarget as HTMLElement;
  const navType = target.getAttribute('data-nav') as NavigationState['activeSection'];
  
  if (!navType) return;

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  target.classList.add('active');

  // Update navigation state
  navigationState.activeSection = navType;
  navigationState.tagFilter = null; // Clear tag filter when switching sections

  applyCurrentFilters();
}

function handleSearch(e: Event): void {
  const searchTerm = (e.target as HTMLInputElement).value;
  navigationState.searchQuery = searchTerm;
  applyCurrentFilters();
}

function toggleFilterSection(): void {
  const filterSection = document.getElementById('filter-section');
  if (!filterSection) return;

  filterState.isVisible = !filterState.isVisible;
  filterSection.style.display = filterState.isVisible ? 'block' : 'none';
}

function handleFilterChange(): void {
  const keywordInput = document.getElementById('filter-keyword') as HTMLInputElement;
  const tagInput = document.getElementById('filter-tag') as HTMLInputElement;
  const dateSelect = document.getElementById('filter-date') as HTMLSelectElement;

  filterState.keyword = keywordInput?.value || '';
  filterState.tag = tagInput?.value || '';
  filterState.date = dateSelect?.value || '';

  applyCurrentFilters();
}

function togglePlusMenu(e: Event): void {
  e.stopPropagation();
  const plusMenu = document.getElementById('plus-menu');
  const summarizeMenu = document.getElementById('summarize-menu');
  
  if (!plusMenu) return;

  // Hide summarize menu if open
  if (summarizeMenu) {
    summarizeMenu.style.display = 'none';
  }

  // Toggle plus menu
  const isVisible = plusMenu.style.display === 'block';
  plusMenu.style.display = isVisible ? 'none' : 'block';
}

function showSummarizeMenu(e: Event): void {
  e.stopPropagation();
  const plusMenu = document.getElementById('plus-menu');
  const summarizeMenu = document.getElementById('summarize-menu');
  
  if (!summarizeMenu) return;

  // Hide plus menu
  if (plusMenu) {
    plusMenu.style.display = 'none';
  }

  // Show summarize menu
  summarizeMenu.style.display = 'block';
}

function handleOutsideClick(e: Event): void {
  const target = e.target as HTMLElement;
  const plusBtn = document.getElementById('plus-btn');
  const plusMenu = document.getElementById('plus-menu');
  const summarizeMenu = document.getElementById('summarize-menu');

  // Check if click is outside menus and plus button
  if (!target.closest('#plus-btn') && !target.closest('#plus-menu') && !target.closest('#summarize-menu')) {
    if (plusMenu) plusMenu.style.display = 'none';
    if (summarizeMenu) summarizeMenu.style.display = 'none';
  }
}

async function handleSummarizeOption(e: Event): Promise<void> {
  const target = e.target as HTMLElement;
  const summaryType = target.getAttribute('data-summary-type');
  
  if (!summaryType) return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'SUMMARIZE_CHAT',
        summaryType: summaryType
      });
      
      if (response && response.success) {
        // Hide menus
        const plusMenu = document.getElementById('plus-menu');
        const summarizeMenu = document.getElementById('summarize-menu');
        if (plusMenu) plusMenu.style.display = 'none';
        if (summarizeMenu) summarizeMenu.style.display = 'none';
        
        window.close();
      } else {
        alert('Failed to insert summarize prompt. Make sure you are on a ChatGPT page.');
      }
    }
  } catch (error) {
    console.error('Failed to insert summarize prompt:', error);
    alert('Failed to insert summarize prompt. Make sure you are on a ChatGPT page and try again.');
  }
}

function applyCurrentFilters(): void {
  let filtered = [...allContexts];

  // Apply section filter
  switch (navigationState.activeSection) {
    case 'recent':
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(context => context.dateSaved > oneWeekAgo);
      break;
    case 'favorites':
      filtered = filtered.filter(context => context.isFavorite);
      break;
    case 'tags':
      // For tags view, group by tags or show all if no specific tag filter
      if (navigationState.tagFilter) {
        filtered = filtered.filter(context => 
          context.tags.some(tag => tag.toLowerCase().includes(navigationState.tagFilter!.toLowerCase()))
        );
      }
      break;
    case 'all':
    default:
      // No additional filtering for 'all'
      break;
  }

  // Apply search filter
  if (navigationState.searchQuery.trim()) {
    const searchTerm = navigationState.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(context =>
      context.title.toLowerCase().includes(searchTerm) ||
      context.body.toLowerCase().includes(searchTerm) ||
      context.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Apply additional filters
  if (filterState.keyword.trim()) {
    const keyword = filterState.keyword.toLowerCase().trim();
    filtered = filtered.filter(context =>
      context.title.toLowerCase().includes(keyword) ||
      context.body.toLowerCase().includes(keyword) ||
      context.tags.some(tag => tag.toLowerCase().includes(keyword))
    );
  }

  if (filterState.tag.trim()) {
    const tag = filterState.tag.toLowerCase().trim();
    filtered = filtered.filter(context =>
      context.tags.some(contextTag => contextTag.toLowerCase().includes(tag))
    );
  }

  if (filterState.date) {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    switch (filterState.date) {
      case 'today':
        filtered = filtered.filter(context => context.dateSaved > oneDayAgo);
        break;
      case 'week':
        filtered = filtered.filter(context => context.dateSaved > oneWeekAgo);
        break;
      case 'month':
        filtered = filtered.filter(context => context.dateSaved > oneMonthAgo);
        break;
      case 'older':
        filtered = filtered.filter(context => context.dateSaved <= oneMonthAgo);
        break;
    }
  }

  filteredContexts = filtered;
  renderContexts();
}

async function updateStats(): Promise<void> {
  try {
    const stats = await getContextStats();
    const statsCount = document.getElementById('stats-count');
    const statsTitle = document.getElementById('stats-title');
    
    if (statsCount) statsCount.textContent = stats.total.toString();
    if (statsTitle) {
      statsTitle.textContent = `You have ${stats.total} saved context${stats.total !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

function renderContexts(): void {
  console.log('📚 Starting renderContexts...');
  console.log('📚 filteredContexts.length:', filteredContexts.length);
  
  const contextsGrid = document.getElementById('contexts-grid');
  if (!contextsGrid) {
    console.error('📚 Contexts grid element not found!');
    return;
  }

  if (filteredContexts.length === 0) {
    console.log('📚 No contexts to display, showing empty state');
    const emptyMessage = getEmptyStateMessage();
    contextsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div>${emptyMessage}</div>
      </div>
    `;
    return;
  }

  console.log('📚 Rendering', filteredContexts.length, 'contexts');

  contextsGrid.innerHTML = filteredContexts.map(context => {
    console.log('📚 Rendering context:', context.title, 'ID:', context.id);
    
    return `
      <div class="context-card" data-context-id="${context.id}">
        <div class="context-header">
          <div>
            <div class="context-title">${escapeHtml(context.title)}</div>
            <div class="context-date">${formatDate(context.dateSaved)}</div>
          </div>
          <div class="context-actions">
            <button class="action-btn insert-btn" data-context-id="${context.id}" title="Insert Context">⬇️</button>
            <button class="action-btn export-context-btn" data-context-id="${context.id}" title="Export Context">📁</button>
            <button class="action-btn edit-btn" data-context-id="${context.id}" title="Edit">📝</button>
            <button class="action-btn favorite-btn ${context.isFavorite ? 'favorited' : ''}" data-context-id="${context.id}" title="Favorite">⭐</button>
            <button class="action-btn delete-btn" data-context-id="${context.id}" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="context-preview">${escapeHtml(truncateText(context.body, 150))}</div>
        <div class="context-tags">
          ${context.tags.map(tag => 
            `<span class="tag ${navigationState.tagFilter === tag ? 'active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }).join('');

  console.log('📚 Context HTML generated, setting up listeners...');

  // Add event listeners for context cards and actions
  setupContextEventListeners();
  
  console.log('📚 renderContexts complete');
}

function getEmptyStateMessage(): string {
  switch (navigationState.activeSection) {
    case 'recent':
      return 'No recent contexts found. Recent contexts are from the last 7 days.';
    case 'favorites':
      return 'No favorite contexts yet. Star contexts to add them to your favorites.';
    case 'tags':
      return navigationState.tagFilter 
        ? `No contexts found with tag "${navigationState.tagFilter}"`
        : 'Browse contexts by tags. Click on any tag to filter.';
    default:
      return navigationState.searchQuery
        ? 'No contexts match your search. Try different keywords.'
        : 'No saved contexts found. Visit ChatGPT and save your first context!';
  }
}

function setupContextEventListeners(): void {
  // Context card clicks (for viewing)
  document.querySelectorAll('.context-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger on action button clicks
      if ((e.target as HTMLElement).closest('.action-btn')) return;
      
      const contextId = card.getAttribute('data-context-id');
      if (contextId) viewContext(contextId);
    });
  });

  // Action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent card click
      const contextId = btn.getAttribute('data-context-id');
      if (!contextId) return;

      if (btn.classList.contains('insert-btn')) {
        await insertContext(contextId);
      } else if (btn.classList.contains('export-context-btn')) {
        await handleExportContext(contextId);
      } else if (btn.classList.contains('edit-btn')) {
        await insertContext(contextId); // For now, edit means insert
      } else if (btn.classList.contains('favorite-btn')) {
        await handleToggleFavorite(contextId);
      } else if (btn.classList.contains('delete-btn')) {
        await handleDeleteContext(contextId);
      }
    });
  });

  // Tag clicks
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const tagName = tag.getAttribute('data-tag');
      if (tagName) handleTagFilter(tagName);
    });
  });
}

function handleTagFilter(tagName: string): void {
  // Switch to tags view if not already there
  if (navigationState.activeSection !== 'tags') {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('[data-nav="tags"]')?.classList.add('active');
    navigationState.activeSection = 'tags';
  }

  // Toggle tag filter
  navigationState.tagFilter = navigationState.tagFilter === tagName ? null : tagName;
  applyCurrentFilters();
}

async function handleExportContext(contextId: string): Promise<void> {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) return;

  try {
    const content = `Title: ${context.title}\nDate Saved: ${new Date(context.dateSaved).toLocaleString()}\nTags: ${context.tags.join(', ')}\n\n${context.body}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Sanitize filename
    const sanitizedTitle = context.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `chatseed_${sanitizedTitle}_${context.id.substring(0, 8)}.txt`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log(`Successfully exported context "${context.title}" as .txt file`);
  } catch (error) {
    console.error('Failed to export context:', error);
    alert('Failed to export context. Please try again.');
  }
}

async function handleExportAllIndividual(): Promise<void> {
  try {
    if (allContexts.length === 0) {
      alert('No contexts to export.');
      return;
    }

    // Create individual .txt files for each context
    for (const context of allContexts) {
      const content = `Title: ${context.title}\nDate Saved: ${new Date(context.dateSaved).toLocaleString()}\nTags: ${context.tags.join(', ')}\n\n${context.body}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Sanitize filename
      const sanitizedTitle = context.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `chatseed_${sanitizedTitle}_${context.id.substring(0, 8)}.txt`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      // Small delay between downloads to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully exported ${allContexts.length} contexts as individual .txt files`);
  } catch (error) {
    console.error('Failed to export contexts:', error);
    alert('Failed to export contexts. Please try again.');
  }
}

async function insertContext(contextId: string): Promise<void> {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'INSERT_CONTEXT',
        context: context
      });
      
      if (response && response.success) {
        await markAsUsed(contextId);
        window.close();
      } else {
        alert('Failed to insert context. Make sure you are on a ChatGPT page.');
      }
    }
  } catch (error) {
    console.error('Failed to insert context:', error);
    alert('Failed to insert context. Please try again.');
  }
}

async function handleToggleFavorite(contextId: string): Promise<void> {
  try {
    await toggleFavorite(contextId);
    await loadContexts(); // Refresh to show updated state
    await updateStats();
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    alert('Failed to update favorite status. Please try again.');
  }
}

async function handleDeleteContext(contextId: string): Promise<void> {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) return;

  if (confirm(`Are you sure you want to delete "${context.title}"?`)) {
    try {
      await deleteContextBlock(contextId);
      await loadContexts();
      await updateStats();
    } catch (error) {
      console.error('Failed to delete context:', error);
      alert('Failed to delete context. Please try again.');
    }
  }
}

function viewContext(contextId: string): void {
  const context = allContexts.find(c => c.id === contextId);
  if (!context) return;

  // Create a view modal
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
        ${context.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  const closeBtn = modal.querySelector('#close-view-modal');
  closeBtn?.addEventListener('click', () => modal.remove());
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
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
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function showError(message: string): void {
  const contextsGrid = document.getElementById('contexts-grid');
  if (contextsGrid) {
    contextsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <div>${message}</div>
      </div>
    `;
  }
}