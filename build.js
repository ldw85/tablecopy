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
    languages: ['zh', 'en', 'es', 'pt'],
    defaultLang: 'zh',
    pages: ['index', 'web-to-image', 'web-to-pdf'], // 需要构建的页面列表
};

// --- Nunjucks Setup ---
const env = nunjucks.configure(config.srcDir, {
    autoescape: true,
    noCache: true, // 在开发时禁用缓存
});

// --- 自定义 Nunjucks 过滤器 ---
// 添加 'path' 过滤器来处理多语言路径
env.addFilter('path', function(filename, lang) {
    // 如果是默认语言 'zh'，则路径在根目录
    // 否则，路径在语言子目录中，例如 /en/page.html
    return lang === config.defaultLang ? `/${filename}` : `/${lang}/${filename}`;
});

// --- Main Build Function ---
async function build() {
    console.log('🚀 Starting build...');

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

    // 3. 加载所有翻译文件
    const allTranslations = {};
    for (const lang of config.languages) {
        allTranslations[lang] = await fs.readJson(path.join(config.srcDir, 'locales', `${lang}.json`));
    }
    console.log('✅ Loaded all translations.');

    // 4. 为每种语言渲染页面
    for (const lang of config.languages) {
        for (const page of config.pages) {
            const context = {
                // 页面变量
                page: {
                    name: page,
                    lang: lang,
                    // 生成正确的页面路径
                    path: lang === config.defaultLang ? `/${page}.html` : `/${lang}/${page}.html`,
                    // 生成 canonical URL
                    canonicalUrl: `${config.baseUrl}${lang === config.defaultLang ? '' : '/' + lang}/${page}.html`,
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

    console.log('🎉 Build finished successfully! Your site is ready in the "dist" directory.');
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});