import { openHighlightSaveModal } from './highlightSaveModal';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "OPEN_SAVE_MODAL_WITH_SELECTION") {
        openHighlightSaveModal(message.selection || "");
    }
});
