/**
 * =============================================================
 * Unified Web Tools Toolbox
 * =============================================================
 *
 * A unified toolbox for 10 essential browser tools.
 * Tools are organized into two categories:
 * - Web Tools (5 tools): Enable Copy, Highlight, etc.
 * - Web Converters (5 tools): PDF, Image, Word, Markdown, Text
 *
 * Version: 2.0
 */

(function() {

    // ============================================
    // 0. Check if already running
    // ============================================
    if (document.getElementById('webtools-modal-style')) {
        return;
    }

    // ============================================
    // 1. Language Detection
    // ============================================
    const lang = (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
    const validLangs = ['zh', 'en', 'es', 'pt', 'de', 'fr', 'ja', 'ko', 'ru'];
    const detectedLang = validLangs.includes(lang) ? lang : 'en';

    // ============================================
    // 2. Translations
    // ============================================
    const translations = {
        en: {
            modal_title: "Web Tools",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "Web Tools",
            category_converters: "Web Converters",
            tool_enable_copy: "Enable Copy",
            tool_highlight_structure: "Highlight Structure",
            tool_image_downloader: "Image Downloader",
            tool_video_downloader: "Video Downloader",
            tool_qr_code: "QR Code",
            tool_wayback: "Wayback Machine",
            tool_pdf: "Save as PDF",
            tool_image: "Save as Image",
            tool_word: "Save as Word",
            tool_markdown: "Save as Markdown",
            tool_text: "Save as Text",
            loading_tool: "Loading tool...",
            error_loading: "Failed to load tool. Please try again."
        },
        zh: {
            modal_title: "网页工具",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "网页工具",
            category_converters: "转换工具",
            tool_enable_copy: "解除复制限制",
            tool_highlight_structure: "结构高亮",
            tool_image_downloader: "图片下载器",
            tool_video_downloader: "视频下载器",
            tool_qr_code: "二维码生成",
            tool_wayback: "时光机",
            tool_pdf: "保存为PDF",
            tool_image: "保存为图片",
            tool_word: "保存为Word",
            tool_markdown: "保存为Markdown",
            tool_text: "保存为纯文本",
            loading_tool: "正在加载工具...",
            error_loading: "工具加载失败，请重试。"
        },
        es: {
            modal_title: "Herramientas Web",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "Herramientas Web",
            category_converters: "Conversores",
            tool_enable_copy: "Habilitar Copiar",
            tool_highlight_structure: "Resaltar Estructura",
            tool_image_downloader: "Descargador de Imágenes",
            tool_video_downloader: "Descargador de Videos",
            tool_qr_code: "Código QR",
            tool_wayback: "Máquina del Tiempo",
            tool_pdf: "Guardar como PDF",
            tool_image: "Guardar como Imagen",
            tool_word: "Guardar como Word",
            tool_markdown: "Guardar como Markdown",
            tool_text: "Guardar como Texto",
            loading_tool: "Cargando herramienta...",
            error_loading: "Error al cargar la herramienta. Inténtelo de nuevo."
        },
        pt: {
            modal_title: "Ferramentas Web",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "Ferramentas Web",
            category_converters: "Conversores",
            tool_enable_copy: "Permitir Copiar",
            tool_highlight_structure: "Destacar Estrutura",
            tool_image_downloader: "Baixador de Imagens",
            tool_video_downloader: "Baixador de Vídeos",
            tool_qr_code: "Código QR",
            tool_wayback: "Máquina do Tempo",
            tool_pdf: "Salvar como PDF",
            tool_image: "Salvar como Imagem",
            tool_word: "Salvar como Word",
            tool_markdown: "Salvar como Markdown",
            tool_text: "Salvar como Texto",
            loading_tool: "Carregando ferramenta...",
            error_loading: "Falha ao carregar ferramenta. Tente novamente."
        },
        de: {
            modal_title: "Web-Tools",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "Web-Tools",
            category_converters: "Konverter",
            tool_enable_copy: "Kopieren Aktivieren",
            tool_highlight_structure: "Struktur Hervorheben",
            tool_image_downloader: "Bild-Downloader",
            tool_video_downloader: "Video-Downloader",
            tool_qr_code: "QR-Code",
            tool_wayback: "Zeitmaschine",
            tool_pdf: "Als PDF speichern",
            tool_image: "Als Bild speichern",
            tool_word: "Als Word speichern",
            tool_markdown: "Als Markdown speichern",
            tool_text: "Als Text speichern",
            loading_tool: "Tool wird geladen...",
            error_loading: "Tool konnte nicht geladen werden. Bitte versuchen Sie es erneut."
        },
        fr: {
            modal_title: "Outils Web",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "Outils Web",
            category_converters: "Convertisseurs",
            tool_enable_copy: "Activer la Copie",
            tool_highlight_structure: "Mettre en Structure",
            tool_image_downloader: "Téléchargeur d'Images",
            tool_video_downloader: "Téléchargeur de Vidéos",
            tool_qr_code: "Code QR",
            tool_wayback: "Machine à Remonter le Temps",
            tool_pdf: "Enregistrer en PDF",
            tool_image: "Enregistrer en Image",
            tool_word: "Enregistrer en Word",
            tool_markdown: "Enregistrer en Markdown",
            tool_text: "Enregistrer en Texte",
            loading_tool: "Chargement de l'outil...",
            error_loading: "Échec du chargement de l'outil. Veuillez réessayer."
        },
        ja: {
            modal_title: "ウェブツール",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "ウェブツール",
            category_converters: "コンバーター",
            tool_enable_copy: "コピーを有効にする",
            tool_highlight_structure: "構造のハイライト",
            tool_image_downloader: "画像ダウンローダー",
            tool_video_downloader: "動画ダウンローダー",
            tool_qr_code: "QRコード",
            tool_wayback: "ウェイバックマシン",
            tool_pdf: "PDFとして保存",
            tool_image: "画像として保存",
            tool_word: "Wordとして保存",
            tool_markdown: "Markdownとして保存",
            tool_text: "テキストとして保存",
            loading_tool: "ツールを読み込み中...",
            error_loading: "ツールの読み込みに失敗しました。もう一度お試しください。"
        },
        ko: {
            modal_title: "웹 도구",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "웹 도구",
            category_converters: "변환기",
            tool_enable_copy: "복사 활성화",
            tool_highlight_structure: "구조 강조",
            tool_image_downloader: "이미지 다운로더",
            tool_video_downloader: "비디오 다운로더",
            tool_qr_code: "QR 코드",
            tool_wayback: "웨이백 머신",
            tool_pdf: "PDF로 저장",
            tool_image: "이미지로 저장",
            tool_word: "Word로 저장",
            tool_markdown: "Markdown로 저장",
            tool_text: "텍스트로 저장",
            loading_tool: "도구 로드 중...",
            error_loading: "도구 로드 실패. 다시 시도해 주세요."
        },
        ru: {
            modal_title: "Веб-инструменты",
            close_button: "×",
            footer_logo: "TableCopy.pro",
            category_tools: "Веб-инструменты",
            category_converters: "Конвертеры",
            tool_enable_copy: "Разрешить копирование",
            tool_highlight_structure: "Выделить структуру",
            tool_image_downloader: "Загрузчик изображений",
            tool_video_downloader: "Загрузчик видео",
            tool_qr_code: "QR-код",
            tool_wayback: "Машина времени",
            tool_pdf: "Сохранить как PDF",
            tool_image: "Сохранить как изображение",
            tool_word: "Сохранить как Word",
            tool_markdown: "Сохранить как Markdown",
            tool_text: "Сохранить как текст",
            loading_tool: "Загрузка инструмента...",
            error_loading: "Не удалось загрузить инструмент. Попробуйте снова."
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // ============================================
    // 3. Tool Registry
    // ============================================
    const TOOL_REGISTRY = {
        // Web Tools (5 tools)
        'enable-copy': {
            id: 'enable-copy',
            script: '/assets/js/tool-enable-copy.js',
            cssPrefix: 'ecopy-',
            name: t('tool_enable_copy'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
            color: '#2ECC71',
            category: 'tools'
        },
        'highlight-structure': {
            id: 'highlight-structure',
            script: '/assets/js/tool-highlight-structure.js',
            cssPrefix: 'highlight-',
            name: t('tool_highlight_structure'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
            color: '#E67E22',
            category: 'tools'
        },
        'image-downloader': {
            id: 'image-downloader',
            script: '/assets/js/tool-image-downloader.js',
            cssPrefix: 'imgdl-',
            name: t('tool_image_downloader'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,
            color: '#9B59B6',
            category: 'tools'
        },
        'video-downloader': {
            id: 'video-downloader',
            script: '/assets/js/tool-video-downloader.js',
            cssPrefix: 'viddl-',
            name: t('tool_video_downloader'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>`,
            color: '#9B59B6',
            category: 'tools'
        },
        'wayback': {
            id: 'wayback',
            script: '/assets/js/tool-wayback.js',
            cssPrefix: 'wayback-',
            name: t('tool_wayback'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>`,
            color: '#A0522D',
            category: 'tools'
        },
        'qr-code': {
            id: 'qr-code',
            script: '/assets/js/tool-qr-code.js',
            cssPrefix: 'qr-',
            name: t('tool_qr_code'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h3v2h-3v-2zm-6 3h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h3v2h-3v-2z"/></svg>`,
            color: '#1ABC9C',
            category: 'tools'
        },
        // Web Converters (5 tools)
        'converter-pdf': {
            id: 'converter-pdf',
            script: '/assets/js/web-converter.js',
            converterType: 'pdf',
            name: t('tool_pdf'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9.5 11.5c0 .83-.67 1.5-1.5 1.5H7v2H5.5V9H8c.83 0 1.5.67 1.5 1.5v1zm-1.5-1H7v1h1v-1zm7 3.5H15v-1h-1.5v-1H15v-1h-2.5V9h4v6h-1.5zm-5-3.5c0-.83.67-1.5 1.5-1.5h2.5v6H13V9h-1.5c-.83 0-1.5.67-1.5 1.5v4h-1.5V9h1.5v2.5zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"></path></svg>`,
            color: '#D9534F',
            category: 'converters'
        },
        'converter-image': {
            id: 'converter-image',
            script: '/assets/js/web-converter.js',
            converterType: 'image',
            name: t('tool_image'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>`,
            color: '#5CB85C',
            category: 'converters'
        },
        'converter-word': {
            id: 'converter-word',
            script: '/assets/js/web-converter.js',
            converterType: 'word',
            name: t('tool_word'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm8 7h-2v8h2v-8zm-4 0H8v8h2v-8zm8-6.17L19.17 8H18V2.83z"></path></svg>`,
            color: '#2B579A',
            category: 'converters'
        },
        'converter-markdown': {
            id: 'converter-markdown',
            script: '/assets/js/web-converter.js',
            converterType: 'markdown',
            name: t('tool_markdown'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.56 15.2c.29-.29.44-.68.44-1.07v-4.26c0-.39-.15-.78-.44-1.07l-2.13-2.13c-.29-.29-.68-.44-1.07-.44H6.63c-.79 0-1.44.65-1.44 1.44v8.58c0 .79.65 1.44 1.44 1.44h12.86c.39 0 .78-.15 1.07-.44l.01-.01zm-3.5-4.52H15.5v3.5h-1.5v-3.5h-1.56L15 8.1l2.56 2.58zM9.5 14H8v-4h1.5v4zm3.5 0h-1.5V8.5H13v5.5z"></path></svg>`,
            color: '#333',
            category: 'converters'
        },
        'converter-text': {
            id: 'converter-text',
            script: '/assets/js/web-converter.js',
            converterType: 'text',
            name: t('tool_text'),
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path></svg>`,
            color: '#17A2B8',
            category: 'converters'
        }
    };

    // ============================================
    // 4. Tool Loader
    // ============================================
    const loadedScripts = new Set();
    const loadingPromises = new Map();

    function loadToolScript(toolId) {
        const tool = TOOL_REGISTRY[toolId];

        if (!tool) {
            return Promise.reject(new Error(`Tool not found: ${toolId}`));
        }

        if (loadedScripts.has(toolId)) {
            return Promise.resolve(true);
        }

        if (loadingPromises.has(toolId)) {
            return loadingPromises.get(toolId);
        }

        const loadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = tool.script;

            script.onload = () => {
                loadedScripts.add(toolId);
                loadingPromises.delete(toolId);
                resolve(true);
            };

            script.onerror = () => {
                loadingPromises.delete(toolId);
                reject(new Error(`Failed to load script: ${tool.script}`));
            };

            document.head.appendChild(script);
        });

        loadingPromises.set(toolId, loadPromise);
        return loadPromise;
    }

    // ============================================
    // 5. CSS Styles
    // ============================================
    const CSS_PREFIX = 'webtools-';
    const STYLES = `
        #${CSS_PREFIX}modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 2147483646;
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #${CSS_PREFIX}modal {
            background: #fff;
            position: relative;
            padding: 24px 28px 20px 28px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 680px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        #${CSS_PREFIX}modal h3 {
            margin-top: 0;
            margin-bottom: 20px;
            color: #333;
            font-size: 22px;
            font-weight: 600;
        }
        #${CSS_PREFIX}modal .tool-section {
            margin-bottom: 24px;
        }
        #${CSS_PREFIX}modal .section-header {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #${CSS_PREFIX}modal .section-header.tools-section {
            color: #9B59B6;
            border-color: #9B59B6;
        }
        #${CSS_PREFIX}modal .section-header.converters-section {
            color: #28a745;
            border-color: #28a745;
        }
        #${CSS_PREFIX}modal .button-container {
            display: grid;
            gap: 12px;
        }
        #${CSS_PREFIX}modal .tools-section .button-container {
            grid-template-columns: repeat(3, 1fr);
        }
        #${CSS_PREFIX}modal .converters-section .button-container {
            grid-template-columns: repeat(5, 1fr);
        }
        @media (max-width: 768px) {
            #${CSS_PREFIX}modal .tools-section .button-container,
            #${CSS_PREFIX}modal .converters-section .button-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        #${CSS_PREFIX}modal button.tool-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 85px;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            color: #333;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        #${CSS_PREFIX}modal button.tool-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: #dee2e6;
            background-color: #e9ecef;
        }
        #${CSS_PREFIX}modal button.tool-button svg {
            width: 26px;
            height: 26px;
            margin-bottom: 6px;
        }
        #${CSS_PREFIX}close {
            position: absolute;
            top: 10px; right: 10px;
            width: 28px; height: 28px;
            background: none; border: none;
            color: #888;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s, color 0.2s;
        }
        #${CSS_PREFIX}close:hover {
            color: #333;
            background-color: #f0f2f5;
        }
        #${CSS_PREFIX}footer {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #e9ecef;
        }
        #${CSS_PREFIX}logo {
            font-size: 13px;
            font-weight: bold;
            color: #adb5bd;
            text-decoration: none;
        }
    `;

    // ============================================
    // 6. Modal HTML
    // ============================================
    const MODAL_HTML = `
        <div id="${CSS_PREFIX}modal">
            <button id="${CSS_PREFIX}close" title="Close">${t('close_button')}</button>
            <h3>${t('modal_title')}</h3>

            <div class="tool-section tools-section">
                <div class="section-header tools-section">
                    <span>${t('category_tools')}</span>
                </div>
                <div class="button-container">
                    <button class="tool-button" data-tool="enable-copy">
                        ${TOOL_REGISTRY['enable-copy'].icon}
                        <span>${TOOL_REGISTRY['enable-copy'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="highlight-structure">
                        ${TOOL_REGISTRY['highlight-structure'].icon}
                        <span>${TOOL_REGISTRY['highlight-structure'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="image-downloader">
                        ${TOOL_REGISTRY['image-downloader'].icon}
                        <span>${TOOL_REGISTRY['image-downloader'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="video-downloader">
                        ${TOOL_REGISTRY['video-downloader'].icon}
                        <span>${TOOL_REGISTRY['video-downloader'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="wayback">
                        ${TOOL_REGISTRY['wayback'].icon}
                        <span>${TOOL_REGISTRY['wayback'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="qr-code">
                        ${TOOL_REGISTRY['qr-code'].icon}
                        <span>${TOOL_REGISTRY['qr-code'].name}</span>
                    </button>
                </div>
            </div>

            <div class="tool-section converters-section">
                <div class="section-header converters-section">
                    <span>${t('category_converters')}</span>
                </div>
                <div class="button-container">
                    <button class="tool-button" data-tool="converter-pdf">
                        ${TOOL_REGISTRY['converter-pdf'].icon}
                        <span>${TOOL_REGISTRY['converter-pdf'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="converter-image">
                        ${TOOL_REGISTRY['converter-image'].icon}
                        <span>${TOOL_REGISTRY['converter-image'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="converter-word">
                        ${TOOL_REGISTRY['converter-word'].icon}
                        <span>${TOOL_REGISTRY['converter-word'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="converter-markdown">
                        ${TOOL_REGISTRY['converter-markdown'].icon}
                        <span>${TOOL_REGISTRY['converter-markdown'].name}</span>
                    </button>
                    <button class="tool-button" data-tool="converter-text">
                        ${TOOL_REGISTRY['converter-text'].icon}
                        <span>${TOOL_REGISTRY['converter-text'].name}</span>
                    </button>
                </div>
            </div>

            <div id="${CSS_PREFIX}footer">
                <a href="https://tablecopy.pro" target="_blank" id="${CSS_PREFIX}logo">${t('footer_logo')}</a>
            </div>
        </div>
    `;

    // ============================================
    // 7. UI Injection
    // ============================================
    function injectUI() {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'webtools-unified-style';
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);

        const overlay = document.createElement('div');
        overlay.id = `${CSS_PREFIX}modal-overlay`;
        overlay.innerHTML = MODAL_HTML;
        document.body.appendChild(overlay);

        return overlay;
    }

    // ============================================
    // 8. Tool Launch Function
    // ============================================
    async function launchTool(toolId) {
        const toolboxModal = document.getElementById(`${CSS_PREFIX}modal-overlay`);

        if (!toolboxModal) {
            console.error('Web Tools modal not found');
            return;
        }

        // Hide toolbox
        toolboxModal.style.display = 'none';

        const tool = TOOL_REGISTRY[toolId];

        // Check if it's a converter tool
        if (tool.category === 'converters') {
            // Load web-converter.js and trigger the specific converter
            try {
                await loadToolScript(toolId);
                // The converter modal will show automatically
                // Store toolbox ref to restore later
                window.__WEB_TOOLBOX_REF__ = toolboxModal;
            } catch (error) {
                console.error('Failed to launch converter:', error);
                toolboxModal.style.display = 'flex';
                alert(t('error_loading'));
            }
        } else {
            // Set global flag for tools to check
            window.__WEB_TOOLS_ACTIVE__ = true;

            try {
                // Load and execute tool
                await loadToolScript(toolId);

                // Tool will show its own modal
            } catch (error) {
                console.error('Failed to launch tool:', error);

                // Show toolbox again on error
                toolboxModal.style.display = 'flex';
                window.__WEB_TOOLS_ACTIVE__ = false;

                alert(t('error_loading'));
            }
        }
    }

    // Global function for "Back to Tools" button
    window.__showWebTools = function() {
        const toolboxModal = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        if (toolboxModal) {
            toolboxModal.style.display = 'flex';
        }
        window.__WEB_TOOLS_ACTIVE__ = false;
    };

    // ============================================
    // 9. Cleanup Function
    // ============================================
    function cleanup() {
        const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        const style = document.getElementById('webtools-unified-style');
        if (overlay) document.body.removeChild(overlay);
        if (style) document.head.removeChild(style);
        window.__WEB_TOOLS_ACTIVE__ = false;
    }

    // ============================================
    // 10. Initialize
    // ============================================
    function init() {
        const overlay = injectUI();

        // Tool button clicks
        overlay.querySelectorAll('button.tool-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const toolId = e.currentTarget.getAttribute('data-tool');

                // Handle converter buttons specially
                if (toolId.startsWith('converter-')) {
                    const tool = TOOL_REGISTRY[toolId];
                    // Store converter type globally for web-converter.js to pick up
                    window.__WEB_CONVERTER_TYPE__ = tool.converterType;

                    // Load converter script
                    const script = document.createElement('script');
                    script.src = tool.script;
                    script.onload = () => {
                        // Hide toolbox
                        overlay.style.display = 'none';
                        window.__WEB_TOOLBOX_REF__ = overlay;

                        // Trigger the specific converter function
                        const converterFuncMap = {
                            'pdf': 'saveAsPdf',
                            'image': 'saveAsImage',
                            'word': 'saveAsWord',
                            'markdown': 'saveAsMarkdown',
                            'text': 'saveAsText'
                        };
                        const funcName = converterFuncMap[tool.converterType];

                        // The web-converter.js needs to be modified to support this
                        // For now, the converter modal will show and user can click the button
                    };
                    script.onerror = () => {
                        alert(t('error_loading'));
                        overlay.style.display = 'flex';
                    };
                    document.head.appendChild(script);
                } else {
                    launchTool(toolId);
                }
            });
        });

        // Close button
        document.getElementById(`${CSS_PREFIX}close`).addEventListener('click', cleanup);

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target.id === `${CSS_PREFIX}modal-overlay`) {
                cleanup();
            }
        });
    }

    // Start the toolbox
    init();

})();
