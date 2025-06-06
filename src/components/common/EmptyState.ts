export function renderEmptyState(message: string = 'No saved contexts.'): HTMLElement {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = message;
    return empty;
  }
  