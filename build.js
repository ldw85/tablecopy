const fs = require('fs-extra');
const nunjucks = require('nunjucks');
const path = require('path');

// --- Configuration ---
// 项目根目录就是当前脚本所在的目录
const rootDir = __dirname;
const config = {
    srcDir: path.join(rootDir, 'src'), // 源文件目录: .../tablecopy/src
    distDir: path.join(rootDir, 'dist'), // 输出目录: .../tablecopy/dist
    baseUrl: 'https://tablecopy.pro', // 你的网站域名
    languages: ['zh', 'en', 'es', 'pt', 'de', 'fr', 'ja', 'ko', 'ru'],
    defaultLang: 'en',
};

// --- Nunjucks Setup ---
const env = nunjucks.configure(config.srcDir, {
    autoescape: true,
    noCache: true, // 在开发时禁用缓存
});

// --- 自定义 Nunjucks 过滤器 ---
// 添加 'path' 过滤器来处理多语言路径
env.addFilter('path', function(filename, lang) {
    // 如果是默认语言 'en'，则路径在根目录
    // 否则，路径在语言子目录中，例如 /zh/page.html
    return lang === config.defaultLang ? `/${filename}` : `/${lang}/${filename}`;
});

// --- Main Build Function ---
async function build() {
    console.log('🚀 Starting build...');

    // 0. 动态扫描 pages 目录以获取所有页面
    const pagesDir = path.join(config.srcDir, 'pages');
    const pages = (await fs.readdir(pagesDir))
        .filter(file => file.endsWith('.html'))
        .map(file => path.basename(file, '.html'));
    console.log(`📄 Found ${pages.length} pages to build: ${pages.join(', ')}`);

    // 1. 清理并准备 dist 目录
    await fs.emptyDir(config.distDir);
    console.log('✅ Cleaned dist directory.');

    // 2. 复制静态资源 (assets, favicon, etc.)
    const assetsSrc = path.join(config.srcDir, 'assets');
    const assetsDist = path.join(config.distDir, 'assets');
    if (await fs.pathExists(assetsSrc)) {
        await fs.copy(assetsSrc, assetsDist);
    }
    console.log('✅ Copied static assets.');

    // 2.1 sitemap.xml 将在构建后自动生成

    // 2.2 复制 _redirects 文件到根目录（Cloudflare Pages 配置）
    const redirectsSrc = path.join(config.srcDir, '_redirects');
    const redirectsDist = path.join(config.distDir, '_redirects');
    if (await fs.pathExists(redirectsSrc)) {
        await fs.copy(redirectsSrc, redirectsDist);
        console.log('✅ Copied _redirects to dist root.');
    }

    // 2.3 复制 robots.txt 到根目录
    const robotsSrc = path.join(config.srcDir, 'robots.txt');
    const robotsDist = path.join(config.distDir, 'robots.txt');
    if (await fs.pathExists(robotsSrc)) {
        await fs.copy(robotsSrc, robotsDist);
        console.log('✅ Copied robots.txt to dist root.');
    }

    // 3. 加载所有翻译文件
    const allTranslations = {};
    for (const lang of config.languages) {
        allTranslations[lang] = await fs.readJson(path.join(config.srcDir, 'locales', `${lang}.json`));
    }
    console.log('✅ Loaded all translations.');

    // 4. 为每种语言渲染页面
    for (const lang of config.languages) {
        for (const page of pages) {
            const context = {
                // 配置变量
                config: {
                    defaultLang: config.defaultLang,
                },
                // 页面变量
                page: {
                    name: page,
                    lang: lang,
                    // 生成正确的页面路径
                    path: lang === config.defaultLang ? `/${page}.html` : `/${lang}/${page}.html`,
                    // 生成 canonical URL
                    canonicalUrl: `${config.baseUrl}${lang === config.defaultLang ? '' : '/' + lang}/${page}.html`,
                    // 添加相对路径深度信息
                    depth: lang === config.defaultLang ? 0 : 1, // 根目录为0，语言子目录为1
                },
                // 用于 hreflang 的语言备用链接
                alternates: config.languages.map(altLang => ({
                    lang: altLang,
                    url: `${config.baseUrl}${altLang === config.defaultLang ? '' : '/' + altLang}/${page}.html`,
                })),
                defaultLangUrl: `${config.baseUrl}/${page}.html`,
                // 当前语言的翻译对象
                T: allTranslations[lang],
            };

            const templatePath = path.join('pages', `${page}.html`);
            const html = env.render(templatePath, context);

            // 确定输出路径
            const outDir = lang === config.defaultLang ? config.distDir : path.join(config.distDir, lang);
            await fs.ensureDir(outDir);
            const outPath = path.join(outDir, `${page}.html`);

            await fs.writeFile(outPath, html);
        }
    }

    // 5. 复制博客文章
    const blogSrcDir = path.join(rootDir, 'blog');
    const blogDistDir = path.join(config.distDir, 'blog');
    if (await fs.pathExists(blogSrcDir)) {
        await fs.copy(blogSrcDir, blogDistDir);
        console.log('✅ Copied blog posts.');
    }

    // 6. 生成 sitemap.xml
    await generateSitemap();

    console.log('🎉 Build finished successfully! Your site is ready in the "dist" directory.');
}

