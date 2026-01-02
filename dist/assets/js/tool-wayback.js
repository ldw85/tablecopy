/**
 * =============================================================
 * Wayback Machine (查看网页历史)
 * =============================================================
 *
 * 功能: 在Internet Archive Wayback Machine中查看当前页面的历史版本
 *
 * 版本: 1.0
 */
(function() {

    // 1. 语言检测
    const lang = (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
    const validLangs = ['zh', 'en', 'es', 'pt', 'de', 'fr', 'ja', 'ko', 'ru'];
    const detectedLang = validLangs.includes(lang) ? lang : 'en';

    // 2. 翻译 (仅包含检测到的语言)
    const translations = {
        en: {
            redirecting: "Opening Wayback Machine..."
        },
        zh: {
            redirecting: "正在打开 Wayback Machine..."
        },
        es: {
            redirecting: "Abriendo Wayback Machine..."
        },
        pt: {
            redirecting: "Abrindo Wayback Machine..."
        },
        de: {
            redirecting: "Wayback Machine wird geöffnet..."
        },
        fr: {
            redirecting: "Ouverture de Wayback Machine..."
        },
        ja: {
            redirecting: "Wayback Machineを開いています..."
        },
        ko: {
            redirecting: "Wayback Machine 열기..."
        },
        ru: {
            redirecting: "Открытие Wayback Machine..."
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // 3. CSS前缀
    const CSS_PREFIX = 'wayback-';

    // 4. 显示重定向消息
    function showRedirectMessage() {
        const STYLES = `
            #${CSS_PREFIX}message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 24px 32px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-align: center;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}style`;
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);

        const message = document.createElement('div');
        message.id = `${CSS_PREFIX}message`;
        message.innerHTML = `
            <div style="margin-bottom: 12px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: ${CSS_PREFIX}spin 1s linear infinite;">
                    <circle cx="12" cy="12" r="10" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/>
                </svg>
            </div>
            <div>${t('redirecting')}</div>
        `;
        message.innerHTML += `
            <style>
                @keyframes ${CSS_PREFIX}spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(message);
    }

    // 5. 主函数
    function main() {
        showRedirectMessage();

        // 构建Wayback Machine URL
        const currentUrl = window.location.href;
        const waybackUrl = `https://web.archive.org/web/*/${currentUrl}`;

        // 延迟一小段时间后跳转，让用户看到消息
        setTimeout(() => {
            window.location.href = waybackUrl;
        }, 500);
    }

    // 6. 启动脚本
    main();

})();
