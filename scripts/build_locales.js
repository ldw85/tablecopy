#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = ROOT; // tools/tablecopy

const pages = [
  { src: path.join(SRC, 'web-to-image.html'), name: 'web-to-image.html', slug: 'web-to-image' },
  { src: path.join(SRC, 'web-to-pdf.html'), name: 'web-to-pdf.html', slug: 'web-to-pdf' }
];

const LOCALES = ['en','pt','es','zh'];

// Translation dictionaries including FAQ question/answer arrays for each page
const translations = {
  'web-to-image': {
    en: {
      hero_h1: 'One-click capture of webpages to PNG — Web to Image (Full page, High-res)',
      hero_slogan: 'Capture any webpage as a high-resolution PNG (visual fidelity & long-page stitching). Ideal for sharing and archiving.',
      install_cta: 'Use Now',
      features_title: 'Features — Web to Image / Save as PNG',
      about_title: 'About this tool (How it works & EEAT)',
      faq_title: 'FAQ',
      footer_p: '© 2025 Web Converter. Powered by Gemini AI.',
      faq: [
        { q: 'What if overlays or toolbars appear in the capture?', a: 'The script tries to hide its own modal and controls to avoid self-capture. For third-party overlays (chat widgets, cookie notices or banners), please close or hide them before capturing.' },
        { q: 'Why are some images or resources missing in the exported image?', a: "If resources come from third-party domains without CORS headers, the browser can block drawing them to the canvas. Open in a new tab or save critical images locally before composing a capture as a workaround." },
        { q: 'How to get higher resolution or smaller file size?', a: 'Increase the scale (e.g. window.devicePixelRatio * 2) for higher resolution, but this uses more memory. To reduce file size, lower quality parameters or compress the file afterwards.' },
        { q: 'How to avoid memory crashes on very long pages?', a: 'Very long pages can use lots of memory. Consider capturing in segments or lowering scale and merging images locally. Server-side rendering is another option if acceptable.' },
        { q: 'How can I give feedback or contribute?', a: 'Open an issue or PR in the GitHub repository (path: tools/tablecopy/). Provide a reproducible example or recording to help debugging.' }
      ]
    },
    pt: {
      hero_h1: 'Captura de página para PNG com um clique — Web to Image (página inteira, alta resolução)',
      hero_slogan: 'Capture qualquer página web como PNG de alta resolução (fidelidade visual e junção de páginas longas). Ideal para compartilhar e arquivar.',
      install_cta: 'Usar Agora',
      features_title: 'Destaques — Web to Image / Salvar como PNG',
      about_title: 'Sobre esta ferramenta (Como funciona & EEAT)',
      faq_title: 'Perguntas Frequentes (FAQ)',
      footer_p: '© 2025 Web Converter. Powered by Gemini AI.',
      faq: [
        { q: 'O que fazer se sobreposições ou barras de ferramentas aparecerem na captura?', a: 'O script tenta ocultar seu próprio modal e controles para evitar auto-captura. Para sobreposições de terceiros (widgets de chat, avisos de cookies ou banners), feche ou oculte-os antes de capturar.' },
        { q: 'Por que algumas imagens ou recursos faltam na imagem exportada?', a: 'Se recursos vierem de domínios de terceiros sem cabeçalhos CORS, o navegador pode bloquear sua renderização no canvas. Abra em uma nova guia ou salve imagens críticas localmente antes de compor a captura.' },
        { q: 'Como obter maior resolução ou arquivo menor?', a: 'Aumente o scale (por exemplo window.devicePixelRatio * 2) para mais resolução, mas isso consome mais memória. Para reduzir o tamanho do arquivo, diminua a qualidade ou comprima o arquivo após a exportação.' },
        { q: 'Como evitar falhas de memória em páginas muito longas?', a: 'Páginas muito longas podem consumir muita memória. Considere capturar em segmentos ou reduzir o scale e mesclar as imagens localmente.' },
        { q: 'Como posso enviar feedback ou contribuir?', a: 'Abra uma issue ou PR no repositório GitHub (caminho: tools/tablecopy/). Envie um exemplo reproduzível ou gravação para facilitar o diagnóstico.' }
      ]
    },
    es: {
      hero_h1: 'Captura de página a PNG con un clic — Web to Image (página completa, alta resolución)',
      hero_slogan: 'Captura cualquier página web como PNG de alta resolución (fidelidad visual y unión de páginas largas). Ideal para compartir y archivar.',
      install_cta: 'Usar ahora',
      features_title: 'Características — Web to Image / Guardar como PNG',
      about_title: 'Acerca de esta herramienta (Cómo funciona & EEAT)',
      faq_title: 'Preguntas Frecuentes (FAQ)',
      footer_p: '© 2025 Web Converter. Powered by Gemini AI.',
      faq: [
        { q: '¿Qué pasa si aparecen superposiciones o barras en la captura?', a: 'El script intenta ocultar su propio modal y controles para evitar auto-captura. Para superposiciones de terceros (widgets de chat, avisos de cookies o banners), ciérrelos u oculte antes de capturar.' },
        { q: '¿Por qué faltan algunas imágenes o recursos en la imagen exportada?', a: 'Si los recursos provienen de dominios de terceros sin CORS, el navegador puede bloquear su renderización en el canvas. Abra en una nueva pestaña o guarde imágenes críticas localmente antes de componer la captura.' },
        { q: '¿Cómo obtener mayor resolución o menor tamaño de archivo?', a: 'Aumente el scale (por ejemplo window.devicePixelRatio * 2) para más resolución, pero usa más memoria. Para reducir tamaño, baje la calidad o comprima el archivo posteriores a la exportación.' },
        { q: '¿Cómo evitar fallos de memoria en páginas muy largas?', a: 'Las páginas muy largas pueden usar mucha memoria. Considere capturar por segmentos o reducir el scale y luego unir las imágenes localmente.' },
        { q: '¿Cómo doy feedback o contribuyo?', a: 'Abra un issue o PR en el repositorio GitHub (ruta: tools/tablecopy/). Incluya un ejemplo reproducible o grabación para ayudar.' }
      ]
    },
    zh: {
      // zh uses the original page text; leave empty FAQ to keep original
      hero_h1: '', hero_slogan: '', install_cta: '', features_title: '', about_title: '', faq_title: '', footer_p: '', faq: []
    }
  },
  'web-to-pdf': {
    en: {
      hero_h1: 'One-click save webpage as PDF — Web to PDF (High-quality, Searchable)',
      hero_slogan: 'Export any webpage as a high-quality, searchable PDF (preserving layout, styles and selectable text).',
      install_cta: 'Use Now',
      features_title: 'Features — Web to PDF / Save as PDF',
      about_title: 'About this tool (How it works & EEAT)',
      faq_title: 'FAQ',
      footer_p: '© 2025 Web Converter. Powered by Gemini AI.',
      faq: [
        { q: 'Will this tool upload my page content?', a: 'No. All processing (printing or capturing) is performed locally in the browser and the exported file downloads to your device.' },
        { q: 'Why does the printed PDF differ from the on-screen page?', a: 'Many sites include @media print styles which change print output. Check print preview for pagination, scale and margins; use capture mode for visual fidelity.' },
        { q: 'When should I use screenshot (PNG) instead of printing?', a: 'When the page contains complex canvas, WebGL or dynamic visualizations, printing may not render correctly; use screenshot mode to capture visual output.' },
        { q: 'How to preserve searchable text when printing?', a: 'Prefer the browser native print (window.print()) which preserves DOM text. Avoid screenshot mode if you need selectable/searchable text.' },
        { q: 'What if CDN libraries fail due to adblockers?', a: 'If html2canvas or other CDN libs fail to load, the script shows a fallback message and suggests using browser print or whitelisting the CDN.' },
        { q: 'How can I report bugs or contribute?', a: 'Open an issue or PR in the repository (path: tools/tablecopy/) with a reproducible example or recording.' }
      ]
    },
    pt: {
      hero_h1: 'Salvar página como PDF com um clique — Web to PDF (Alta qualidade, pesquisável)',
      hero_slogan: 'Exporte qualquer página como PDF de alta qualidade e pesquisável (preservando layout, estilos e texto selecionável).',
      install_cta: 'Usar Agora',
      features_title: 'Destaques — Web to PDF / Salvar como PDF',
      about_title: 'Sobre esta ferramenta (Como funciona & EEAT)',
      faq_title: 'Perguntas Frequentes (FAQ)',
      footer_p: '© 2025 Web Converter. Powered by Gemini AI.',
      faq: [
        { q: 'Esta ferramenta fará upload do conteúdo da minha página?', a: 'Não. Todo o processamento (impressão ou captura) é feito localmente no navegador e o arquivo exportado é baixado para o seu dispositivo.' },
        { q: 'Por que o PDF impresso difere da página exibida?', a: 'Muitos sites usam estilos @media print que alteram a saída de impressão. Verifique a pré-visualização de impressão para paginação, escala e margens; use modo de captura para fidelidade visual.' },
        { q: 'Quando devo usar screenshot (PNG) em vez de imprimir?', a: 'Quando a página contém canvas complexos, WebGL ou visualizações dinâmicas, a impressão pode não renderizar corretamente; use o modo screenshot para capturar o resultado visual.' },
        { q: 'Como preservar texto pesquisável ao imprimir?', a: 'Prefira a impressão nativa do navegador (window.print()) que preserva o texto do DOM. Evite o modo screenshot se precisar de texto selecionável/pesquisável.' },
        { q: 'E se as bibliotecas CDN falharem devido a bloqueadores?', a: 'Se html2canvas ou outras bibliotecas CDN falharem, o script mostra uma mensagem de fallback e sugere usar a impressão do navegador ou adicionar o CDN à lista de permissões.' },
        { q: 'Como posso reportar bugs ou contribuir?', a: 'Abra um issue ou PR no repositório (caminho: tools/tablecopy/) com um exemplo reproduzível ou gravação.' }
      ]
    },
    es: {
      hero_h1: 'Guardar página como PDF con un clic — Web to PDF (Alta calidad, buscable)',
      hero_slogan: 'Exporta cualquier página como PDF de alta calidad y buscable (preservando diseño, estilos y texto seleccionable).',
      install_cta: 'Usar ahora',
      features_title: 'Características — Web to PDF / Guardar como PDF',
      about_title: 'Acerca de esta herramienta (Cómo funciona & EEAT)',
      faq_title: 'Preguntas Frecuentes (FAQ)',
      footer_p: '© 2025 Web Converter. Powered by Gemini AI.',
      faq: [
        { q: '¿Esta herramienta subirá el contenido de mi página?', a: 'No. Todo el procesamiento (impresión o captura) se realiza localmente en el navegador y el archivo exportado se descarga en su dispositivo.' },
        { q: '¿Por qué el PDF impreso difiere de la página en pantalla?', a: 'Muchos sitios incluyen estilos @media print que cambian la salida de impresión. Verifique la vista previa de impresión para paginación, escala y márgenes; use el modo de captura para fidelidad visual.' },
        { q: '¿Cuándo debo usar captura (PNG) en lugar de imprimir?', a: 'Cuando la página contiene canvas complejos, WebGL o visualizaciones dinámicas, imprimir puede no renderizar correctamente; use el modo captura para capturar la salida visual.' },
        { q: '¿Cómo preservar texto buscable al imprimir?', a: 'Prefiera la impresión nativa del navegador (window.print()) que preserva el texto del DOM. Evite el modo captura si necesita texto seleccionable/buscable.' },
        { q: '¿Y si las bibliotecas CDN fallan por bloqueadores?', a: 'Si html2canvas u otras bibliotecas CDN fallan, el script muestra un mensaje de fallback y sugiere usar la impresión del navegador o permitir el CDN.' },
        { q: '¿Cómo reporto bugs o contribuyo?', a: 'Abra un issue o PR en el repositorio (ruta: tools/tablecopy/) con un ejemplo reproducible o grabación.' }
      ]
    },
    zh: { hero_h1: '', hero_slogan: '', install_cta: '', features_title: '', about_title: '', faq_title: '', footer_p: '', faq: [] }
  }
};

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function replaceHeadJsonLd(html, softwareApplication, faqPage){
  // build combined JSON-LD
  const graph = [softwareApplication, faqPage];
  const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  // replace first <script type="application/ld+json">...</script>
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i;
  if(!re.test(html)){
    // insert into head
    return html.replace(/<head[^>]*>/i, m => m + '\n' + `<script type="application/ld+json">\n${jsonld}\n</script>`);
  }
  return html.replace(re, `<script type="application/ld+json">\n${jsonld}\n</script>`);
}

