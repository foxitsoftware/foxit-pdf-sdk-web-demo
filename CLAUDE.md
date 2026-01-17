# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based catalog application showcasing Foxit PDF SDK for Web features. It displays PDF examples in iframes and serves as a companion to the main [foxit-pdf-sdk-web-demo-frontend](https://github.com/foxitsoftware/foxit-pdf-sdk-web-demo-frontend) app.

**Node version:** 14.16.0

## Commands

```bash
# Install dependencies
npm install

# Development (starts webpack dev server + snapshot server)
npm start
# Opens at http://0.0.0.0:8083

# Production build (outputs to dist/)
npm run build

# Optional services for specific examples
npm run start:collaboration-server  # Port 19112
npm run start:conversion-server     # Port 19113
```

## Architecture

### Build System
- **Webpack** with two separate configs in `build/webpack.config.js`:
  1. **Examples bundler** - Dynamically scans `examples/` folder and creates separate entry points for each
  2. **Catalog bundler** - Main React app from `src/index.tsx`
- Each example becomes an isolated bundle loaded in an iframe
- SDK assets are copied from `node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library/lib` to `dist/lib`

### Key Directories
- `src/` - Main catalog React app with routing, tooltips, and iframe management
- `examples/` - 16 standalone PDF feature examples, each with its own `index.js` entry point
- `common/` - Shared utilities for examples (`pdfui.js`, `pdfviewer.js`, etc.)
- `assets/` - Sample PDFs, fonts, and images

### Communication Pattern
- Parent catalog app and iframe examples communicate via `postMessage` API
- Language selection syncs between parent and child frames
- Tooltip "scenes" (`src/scenes/`) define guided tutorial overlays

### Adding New Examples
1. Create folder `examples/[name]/`
2. Add `index.js` entry point
3. Optionally add `info.json` with metadata (name, description)
4. Webpack automatically discovers and bundles it

## Key Dependencies
- **Foxit PDF SDK** v11.0.5 - Core PDF functionality
- **React** v17 with React Router v5 (hash-based routing)
- **Ant Design** v4 - UI components
- **i18next** - Internationalization (EN, ZH-CN, ZH-TW)
- **driver.js** - Tutorial/tooltip system

## License Key
The `license-key.js` file (git-ignored) must contain valid Foxit SDK credentials. Webpack injects license URLs via environment variables.

## Dev Server Proxies
- `/snapshot` → localhost:3003 (snapshot server)
- `/collab` → webviewer-examples.foxit.com (collaboration)
- `/conversion-server` → localhost:19113 (PDF conversion)
