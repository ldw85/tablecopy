# Table Export Pro Extension - Development Guide

## Quick Start

### 1. Development Setup
```bash
# Navigate to extension directory
cd extension/

# Install dependencies (optional, for build tools)
npm install

# Start development mode
npm run dev
```

### 2. Loading Extension for Testing

#### Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` directory

#### Edge:
1. Open `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` directory

### 3. Testing
1. Navigate to any webpage with tables
2. Click the extension icon in toolbar
3. Test table detection and export functionality

## Development Workflow

### Making Changes
1. Edit files in the `extension/` directory
2. Reload the extension in browser extensions page
3. Test your changes

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Building for Production
```bash
# Build the extension
npm run build

# Create distribution packages
npm run package
```

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js             # Content script for table extraction
├── popup.html             # Popup UI
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── injected.js            # Advanced injection script
├── icons/                 # Extension icons
├── build.js               # Build script
├── package.js             # Packaging script
└── package.json           # Node.js dependencies
```

## Key Components

### 1. Manifest Configuration
- Uses Manifest V3 (latest standard)
- Minimal permissions for security
- Cross-browser compatible

### 2. Background Script
- Handles file downloads
- Manages cross-tab data
- Processes auto-extraction results

### 3. Content Script
- Detects tables on web pages
- Extracts table data
- Handles pagination navigation

### 4. Popup Interface
- User-friendly table selection
- Export options (CSV/JSON)
- Auto-extraction configuration

### 5. Injected Script
- Advanced DOM manipulation
- Pagination detection
- Table change monitoring

## API Reference

### Content Script Messages
```javascript
// Detect tables
chrome.tabs.sendMessage(tabId, { action: 'detectTables' })

// Export table
chrome.tabs.sendMessage(tabId, {
  action: 'exportTable',
  tableIndex: 0,
  includeHeaders: true
})

// Start auto-extraction
chrome.tabs.sendMessage(tabId, {
  action: 'startAutoExtraction',
  config: { maxPages: 10, delay: 2000 }
})
```

### Background Script Messages
```javascript
// Download file
chrome.runtime.sendMessage({
  action: 'downloadFile',
  filename: 'table.csv',
  content: 'csv,data,here'
})

// Merge CSV data
chrome.runtime.sendMessage({
  action: 'mergeCSVData',
  data: [page1Data, page2Data]
})
```

## Browser Compatibility

### Supported Browsers
- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

### Testing Checklist
- [ ] Table detection on various websites
- [ ] CSV export functionality
- [ ] JSON export functionality
- [ ] Auto-pagination extraction
- [ ] Progress indication
- [ ] Error handling
- [ ] Memory usage

## Debugging Tips

### 1. Console Logging
```javascript
// Use console.log for debugging
console.log('Debug info:', data);

// Use chrome.runtime.lastError for error handling
if (chrome.runtime.lastError) {
  console.error('Error:', chrome.runtime.lastError);
}
```

### 2. Extension Pages
- `chrome://extensions/` - Manage extensions
- `chrome://extension-errors/` - View errors
- Right-click extension icon → "Inspect popup"

### 3. Content Script Debugging
1. Open DevTools on target webpage
2. Look for "Content Scripts" tab
3. Set breakpoints in content.js

## Common Issues

### Extension Not Loading
- Check manifest.json syntax
- Verify file paths are correct
- Ensure all required files exist

### Tables Not Detected
- Check if page uses standard `<table>` elements
- Verify content script is injected
- Test on different websites

### Auto-pagination Fails
- Check pagination button selectors
- Adjust delay timing
- Verify page structure

### File Download Issues
- Check download permissions
- Verify filename format
- Test download functionality

## Performance Optimization

### 1. Memory Management
- Clean up event listeners
- Remove unused variables
- Limit data storage duration

### 2. Execution Speed
- Minimize DOM queries
- Use efficient selectors
- Batch operations when possible

### 3. File Size
- Minimize JavaScript code
- Optimize CSS
- Compress images

## Security Considerations

### 1. Permissions
- Request minimal permissions
- Justify each permission in manifest
- Use optional permissions when possible

### 2. Content Security Policy
- Define strict CSP in manifest
- Avoid inline scripts
- Use external resources carefully

### 3. Data Handling
- Sanitize user inputs
- Validate extracted data
- Secure storage of sensitive data

## Release Process

### 1. Pre-release Checklist
- [ ] All features tested
- [ ] Code quality checks passed
- [ ] Documentation updated
- [ ] Version number updated

### 2. Building
```bash
# Run full build and package
npm run build
npm run package
```

### 3. Distribution
- Upload to Chrome Web Store
- Submit to Edge Add-ons
- Update website download links

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following guidelines
4. Test thoroughly
5. Submit pull request

## Support

For development questions:
- Check existing issues
- Review documentation
- Submit new issues with detailed information

---

**Happy coding!** 🚀