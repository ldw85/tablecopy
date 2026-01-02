/**
 * =============================================================
 * QR Code Generator (二维码生成器)
 * =============================================================
 *
 * 功能: 为当前页面URL生成二维码
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
            modal_title: "QR Code for Current Page",
            download_button: "Download PNG",
            close_button: "Close",
            generating: "Generating QR code...",
            success: "QR code generated!",
            error: "Failed to generate QR code"
        },
        zh: {
            modal_title: "当前页面的二维码",
            download_button: "下载PNG",
            close_button: "关闭",
            generating: "正在生成二维码...",
            success: "二维码已生成！",
            error: "生成二维码失败"
        },
        es: {
            modal_title: "Código QR de la página actual",
            download_button: "Descargar PNG",
            close_button: "Cerrar",
            generating: "Generando código QR...",
            success: "¡Código QR generado!",
            error: "Error al generar código QR"
        },
        pt: {
            modal_title: "Código QR da página atual",
            download_button: "Baixar PNG",
            close_button: "Fechar",
            generating: "Gerando código QR...",
            success: "Código QR gerado!",
            error: "Falha ao gerar código QR"
        },
        de: {
            modal_title: "QR-Code für aktuelle Seite",
            download_button: "PNG herunterladen",
            close_button: "Schließen",
            generating: "QR-Code wird generiert...",
            success: "QR-Code generiert!",
            error: "QR-Code konnte nicht generiert werden"
        },
        fr: {
            modal_title: "QR Code pour la page actuelle",
            download_button: "Télécharger PNG",
            close_button: "Fermer",
            generating: "Génération du code QR...",
            success: "Code QR généré!",
            error: "Échec de la génération du code QR"
        },
        ja: {
            modal_title: "現在のページのQRコード",
            download_button: "PNGをダウンロード",
            close_button: "閉じる",
            generating: "QRコードを生成中...",
            success: "QRコードが生成されました！",
            error: "QRコードの生成に失敗しました"
        },
        ko: {
            modal_title: "현재 페이지의 QR 코드",
            download_button: "PNG 다운로드",
            close_button: "닫기",
            generating: "QR 코드 생성 중...",
            success: "QR 코드가 생성되었습니다!",
            error: "QR 코드 생성 실패"
        },
        ru: {
            modal_title: "QR-код для текущей страницы",
            download_button: "Скачать PNG",
            close_button: "Закрыть",
            generating: "Создание QR-кода...",
            success: "QR-код создан!",
            error: "Не удалось создать QR-код"
        }
    };

    const t = (key) => translations[detectedLang][key] || translations['en'][key];

    // 3. CSS前缀
    const CSS_PREFIX = 'qr-';

    // 4. 检查是否已经执行过
    if (document.getElementById(`${CSS_PREFIX}modal-overlay`)) {
        return;
    }

    // 5. 样式
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
            max-width: 400px;
            padding: 24px;
            text-align: center;
        }
        #${CSS_PREFIX}modal h3 {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #333;
            font-weight: 600;
        }
        #${CSS_PREFIX}qr-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 20px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            min-height: 280px;
        }
        #${CSS_PREFIX}qr-placeholder {
            color: #999;
            font-size: 14px;
        }
        #${CSS_PREFIX}button-container {
            display: flex;
            gap: 12px;
            margin-top: 20px;
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
        #${CSS_PREFIX}download-btn {
            background-color: #1ABC9C;
            color: white;
        }
        #${CSS_PREFIX}download-btn:hover {
            background-color: #16A085;
        }
        #${CSS_PREFIX}download-btn:disabled {
            background-color: #95A5A6;
            cursor: not-allowed;
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

    // 7. 加载外部库
    function loadQRCodeLibrary(callback) {
        if (typeof QRCode !== 'undefined') {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
        script.onload = callback;
        script.onerror = () => {
            console.error('Failed to load QRCode library');
            showError();
        };
        document.head.appendChild(script);
    }

    // 8. 显示错误
    function showError() {
        const container = document.getElementById(`${CSS_PREFIX}qr-container`);
        if (container) {
            container.innerHTML = `<div style="color: #E74C3C;">${t('error')}</div>`;
        }
    }

    // 9. 生成二维码
    function generateQRCode() {
        const container = document.getElementById(`${CSS_PREFIX}qr-container`);
        const url = window.location.href;

        try {
            // 清空容器
            container.innerHTML = '';

            // 创建QR码
            const qrDiv = document.createElement('div');
            qrDiv.id = `${CSS_PREFIX}qrcode`;
            container.appendChild(qrDiv);

            // 生成QR码
            new QRCode(qrDiv, {
                text: url,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // 启用下载按钮
            const downloadBtn = document.getElementById(`${CSS_PREFIX}download-btn`);
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }
        } catch (error) {
            console.error('QR Code generation error:', error);
            showError();
        }
    }

    // 10. 下载QR码
    function downloadQRCode() {
        const qrContainer = document.getElementById(`${CSS_PREFIX}qrcode`);
        if (!qrContainer) return;

        const img = qrContainer.querySelector('img');
        if (!img) {
            // 如果img还没生成，使用canvas
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
            return;
        }

        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = img.src;
        link.click();
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

        // QR码容器
        const qrContainer = document.createElement('div');
        qrContainer.id = `${CSS_PREFIX}qr-container`;
        qrContainer.innerHTML = `<div id="${CSS_PREFIX}qr-placeholder">${t('generating')}</div>`;
        modal.appendChild(qrContainer);

        // 按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.id = `${CSS_PREFIX}button-container`;

        const downloadBtn = document.createElement('button');
        downloadBtn.id = `${CSS_PREFIX}download-btn`;
        downloadBtn.innerText = t('download_button');
        downloadBtn.disabled = true;
        downloadBtn.addEventListener('click', downloadQRCode);

        const closeBtn = document.createElement('button');
        closeBtn.id = `${CSS_PREFIX}close-btn`;
        closeBtn.innerText = t('close_button');
        closeBtn.addEventListener('click', () => overlay.remove());

        buttonContainer.appendChild(downloadBtn);
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

    // 12. 主函数
    function main() {
        injectStyles();
        const overlay = createModal();

        // 加载库并生成QR码
        loadQRCodeLibrary(() => {
            generateQRCode();
        });
    }

    // 13. 启动脚本
    main();

})();
