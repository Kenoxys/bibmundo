# AGENTS.md - Biblioteca Mundo Hispano

## Project Overview

This is a Progressive Web App (PWA) for a Spanish-language biblical resources library. It consists of:
- **Python**: `scripts/generate_library_json.py` - generates library catalog from PDFs
- **JavaScript**: Vanilla JS frontend (`pwa/app.js`, `pwa/sw.js`)
- **PDF.js**: Local PDF viewer for offline reading (`pwa/lib/`)
- **CSS**: Styling with CSS variables (`pwa/styles.css`)
- **HTML**: Single-page app (`pwa/index.html`)

## Key Features

- **Offline Support**: Works without internet using Service Worker and IndexedDB
- **PDF Viewer**: Integrated PDF.js viewer with page navigation
- **Categories**: 5 categories (Biblias, Estudio, Predicación, Pastoral, Otros)
- **Search**: Real-time search by title
- **PWA**: Installable as native app on Android/iOS/Windows

## Build / Deploy Commands

### Local Development

```bash
# Serve from project root (for /pwa/ paths)
python3 -m http.server 8000

# Access at http://localhost:8000/pwa/
```

### Generate Library JSON

```bash
# Generate library JSON (requires pdfinfo from poppler-utils)
python3 scripts/generate_library_json.py
```

### Deploy to GitHub Pages

```bash
# Push changes to GitHub
git add .
git commit -m "Update: description of changes"
git push origin main

# GitHub Pages auto-deploys from main branch
# URL will be: https://yourusername.github.io/repo-name/
```

### Generate APK with PWABuilder

1. Deploy to GitHub Pages (or any HTTPS host)
2. Go to https://www.pwabuilder.com/
3. Enter your PWA URL
4. Download Android APK

## Project Structure

```
.
├── AGENTS.md                    # This file
├── pwa/                         # Web application
│   ├── index.html              # Main HTML
│   ├── app.js                  # Frontend logic
│   ├── sw.js                   # Service Worker (offline support)
│   ├── styles.css              # CSS
│   ├── manifest.json           # PWA manifest
│   ├── library.json            # Generated catalog
│   ├── icons/                  # App icons (PNG)
│   └── lib/                    # PDF.js for offline PDF viewing
│       ├── pdf.min.js
│       └── pdf.worker.min.js
├── scripts/
│   └── generate_library_json.py # PDF catalog generator
└── LIBRARY/                     # PDF files (BMH_001.pdf, etc.)
```

## Common Tasks

### Adding a new PDF
1. Place PDF in `LIBRARY/` folder with naming convention `BMH_XXX.pdf`
2. Run: `python3 scripts/generate_library_json.py`
3. Commit both the PDF and the updated `pwa/library.json`

### Testing Changes
1. Serve the project from root:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000/pwa/` in browser
3. Use browser DevTools for debugging (Console, Network, Application tabs)

### PWA Deployment
The app works offline via Service Worker. Deploy to any static host:
- **GitHub Pages** (recommended - free)
- **Netlify** (free)
- **Vercel** (free)

### Debugging Tips

- **Service Worker**: Check Application tab in browser DevTools
- **IndexedDB**: View stored books in Application > IndexedDB
- **PDF Loading**: Check Network tab for PDF requests
- **Console**: Check for errors in Console tab
