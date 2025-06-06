export function renderTag(text: string): HTMLElement {
    const tag = document.createElement('div');
    tag.className = 'context-tag';
    tag.textContent = text;
    return tag;
  }
  