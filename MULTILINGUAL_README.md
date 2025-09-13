Why static per-locale pages are best for SEO

Recommendation

- For best SEO and reliable Rich Results in multiple languages, generate server-side or build-time static pages per locale (e.g. `/en/web-to-image.html`, `/pt/web-to-image.html`, `/es/web-to-image.html`, `/zh/web-to-image.html`).
- Place localized JSON-LD in the page `<head>` statically so crawlers and Rich Results tests see the localized structured data without executing JS.

Simple approaches

1) Manual copy (small sites)
- Duplicate files under locale folders, e.g. `tools/tablecopy/en/web-to-image.html` and update the head JSON-LD + visible text.

2) Minimal build script (Node)
- Keep a source `templates/` directory with placeholders. Use a small Node script to load translations (JSON files) and render per-locale pages.

Example commands (zsh):

- Serve locally to preview:

```bash
python3 -m http.server 8000
# open http://localhost:8000/tools/tablecopy/en/web-to-image.html
```

- Minimal Node build (pseudo):

```bash
node build-locales.js --locales en,zh,pt,es
```

Notes & tradeoffs

- Client-side injection (current approach) is useful for a single-file UI and quick prototyping, but many search engines and the Rich Results tester prefer structured data present in the static HTML head.
- If you must keep a single file, consider server-side rendering or pre-rendering the localized HTML for crawlers (e.g., Netlify, Vercel prerendering).