function buildFaqHtml(faqArr){
  let out = `            <h2 class="section-title">${faqArr.title || ''}</h2>\n`;
  faqArr.items.forEach(item => {
    out += `                <div class="faq-item">\n                    <h3>${item.q}</h3>\n                    <p>${item.a}</p>\n                </div>\n`;
  });
  out += '                <p style="margin-top:18px;">需要可搜索文本或更好的打印效果？请跳转到：<a href="web-to-pdf.html">网页转 PDF（Web to PDF）</a>。</p>\n';
  return out;
}

function buildFaqPageObject(faqArr){
  const mainEntity = faqArr.items.map(it => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } }));
  return { '@type': 'FAQPage', mainEntity };
}

function buildSoftwareApplicationObject(pageSlug, locale){
  const baseUrl = `https://tablecopy.pro/${pageSlug}`;
  const name = pageSlug === 'web-to-image' ? (locale === 'zh' ? 'Web to Image' : 'Web to Image') : (locale === 'zh' ? 'Web to PDF' : 'Web to PDF');
  return {
    '@type': 'SoftwareApplication',
    'name': name,
    'description': locale === 'zh' ? undefined : undefined,
    'applicationCategory': 'BrowserTool',
    'operatingSystem': 'Any',
    'url': baseUrl,
    'author': { '@type': 'Organization', name: 'TableCopy', url: 'https://tablecopy.pro' }
  };
}

