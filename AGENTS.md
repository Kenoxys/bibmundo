# AGENTS.md - Biblioteca Mundo Hispano

## Project Overview

This is a Progressive Web App (PWA) for a Spanish-language biblical resources library. It consists of:
- **Python**: `scripts/generate_library_json.py` - generates library catalog from PDFs
- **JavaScript**: Vanilla JS frontend (`docs/app.js`, `docs/sw.js`)
- **PDF.js**: Local PDF viewer for offline reading (`docs/lib/`)
- **CSS**: Styling with CSS variables (`docs/styles.css`)
- **HTML**: Single-page app (`docs/index.html`)

## Key Features

- **Offline Support**: Works without internet using Service Worker and IndexedDB
- **PDF Viewer**: Integrated PDF.js viewer with page navigation
- **Categories**: 5 categories (Biblias, Estudio, Predicación, Pastoral, Otros)
- **Search**: Real-time search by title
- **PWA**: Installable as native app on Android/iOS/Windows

## Project Structure

```
.
├── AGENTS.md                    # This file
├── docs/                        # Web application (served by GitHub Pages)
│   ├── index.html              # Main HTML
│   ├── app.js                  # Frontend logic
│   ├── sw.js                   # Service Worker (offline support)
│   ├── styles.css              # CSS
│   ├── manifest.json           # PWA manifest
│   ├── library.json            # Generated catalog
│   ├── _headers                # CORS headers for PDFs on GitHub Pages
│   ├── icons/                  # App icons (PWA)
│   ├── LIBRARY/                # PDF files (BMH_001.pdf, etc.)
│   └── lib/                    # PDF.js for offline PDF viewing
│       ├── pdf.min.js
│       └── pdf.worker.min.js
├── scripts/
│   └── generate_library_json.py # PDF catalog generator
├── bibmundo.pdf                # Sample PDF at root
├── LICENSE
└── README.md                   # User documentation
```

## Build / Deploy Commands

### Local Development

```bash
# Serve from project root (for /docs/ paths)
python3 -m http.server 8000

# Access at http://localhost:8000/docs/
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

## Common Tasks

### Adding a new PDF
1. Place PDF in `docs/LIBRARY/` folder with naming convention `BMH_XXX.pdf`
2. Run: `python3 scripts/generate_library_json.py`
3. Commit both the PDF and the updated `docs/library.json`

### Testing Changes
1. Serve the project from root:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000/docs/` in browser
3. Use browser DevTools for debugging (Console, Network, Application tabs)

### PWA Deployment
The app works offline via Service Worker. Deploy to any static host:
- **GitHub Pages** (recommended - free)
- **Netlify** (free)
- **Vercel** (free)

## Debugging Tips

- **Service Worker**: Check Application tab in browser DevTools
- **IndexedDB**: View stored books in Application > IndexedDB
- **PDF Loading**: Check Network tab for PDF requests
- **Console**: Check for errors in Console tab
- **Clear cache**: If PDFs show 404, unregister Service Worker and hard refresh
