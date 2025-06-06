export function renderChevron(direction: 'up' | 'down'): HTMLElement {
    const chevron = document.createElement('div');
    chevron.style.width = '100%';
    chevron.style.height = '100%';
    chevron.style.left = '0px';
    chevron.style.top = '0px';
    chevron.style.position = 'absolute';
  
    if (direction === 'down') {
      chevron.style.borderRadius = '1px';
    }
  
    return chevron;
  }
  