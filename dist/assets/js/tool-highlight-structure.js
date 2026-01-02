/**
 * =============================================================
 * Highlight Structure (高亮页面结构)
 * =============================================================
 *
 * 功能: 高亮显示页面的所有div和标题元素，便于调试和SEO分析
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
            modal_title: "Page Structure Highlight",
            toggle_on: "Highlighting: ON",
            toggle_off: "Highlighting: OFF",
            enabled: "Structure highlighting enabled",
            disabled: "Structure highlighting disabled",
            close_button: "Close"
        },
        zh: {
            modal_title: "页面结构高亮",
            toggle_on: "高亮：开启",
            toggle_off: "高亮：关闭",
            enabled: "结构高亮已启用",
            disabled: "结构高亮已禁用",
            close_button: "关闭"
        },
        es: {
            modal_title: "Resaltar estructura de página",
            toggle_on: "Resaltado: ON",
            toggle_off: "Resaltado: OFF",
            enabled: "Resaltado de estructura activado",
            disabled: "Resaltado de estructura desactivado",
            close_button: "Cerrar"
        },
        pt: {
            modal_title: "Destaque de estrutura da página",
            toggle_on: "Destaque: ON",
            toggle_off: "Destaque: OFF",
            enabled: "Destaque de estrutura ativado",
            disabled: "Destaque de estrutura desativado",
            close_button: "Fechar"
        },
        de: {
            modal_title: "Seitenstruktur hervorheben",
            toggle_on: "Hervorhebung: AN",
            toggle_off: "Hervorhebung: AUS",
            enabled: "Strukturhervorhebung aktiviert",
            disabled: "Strukturhervorhebung deaktiviert",
            close_button: "Schließen"
        },
        fr: {
            modal_title: "Mise en évidence de la structure de la page",
            toggle_on: "Mise en évidence : ON",
            toggle_off: "Mise en évidence : OFF",
            enabled: "Mise en évidence de la structure activée",
            disabled: "Mise en évidence de la structure désactivée",
            close_button: "Fermer"
        },
        ja: {
            modal_title: "ページ構造のハイライト",
            toggle_on: "ハイライト：オン",
            toggle_off: "ハイライト：オフ",
            enabled: "構造ハイライトが有効になりました",
            disabled: "構造ハイライトが無効になりました",
            close_button: "閉じる"
        },
        ko: {
            modal_title: "페이지 구조 강조",
            toggle_on: "강조: 켜짐",
            toggle_off: "강조: 꺼짐",
            enabled: "구조 강조가 활성화되었습니다",
            disabled: "구조 강조가 비활성화되었습니다",
            close_button: "닫기"
        },
        ru: {
            modal_title: "Подсветка структуры страницы",
            toggle_on: "Подсветка: ВКЛ",
            toggle_off: "Подсветка: ВЫКЛ",
            enabled: "Подсветка структуры включена",
            disabled: "Подсветка структуры выключена",
            close_button: "Закрыть"
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // 3. CSS前缀
    const CSS_PREFIX = 'highlight-';

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
            /* Highlight styles will be injected here */
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
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 350px;
            padding: 24px;
            text-align: center;
        }
        #${CSS_PREFIX}modal h3 {
            margin: 0 0 20px 0;
            font-size: 20px;
            font-weight: 600;
            color: #333;
        }
        #${CSS_PREFIX}legend {
            margin-bottom: 20px;
            padding: 16px;
            background-color: #f9f9f9;
            border-radius: 8px;
            font-size: 13px;
        }
        #${CSS_PREFIX}legend-item {
            display: flex;
            align-items: center;
            margin: 8px 0;
            justify-content: space-between;
        }
        #${CSS_PREFIX}legend-label {
            flex: 1;
            text-align: left;
            padding: 4px 8px;
            border-radius: 4px;
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
            background-color: #E67E22;
            color: white;
        }
        #${CSS_PREFIX}toggle-btn:hover {
            background-color: #D35400;
        }
        #${CSS_PREFIX}close-btn {
            background-color: #ECF0F1;
            color: #333;
        }
        #${CSS_PREFIX}close-btn:hover {
            background-color: #D5DBDB;
        }
    `;

    // 6. 注入样式
    function injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}styles`;
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);
    }

    // 7. 注入高亮CSS
    function injectHighlightCSS() {
        const highlightCSS = `
            div {
                outline: 2px solid #E74C3C !important;
                outline-offset: 1px;
            }
            h1 {
                outline: 3px solid #FF6B6B !important;
                outline-offset: 2px;
                background-color: rgba(255, 107, 107, 0.1) !important;
            }
            h2 {
                outline: 3px solid #FECA57 !important;
                outline-offset: 2px;
                background-color: rgba(254, 202, 87, 0.1) !important;
            }
            h3 {
                outline: 3px solid #48DBFB !important;
                outline-offset: 2px;
                background-color: rgba(72, 219, 251, 0.1) !important;
            }
            h4 {
                outline: 3px solid #1DD1A1 !important;
                outline-offset: 2px;
                background-color: rgba(29, 209, 161, 0.1) !important;
            }
            h5 {
                outline: 3px solid #5F27CD !important;
                outline-offset: 2px;
                background-color: rgba(95, 39, 205, 0.1) !important;
            }
            h6 {
                outline: 3px solid #FF9FF3 !important;
                outline-offset: 2px;
                background-color: rgba(255, 159, 243, 0.1) !important;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}style`;
        styleSheet.innerText = highlightCSS;
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

        // 图例
        const legend = document.createElement('div');
        legend.id = `${CSS_PREFIX}legend`;

        const legendItems = [
            { label: 'DIV elements', color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.1)' },
            { label: 'H1 headings', color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.2)' },
            { label: 'H2 headings', color: '#FECA57', bg: 'rgba(254, 202, 87, 0.2)' },
            { label: 'H3 headings', color: '#48DBFB', bg: 'rgba(72, 219, 251, 0.2)' },
            { label: 'H4 headings', color: '#1DD1A1', bg: 'rgba(29, 209, 161, 0.2)' },
            { label: 'H5 headings', color: '#5F27CD', bg: 'rgba(95, 39, 205, 0.2)' },
            { label: 'H6 headings', color: '#FF9FF3', bg: 'rgba(255, 159, 243, 0.2)' }
        ];

        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.id = `${CSS_PREFIX}legend-item`;

            const legendLabel = document.createElement('div');
            legendLabel.id = `${CSS_PREFIX}legend-label`;
            legendLabel.innerText = item.label;
            legendLabel.style.border = `2px solid ${item.color}`;
            legendLabel.style.backgroundColor = item.bg;

            legendItem.appendChild(legendLabel);
            legend.appendChild(legendItem);
        });

        modal.appendChild(legend);

        // 状态消息
        const status = document.createElement('p');
        status.innerText = t('enabled');
        status.style.marginBottom = '20px';
        status.style.fontWeight = '600';
        modal.appendChild(status);

        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.id = `${CSS_PREFIX}button-container`;

        const toggleBtn = document.createElement('button');
        toggleBtn.id = `${CSS_PREFIX}toggle-btn`;
        toggleBtn.innerText = t('toggle_off');
        toggleBtn.addEventListener('click', () => {
            // 移除高亮
            const style = document.getElementById(`${CSS_PREFIX}style`);
            const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
            if (style) style.remove();
            if (overlay) overlay.remove();
        });

        const closeBtn = document.createElement('button');
        closeBtn.id = `${CSS_PREFIX}close-btn`;
        closeBtn.innerText = t('close_button');
        closeBtn.addEventListener('click', () => overlay.remove());

        buttonContainer.appendChild(toggleBtn);
        buttonContainer.appendChild(closeBtn);
        modal.appendChild(buttonContainer);

        overlay.appendChild(modal);

        // 点击背景关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        document.body.appendChild(overlay);

        return overlay;
    }

    // 9. 主函数
    function main() {
        injectStyles();
        injectHighlightCSS();
        const overlay = createModal();
    }

    // 10. 启动脚本
    main();

})();
