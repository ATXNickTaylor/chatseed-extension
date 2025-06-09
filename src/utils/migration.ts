// src/utils/migration.ts

import { ContextBlock } from '../types';
import { StorageKeys } from './storage';

export async function migrateToV1_3_0(): Promise<void> {
  try {
    console.log('🔄 Starting migration to v1.3.0...');
    
    const { contextBlocks, version } = await chrome.storage.local.get([
      StorageKeys.CONTEXT_BLOCKS, 
      StorageKeys.VERSION
    ]);
    
    // Check if migration already completed
    if (version === '1.3.0') {
      console.log('✅ Migration already completed');
      return;
    }
    
    if (contextBlocks && contextBlocks.length > 0) {
      console.log(`🔄 Migrating ${contextBlocks.length} contexts...`);
      
      // Add platform field to existing contexts (assume ChatGPT)
      const migratedContexts = contextBlocks.map((context: ContextBlock) => ({
        ...context,
        platform: context.platform || 'chatgpt'
      }));
      
      await chrome.storage.local.set({
        [StorageKeys.CONTEXT_BLOCKS]: migratedContexts,
        [StorageKeys.VERSION]: '1.3.0'
      });
      
      console.log('✅ Migration to v1.3.0 completed successfully');
    } else {
      // No existing data, just set version
      await chrome.storage.local.set({ [StorageKeys.VERSION]: '1.3.0' });
      console.log('✅ Migration completed - no existing data to migrate');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export async function checkAndRunMigrations(): Promise<void> {
  try {
    await migrateToV1_3_0();
  } catch (error) {
    console.error('Migration process failed:', error);
    // Don't throw - allow app to continue even if migration fails
  }
}