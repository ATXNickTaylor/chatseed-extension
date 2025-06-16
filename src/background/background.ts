// src/background/background.ts

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ChatSeed installed');
    
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

// Handle messages between content script, popup, and other parts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.action) {
    case 'INITIATE_DOWNLOAD': // New generic action for download requests
      {
        const { data, filename, mimeType } = message.payload;
        console.log(`📥 Background initiating download for "${filename}"`);
        
        // Encode the data to Base64 for a Data URL.
        // unescape(encodeURIComponent(data)) is used to correctly handle UTF-8 characters
        // before base64 encoding with btoa.
        const encodedData = btoa(unescape(encodeURIComponent(data)));
        const dataUrl = `data:${mimeType};base64,${encodedData}`;

        chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: true // This is crucial for prompting the user to choose a save location
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('🚫 Download error:', chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            console.log(`✅ Download initiated with ID: ${downloadId}`);
            sendResponse({ success: true, downloadId: downloadId });
          }
        });
        return true; // Indicate that sendResponse will be called asynchronously
      }
    case 'SUMMARIZE_CHAT':
      // Existing summarization logic (ensure it sends response if async)
      // Example:
      // ... perform summarization ...
      // sendResponse({ success: true, summary: "..." });
      break;
    case 'INSERT_CONTEXT':
      // Existing insert context logic (ensure it sends response if async)
      // Example:
      // ... insert context ...
      // sendResponse({ success: true });
      break;
    case 'FORWARD_TO_CONTENT':
      // Existing forward logic
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, message.data);
        }
      });
      // sendResponse({ received: true }); // If a response is expected
      break;
    default:
      console.warn('Unknown message action:', message.action);
      // For unknown actions, send a default response or handle as appropriate
      // sendResponse({ received: false, error: 'Unknown action' });
  }
});

// Handle browser action click (when user clicks extension icon)
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup, no additional action needed
  console.log('Extension icon clicked');
});