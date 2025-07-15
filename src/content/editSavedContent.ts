import { getContextBlocks, updateContextBlock } from '../utils/storage';
import { ContextBlock } from '../types';

function injectModalCSS(): HTMLStyleElement {
    const style = document.createElement('style');
    style.id = 'edit-saved-content-modal-styles';
    style.textContent = `
        /* Edit Saved Content Modal Styles */
        .edit-saved-content-modal {
            position: fixed;
            z-index: 9999;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .esc-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
        }
        .esc-modal-content {
            position: relative;
            display: flex;
            width: 900px;
            height: 600px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
            z-index: 1;
            overflow: hidden;
        }
        .esc-modal-left-pane {
            width: 320px;
            background: #f7f7f7;
            border-right: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
        }
        .esc-modal-right-pane {
            flex: 1;
            padding: 32px;
            overflow-y: auto;
        }
        .esc-card-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }
        .esc-filter-bar {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            background: #f7f7f7;
        }
        .esc-modal-close {
            position: absolute;
            top: 12px;
            right: 16px;
            font-size: 2rem;
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
        }
        .esc-edit-form label {
            display: block;
            margin-bottom: 16px;
            font-weight: 700;         /* Make bold */
            color: #176548;           /* Set label color */
        }
        .esc-edit-form input[type="text"],
        .esc-edit-form textarea {
            width: 100%;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #e0e0e0;
            margin-top: 4px;
            color: #111;              /* Make field text black */
        }
        .esc-edit-form textarea {
            min-height: 120px;
        }
        .esc-save-btn {
            background: #176548;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 10px 24px;
            font-weight: 600;
            cursor: pointer;
        }
        .context-card.selected {
            border: 2px solid #176548;
            background: #e6f4ef;
        }
        .esc-edit-placeholder {
            color: #888;
            font-size: 1.1em;
            margin-top: 40px;
            text-align: center;
        }
        .context-card {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .context-card:hover {
            border-color: #176548;
            background: #f9f9f9;
        }
        .context-title {
            font-weight: 600;
            font-size: 0.9em;
            margin-bottom: 4px;
            color: #333;
        }
        .context-preview {
            font-size: 0.8em;
            color: #666;
            line-height: 1.3;
            margin-bottom: 8px;
        }
        .context-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        .tag {
            background: #e6f4ef;
            color: #176548;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.7em;
            font-weight: 500;
        }
        .esc-filter-input,
        .esc-sort-select {
            width: 100%;
            padding: 8px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin-bottom: 8px;
            color: #111;              /* Make dropdown text black */
        }
    `;
    document.head.appendChild(style);
    return style;
}

