## Our Security Commitment

ChatSeed operates with **zero external dependencies** and **complete user privacy**. Every line of our code is open source and auditable by the community.

## Privacy-First Design

### 🔒 What We DON'T Do
- ❌ **No data collection** - We never see your conversations
- ❌ **No external servers** - No data ever leaves your computer  
- ❌ **No tracking** - No analytics, cookies, or user monitoring
- ❌ **No data transmission** - Zero network requests with your data
- ❌ **No cloud storage** - Everything stays local to your device

### ✅ What We DO
- ✅ **Local storage only** - Chrome's encrypted local storage API
- ✅ **User control** - Delete any/all contexts anytime
- ✅ **Open source** - Full code transparency for audit
- ✅ **Minimal permissions** - Only essential Chrome extension permissions
- ✅ **No third parties** - No external services or integrations

## Technical Security Measures

### Code Security
- **GitHub Security Scanning**: Automated vulnerability detection
- **Dependency Monitoring**: Automated alerts for vulnerable packages  
- **Code Analysis**: Static analysis for security issues
- **Open Source Audit**: Community review of all code changes

### Extension Security
- **Manifest V3**: Latest Chrome security architecture
- **Content Security Policy**: Strict CSP preventing code injection
- **Minimal Permissions**: Only `storage`, `activeTab`, and `windows`
- **No Remote Code**: All code bundled locally, no external scripts

### Data Security
- **Chrome Storage API**: Encrypted local storage managed by Chrome
- **No Plaintext Transmission**: Data never sent over network
- **User-Controlled Deletion**: Complete data removal capability
- **No Backup Services**: Data never copied to external locations

## Verifying Our Security Claims

### For Technical Users
1. **Review Source Code**: Complete codebase available on GitHub
2. **Monitor Network Traffic**: Zero outbound requests (except opening websites)
3. **Inspect Chrome Storage**: See exactly what data is stored locally
4. **Build from Source**: Compile extension yourself for verification

### For Non-Technical Users
- ✅ **Open Source Badge**: All code publicly reviewable
- ✅ **GitHub Security Scans**: Automated vulnerability detection
- ✅ **Community Review**: Ongoing security feedback from developers
- ✅ **No Account Required**: No sign-up, no personal information collected

## Permissions Explanation

ChatSeed requests minimal permissions:

### `storage`
**Purpose**: Save your contexts locally in Chrome's encrypted storage
**Data**: Only conversation contexts you explicitly save
**Access**: Only ChatSeed can read this data

### `activeTab` 
**Purpose**: Integrate with ChatGPT page for context saving
**Data**: Only when you're actively using the extension
**Access**: Limited to tab content when extension is used

### `windows`
**Purpose**: Create sticky windows for multi-LLM workflows
**Data**: No data access, only window positioning
**Access**: Window management only, no content access

## Reporting Security Issues

### For Security Researchers
If you discover a security vulnerability:

**🔒 Private Reporting** (Preferred):
- Email: security@revlytiq.io
- Include: Detailed reproduction steps
- Response time: 24-48 hours

**📋 Public Reporting**:
- GitHub Issues: [Report a Bug](https://revlytiq.fillout.com/chatseed-support)
- Use for non-sensitive security improvements


## Security Best Practices for Users

### Installation Security
- ✅ **Download from GitHub** releases only
- ✅ **Verify file integrity** if you're security-conscious
- ✅ **Use Developer Mode** as intended by Chrome
- ❌ **Don't download** from third-party sites

### Usage Security  
- ✅ **Review contexts** before saving sensitive information
- ✅ **Delete unused contexts** to minimize data footprint
- ✅ **Keep Chrome updated** for latest security features
- ✅ **Monitor extension permissions** in Chrome settings

### Data Security
- ✅ **Your data stays local** - we can't access it even if we wanted to
- ✅ **Chrome encryption** protects stored contexts
- ✅ **Uninstall removes all data** - clean removal guaranteed

## Security Roadmap

### Current Security Status
- ✅ Open source transparency
- ✅ Automated security scanning  
- ✅ Zero data collection architecture
- ✅ Community security review

### Planned Security Enhancements
- 🔄 Third-party security audit (when funding allows)
- 🔄 Code signing certificate for additional trust
- 🔄 Advanced CSP policies
- 🔄 Enhanced permission documentation

## Frequently Asked Security Questions

**Q: Can ChatSeed see my ChatGPT conversations?**
A: No. We only see contexts you explicitly choose to save, and even those stay on your computer.

**Q: Does ChatSeed work offline?**
A: Yes, for managing saved contexts. You need internet only for ChatGPT/Claude access.

**Q: What happens if I uninstall ChatSeed?**
A: All data is completely removed. Nothing remains on your system.

**Q: Can ChatSeed access other websites?**
A: No. Our permissions are limited to ChatGPT domains and local storage only.

**Q: How do I verify ChatSeed isn't sending data?**
A: Monitor your network traffic or review our open source code - you'll see zero data transmission.

---

## Security Contact

- **General Security**: security@revlytiq.io
- **Vulnerability Reports**: security@revlytiq.io  
- **Security Questions**: chatseed@revlytiq.io

**Security isn't just a feature - it's our foundation.** 🔒

Your data, your device, your control. Always.
