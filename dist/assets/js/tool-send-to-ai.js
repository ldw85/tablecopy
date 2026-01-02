/**
 * =============================================================
 * Send to AI (发送给AI)
 * =============================================================
 *
 * 功能: 将选中的文本发送到AI服务 (ChatGPT, Claude, Perplexity)
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
            alert_select_text: "Please select text first!",
            modal_title: "Choose AI Service",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "Send",
            copy_to_clipboard: "Copy to Clipboard",
            copied_message: "Text copied! Opening AI service...",
            open_button: "Open",
            cancel_button: "Close"
        },
        zh: {
            alert_select_text: "请先选择文本！",
            modal_title: "选择AI服务",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "发送",
            copy_to_clipboard: "复制到剪贴板",
            copied_message: "文本已复制！正在打开AI服务...",
            open_button: "打开",
            cancel_button: "关闭"
        },
        es: {
            alert_select_text: "¡Por favor selecciona texto primero!",
            modal_title: "Elige el servicio de IA",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "Enviar",
            copy_to_clipboard: "Copiar al portapapeles",
            copied_message: "¡Texto copiado! Abriendo servicio de IA...",
            open_button: "Abrir",
            cancel_button: "Cerrar"
        },
        pt: {
            alert_select_text: "Por favor selecione o texto primeiro!",
            modal_title: "Escolha o serviço de IA",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "Enviar",
            copy_to_clipboard: "Copiar para área de transferência",
            copied_message: "Texto copiado! Abrindo serviço de IA...",
            open_button: "Abrir",
            cancel_button: "Fechar"
        },
        de: {
            alert_select_text: "Bitte wählen Sie zuerst Text aus!",
            modal_title: "KI-Dienst auswählen",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "Senden",
            copy_to_clipboard: "In die Zwischenablage kopieren",
            copied_message: "Text kopiert! Öffne KI-Dienst...",
            open_button: "Öffnen",
            cancel_button: "Schließen"
        },
        fr: {
            alert_select_text: "Veuillez d'abord sélectionner du texte!",
            modal_title: "Choisir le service IA",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "Envoyer",
            copy_to_clipboard: "Copier dans le presse-papiers",
            copied_message: "Texte copié! Ouverture du service IA...",
            open_button: "Ouvrir",
            cancel_button: "Fermer"
        },
        ja: {
            alert_select_text: "最初にテキストを選択してください！",
            modal_title: "AIサービスを選択",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "送信",
            copy_to_clipboard: "クリップボードにコピー",
            copied_message: "テキストをコピーしました！AIサービスを開いています...",
            open_button: "開く",
            cancel_button: "閉じる"
        },
        ko: {
            alert_select_text: "먼저 텍스트를 선택하세요!",
            modal_title: "AI 서비스 선택",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "보내기",
            copy_to_clipboard: "클립보드에 복사",
            copied_message: "텍스트가 복사되었습니다! AI 서비스를 여는 중...",
            open_button: "열기",
            cancel_button: "닫기"
        },
        ru: {
            alert_select_text: "Сначала выберите текст!",
            modal_title: "Выберите сервис ИИ",
            chatgpt: "ChatGPT",
            claude: "Claude",
            perplexity: "Perplexity",
            send_button: "Отправить",
            copy_to_clipboard: "Копировать в буфер обмена",
            copied_message: "Текст скопирован! Открытие сервиса ИИ...",
            open_button: "Открыть",
            cancel_button: "Закрыть"
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // 3. CSS前缀
    const CSS_PREFIX = 'stai-';

    // 4. 获取选中的文本
    const selectedText = window.getSelection().toString().trim();

    if (!selectedText) {
        alert(t('alert_select_text'));
        return;
    }

    // 5. 检查是否已经执行过
    if (document.getElementById(`${CSS_PREFIX}modal-overlay`)) {
        return;
    }

    // 6. 样式
    const STYLES = `
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
            max-width: 450px;
            padding: 28px;
            text-align: center;
        }
        #${CSS_PREFIX}modal h3 {
            margin: 0 0 24px 0;
            font-size: 22px;
            color: #333;
            font-weight: 600;
        }
        #${CSS_PREFIX}text-preview {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 24px;
            font-size: 13px;
            color: #666;
            max-height: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }
        #${CSS_PREFIX}button-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 12px;
        }
        #${CSS_PREFIX}modal button {
            padding: 16px 12px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        #${CSS_PREFIX}chatgpt-btn {
            background-color: #10A37F;
            color: white;
        }
        #${CSS_PREFIX}chatgpt-btn:hover {
            background-color: #0D8B6A;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
        }
        #${CSS_PREFIX}claude-btn {
            background-color: #CC785C;
            color: white;
        }
        #${CSS_PREFIX}claude-btn:hover {
            background-color: #B2674D;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(204, 120, 92, 0.3);
        }
        #${CSS_PREFIX}perplexity-btn {
            background-color: #26BB6C;
            color: white;
        }
        #${CSS_PREFIX}perplexity-btn:hover {
            background-color: #20A35C;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(38, 187, 108, 0.3);
        }
        #${CSS_PREFIX}close-btn {
            background-color: #ECF0F1;
            color: #333;
            margin-top: 8px;
            width: 100%;
        }
        #${CSS_PREFIX}close-btn:hover {
            background-color: #D5DBDB;
        }
        #${CSS_PREFIX}notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #27AE60;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 2147483647;
            font-size: 14px;
            font-weight: 500;
            animation: ${CSS_PREFIX}slideIn 0.3s ease-out;
        }
        @keyframes ${CSS_PREFIX}slideIn {
            from {
                transform: translateX(-50%) translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
    `;

    // 7. 注入样式
    function injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}styles`;
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);
    }

    // 8. 复制到剪贴板
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text:', err);
            return false;
        }
    }

    // 9. 显示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.id = `${CSS_PREFIX}notification`;
        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    // 10. 处理AI服务
    async function handleAIService(service) {
        const urls = {
            chatgpt: 'https://chat.openai.com/',
            claude: 'https://claude.ai/',
            perplexity: 'https://www.perplexity.ai/'
        };

        // 复制文本到剪贴板
        const success = await copyToClipboard(selectedText);

        if (success) {
            showNotification(t('copied_message'));
        }

        // 延迟一小段时间后打开AI服务
        setTimeout(() => {
            window.open(urls[service], '_blank');
        }, 500);

        // 关闭模态框
        const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        if (overlay) overlay.remove();
    }

    // 11. 创建模态框
    function createModal() {
        const overlay = document.createElement('div');
        overlay.id = `${CSS_PREFIX}modal-overlay`;

        const modal = document.createElement('div');
        modal.id = `${CSS_PREFIX}modal`;

        // 标题
        const title = document.createElement('h3');
        title.innerText = t('modal_title');
        modal.appendChild(title);

        // 文本预览
        const preview = document.createElement('div');
        preview.id = `${CSS_PREFIX}text-preview`;
        preview.innerText = selectedText;
        modal.appendChild(preview);

        // 按钮网格
        const buttonGrid = document.createElement('div');
        buttonGrid.id = `${CSS_PREFIX}button-grid`;

        const chatgptBtn = document.createElement('button');
        chatgptBtn.id = `${CSS_PREFIX}chatgpt-btn`;
        chatgptBtn.innerHTML = `<div style="font-size: 20px;">🤖</div><div>${t('chatgpt')}</div>`;
        chatgptBtn.addEventListener('click', () => handleAIService('chatgpt'));

        const claudeBtn = document.createElement('button');
        claudeBtn.id = `${CSS_PREFIX}claude-btn`;
        claudeBtn.innerHTML = `<div style="font-size: 20px;">🧠</div><div>${t('claude')}</div>`;
        claudeBtn.addEventListener('click', () => handleAIService('claude'));

        const perplexityBtn = document.createElement('button');
        perplexityBtn.id = `${CSS_PREFIX}perplexity-btn`;
        perplexityBtn.innerHTML = `<div style="font-size: 20px;">🔍</div><div>${t('perplexity')}</div>`;
        perplexityBtn.addEventListener('click', () => handleAIService('perplexity'));

        buttonGrid.appendChild(chatgptBtn);
        buttonGrid.appendChild(claudeBtn);
        buttonGrid.appendChild(perplexityBtn);
        modal.appendChild(buttonGrid);

        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.id = `${CSS_PREFIX}close-btn`;
        closeBtn.innerText = t('cancel_button');
        closeBtn.addEventListener('click', () => overlay.remove());
        modal.appendChild(closeBtn);

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

    // 12. 主函数
    function main() {
        injectStyles();
        const overlay = createModal();
    }

    // 13. 启动脚本
    main();

})();
