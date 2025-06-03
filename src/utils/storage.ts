// src/utils/storage.ts
import { ContextBlock } from '../types';

// chrome.storage.local is Chrome's built-in storage API that persists data locally
export const StorageKeys = {
  CONTEXT_BLOCKS: 'contextBlocks',
  API_KEY: 'openaiApiKey'
} as const;

export async function saveContextBlock(contextBlock: ContextBlock): Promise<void> {
  try {
    console.log('💾 Saving context block:', contextBlock);
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
    console.log('📖 Getting context blocks from storage...');
    const result = await chrome.storage.local.get([StorageKeys.CONTEXT_BLOCKS]);
    console.log('📖 Raw storage result:', result);
    
    const contexts = result[StorageKeys.CONTEXT_BLOCKS] || [];
    console.log('📖 Parsed contexts:', contexts);
    console.log('📖 Number of contexts found:', contexts.length);
    
    return contexts;
  } catch (error) {
    console.error('📖 Failed to get context blocks:', error);
    return [];
  }
}

export async function deleteContextBlock(id: string): Promise<void> {
  try {
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

export async function saveApiKey(apiKey: string): Promise<void> {
  try {
    await chrome.storage.local.set({ [StorageKeys.API_KEY]: apiKey });
  } catch (error) {
    console.error('Failed to save API key:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get([StorageKeys.API_KEY]);
    return result[StorageKeys.API_KEY] || null;
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
}