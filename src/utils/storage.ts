// src/utils/storage.ts
import { ContextBlock, ContextStats } from '../types';
import { detectCurrentPlatform } from './platformDetection';

// chrome.storage.local is Chrome's built-in storage API that persists data locally
export const StorageKeys = {
  CONTEXT_BLOCKS: 'contextBlocks',
  API_KEY: 'openaiApiKey',
  VERSION: 'version'
} as const;

// Check if extension context is still valid
function isExtensionContextValid(): boolean {
  try {
    return !!(chrome.storage && chrome.storage.local && chrome.runtime && chrome.runtime.id);
  } catch (error) {
    return false;
  }
}

export async function saveContextBlock(contextBlock: ContextBlock): Promise<void> {
  try {
    if (!isExtensionContextValid()) {
      throw new Error('Extension context invalidated - cannot save');
    }

    console.log('💾 Saving context block:', contextBlock);

    // Ensure platform is set
    if (!contextBlock.platform) {
      const currentPlatform = detectCurrentPlatform();
      contextBlock.platform = (currentPlatform || 'chatgpt') as 'chatgpt' | 'gemini';
    }

    const existing = await getContextBlocks();
    console.log('💾 Existing contexts before save:', existing);
    const updated = [...existing, contextBlock];
    console.log('💾 Updated contexts to save:', updated);

    await chrome.storage.local.set({ [StorageKeys.CONTEXT_BLOCKS]: updated });
    console.log('💾 Context block saved successfully!');

    // Verify the save worked
    const verification = await chrome.storage.local.get([StorageKeys.CONTEXT_BLOCKS]);
    console.log('💾 Verification - contexts in storage:', verification[StorageKeys.CONTEXT_BLOCKS]);
  } catch (error) {
    console.error('💾 Failed to save context block:', error);
    throw error;
  }
}

export async function getContextBlocks(): Promise<ContextBlock[]> {
  try {
    if (!isExtensionContextValid()) {
      console.warn('Extension context invalidated - cannot access storage');
      return [];
    }

    console.log('📖 Getting context blocks from storage...');
    const result = await chrome.storage.local.get([StorageKeys.CONTEXT_BLOCKS]);
    console.log('📖 Raw storage result:', result);

    const contexts = result[StorageKeys.CONTEXT_BLOCKS] || [];

    // Migrate legacy contexts without platform field
    const migratedContexts = contexts.map((context: ContextBlock) => ({
      ...context,
      platform: context.platform || 'chatgpt'
    }));

    console.log('📖 Parsed contexts:', migratedContexts);
    console.log('📖 Number of contexts found:', migratedContexts.length);

    return migratedContexts;
  } catch (error) {
    console.error('📖 Failed to get context blocks:', error);
    return [];
  }
}

export async function getContextBlocksByPlatform(platform: string): Promise<ContextBlock[]> {
  try {
    const allContexts = await getContextBlocks();
    return allContexts.filter(context => context.platform === platform);
  } catch (error) {
    console.error('Failed to get contexts by platform:', error);
    return [];
  }
}

export async function deleteContextBlock(id: string): Promise<void> {
  try {
    if (!isExtensionContextValid()) {
      throw new Error('Extension context invalidated - cannot delete');
    }

    console.log('🗑️ Deleting context block with ID:', id);
    const existing = await getContextBlocks();
    console.log('🗑️ Existing contexts before delete:', existing);
    const updated = existing.filter(block => block.id !== id);
    console.log('🗑️ Updated contexts after delete:', updated);

    await chrome.storage.local.set({ [StorageKeys.CONTEXT_BLOCKS]: updated });
    console.log('🗑️ Context block deleted successfully!');
  } catch (error) {
    console.error('🗑️ Failed to delete context block:', error);
    throw error;
  }
}

export async function updateContextBlock(id: string, updates: Partial<ContextBlock>): Promise<void> {
  try {
    if (!isExtensionContextValid()) {
      throw new Error('Extension context invalidated - cannot update');
    }

    const existing = await getContextBlocks();
    const updated = existing.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    await chrome.storage.local.set({ [StorageKeys.CONTEXT_BLOCKS]: updated });
  } catch (error) {
    console.error('Failed to update context block:', error);
    throw error;
  }
}

export async function toggleFavorite(id: string): Promise<void> {
  try {
    const existing = await getContextBlocks();
    const updated = existing.map(block =>
      block.id === id ? { ...block, isFavorite: !block.isFavorite } : block
    );
    await chrome.storage.local.set({ [StorageKeys.CONTEXT_BLOCKS]: updated });
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    throw error;
  }
}

export async function markAsUsed(id: string): Promise<void> {
  try {
    const existing = await getContextBlocks();
    const updated = existing.map(block =>
      block.id === id ? { ...block, lastUsed: Date.now() } : block
    );
    await chrome.storage.local.set({ [StorageKeys.CONTEXT_BLOCKS]: updated });
  } catch (error) {
    console.error('Failed to mark as used:', error);
    throw error;
  }
}

export async function getContextStats(): Promise<ContextStats> {
  try {
    const contexts = await getContextBlocks();
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const allTags = contexts.flatMap(context => context.tags);
    const uniqueTags = Array.from(new Set(allTags));

    return {
      total: contexts.length,
      recent: contexts.filter(context => context.dateSaved > oneWeekAgo).length,
      favorites: contexts.filter(context => context.isFavorite).length,
      tags: uniqueTags
    };
  } catch (error) {
    console.error('Failed to get context stats:', error);
    return { total: 0, recent: 0, favorites: 0, tags: [] };
  }
}

export async function getRecentContexts(limit: number = 10): Promise<ContextBlock[]> {
  try {
    const contexts = await getContextBlocks();
    return contexts
      .sort((a, b) => (b.lastUsed || b.dateSaved) - (a.lastUsed || a.dateSaved))
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get recent contexts:', error);
    return [];
  }
}

export async function getFavoriteContexts(): Promise<ContextBlock[]> {
  try {
    const contexts = await getContextBlocks();
    return contexts
      .filter(context => context.isFavorite)
      .sort((a, b) => b.dateSaved - a.dateSaved);
  } catch (error) {
    console.error('Failed to get favorite contexts:', error);
    return [];
  }
}

export async function exportAllContexts(): Promise<string> {
  try {
    const contexts = await getContextBlocks();
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      contexts: contexts
    };
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export all contexts:', error);
    throw error;
  }
}

export async function saveApiKey(apiKey: string): Promise<void> {
  try {
    if (!isExtensionContextValid()) {
      throw new Error('Extension context invalidated - cannot save API key');
    }
    
    await chrome.storage.local.set({ [StorageKeys.API_KEY]: apiKey });
  } catch (error) {
    console.error('Failed to save API key:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    if (!isExtensionContextValid()) {
      console.warn('Extension context invalidated - cannot get API key');
      return null;
    }
    
    const result = await chrome.storage.local.get([StorageKeys.API_KEY]);
    return result[StorageKeys.API_KEY] || null;
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
}