/**
 * =============================================================
 * Web Translator (网页翻译)
 * =============================================================
 *
 * 功能: 使用Google Translate翻译当前网页
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
            redirecting: "Redirecting to Google Translate..."
        },
        zh: {
            redirecting: "正在跳转到谷歌翻译..."
        },
        es: {
            redirecting: "Redirigiendo a Google Translate..."
        },
        pt: {
            redirecting: "Redirecionando para o Google Translate..."
        },
        de: {
            redirecting: "Weiterleitung zu Google Translate..."
        },
        fr: {
            redirecting: "Redirection vers Google Translate..."
        },
        ja: {
            redirecting: "Google Translateにリダイレクト中..."
        },
        ko: {
            redirecting: "Google Translate로 리디렉션..."
        },
        ru: {
            redirecting: "Перенаправление на Google Translate..."
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // 3. CSS前缀
    const CSS_PREFIX = 'trans-';

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

        // 构建Google Translate URL
        const currentUrl = encodeURIComponent(window.location.href);
        const targetLang = detectedLang;
        const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${currentUrl}`;

        // 延迟一小段时间后跳转，让用户看到消息
        setTimeout(() => {
            window.location.href = translateUrl;
        }, 500);
    }

    // 6. 启动脚本
    main();

})();