// --- Sitemap Generation Function ---
async function generateSitemap() {
    console.log('🗺️  Generating sitemap.xml...');

    const urls = [];

    // 递归扫描 dist 目录查找所有 HTML 文件
    async function scanDir(dir, basePath = '') {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.join(basePath, entry.name);

            if (entry.isDirectory()) {
                // 跳过 assets 目录（不需要在 sitemap 中）
                if (entry.name !== 'assets') {
                    await scanDir(fullPath, relativePath);
                }
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                // 获取文件修改时间
                const stats = await fs.stat(fullPath);
                const lastmod = stats.mtime.toISOString();

                // 生成 URL
                let urlPath = relativePath.replace(/\.html$/, '');

                // 特殊处理: 如果文件名是 index，则移除它（使用目录路径）
                // 例如: "index" -> "", "zh/index" -> "zh", "blog/post" -> "blog/post"
                if (path.basename(urlPath) === 'index') {
                    urlPath = path.dirname(urlPath);
                    // 如果 dirname 返回 "."，则表示是根目录的 index
                    if (urlPath === '.') {
                        urlPath = '';
                    }
                    // 目录路径添加尾部斜杠
                    if (urlPath !== '') {
                        urlPath = urlPath + '/';
                    }
                }

                // 确保根路径有斜杠
                if (urlPath === '') {
                    urlPath = '/';
                } else {
                    urlPath = '/' + urlPath;
                }

                // 确定优先级
                const isIndex = path.basename(entry.name) === 'index.html';
                const priority = isIndex ? '1.00' : '0.80';

                urls.push({
                    loc: `${config.baseUrl}${urlPath}`,
                    lastmod: lastmod,
                    priority: priority,
                    langOrder: basePath === '' ? 0 : 1, // 用于排序: 根目录在前
                    path: urlPath
                });
            }
        }
    }

    await scanDir(config.distDir);

    // 排序: 按语言分组，然后按路径排序
    urls.sort((a, b) => {
        // 首先按语言分组（根目录在前）
        if (a.langOrder !== b.langOrder) {
            return a.langOrder - b.langOrder;
        }
        // 然后按路径排序
        return a.path.localeCompare(b.path);
    });

    // 生成 XML
    const xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(url =>
            `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`
        ),
        '</urlset>'
    ];

    const xmlContent = xmlLines.join('\n');

    // 写入 sitemap.xml
    const sitemapPath = path.join(config.distDir, 'sitemap.xml');
    await fs.writeFile(sitemapPath, xmlContent);

    console.log(`✅ Generated sitemap.xml with ${urls.length} URLs.`);
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});