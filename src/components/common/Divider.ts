export function renderDivider(): HTMLElement {
    const divider = document.createElement('div');
    divider.style.width = '100%';
    divider.style.height = '100%';
    divider.style.left = '0px';
    divider.style.top = '0px';
    divider.style.position = 'absolute';
    return divider;
  }
  