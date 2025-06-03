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
  
  sendResponse({ received: true });
});

// Handle browser action click (when user clicks extension icon)
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup, no additional action needed
  console.log('Extension icon clicked');
});