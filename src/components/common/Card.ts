// src/components/common/Card.ts
import { ContextBlock } from '../../types';
import { renderTag } from './Tag';

export function renderCard(
  context: ContextBlock,
  actions: {
    onDelete: () => void;
    onFavorite: () => void;
    onResume: () => void;
    // NEW: Add a new action for exporting a single context as a file
    onExportAsFile: () => void;
  }
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'context-card';

  // Label (if any) - optional property check
  const contextWithLabel = context as ContextBlock & { label?: string; labelColor?: string };
  if (contextWithLabel.label) {
    const label = document.createElement('div');
    label.className = 'context-label';
    label.textContent = contextWithLabel.label;
    label.style.color = contextWithLabel.labelColor || '#1A5445'; // Preserve color
    card.appendChild(label);
  }

  // Title
  const title = document.createElement('div');
  title.className = 'context-title';
  title.textContent = context.title || 'Untitled';
  card.appendChild(title);

  // Preview - FIXED: Use 'body' instead of 'text'
  const preview = document.createElement('div');
  preview.className = 'context-preview';
  preview.textContent = context.body.slice(0, 200);
  card.appendChild(preview);

  // Tags
  if (context.tags && context.tags.length > 0) {
    const tagContainer = document.createElement('div');
    tagContainer.className = 'context-tags';
    context.tags.forEach(tag => {
      tagContainer.appendChild(renderTag(tag));
    });
    card.appendChild(tagContainer);
  }

  // Action Icons
  const actionsBar = document.createElement('div');
  actionsBar.style.display = 'flex';
  actionsBar.style.justifyContent = 'flex-end';
  actionsBar.style.marginTop = '8px';
  actionsBar.style.gap = '8px';

  const resumeBtn = createIconButton('icon-logo.png', 'Resume', actions.onResume);
  const favoriteBtn = createIconButton('icon-bookmark.png', 'Favorite', actions.onFavorite);
  const deleteBtn = createIconButton('icon-trash.png', 'Delete', actions.onDelete);
  // NEW: Create the "Export as File" button
  const exportFileBtn = createIconButton('icon-export-single.png', 'Export as File', actions.onExportAsFile);


  actionsBar.appendChild(resumeBtn);
  actionsBar.appendChild(favoriteBtn);
  actionsBar.appendChild(deleteBtn);
  // NEW: Append the export file button to the actions bar
  actionsBar.appendChild(exportFileBtn);

  card.appendChild(actionsBar);

  return card;
}

function createIconButton(iconFile: string, title: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'icon-btn';
  btn.title = title;
  btn.style.padding = '2px';

  const img = document.createElement('img');
  img.src = chrome.runtime.getURL(`assets/img/${iconFile}`);
  img.alt = title;
  img.style.width = '18px'; // Adjust size as needed
  img.style.height = '18px'; // Adjust size as needed

  btn.appendChild(img);
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent card click event from firing
    onClick();
  });
  return btn;
}