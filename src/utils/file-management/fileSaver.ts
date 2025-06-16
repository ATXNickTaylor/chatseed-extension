// src/utils/file-management/fileSaver.ts
import { ContextBlock } from '../../types';

/**
 * Helper function to format a single context for export.
 * You can customize this format as needed.
 */
export function formatContextForExport(context: ContextBlock): string {
  return `Title: ${context.title}\nDate Saved: ${new Date(context.dateSaved).toLocaleString()}\nTags: ${context.tags.join(', ')}\n\n${context.body}`;
}

/**
 * Sends data to the background script to initiate a file download, prompting the user for location.
 * This is a generic function that can be used for any data.
 * @param data The content to save (string).
 * @param filename The suggested filename (e.g., "my_context.txt").
 * @param mimeType The MIME type of the file (e.g., "text/plain", "application/json").
 * @returns A Promise that resolves when the message is sent.
 */
export async function sendDataToBackgroundForDownload(
  data: string,
  filename: string,
  mimeType: string
): Promise<void> {
  console.log(`🗄️ Sending download request to background for ${filename}`);
  try {
    await chrome.runtime.sendMessage({
      action: 'INITIATE_DOWNLOAD', // New generic action for downloads
      payload: {
        data: data,
        filename: filename,
        mimeType: mimeType,
      }
    });
    console.log(`🗄️ Download request sent for ${filename}`);
  } catch (error) {
    console.error(`🗄️ Failed to send download message to background for ${filename}:`, error);
    throw error;
  }
}

/**
 * Initiates a download for a single context block, allowing the user to select the save location.
 * This function now uses the generic sendDataToBackgroundForDownload.
 * @param context The ContextBlock to be exported.
 * @returns A Promise that resolves when the download is initiated.
 */
export async function exportContextToFile(context: ContextBlock): Promise<void> {
  const fileContent = formatContextForExport(context);
  // Standardize filename: replace non-alphanumeric with underscores, convert to lowercase
  const filename = `chatseed_${context.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  await sendDataToBackgroundForDownload(fileContent, filename, 'text/plain');
}

/**
 * Initiates a download for all context blocks, allowing the user to select the save location for a single JSON file.
 * This function now uses the generic sendDataToBackgroundForDownload.
 * @param contexts An array of all ContextBlocks to be exported.
 * @returns A Promise that resolves when the download is initiated.
 */
export async function exportAllContextsToFile(contexts: ContextBlock[]): Promise<void> {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0', // You might want to update this version as your data structure evolves
    contexts: contexts
  };
  const filename = `ChatSeed_All_Contexts_${new Date().toISOString().split('T')[0]}.json`;
  const content = JSON.stringify(exportData, null, 2);
  await sendDataToBackgroundForDownload(content, filename, 'application/json');
}