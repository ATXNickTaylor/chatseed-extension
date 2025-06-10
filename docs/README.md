<img src="images/icon-128.png" width="64"/>

# ChatSeed - AI Context Manager

[![GitHub Release](https://img.shields.io/badge/GitHub-Release-brightgreen)](https://github.com/ATXNickTaylor/chatseed-extension/releases)
[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/ATXNickTaylor/chatseed-extension/releases/tag/v1.2.2)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange)](https://developer.chrome.com/docs/extensions/mv3/)

ChatSeed enables you to save conversation contexts from AI platforms and seamlessly bridge them across different chat sessions. Works with both ChatGPT and Gemini - save from one, use in the other!

**🎉 Version 2.0.0 Releasing - June 10, 2025**

## 🌟 Features

### Core Functionality
- **Cross-Platform Support**: Save contexts from ChatGPT or Gemini and use them interchangeably
- **Context Saving**: Extract and save AI conversation segments with custom titles and tags
- **Smart Organization**: Search, filter, and categorize your saved contexts by platform, tags, and date
- **Seamless Integration**: One-click context insertion into new conversations on either platform
- **Export Capabilities**: Individual and bulk export as .txt files

### Advanced Features (v2.0.0)
- **Multi-Platform Support**: Full ChatGPT and Gemini compatibility
- **Platform Detection**: Automatic platform identification with visual indicators
- **Persona-Enhanced Summarization**: 4 distinct persona styles (Executive, Teammate, Analyst, Standard)
- **Individual Context Actions**: Per-context insert, export, view, favorite, and delete
- **Modern UI**: Clean interface with platform-specific icons and intuitive workflow
- **Real-time Search**: Instant filtering across all saved contexts
- **Usage Tracking**: Statistics and favorites management

### Privacy & Security
- **100% Client-Side**: All data stored locally using Chrome's storage API
- **Zero Data Transmission**: No external servers, complete privacy
- **Minimal Permissions**: Only requires access to ChatGPT and Gemini domains

## 🚀 Installation

### For Users

#### Step 1: Download ChatSeed
1. Go to [ChatSeed Releases](https://github.com/ATXNickTaylor/chatseed-extension/releases)
2. Click on the latest `chatseed-v#.#.#.zip` file to download it
3. The ZIP file will download to your Downloads folder

#### Step 2: Extract (Unzip) the Files

**Windows:**
1. Go to your Downloads folder and find `chatseed-v#.#.#.zip`
2. Right-click on the ZIP file
3. Select "Extract All..." from the menu
4. Choose where to extract (or use the default location)
5. Click "Extract" - this creates a new folder with all the extension files

**Mac:**
1. Go to your Downloads folder and find `chatseed-v#.#.#.zip`
2. Double-click the ZIP file - it will automatically extract
3. You'll see a new folder called `chatseed-v#.#.#` with all the extension files

#### Step 3: Install in Chrome

**Windows & Mac:**
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Turn on "Developer mode" by clicking the toggle in the top-right corner
4. Click the "Load unpacked" button that appears
5. Navigate to and select the extracted ChatSeed folder (the one containing the files, not the ZIP)
6. Click "Select Folder" (Windows) or "Open" (Mac)
7. ChatSeed should now appear in your extensions list with a toggle to enable it

#### Start Using
1. Navigate to ChatGPT or Gemini
2. Look for the floating save button during conversations
3. Click the ChatSeed extension icon in your browser toolbar to manage contexts

## 📖 How To Use ChatSeed

### Getting Started
Once installed, ChatSeed integrates seamlessly with both ChatGPT and Gemini. Here's how to use every feature:

### 💾 Saving Contexts

#### Method 1: Floating Save Button
1. **Start a conversation** on ChatGPT or Gemini
2. **Look for the floating save button** (circular button in bottom-right corner)
3. **Click the floating button** to open the save modal
4. **Select messages** - Check the boxes next to messages you want to save
5. **Add a title** - Give your context a descriptive name (required)
6. **Add tags** - Optional comma-separated tags (e.g., "coding, javascript, debugging")
7. **Click "Save Context"** - Your context is now saved locally

#### Method 2: Extension Popup
1. **Click the ChatSeed icon** in your Chrome toolbar
2. **Click the "+" button** in the popup
3. **Select a persona** for summarization (or save directly)
4. Follow the same process as above

### 🔍 Managing Your Contexts

#### Using the Popup Interface
1. **Click the ChatSeed icon** in your Chrome toolbar
2. **Browse your contexts** - All saved contexts appear as cards
3. **Use the search bar** - Type keywords to find specific contexts
4. **Filter by sections**:
   - **All**: Shows all saved contexts
   - **Recent**: Contexts from the last 7 days
   - **Favorites**: Contexts you've starred
   - **Tags**: Browse contexts by tag

#### Advanced Filtering
1. **Click the filter button** (funnel icon) to access advanced filters
2. **Filter by keyword** - Search within context content
3. **Filter by tag** - Show only contexts with specific tags
4. **Filter by date** - Today, This Week, This Month, or Older

### 🏷️ Understanding Context Cards

Each saved context appears as a card with these elements:

#### Platform Icon (Top-Right Corner)
- **ChatGPT icon**: ![ChatGPT](images/icon-gpt.png) Context saved from ChatGPT
- **Gemini icon**: ![Gemini](images/icon-gemini.png) Context saved from Gemini

#### Action Buttons (Right Side)
- **Insert** ![Insert](images/icon-insert.png): Insert this context into the current AI chat
- **Export** ![Export](images/icon-export-single.png): Download this context as a .txt file  
- **View** ![View](images/icon-edit.png): Open context in a popup to read full content
- **Favorite** ![Favorite](images/icon-favorite.png): Star this context (turns gold when favorited)
- **Delete** ![Delete](images/icon-trash.png): Permanently remove this context

#### Context Information
- **Title**: The name you gave the context
- **Date**: When the context was saved (e.g., "Today", "2 days ago")
- **Preview**: First 150 characters of the context content
- **Tags**: Colored badges showing all tags for this context

### 🔄 Using Contexts Cross-Platform

#### The Power of Cross-Platform
ChatSeed's main feature is using contexts across different AI platforms:

1. **Save from ChatGPT** → **Use in Gemini** 
2. **Save from Gemini** → **Use in ChatGPT**
3. **Save from either** → **Use in either**

#### How to Insert Contexts
1. **Open the AI platform** where you want to use the context (ChatGPT or Gemini)
2. **Open ChatSeed popup** by clicking the extension icon
3. **Find your context** using search or browsing
4. **Click the Insert button** ![Insert](images/icon-insert.png) on the context card
5. **The context appears** in the chat input field with proper formatting
6. **Continue your conversation** with full context maintained

### 📝 Summarization Features

#### Accessing Summarization
1. **During an active conversation** on ChatGPT or Gemini
2. **Click the ChatSeed icon** in your toolbar
3. **Click the "+" button** in the popup
4. **Select a persona** from the options

#### Persona Types
- **Executive**: High-level summaries for stakeholders and decision-makers
- **Teammate**: Friendly, conversational summaries for collaboration
- **Analyst**: Logical, structured summaries with clear bullet points
- **Default**: Standard comprehensive summaries

#### How Summarization Works
1. **Select your persona** - Choose the style that fits your needs
2. **Prompt is inserted** - A tailored summarization prompt appears in the chat input
3. **AI creates summary** - The AI platform generates a summary in your chosen style
4. **Save the summary** - Use the floating button to save the summary as a new context

### 📤 Export Features

#### Export Individual Contexts
1. **Find the context** you want to export
2. **Click the Export button** ![Export](images/icon-export-single.png) on the context card
3. **File downloads** automatically as `chatseed_[title]_[id].txt`

#### Export All Contexts
1. **Open ChatSeed popup**
2. **Click "Export All"** in the top banner
3. **All contexts download** as individual .txt files
4. **Files are named** with titles and unique IDs for organization

#### Export File Format
Each exported file contains:
- Context title
- Date saved
- Associated tags
- Full context content

### 🔧 Settings and Preferences

#### Statistics
- **View your usage** - See total contexts saved
- **Track favorites** - Monitor your most-used contexts
- **Platform distribution** - See how many contexts from each platform

#### Organization Tips
- **Use descriptive titles** - Make contexts easy to find later
- **Add relevant tags** - Tag by topic, project, or use case
- **Favorite important contexts** - Star frequently-used contexts
- **Regular cleanup** - Delete outdated or unused contexts

### ⚡ Pro Tips

#### Efficiency Tips
- **Use keyboard shortcuts** - Tab through interface elements
- **Tag consistently** - Develop a tagging system for better organization
- **Export regularly** - Back up important contexts
- **Cross-platform workflow** - Save research in ChatGPT, use for writing in Gemini

#### Best Practices
- **Descriptive titles** - "Bug fix for React hooks" vs "Code help"
- **Strategic tagging** - Use 2-4 relevant tags per context
- **Regular organization** - Review and clean up contexts monthly
- **Context sizing** - Save focused segments rather than entire conversations

### For Developers
1. Clone this repository:
   ```bash
   git clone https://github.com/ATXNickTaylor/chatseed-extension.git
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
- **Vanilla CSS** - Modern styling with platform-specific theming
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
├── content/            # AI platform page integration
│   ├── content.ts      # Main content script
│   └── saveModal.ts    # Context saving interface
├── popup/              # Main UI (600x500px popup)
├── utils/              # Storage, platform detection, and utilities
│   ├── storage.ts      # Local storage management
│   ├── platformDetection.ts  # AI platform identification
│   └── messageExtractor.ts   # Message parsing
├── types/              # TypeScript interfaces
├── config/             # Platform configurations
└── assets/img/         # Icons and images
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

The `build/` folder contains the extension ready for distribution.

### Asset Optimization
- **Platform Icons**: Dedicated 40x40px icons for ChatGPT and Gemini
- **Action Icons**: Optimized 16x16px icons for all UI actions
- **Modern Design**: Clean interface with platform-specific visual cues

## 🎯 User Workflow

1. **Save**: Click floating button on ChatGPT/Gemini → Select messages → Add title/tags → Save
2. **Manage**: Open extension popup → Browse/search contexts → Filter by platform, tags, or date
3. **Reuse**: Select context → Click insert → Continue conversation with full context on any platform
4. **Summarize**: Use persona-enhanced prompts for tailored conversation summaries
5. **Export**: Export individual contexts or bulk export all contexts as text files

## 🔧 Platform Support

### Supported Platforms
- **ChatGPT**: `chatgpt.com`, `chat.openai.com`
- **Gemini**: `gemini.google.com/app`

### Cross-Platform Features
- Save contexts from either platform
- Insert contexts into either platform
- Platform-specific visual indicators
- Automatic platform detection

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on both ChatGPT and Gemini
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Test on both supported AI platforms
- Update documentation for new features
- Ensure platform detection works correctly

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2025 RevlytIQ LLC

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ATXNickTaylor/chatseed-extension/issues)
- **Email**: [chatseed@revlytiq.io](mailto:chatseed@revlytiq.io)
- **Website**: [https://revlytiq.io/ChatSeed](https://revlytiq.io/ChatSeed)
- **Feedback Form**: [https://revlytiq.fillout.com/chatseed-survey](https://revlytiq.fillout.com/chatseed-survey)
- **Beta Access**: [https://revlytiq.fillout.com/chatseed-beta](https://revlytiq.fillout.com/chatseed-beta)
- **Report Issues**: [https://revlytiq.fillout.com/chatseed-support](https://revlytiq.fillout.com/chatseed-support)
- **Request A Feature**: [https://revlytiq.fillout.com/feature-request](https://revlytiq.fillout.com/feature-request)

## 💻 System Requirements

- **Browser**: Google Chrome (latest version recommended)
- **Operating System**: Windows 10+, macOS 10.14+, Linux (Chrome supported)  
- **Storage**: Minimal (~1MB for extension + your saved contexts)
- **Permissions**: Only ChatGPT and Gemini domains
- **Internet**: Required for accessing ChatGPT and Gemini (contexts stored locally)

## 📸 How It Works

### Visual Guide
*Screenshots and demonstrations of key features:*

#### Saving a Context
- Floating save button appears on AI platform pages
- Modal interface for selecting messages and adding metadata
- Confirmation when context is successfully saved

#### Managing Contexts  
- Clean popup interface with search and filtering
- Context cards with platform indicators and action buttons
- Statistics and organization features

#### Cross-Platform Usage
- Insert contexts from ChatGPT into Gemini conversations
- Insert contexts from Gemini into ChatGPT conversations  
- Seamless cross-platform context sharing

*Note: Screenshots and demo GIFs will be added in future updates*

## 🔧 Troubleshooting

### Common Issues

#### Installation Problems
- **Extension not appearing after installation**: 
  - Refresh the `chrome://extensions/` page
  - Ensure "Developer mode" is enabled
  - Try disabling and re-enabling the extension

#### Functionality Issues  
- **Floating button not showing**: 
  - Refresh the ChatGPT/Gemini page after installing
  - Check that you're on a supported domain (`chatgpt.com` or `gemini.google.com/app`)
  - Disable other extensions that might conflict

- **Contexts not saving**: 
  - Ensure you're selecting at least one message
  - Add a title (required field)
  - Check browser console for error messages

- **Wrong platform icon showing**: 
  - This was fixed in v2.0.0 - ensure you have the latest version
  - Clear browser cache and reload the extension

#### Performance Issues
- **Popup loading slowly**: 
  - You may have many saved contexts - consider organizing or deleting old ones
  - Check available browser storage space

- **Search not working**: 
  - Try refreshing the popup by closing and reopening
  - Clear the search field and try again

#### Chrome-Specific Issues
- **Extension disabled automatically**: 
  - Chrome may disable unpacked extensions - re-enable in `chrome://extensions/`
  - Consider using the official Chrome Web Store version when available

### Getting Help
If you encounter issues not covered here:
1. Check [GitHub Issues](https://github.com/ATXNickTaylor/chatseed-extension/issues) for similar problems
2. Create a new issue with detailed error information
3. Contact support via [chatseed@revlytiq.io](mailto:chatseed@revlytiq.io)

## ❓ Frequently Asked Questions

### General Usage

**Q: Can I use contexts saved from ChatGPT in Gemini?**
A: Yes! This is ChatSeed's main feature. You can save contexts from either platform and use them in the other.

**Q: Where is my data stored?**
A: All data is stored locally in your browser using Chrome's storage API. Nothing is sent to external servers.

**Q: Does this work with ChatGPT Plus/Pro and Gemini Advanced?**
A: Yes, ChatSeed works with all versions and subscription tiers of both platforms.

**Q: How many contexts can I save?**
A: There's no hard limit, but performance may slow with thousands of contexts. We recommend organizing and cleaning up periodically.

### Technical Questions

**Q: Does ChatSeed collect any personal data?**
A: No. ChatSeed collects zero personal data. All conversations stay local to your browser.

**Q: Will this work with future updates to ChatGPT/Gemini?**
A: We monitor platform changes and update ChatSeed accordingly. Check for extension updates regularly.

**Q: Can I sync contexts across multiple computers?**
A: Currently, contexts are stored locally per browser. Export/import functionality allows manual transfer.

**Q: Does this work with the ChatGPT mobile app?**
A: No, ChatSeed is a Chrome extension and only works with the web versions of ChatGPT and Gemini.

### Features and Functionality

**Q: What's the difference between the persona types for summarization?**
A: 
- **Executive**: High-level, stakeholder-focused summaries
- **Teammate**: Conversational, collaboration-friendly summaries  
- **Analyst**: Structured, logical summaries with clear organization
- **Default**: Comprehensive, balanced summaries

**Q: Can I edit saved contexts?**
A: Currently, contexts are read-only after saving. You can view, export, favorite, or delete them.

**Q: What file format are exports in?**
A: Contexts export as plain text (.txt) files with metadata included.

**Q: Can I import contexts from other tools?**
A: Currently, ChatSeed doesn't support importing. You can manually create contexts by copying and pasting content.

## 🔒 Privacy & Security Details

### Data Handling
- **No data collection**: ChatSeed never sees or stores your conversations on external servers
- **Local storage only**: All contexts stored in Chrome's local storage API  
- **No analytics**: No tracking, usage analytics, or telemetry of any kind
- **No accounts required**: No sign-up, login, or user accounts needed

### Security Measures
- **Minimal permissions**: Only requests access to ChatGPT and Gemini domains
- **Open source transparency**: Full code available for security audits
- **No external dependencies**: No third-party services or APIs called
- **Sandboxed execution**: Runs in Chrome's secure extension environment

### Your Control
- **Complete ownership**: Your contexts belong entirely to you
- **Easy data export**: Export all contexts at any time
- **Simple removal**: Uninstall the extension to remove all data
- **No vendor lock-in**: Data exports in standard text format

### Compliance
- **GDPR compliant**: No personal data processing or storage
- **No cookies**: No tracking cookies or browser fingerprinting
- **Privacy by design**: Built with privacy as the core principle

### v2.0.0 (June 10, 2025)
- **Multi-Platform Support**: Added full Gemini compatibility
- **Cross-Platform Context Sharing**: Save from ChatGPT, use in Gemini (and vice versa)
- **Enhanced Platform Detection**: Automatic platform identification with visual indicators
- **Improved UI**: Platform-specific icons and enhanced user experience
- **Bug Fixes**: Resolved platform icon detection issues

### v1.2.x
- Persona-enhanced summarization
- Individual context management
- Export functionality
- Modern UI improvements

---

**ChatSeed** - Seamlessly bridge your AI conversations across platforms  
Built with ❤️ by [RevlytIQ LLC](https://revlytiq.io/chatseed)