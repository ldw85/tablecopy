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
简化的本地生成并推送流程（中文说明）

- 目的：在本地一次性生成每个语言的静态页面并直接提交到 GitHub，避免依赖定制化 CI/workflow。
- 生成命令（在仓库根目录或 tools/tablecopy 下运行）：

```bash
# 使用 node 脚本生成本地静态页面
node tools/tablecopy/scripts/build_locales.js
# 或通过 npm 脚本
cd tools/tablecopy
npm run build-locales
```

- 生成结果：脚本会在 `tools/tablecopy/` 目录下创建或覆盖 `en/`, `pt/`, `es/`, `zh/` 子目录，每个子目录包含对应的 `web-to-image.html` 和 `web-to-pdf.html`。
- 提交并推送（示例）：

```bash
git add tools/tablecopy/en tools/tablecopy/pt tools/tablecopy/es tools/tablecopy/zh
git commit -m "chore: generate static localized pages"
git push origin your-branch
```

- 验证：可以本地启动一个静态服务器来预览生成的页面，例如：

```bash
python3 -m http.server 8000
# 然后在浏览器打开 http://localhost:8000/tools/tablecopy/en/web-to-image.html
```

说明：此方式把构建过程放在本地开发者机器上，减轻 CI 维护成本；如果你希望自动化（在合并到 main 后触发生成并发布），可以再额外添加 GitHub Actions，但这不是必须的。