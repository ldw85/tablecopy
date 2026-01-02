/**
 * =============================================================
 * Enable Copy (解除复制限制)
 * =============================================================
 *
 * 功能: 移除网页的右键、选择、复制限制
 * 清除事件监听器，恢复用户的复制权限
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
            success_message: "Copy restrictions removed! You can now select and copy text."
        },
        zh: {
            success_message: "复制限制已解除！现在可以选择和复制文本。"
        },
        es: {
            success_message: "¡Restricciones de copia eliminadas! Ahora puedes seleccionar y copiar texto."
        },
        pt: {
            success_message: "Restrições de cópia removidas! Agora você pode selecionar e copiar texto."
        },
        de: {
            success_message: "Kopiereinschränkungen entfernt! Sie können jetzt Text auswählen und kopieren."
        },
        fr: {
            success_message: "Restrictions de copie supprimées! Vous pouvez maintenant sélectionner et copier du texte."
        },
        ja: {
            success_message: "コピー制限が解除されました！テキストを選択してコピーできます。"
        },
        ko: {
            success_message: "복사 제한이 제거되었습니다! 이제 텍스트를 선택하고 복사할 수 있습니다."
        },
        ru: {
            success_message: "Ограничения на копирование сняты! Теперь вы можете выделять и копировать текст."
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // 3. CSS前缀
    const CSS_PREFIX = 'ecopy-';

    // 4. 检查是否已经执行过
    if (document.getElementById(`${CSS_PREFIX}style`)) {
        // 如果已经执行过，直接显示成功消息
        showNotification(t('success_message'));
        return;
    }

    // 5. 注入样式（用于通知）
    const STYLES = `
        #${CSS_PREFIX}notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2ECC71;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: ${CSS_PREFIX}slideIn 0.3s ease-out;
        }
        @keyframes ${CSS_PREFIX}slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes ${CSS_PREFIX}fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;

    function injectStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}style`;
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);
    }

    // 6. 显示通知
    function showNotification(message) {
        // 移除旧通知（如果存在）
        const oldNotification = document.getElementById(`${CSS_PREFIX}notification`);
        if (oldNotification) {
            oldNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = `${CSS_PREFIX}notification`;
        notification.innerText = message;
        document.body.appendChild(notification);

        // 3秒后淡出并移除
        setTimeout(() => {
            notification.style.animation = `${CSS_PREFIX}fadeOut 0.3s ease-out`;
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // 7. 清除复制限制
    function removeCopyRestrictions() {
        // 清除内联事件处理器
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            el.oncopy = null;
            el.oncut = null;
            el.onpaste = null;
            el.onselectstart = null;
            el.oncontextmenu = null;
            el.onmousedown = null;
            el.onmouseup = null;
            el.onkeydown = null;
        });

        // 覆盖常见的事件阻止方法
        const events = ['copy', 'cut', 'paste', 'selectstart', 'contextmenu', 'mousedown', 'mouseup', 'keydown'];
        events.forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.stopPropagation();
            }, true);
        });

        // 移除可能的user-select CSS限制
        const style = document.createElement('style');
        style.id = `${CSS_PREFIX}user-select-style`;
        style.innerText = `
            * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 8. 主函数
    function main() {
        injectStyles();
        removeCopyRestrictions();
        showNotification(t('success_message'));
    }

    // 9. 启动脚本
    main();

})();