function removeModalCSS() {
    const existingStyle = document.getElementById('edit-saved-content-modal-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
}

let modal: HTMLDivElement | null = null;
let selectedContextId: string | null = null;
let allContexts: ContextBlock[] = [];
let filterQuery = '';
let sortOrder: 'newest' | 'oldest' = 'newest';

export async function openEditSavedContentModal() {
    if (modal) {
        modal.style.display = 'flex';
        await loadContexts();
        return;
    }

    // Inject CSS only when modal is created
    injectModalCSS();

    modal = document.createElement('div');
    modal.className = 'edit-saved-content-modal';
    modal.innerHTML = `
    <div class="esc-modal-overlay"></div>
    <div class="esc-modal-content">
      <div class="esc-modal-left-pane">
        <div class="esc-filter-bar"></div>
        <div class="esc-card-list"></div>
      </div>
      <div class="esc-modal-right-pane">
        <div class="esc-edit-form"></div>
      </div>
      <button class="esc-modal-close">&times;</button>
    </div>
  `;
    document.body.appendChild(modal);

    modal.querySelector('.esc-modal-close')?.addEventListener('click', () => {
        closeEditSavedContentModal();
    });

    modal.querySelector('.esc-modal-overlay')?.addEventListener('click', () => {
        closeEditSavedContentModal();
    });

    await loadContexts();
}

export function closeEditSavedContentModal() {
    if (modal) {
        modal.remove();
        modal = null;
        selectedContextId = null;
        removeModalCSS();
    }
}

async function loadContexts() {
    allContexts = await getContextBlocks();
    renderFilterBar();
    renderCardList();
    renderEditForm(null);
}

function renderFilterBar() {
    const bar = modal!.querySelector('.esc-filter-bar') as HTMLDivElement;
    bar.innerHTML = `
    <input type="text" class="esc-filter-input" placeholder="Search..." value="${filterQuery}">
    <select class="esc-sort-select">
      <option value="newest" ${sortOrder === 'newest' ? 'selected' : ''}>Newest to Oldest</option>
      <option value="oldest" ${sortOrder === 'oldest' ? 'selected' : ''}>Oldest to Newest</option>
    </select>
  `;
    bar.querySelector('.esc-filter-input')!.addEventListener('input', (e) => {
        filterQuery = (e.target as HTMLInputElement).value;
        renderCardList();
    });
    bar.querySelector('.esc-sort-select')!.addEventListener('change', (e) => {
        sortOrder = (e.target as HTMLSelectElement).value as any;
        renderCardList();
    });
}

function getFilteredSortedContexts() {
    let filtered = allContexts;
    if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        filtered = filtered.filter(ctx =>
            ctx.title.toLowerCase().includes(q) ||
            ctx.body.toLowerCase().includes(q) ||
            ctx.tags.some(tag => tag.toLowerCase().includes(q))
        );
    }
    filtered = filtered.sort((a, b) =>
        sortOrder === 'newest' ? b.dateSaved - a.dateSaved : a.dateSaved - b.dateSaved
    );
    return filtered;
}

function renderCardList() {
    const list = modal!.querySelector('.esc-card-list') as HTMLDivElement;
    const contexts = getFilteredSortedContexts();
    list.innerHTML = '';
    contexts.forEach(ctx => {
        const card = createContextCard(ctx);
        card.addEventListener('click', () => {
            selectedContextId = ctx.id;
            renderEditForm(ctx);
            // Highlight selected
            list.querySelectorAll('.context-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        });
        if (ctx.id === selectedContextId) card.classList.add('selected');
        list.appendChild(card);
    });
}

function createContextCard(context: ContextBlock): HTMLElement {
    // Copy the card structure from popup or src/components/common/Card.ts, but remove action buttons
    const card = document.createElement('div');
    card.className = 'context-card';
    card.innerHTML = `
    <div class="context-title">${context.title || 'Untitled'}</div>
    <div class="context-preview">${context.body.slice(0, 200)}</div>
    <div class="context-tags">${context.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
  `;
    return card;
}

function renderEditForm(context: ContextBlock | null) {
    const form = modal!.querySelector('.esc-edit-form') as HTMLDivElement;
    if (!context) {
        form.innerHTML = '<div class="esc-edit-placeholder">Select a context to edit</div>';
        return;
    }
    form.innerHTML = `
    <label>Title: <input type="text" class="esc-edit-title" value="${escapeHtml(context.title)}"></label>
    <label>Body: <textarea class="esc-edit-body">${escapeHtml(context.body)}</textarea></label>
    <label>Tags: <input type="text" class="esc-edit-tags" value="${escapeHtml(context.tags.join(', '))}"></label>
    <button class="esc-save-btn">Save</button>
  `;
    form.querySelector('.esc-save-btn')!.addEventListener('click', async () => {
        const newTitle = (form.querySelector('.esc-edit-title') as HTMLInputElement).value;
        const newBody = (form.querySelector('.esc-edit-body') as HTMLTextAreaElement).value;
        const newTags = (form.querySelector('.esc-edit-tags') as HTMLInputElement).value.split(',').map(t => t.trim()).filter(Boolean);
        await updateContextBlock(context.id, { title: newTitle, body: newBody, tags: newTags });
        await loadContexts();
        // Optionally, send a message to popup to refresh its list
    });
}

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
