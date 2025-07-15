// src/background/background.ts

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ChatGPT Context Saver installed');

    // Set default settings
    chrome.storage.local.set({
      contextBlocks: [],
      settings: {
        autoSummarize: false,
        toolbarPosition: 'bottom-right'
      }
    });
  }
});

// Handle messages between content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  // Forward messages if needed
  if (message.action === 'FORWARD_TO_CONTENT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message.data);
      }
    });
  }

  // Handle organized exports from organize modal
  if (message.action === 'EXPORT_ORGANIZED_CONTEXTS') {
    handleOrganizedExport(message.method, message.contexts).then(() => {
      sendResponse({ success: true });
    });
    return true; // Only now, because sendResponse is called asynchronously
  }

  // Handle quick exports from organize modal
  if (message.action === 'EXPORT_QUICK_CONTEXTS') {
    handleQuickExport(message.type, message.contexts, message.filename).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  sendResponse({ received: true });
});

// Handle browser action click (when user clicks extension icon)
// DELETE this entire block - it will never execute with a popup defined

// Handle context menu clicks
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-highlighted-text",
    title: "Save selection to ChatSeed",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-highlighted-text" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "OPEN_SAVE_MODAL_WITH_SELECTION",
      selection: info.selectionText
    });
  }
});

// Handle organized exports by method
async function handleOrganizedExport(method: 'date' | 'platform' | 'tags' | 'all', contexts: any[]): Promise<void> {
  try {
    console.log(`Handling organized export: ${method}`);

    if (method === 'all') {
      // Export using all methods
      await handleOrganizedExport('date', contexts);
      await handleOrganizedExport('platform', contexts);
      await handleOrganizedExport('tags', contexts);
      return;
    }

    if (method === 'date') {
      await exportByDate(contexts);
    } else if (method === 'platform') {
      await exportByPlatform(contexts);
    } else if (method === 'tags') {
      await exportByTags(contexts);
    }

  } catch (error) {
    console.error('Error in organized export:', error);
  }
}

// Export contexts organized by date (monthly)
async function exportByDate(contexts: any[]): Promise<void> {
  const contextsByDate: { [key: string]: any[] } = {};

  // Group by year-month
  contexts.forEach(context => {
    const date = new Date(context.dateSaved);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!contextsByDate[yearMonth]) {
      contextsByDate[yearMonth] = [];
    }
    contextsByDate[yearMonth].push(context);
  });

  // Create download for each month
  for (const [yearMonth, monthContexts] of Object.entries(contextsByDate)) {
    const filename = `ChatSeed-${yearMonth}.txt`;
    const content = generateExportContent(monthContexts, `Contexts from ${yearMonth}`);

    await chrome.downloads.download({
      url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
      filename: filename,
      saveAs: true
    });
  }
}

// Export contexts organized by platform
async function exportByPlatform(contexts: any[]): Promise<void> {
  const contextsByPlatform: { [key: string]: any[] } = {};

  // Group by platform
  contexts.forEach(context => {
    const platform = context.platform || 'chatgpt';
    if (!contextsByPlatform[platform]) {
      contextsByPlatform[platform] = [];
    }
    contextsByPlatform[platform].push(context);
  });

  // Create download for each platform
  for (const [platform, platformContexts] of Object.entries(contextsByPlatform)) {
    const platformName = platform === 'chatgpt' ? 'ChatGPT' : 'Gemini';
    const filename = `ChatSeed-${platformName}.txt`;
    const content = generateExportContent(platformContexts, `${platformName} Contexts`);

    await chrome.downloads.download({
      url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
      filename: filename,
      saveAs: true
    });
  }
}

// Export contexts organized by tags
async function exportByTags(contexts: any[]): Promise<void> {
  const contextsByTag: { [key: string]: any[] } = {};

  // Group by tags
  contexts.forEach(context => {
    if (context.tags && context.tags.length > 0) {
      context.tags.forEach((tag: string) => {
        if (!contextsByTag[tag]) {
          contextsByTag[tag] = [];
        }
        contextsByTag[tag].push(context);
      });
    } else {
      // Contexts without tags
      if (!contextsByTag['untagged']) {
        contextsByTag['untagged'] = [];
      }
      contextsByTag['untagged'].push(context);
    }
  });

  // Create download for each tag
  for (const [tag, tagContexts] of Object.entries(contextsByTag)) {
    const cleanTag = tag.replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `ChatSeed-${cleanTag}.txt`;
    const content = generateExportContent(tagContexts, `Contexts tagged: ${tag}`);

    await chrome.downloads.download({
      url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
      filename: filename,
      saveAs: true
    });
  }
}

// Handle quick exports
async function handleQuickExport(type: string, contexts: any[], filename: string): Promise<void> {
  try {
    console.log(`Handling quick export: ${type}`);

    let title = '';
    switch (type) {
      case 'favorites':
        title = 'Favorite Contexts';
        break;
      case 'recent':
        title = 'Recent Contexts (Last 30 Days)';
        break;
      case 'single':
        title = 'All Contexts';
        break;
      default:
        title = 'Exported Contexts';
    }

    const content = generateExportContent(contexts, title);

    await chrome.downloads.download({
      url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
      filename: `${filename}.txt`,
      saveAs: true
    });

  } catch (error) {
    console.error('Error in quick export:', error);
  }
}

// Generate export content (reusable function)
function generateExportContent(contexts: any[], title: string): string {
  const header = `${title}
Exported on: ${new Date().toLocaleString()}
Total contexts: ${contexts.length}

${'='.repeat(50)}

`;

  const contextContent = contexts
    .sort((a, b) => b.dateSaved - a.dateSaved) // Sort by newest first
    .map(context => {
      return `Title: ${context.title}
Date: ${new Date(context.dateSaved).toLocaleDateString()}
Platform: ${context.platform || 'ChatGPT'}
Tags: ${context.tags?.join(', ') || 'None'}
${context.isFavorite ? 'Favorite: Yes' : ''}

${context.body}

${'='.repeat(50)}

`;
    }).join('');

  return header + contextContent;
}