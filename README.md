# ChatSeed - Chrome Extension for ChatGPT Context Management

<img src="src/assets/img/icon-128.png" width="64"/>

**ChatSeed** is a Chrome extension that enhances ChatGPT by enabling users to save conversation contexts and bridge them across different chat sessions. The extension operates entirely client-side, addressing the pain point of losing conversation context when starting new ChatGPT sessions.

## ✨ Features

### Core Functionality
- 💾 **Save ChatGPT Contexts** - Extract and save conversation contexts with titles, tags, and metadata
- 🔄 **Context Bridging** - Insert saved contexts into new ChatGPT conversations  
- 🔍 **Advanced Search & Filtering** - Search by keyword, tag, or date across all saved contexts
- 📊 **Smart Organization** - Sidebar navigation with All, Recent, Favorites, and Tags sections
- 📁 **Individual Exports** - Export each context as individual .txt files
- ⭐ **Favorites System** - Star important contexts for quick access

### Summarization Tools
- 🎯 **Quick Summary** - Main topics overview
- 📋 **Detailed Summary** - Topics, action items, and things to remember  
- 💼 **Business Summary** - Executive summary with key insights and action items

### Modern Interface
- 🎨 **Clean Design** - Modern 800x600px popup with #176548 green accent
- ⚡ **Responsive UI** - Fast hover effects and smooth transitions
- 📱 **Intuitive Navigation** - Sidebar with context cards and action buttons

## 🛠️ Technical Architecture

### Tech Stack
- **Language**: TypeScript
- **Build System**: Webpack 5  
- **Storage**: Chrome Extension Storage API
- **UI**: HTML/CSS (no framework dependencies)
- **Target**: Manifest V3 Chrome Extension

### File Structure
```
chatgpt-context-saver/
├── src/
│   ├── popup/           # Extension popup interface (800x600px)
│   ├── content/         # ChatGPT page integration scripts
│   ├── background/      # Background service worker
│   ├── utils/          # Storage and message extraction utilities
│   ├── types/          # TypeScript interfaces
│   ├── assets/img/     # Extension icons and UI assets
│   └── manifest.json   # Chrome extension manifest
├── build/              # Webpack output
└── [config files]     # Webpack, TypeScript, package.json
```

## 🚀 Installation & Development

### Prerequisites
- **Node.js** version >= 18
- **Chrome Browser** with Developer mode enabled

### Setup Instructions
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chatgpt-context-saver.git
   cd chatgpt-context-saver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   1. Open Chrome and go to `chrome://extensions/`
   2. Enable "Developer mode" (top right toggle)
   3. Click "Load unpacked"
   4. Select the `build` folder from your project

5. **Start developing**
   ```bash
   npm start
   ```
   This enables auto-reload during development.

## 📝 Publishing to GitHub (Windows PC)

### Initial Setup
1. **Open Command Prompt or PowerShell**
   ```cmd
   cd path\to\chatgpt-context-saver
   ```

2. **Initialize Git (if not already done)**
   ```cmd
   git init
   git remote add origin https://github.com/yourusername/chatgpt-context-saver.git
   ```

### Creating and Publishing to a Custom Branch

#### Method 1: Create Branch Locally First
```cmd
# Create and switch to new branch
git checkout -b feature/new-ui-updates

# Add your changes
git add .

# Commit with descriptive message
git commit -m "Add modern UI with enhanced features

- Implement green banner design
- Add individual context exports
- Create collapsible filter system
- Enhance summarization options
- Improve hover effects and responsiveness"

# Push to GitHub (creates remote branch)
git push -u origin feature/new-ui-updates
```

#### Method 2: Push to Existing Branch
```cmd
# Switch to existing branch
git checkout existing-branch-name

# Add and commit changes
git add .
git commit -m "Your commit message here"

# Push changes
git push origin existing-branch-name
```

### Useful Git Commands for Windows
```cmd
# Check current status
git status

# See all branches
git branch -a

# Switch branches
git checkout branch-name

# Pull latest changes
git pull origin main

# Merge branch to main
git checkout main
git merge feature/new-ui-updates
git push origin main

# Delete branch after merging
git branch -d feature/new-ui-updates
git push origin --delete feature/new-ui-updates
```

### Creating Pull Requests
1. Push your branch to GitHub using commands above
2. Go to your GitHub repository in browser
3. Click "Compare & pull request" 
4. Add description and click "Create pull request"

## 🔧 Development Commands

```bash
# Development with auto-reload
npm start

# Production build
npm run build

# TypeScript type checking
npx tsc --noEmit

# Lint code (if configured)
npx eslint src/ --ext .ts,.js
```

## 📖 Usage

1. **Saving Contexts**: Click the floating button on any ChatGPT page to save conversation context
2. **Accessing Contexts**: Click the extension icon to open the 800x600px popup interface
3. **Inserting Contexts**: Use the ⬇️ insert button on any saved context
4. **Summarizing**: Use the ➕ plus menu for different summarization options
5. **Organizing**: Use favorites ⭐, tags, and the filter system ⚙️
6. **Exporting**: Use 📁 export buttons for individual or bulk .txt downloads

## 🎯 Key Features in Detail

### Context Management
- **Smart Extraction**: Automatically parses ChatGPT conversations
- **Rich Metadata**: Titles, tags, timestamps, and usage tracking
- **Quick Access**: Recent contexts, favorites, and tag-based organization

### Summarization Options
- **Quick**: Concise main topics overview
- **Detailed**: Comprehensive with action items and key points
- **Business**: Executive-level with insights and to-do lists

### Modern UI Design
- **Banner Design**: #176548 green header with action buttons
- **Sidebar Navigation**: All, Recent, Favorites, Tags sections  
- **Context Cards**: Hover actions with insert, export, favorite, delete
- **Filter System**: Collapsible keyword, tag, and date filters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Webpack Documentation](https://webpack.js.org/concepts/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**ChatSeed** - Bridge your ChatGPT conversations across sessions with intelligent context management.
