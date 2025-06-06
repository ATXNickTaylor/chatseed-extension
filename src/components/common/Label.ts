export function renderLabel(text: string, color: string = '#1A5445'): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.left = '0px';
    wrapper.style.top = '0px';
    wrapper.style.position = 'absolute';
    wrapper.style.borderRadius = '3px';
    wrapper.style.justifyContent = 'flex-start';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.display = 'inline-flex';
  
    const label = document.createElement('div');
    label.style.left = '4px';
    label.style.top = '4px';
    label.style.position = 'absolute';
    label.style.textAlign = 'center';
    label.style.color = color;
    label.style.fontSize = '10px';
    label.style.fontFamily = 'Inter';
    label.style.fontWeight = '400';
    label.style.lineHeight = '8px';
    label.style.wordWrap = 'break-word';
    label.textContent = text;
  
    wrapper.appendChild(label);
    return wrapper;
  }
  