<img src="src/assets/img/icon-128.png" width="64"/>

# ChatSeed - ChatGPT Context Manager

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.2.1-blue)](https://github.com/atxnicktaylor/chatseed-extension)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange)](https://developer.chrome.com/docs/extensions/mv3/)

ChatSeed enhances your ChatGPT experience by enabling you to save conversation contexts and seamlessly bridge them across different chat sessions. Never lose important context again!

## 🌟 Features

### Core Functionality
- **Context Saving**: Extract and save ChatGPT conversation segments with custom titles and tags
- **Smart Organization**: Search, filter, and categorize your saved contexts
- **Seamless Integration**: One-click context insertion into new ChatGPT conversations
- **Export Capabilities**: Individual and bulk export as .txt files

### Advanced Features (v1.2.0+)
- **Persona-Enhanced Summarization**: 4 distinct persona styles (Executive, Teammate, Analyst, Standard)
- **Individual Context Actions**: Per-context insert, export, view, favorite, and delete
- **Modern UI**: Clean white design with 12px curved corners and intuitive workflow
- **Real-time Search**: Instant filtering with <50ms latency
- **Usage Tracking**: Statistics and favorites management

### Privacy & Security
- **100% Client-Side**: All data stored locally using Chrome's storage API
- **Zero Data Transmission**: No external servers, complete privacy
- **Minimal Permissions**: Only requires access to ChatGPT domains

## 🚀 Installation

### For Users
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (link coming soon)
2. Click "Add to Chrome"
3. Navigate to ChatGPT and start saving contexts!

### For Developers
1. Clone this repository:
   ```bash
   git clone https://github.com/atxnicktaylor/chatseed-extension.git
   cd chatseed-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build` folder

## 🛠️ Development

### Prerequisites
- Node.js >= 18
- Chrome Browser

### Tech Stack
- **TypeScript** - Type-safe development
- **Webpack 5** - Module bundling and optimization
- **Vanilla CSS** - Modern styling with curves and animations
- **Manifest V3** - Latest Chrome extension architecture

### Development Commands
```bash
# Development build with hot reload
npm start

# Production build
npm run build

# TypeScript validation
npx tsc --noEmit
```

### Project Structure
```
src/
├── background/          # Extension lifecycle management
├── content/            # ChatGPT page integration
├── popup/              # Main UI (400x500px popup)
├── components/         # Reusable UI components
├── utils/              # Storage and message extraction
├── types/              # TypeScript interfaces
└── assets/img/         # Icons and images
```

## 📦 Build & Deployment

### Production Build
```bash
NODE_ENV=production npm run build
```

The `build/` folder contains the extension ready for Chrome Web Store submission.

### Asset Optimization
- **Total Size**: ~55KB (96% reduction from original 2.85MB)
- **SVG Optimization**: Floating button converted to optimized SVG
- **Modern Icons**: 40x40px persona and action icons

## 🎯 User Workflow

1. **Save**: Click floating button on ChatGPT → Select messages → Add title/tags → Save
2. **Manage**: Open extension popup → Browse/search contexts → Filter and organize
3. **Reuse**: Select context → Click insert → Continue conversation with full context
4. **Summarize**: Use persona-enhanced prompts for tailored conversation summaries

## 🔧 Configuration

### Chrome Web Store Compliance
- **Manifest V3** compliant
- **Minimal Permissions**: `activeTab`, `scripting`, `storage`
- **Host Permissions**: ChatGPT domains only
- **Content Security Policy**: Strict CSP with no remote code

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Test on multiple ChatGPT conversation types
- Update documentation for new features

## 📄 Copyright & License

Copyright (c) 2025 RevlytIQ LLC. All rights reserved.

This software is proprietary and confidential. No part of this software may be reproduced, distributed, or transmitted without prior written permission.

For permission requests: [chatseed@revlytiq.io](mailto:chatseed@revlytiq.io)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/atxnicktaylor/chatseed-extension/issues)
- **Email**: [chatseed@revlytiq.io](mailto:chatseed@revlytiq.io)
- **Website**: [https://revlytiq.io/ChatSeed](https://revlytiq.io/ChatSeed)

---

**ChatSeed** - Seamlessly bridge your ChatGPT conversations  
Built with ❤️ by [RevlytIQ LLC](https://revlytiq.io/chatseed)
