/**
 * ChatSeed Platform Filter Component
 * Provides platform-based filtering for contexts (ChatGPT, Gemini, All)
 */

export interface PlatformFilterOption {
    value: 'all' | 'chatgpt' | 'gemini';
    label: string;
    icon?: string;
    count?: number;
  }
  
  export interface PlatformFilterProps {
    selectedPlatform: string;
    platformCounts: {
      total: number;
      chatgpt: number;
      gemini: number;
    };
    onPlatformChange: (platform: string) => void;
    className?: string;
  }
  
  export class PlatformFilter {
    private container: HTMLElement;
    private dropdown: HTMLElement | null = null;
    private isOpen: boolean = false;
    private selectedPlatform: string = 'all';
    private platformCounts: { total: number; chatgpt: number; gemini: number };
    private onPlatformChange: (platform: string) => void;
  
    private readonly platforms: PlatformFilterOption[] = [
      { value: 'all', label: 'All Platforms', icon: 'icon-logo.png' },
      { value: 'chatgpt', label: 'ChatGPT', icon: 'icon-gpt.png' },
      { value: 'gemini', label: 'Gemini', icon: 'icon-gemini.png' }
    ];
  
    constructor(props: PlatformFilterProps) {
      this.selectedPlatform = props.selectedPlatform;
      this.platformCounts = props.platformCounts;
      this.onPlatformChange = props.onPlatformChange;
      this.container = this.createContainer(props.className);
      this.render();
      this.attachEventListeners();
    }
  
    private createContainer(className?: string): HTMLElement {
      const container = document.createElement('div');
      container.className = `platform-filter ${className || ''}`;
      return container;
    }
  
    private render(): void {
      const selectedOption = this.platforms.find(p => p.value === this.selectedPlatform) || this.platforms[0];
      const selectedCount = this.getSelectedCount();
  
      this.container.innerHTML = `
        <button class="platform-filter-button ${this.isOpen ? 'open' : ''}" aria-expanded="${this.isOpen}">
          <span class="platform-filter-content">
            <img src="${selectedOption.icon}" class="platform-filter-icon" alt="${selectedOption.label}">
            <span class="platform-filter-label">${selectedOption.label}</span>
            ${selectedCount !== undefined ? `<span class="platform-filter-count">(${selectedCount})</span>` : ''}
          </span>
          <svg class="platform-filter-arrow" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="platform-filter-dropdown ${this.isOpen ? 'open' : ''}" role="listbox">
          ${this.platforms.map(platform => {
            const count = this.getPlatformCount(platform.value);
            const isActive = platform.value === this.selectedPlatform;
            return `
              <div class="platform-filter-option ${isActive ? 'active' : ''} ${platform.value === 'gemini' ? 'gemini' : ''}" 
                   role="option" 
                   aria-selected="${isActive}"
                   data-platform="${platform.value}">
                <img src="${platform.icon}" class="platform-option-icon" alt="${platform.label}">
                <span class="platform-option-label">${platform.label}</span>
                ${count !== undefined ? `<span class="platform-option-count">(${count})</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
  
      // Store dropdown reference
      this.dropdown = this.container.querySelector('.platform-filter-dropdown');
    }
  
    private getSelectedCount(): number | undefined {
      switch (this.selectedPlatform) {
        case 'all':
          return this.platformCounts.total;
        case 'chatgpt':
          return this.platformCounts.chatgpt;
        case 'gemini':
          return this.platformCounts.gemini;
        default:
          return undefined;
      }
    }
  
    private getPlatformCount(platform: string): number | undefined {
      switch (platform) {
        case 'all':
          return this.platformCounts.total;
        case 'chatgpt':
          return this.platformCounts.chatgpt;
        case 'gemini':
          return this.platformCounts.gemini;
        default:
          return undefined;
      }
    }
  
    private attachEventListeners(): void {
      // Toggle dropdown
      const button = this.container.querySelector('.platform-filter-button');
      button?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
  
      // Handle option selection
      this.container.addEventListener('click', (e) => {
        const option = (e.target as HTMLElement).closest('.platform-filter-option');
        if (option) {
          const platform = option.getAttribute('data-platform');
          if (platform && platform !== this.selectedPlatform) {
            this.selectPlatform(platform);
          }
          this.close();
        }
      });
  
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.container.contains(e.target as Node)) {
          this.close();
        }
      });
  
      // Handle keyboard navigation
      this.container.addEventListener('keydown', (e) => {
        this.handleKeyboard(e);
      });
    }
  
    private handleKeyboard(e: KeyboardEvent): void {
      const options = Array.from(this.container.querySelectorAll('.platform-filter-option'));
      const currentIndex = options.findIndex(option => 
        option.classList.contains('active')
      );
  
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (this.isOpen) {
            const activeOption = options[currentIndex] as HTMLElement;
            const platform = activeOption?.getAttribute('data-platform');
            if (platform) {
              this.selectPlatform(platform);
              this.close();
            }
          } else {
            this.open();
          }
          break;
  
        case 'ArrowDown':
          e.preventDefault();
          if (!this.isOpen) {
            this.open();
          } else {
            const nextIndex = Math.min(currentIndex + 1, options.length - 1);
            this.highlightOption(nextIndex);
          }
          break;
  
        case 'ArrowUp':
          e.preventDefault();
          if (this.isOpen) {
            const prevIndex = Math.max(currentIndex - 1, 0);
            this.highlightOption(prevIndex);
          }
          break;
  
        case 'Escape':
          e.preventDefault();
          this.close();
          break;
      }
    }
  
    private highlightOption(index: number): void {
      const options = this.container.querySelectorAll('.platform-filter-option');
      options.forEach((option, i) => {
        option.classList.toggle('highlighted', i === index);
      });
    }
  
    private selectPlatform(platform: string): void {
      if (platform !== this.selectedPlatform) {
        this.selectedPlatform = platform;
        this.onPlatformChange(platform);
        this.render();
        this.attachEventListeners();
      }
    }
  
    public toggle(): void {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  
    public open(): void {
      this.isOpen = true;
      this.render();
      this.attachEventListeners();
      
      // Focus first option
      const firstOption = this.container.querySelector('.platform-filter-option');
      if (firstOption) {
        this.highlightOption(0);
      }
    }
  
    public close(): void {
      this.isOpen = false;
      this.render();
      this.attachEventListeners();
    }
  
    public updateCounts(newCounts: { total: number; chatgpt: number; gemini: number }): void {
      this.platformCounts = newCounts;
      this.render();
      this.attachEventListeners();
    }
  
    public updateSelectedPlatform(platform: string): void {
      if (platform !== this.selectedPlatform) {
        this.selectedPlatform = platform;
        this.render();
        this.attachEventListeners();
      }
    }
  
    public getElement(): HTMLElement {
      return this.container;
    }
  
    public getSelectedPlatform(): string {
      return this.selectedPlatform;
    }
  
    public destroy(): void {
      // Clean up event listeners
      this.container.removeEventListener('click', this.attachEventListeners);
      this.container.removeEventListener('keydown', this.handleKeyboard);
      
      // Remove from DOM if attached
      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }
  
  // Utility functions for integration
  export function createPlatformFilter(props: PlatformFilterProps): PlatformFilter {
    return new PlatformFilter(props);
  }
  
  export function filterContextsByPlatform(contexts: any[], platform: string): any[] {
    if (platform === 'all') {
      return contexts;
    }
    
    return contexts.filter(context => {
      // Default to 'chatgpt' for existing contexts without platform field
      const contextPlatform = context.platform || 'chatgpt';
      return contextPlatform === platform;
    });
  }
  
  export function getPlatformCounts(contexts: any[]): { total: number; chatgpt: number; gemini: number } {
    const counts = {
      total: contexts.length,
      chatgpt: 0,
      gemini: 0
    };
  
    contexts.forEach(context => {
      const platform = context.platform || 'chatgpt'; // Default to chatgpt for existing contexts
      if (platform === 'chatgpt') {
        counts.chatgpt++;
      } else if (platform === 'gemini') {
        counts.gemini++;
      }
    });
  
    return counts;
  }
  
  export function getPlatformIcon(platform: string): string {
    switch (platform) {
      case 'chatgpt':
        return 'icon-gpt.png';
      case 'gemini':
        return 'icon-gemini.png';
      default:
        return 'icon-logo.png';
    }
  }
  
  export function getPlatformName(platform: string): string {
    switch (platform) {
      case 'chatgpt':
        return 'ChatGPT';
      case 'gemini':
        return 'Gemini';
      default:
        return 'Unknown Platform';
    }
  }
  
  // Export for global usage
  if (typeof window !== 'undefined') {
    (window as any).ChatSeedPlatformFilter = {
      PlatformFilter,
      createPlatformFilter,
      filterContextsByPlatform,
      getPlatformCounts,
      getPlatformIcon,
      getPlatformName
    };
  }