import { saveContextBlock } from '../utils/storage';
import { ContextBlock } from '../types';

let currentModal: HTMLElement | null = null;

export function openHighlightSaveModal(initialText: string): void {
  if (currentModal) closeHighlightSaveModal();

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5); z-index: 2147483647; display: flex; align-items: center; justify-content: center;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    min-width: 320px; max-width: 400px; padding: 24px 28px; font-family: inherit;
    border: 1px solid #e9ecef; color: #176548;
  `;

  modal.innerHTML = `
    <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #176548;">Save Highlighted Text</div>
    <label style="font-size: 14px; font-weight: 600;">Title *</label>
    <input id="highlight-title" type="text" style="width: 100%; margin-bottom: 12px; padding: 8px; border-radius: 6px; border: 1px solid #e9ecef; font-size: 15px;">
    <label style="font-size: 14px; font-weight: 600;">Tags</label>
    <input id="highlight-tags" type="text" placeholder="tag1, tag2" style="width: 100%; margin-bottom: 12px; padding: 8px; border-radius: 6px; border: 1px solid #e9ecef; font-size: 15px;">
    <div style="margin-bottom: 12px;">
      <label style="font-size: 14px; font-weight: 600; display: block; margin-bottom: 4px;">Type</label>
      <div style="display: flex; gap: 16px;">
        <label style="font-size: 14px; font-weight: 400; cursor: pointer;">
          <input type="radio" name="highlight-type" id="highlight-type-context" value="context" checked>
          Context
        </label>
        <label style="font-size: 14px; font-weight: 400; cursor: pointer;">
          <input type="radio" name="highlight-type" id="highlight-type-prompt" value="prompt">
          Prompt
        </label>
      </div>
    </div>
    <label style="font-size: 14px; font-weight: 600;">Text</label>
    <textarea readonly style="width: 100%; min-height: 80px; margin-bottom: 16px; padding: 8px; border-radius: 6px; border: 1px solid #e9ecef; font-size: 15px; background: #f8f9fa;">${initialText}</textarea>
    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button id="highlight-cancel" style="padding: 8px 18px; border-radius: 6px; border: 1px solid #e9ecef; background: #f8f9fa; color: #176548; font-weight: 600; cursor: pointer;">Cancel</button>
      <button id="highlight-save" style="padding: 8px 18px; border-radius: 6px; border: none; background: linear-gradient(135deg, #176548 0%, #1a7a52 100%); color: #fff; font-weight: 700; cursor: pointer;">Save</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  currentModal = overlay;

  (modal.querySelector('#highlight-cancel') as HTMLElement).onclick = closeHighlightSaveModal;
  (modal.querySelector('#highlight-save') as HTMLElement).onclick = async () => {
    const title = (modal.querySelector('#highlight-title') as HTMLInputElement).value.trim();
    const tagsText = (modal.querySelector('#highlight-tags') as HTMLInputElement).value.trim();
    const typeRadio = modal.querySelector('input[name="highlight-type"]:checked') as HTMLInputElement;
    const contextType = typeRadio ? (typeRadio.value as 'context' | 'prompt') : 'context';
    if (!title) {
      alert('Please enter a title!');
      return;
    }
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(Boolean) : [];
    const contextBlock: ContextBlock = {
      id: `context_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      title,
      body: initialText,
      tags,
      dateSaved: Date.now(),
      platform: 'external',
      contextType
    };
    try {
      await saveContextBlock(contextBlock);
      alert(`Context "${title}" saved!`);
      closeHighlightSaveModal();
    } catch (e) {
      alert('Failed to save context.');
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) closeHighlightSaveModal();
  };
  document.addEventListener('keydown', handleEscape, { once: true });
}

function closeHighlightSaveModal() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') closeHighlightSaveModal();
}