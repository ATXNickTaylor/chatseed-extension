# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChatSeed is a Chrome extension (Manifest V3) that enables users to save, organize, and manage AI conversation contexts across ChatGPT and Gemini platforms. The extension prioritizes privacy with all data stored locally and no external server communication.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm start

# Build for production (creates /build and /zip outputs)
npm run build

# Type-check without emitting files
npx tsc --noEmit
```

## Architecture Overview

### Execution Contexts
1. **Background Service Worker** (`/src/background/background.ts`) - Handles extension lifecycle, context menus, and message passing
2. **Content Scripts** - Injected into web pages:
   - `content.ts` - AI platform integration (ChatGPT/Gemini)
   - `contextMenuContent.ts` - Text selection saving on any webpage
3. **Popup UI** (`/src/popup/`) - Main extension interface (600x500px)

### Key Architectural Patterns
- **Message Passing**: All cross-context communication uses Chrome's message API
- **Storage**: Chrome's local storage API for all data persistence
- **Platform Detection**: Utils detect ChatGPT vs Gemini for platform-specific behavior
- **Modal System**: Content scripts inject modals into host pages for user interaction

### Component Structure
```
/src/components/common/
├── Button.ts      - Reusable button with variants
├── Modal.ts       - Base modal class for inheritance
├── Card.ts        - List item display component
├── EmptyState.ts  - No-data state display
└── Toast.ts       - Notification system
```

### Storage Schema
- **Seeds**: Array of saved contexts with id, title, content, timestamp
- **Personas**: Summarization personas (e.g., Teacher, Pirate, Business)
- **Settings**: User preferences and configuration

## Important Development Considerations

### Privacy Requirements
- Never add external API calls or server communication
- All data must remain in Chrome's local storage
- No analytics, tracking, or telemetry code

### Extension Permissions
Current permissions are minimal and should not be expanded without careful consideration:
- `storage` - For local data persistence
- `activeTab` - For current tab interaction
- `downloads` - For exporting data
- `contextMenus` - For right-click saving

### Content Script Injection
- Content scripts must be defensive - check for existing elements before creating
- Use shadow DOM or unique class names to avoid style conflicts
- Clean up event listeners and DOM modifications on unload

### TypeScript Strict Mode
The project uses TypeScript strict mode. Ensure:
- All variables have explicit types or proper inference
- No `any` types without explicit justification
- Null/undefined checks for all external data

### Build System Notes
- Webpack config includes asset verification - all required icons must exist
- Version in manifest.json is automatically synced from package.json
- Build creates both unpacked extension and distributable ZIP

## Testing Approach
While no formal test suite exists, manual testing should cover:
1. Fresh install flow
2. Cross-platform functionality (ChatGPT & Gemini)
3. Context menu on various websites
4. Data persistence across sessions
5. Export functionality (JSON & Markdown)

## Common Development Tasks

### Adding a New Platform
1. Add platform config in `/src/config/platformConfig.ts`
2. Update content script manifest permissions
3. Implement platform-specific selectors in utils
4. Test message extraction and UI injection

### Creating New Modal Types
1. Extend base Modal class from `/src/components/common/Modal.ts`
2. Implement required abstract methods
3. Add modal trigger in appropriate content script
4. Ensure proper cleanup on close

### Modifying Storage Structure
1. Update TypeScript interfaces in `/src/types/`
2. Add migration logic in storage utils if needed
3. Ensure backward compatibility for existing users