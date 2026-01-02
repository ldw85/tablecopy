/**
 * =============================================================
 * Dark Mode (夜间模式)
 * =============================================================
 *
 * 功能: 为当前页面启用/禁用夜间模式
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
            modal_title: "Dark Mode",
            toggle_on: "Dark Mode: ON",
            toggle_off: "Dark Mode: OFF",
            enabled: "Dark mode enabled",
            disabled: "Dark mode disabled",
            close_button: "Close",
            back_to_tools: "← Back to Tools"
        },
        zh: {
            modal_title: "夜间模式",
            toggle_on: "夜间模式：开启",
            toggle_off: "夜间模式：关闭",
            enabled: "夜间模式已启用",
            disabled: "夜间模式已禁用",
            close_button: "关闭",
            back_to_tools: "← 返回工具箱"
        },
        es: {
            modal_title: "Modo oscuro",
            toggle_on: "Modo oscuro: ON",
            toggle_off: "Modo oscuro: OFF",
            enabled: "Modo oscuro activado",
            disabled: "Modo oscuro desactivado",
            close_button: "Cerrar",
            back_to_tools: "← Volver a Herramientas"
        },
        pt: {
            modal_title: "Modo escuro",
            toggle_on: "Modo escuro: ON",
            toggle_off: "Modo escuro: OFF",
            enabled: "Modo escuro ativado",
            disabled: "Modo escuro desativado",
            close_button: "Fechar",
            back_to_tools: "← Voltar às Ferramentas"
        },
        de: {
            modal_title: "Dunkelmodus",
            toggle_on: "Dunkelmodus: AN",
            toggle_off: "Dunkelmodus: AUS",
            enabled: "Dunkelmodus aktiviert",
            disabled: "Dunkelmodus deaktiviert",
            close_button: "Schließen",
            back_to_tools: "← Zurück zu den Tools"
        },
        fr: {
            modal_title: "Mode sombre",
            toggle_on: "Mode sombre : ON",
            toggle_off: "Mode sombre : OFF",
            enabled: "Mode sombre activé",
            disabled: "Mode sombre désactivé",
            close_button: "Fermer",
            back_to_tools: "← Retour aux Outils"
        },
        ja: {
            modal_title: "ダークモード",
            toggle_on: "ダークモード：オン",
            toggle_off: "ダークモード：オフ",
            enabled: "ダークモードが有効になりました",
            disabled: "ダークモードが無効になりました",
            close_button: "閉じる",
            back_to_tools: "← ツールに戻る"
        },
        ko: {
            modal_title: "다크 모드",
            toggle_on: "다크 모드: 켜짐",
            toggle_off: "다크 모드: 꺼짐",
            enabled: "다크 모드가 활성화되었습니다",
            disabled: "다크 모드가 비활성화되었습니다",
            close_button: "닫기",
            back_to_tools: "← 도구로 돌아가기"
        },
        ru: {
            modal_title: "Темный режим",
            toggle_on: "Темный режим: ВКЛ",
            toggle_off: "Темный режим: ВЫКЛ",
            enabled: "Темный режим включен",
            disabled: "Темный режим выключен",
            close_button: "Закрыть",
            back_to_tools: "← Вернуться к инструментам"
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // 3. CSS前缀
    const CSS_PREFIX = 'dark-';

    // 4. 检查是否已经激活
    const existingStyle = document.getElementById(`${CSS_PREFIX}style`);
    const existingModal = document.getElementById(`${CSS_PREFIX}modal-overlay`);

    if (existingStyle || existingModal) {
        // 如果已激活，则禁用
        if (existingStyle) existingStyle.remove();
        if (existingModal) existingModal.remove();
        return;
    }

    // 5. 样式
    const STYLES = `
        #${CSS_PREFIX}style {
            /* Dark mode styles will be injected here */
        }
        #${CSS_PREFIX}modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 2147483646;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #${CSS_PREFIX}modal {
            background-color: #2C3E50;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            width: 90%;
            max-width: 350px;
            padding: 24px;
            text-align: center;
            color: #ECF0F1;
        }
        #${CSS_PREFIX}modal h3 {
            margin: 0 0 20px 0;
            font-size: 20px;
            font-weight: 600;
        }
        #${CSS_PREFIX}button-container {
            display: flex;
            gap: 12px;
        }
        #${CSS_PREFIX}modal button {
            flex: 1;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        #${CSS_PREFIX}toggle-btn {
            background-color: #E74C3C;
            color: white;
        }
        #${CSS_PREFIX}toggle-btn:hover {
            background-color: #C0392B;
        }
        #${CSS_PREFIX}close-btn {
            background-color: #34495E;
            color: #ECF0F1;
        }
        #${CSS_PREFIX}close-btn:hover {
            background-color: #2C3E50;
        }
    `;

    // 6. 注入样式
    function injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}styles`;
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);
    }

    // 7. 注入夜间模式CSS
    function injectDarkModeCSS() {
        const darkModeCSS = `
            html, body {
                background-color: #1a1a1a !important;
                color: #e0e0e0 !important;
            }
            body, div, p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, article, section, main, aside, nav, footer, header {
                background-color: #1a1a1a !important;
                color: #e0e0e0 !important;
            }
            a {
                color: #5DADE2 !important;
            }
            a:hover {
                color: #3498DB !important;
            }
            img, video, canvas {
                filter: brightness(0.85) contrast(1.1);
            }
            input, textarea, select {
                background-color: #2C3E50 !important;
                color: #ECF0F1 !important;
                border-color: #34495E !important;
            }
            button {
                background-color: #34495E !important;
                color: #ECF0F1 !important;
            }
            code, pre {
                background-color: #2C3E50 !important;
                color: #ECF0F1 !important;
            }
            blockquote {
                border-left-color: #3498DB !important;
                background-color: #2C3E50 !important;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}style`;
        styleSheet.innerText = darkModeCSS;
        document.head.appendChild(styleSheet);
    }

    // 8. 创建模态框
    function createModal() {
        const overlay = document.createElement('div');
        overlay.id = `${CSS_PREFIX}modal-overlay`;

        const modal = document.createElement('div');
        modal.id = `${CSS_PREFIX}modal`;

        // 标题
        const title = document.createElement('h3');
        title.innerText = t('modal_title');
        modal.appendChild(title);

        // 状态消息
        const status = document.createElement('p');
        status.innerText = t('enabled');
        status.style.marginBottom = '20px';
        modal.appendChild(status);

        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.id = `${CSS_PREFIX}button-container`;

        // 返回按钮（如果从工具箱启动）
        if (window.__WEB_TOOLS_ACTIVE__) {
            const backBtn = document.createElement('button');
            backBtn.id = `${CSS_PREFIX}back-btn`;
            backBtn.innerText = t('back_to_tools');
            backBtn.style.backgroundColor = '#27AE60';
            backBtn.style.color = 'white';
            backBtn.addEventListener('click', () => {
                // 移除夜间模式
                const style = document.getElementById(`${CSS_PREFIX}style`);
                const styles = document.getElementById(`${CSS_PREFIX}styles`);
                if (style) style.remove();
                if (styles) styles.remove();
                if (overlay) overlay.remove();

                // 返回工具箱
                if (window.__showWebTools) {
                    window.__showWebTools();
                }
            });
            buttonContainer.appendChild(backBtn);
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.id = `${CSS_PREFIX}toggle-btn`;
        toggleBtn.innerText = t('toggle_off');
        toggleBtn.addEventListener('click', () => {
            // 移除夜间模式
            const style = document.getElementById(`${CSS_PREFIX}style`);
            const styles = document.getElementById(`${CSS_PREFIX}styles`);
            if (style) style.remove();
            if (styles) styles.remove();
            if (overlay) overlay.remove();

            // 如果从工具箱启动，返回工具箱
            if (window.__WEB_TOOLS_ACTIVE__ && window.__showWebTools) {
                window.__showWebTools();
            }
        });

        const closeBtn = document.createElement('button');
        closeBtn.id = `${CSS_PREFIX}close-btn`;
        closeBtn.innerText = t('close_button');
        closeBtn.addEventListener('click', () => {
            // 移除夜间模式
            const style = document.getElementById(`${CSS_PREFIX}style`);
            const styles = document.getElementById(`${CSS_PREFIX}styles`);
            if (style) style.remove();
            if (styles) styles.remove();
            if (overlay) overlay.remove();

            // 如果从工具箱启动，返回工具箱
            if (window.__WEB_TOOLS_ACTIVE__ && window.__showWebTools) {
                window.__showWebTools();
            }
        });

        buttonContainer.appendChild(toggleBtn);
        buttonContainer.appendChild(closeBtn);
        modal.appendChild(buttonContainer);

        overlay.appendChild(modal);

        // 点击背景关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                // 移除夜间模式
                const style = document.getElementById(`${CSS_PREFIX}style`);
                const styles = document.getElementById(`${CSS_PREFIX}styles`);
                if (style) style.remove();
                if (styles) styles.remove();
                if (overlay) overlay.remove();

                // 如果从工具箱启动，返回工具箱
                if (window.__WEB_TOOLS_ACTIVE__ && window.__showWebTools) {
                    window.__showWebTools();
                }
            }
        });

        document.body.appendChild(overlay);

        return overlay;
    }

    // 9. 主函数
    function main() {
        injectStyles();
        injectDarkModeCSS();
        createModal();
    }

    // 10. 启动脚本
    main();

})();