function localizePage(page, locale){
  const raw = fs.readFileSync(page.src, 'utf8');
  let html = raw;
  const slug = page.slug;
  const dict = translations[slug] && translations[slug][locale];
  // update html lang attribute
  html = html.replace(/<html[^>]*lang=["'][^"']*["'][^>]*>/i, `<html lang="${locale === 'zh' ? 'zh-CN' : locale}">`);

  if(locale === 'zh'){
    // for zh, we can output original source under zh dir
    return html;
  }

  if(!dict) return html;

  // Replace hero h1 and slogan by finding the hero section h1 and .slogan
  html = html.replace(/(<section class="hero"[\s\S]*?<h1>)([\s\S]*?)(<\/h1>)/i, (m,a,b,c)=> a + dict.hero_h1 + c);
  html = html.replace(/(<section class="hero"[\s\S]*?<h1>[\s\S]*?<h2 class="slogan">)([\s\S]*?)(<\/h2>)/i, (m,a,b,c)=> a + dict.hero_slogan + c);

  // Replace CTA text '立即使用' or similar
  html = html.replace(/(>立即使用<)/g, `>${dict.install_cta}<`);
  html = html.replace(/(>Use Now<)/g, `>${dict.install_cta}<`);

  // Replace section titles (features, about, faq) by matching the Chinese originals or position-based
  html = html.replace(/(<h2 class="section-title">)(功能亮点[\s\S]*?)(<\/h2>)/i, `$1${dict.features_title}$3`);
  html = html.replace(/(<h2 class="section-title">)(关于本工具[\s\S]*?)(<\/h2>)/i, `$1${dict.about_title}$3`);
  html = html.replace(/(<h2 class="section-title">)(常见问题[\s\S]*?)(<\/h2>)/i, `$1${dict.faq_title}$3`);

  // Replace footer
  html = html.replace(/(>© 2025 [^<]*<)/g, `>${dict.footer_p}<`);

  // Replace FAQ block: find <section id="faq"> ... </section> and replace inner content
  const faqRe = /(<section id="faq">[\s\S]*?<div class="container"[\s\S]*?>)([\s\S]*?)(<\/div>\s*<\/section>)/i;
  const match = faqRe.exec(html);
  if(match){
    const faqHtml = buildFaqHtml({ title: dict.faq_title, items: dict.faq });
    const replacement = match[1] + '\n' + faqHtml + '                ' + match[3];
    html = html.replace(faqRe, replacement);
  }

  // Build JSON-LD objects and replace head JSON-LD
  const software = buildSoftwareApplicationObject(slug, locale);
  // add a localized description if available
  if(dict.hero_slogan) software.description = dict.hero_slogan;
  const faqPage = buildFaqPageObject({ items: dict.faq });
  html = replaceHeadJsonLd(html, software, faqPage);

  return html;
}

function writeLocaleFiles(){
  pages.forEach(page => {
    LOCALES.forEach(lang => {
      const outDir = path.join(SRC, lang);
      ensureDir(outDir);
      const localized = localizePage(page, lang);
      const outPath = path.join(outDir, page.name);
      fs.writeFileSync(outPath, localized, 'utf8');
      console.log('Wrote', outPath);
    });
  });
}

function main(){
  writeLocaleFiles();
  console.log('Done. Run validator to confirm generated pages.');
}

main();
