# Table Export Pro - Browser Extension

This directory contains the browser extension version of Table Export Pro, which is a premium add-on service for the main tablecopy.pro platform.

## Overview

Table Export Pro is a powerful browser extension that allows users to export web table data with automatic pagination support. It's designed as a premium feature for the main bookmarklet service.

## Features

- 🔍 Smart table detection
- 📊 Export to CSV and JSON formats
- 🔄 Automatic pagination scraping
- ⚙️ Configurable extraction settings
- 🎯 Visual table selection
- 📋 Data preview functionality

## File Structure

```
extension/
├── manifest.json          # Extension manifest (Chrome/Edge compatible)
├── background.js          # Background service worker
├── content.js             # Content script for table extraction
├── popup.html             # Extension popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── injected.js            # Injected script for advanced operations
└── icons/                 # Extension icons (various sizes)
    ├── icon16.png         # 16x16 icon
    ├── icon32.png         # 32x32 icon
    ├── icon48.png         # 48x48 icon
    └── icon128.png        # 128x128 icon
```

## Installation for Development

1. **Chrome/Edge Browser**:
   - Open `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this `extension` directory

2. **Testing**:
   - Navigate to any webpage with tables
   - Click the extension icon in the toolbar
   - Follow the interface to export tables

## Building for Production

### Prerequisites
- Node.js 14+ (for build tools)
- Chrome or Edge browser for testing

### Build Process
```bash
# Install dependencies (if any build tools are added)
npm install

# Build the extension
npm run build

# Create distribution package
npm run package
```

### Distribution Package Structure
```
dist/
├── table-export-pro-v1.0.0.zip    # Chrome Web Store package
├── table-export-pro-v1.0.0-edge.zip # Edge Add-ons package
└── source-code.zip                 # Source code for review
```

## Configuration

### Manifest Settings
The `manifest.json` is configured for:
- Manifest V3 (latest standard)
- Cross-browser compatibility
- Minimal required permissions
- Optimal performance

### Extension Permissions
- `activeTab`: Access current tab for table extraction
- `storage`: Save user preferences
- `scripting`: Inject scripts when needed
- `downloads`: Handle file downloads

## Development Guidelines

### Code Style
- Use modern JavaScript (ES6+)
- Follow consistent indentation (2 spaces)
- Add comments for complex logic
- Use meaningful variable names

### Testing
- Test on multiple websites
- Verify cross-browser compatibility
- Check memory usage and performance
- Validate data extraction accuracy

### Security
- Minimize permissions requested
- Validate all user inputs
- Use content security policy
- Avoid external dependencies

## Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|---------|
| Chrome  | 88+            | ✅ Full Support |
| Edge    | 88+            | ✅ Full Support |
| Firefox | TBD            | 🔄 Planned |
| Safari  | TBD            | 🔄 Planned |

## API Integration

This extension is designed to work with the main tablecopy.pro service:
- User preferences sync (future feature)
- Premium feature validation
- Usage analytics
- Update notifications

## Monetization Strategy

As a premium add-on:
- Basic table export: Free
- Advanced features (auto-pagination, batch export): Premium
- Usage limits for free tier
- Subscription-based premium access

## Support

For extension-specific issues:
1. Check browser console for errors
2. Verify extension permissions
3. Test on different websites
4. Submit detailed bug reports

## Roadmap

### Version 1.1 (Next)
- [ ] Firefox support
- [ ] Enhanced pagination detection
- [ ] Batch table export
- [ ] Custom export templates

### Version 1.2 (Future)
- [ ] Safari support
- [ ] Cloud sync integration
- [ ] Advanced data filtering
- [ ] API for third-party integration

---

**Note**: This is the premium browser extension version. For the free bookmarklet version, visit [tablecopy.pro](https://tablecopy.pro).