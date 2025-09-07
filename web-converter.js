/**
 * =============================================================
 * 网页转换器 (Web Converter)
 * =============================================================
 *
 * 功能: 在当前页面注入一个UI，允许用户将页面保存为PDF或图片。
 * - PDF保存: 通过调用 window.print() 实现。
 * - 图片保存: 动态加载 html2canvas.js 库来截取页面。
 *
 * 作者: Gemini (AI Assistant)
 * 版本: 1.0
 */
(function() {

    // 0. 如果脚本已在运行，则直接返回
    if (document.getElementById('wc-modal-style')) {
        return;
    }

    // 1. 定义UI样式和HTML结构
    const CSS_PREFIX = 'web-converter-';
    const STYLES = `
        #${CSS_PREFIX}modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 2147483646; /* Max z-index - 1 */
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #${CSS_PREFIX}modal {
            background: #fff;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        #${CSS_PREFIX}modal h3 {
            margin-top: 0;
            margin-bottom: 20px;
            color: #333;
            font-size: 22px;
        }
        #${CSS_PREFIX}modal .button-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        #${CSS_PREFIX}modal button {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
            color: #fff;
        }
        #${CSS_PREFIX}save-pdf {
            background-color: #D9534F; /* Red for PDF */
        }
        #${CSS_PREFIX}save-pdf:hover {
            background-color: #C9302C;
            transform: scale(1.02);
        }
        #${CSS_PREFIX}save-image {
            background-color: #5CB85C; /* Green for Image */
        }
        #${CSS_PREFIX}save-image:hover {
            background-color: #4CAE4C;
            transform: scale(1.02);
        }
        #${CSS_PREFIX}close {
            margin-top: 10px;
            background: none;
            color: #888;
            font-size: 14px;
        }
        #${CSS_PREFIX}close:hover {
            color: #333;
        }
        #${CSS_PREFIX}status {
            margin-top: 15px;
            font-size: 14px;
            color: #555;
            min-height: 20px;
        }
    `;

    const MODAL_HTML = `
        <div id="${CSS_PREFIX}modal">
            <h3>保存当前网页</h3>
            <div class="button-container">
                <button id="${CSS_PREFIX}save-pdf">保存为 PDF</button>
                <button id="${CSS_PREFIX}save-image">保存为图片 (PNG)</button>
            </div>
            <div id="${CSS_PREFIX}status"></div>
            <button id="${CSS_PREFIX}close">关闭</button>
        </div>
    `;

    // 2. 注入样式和UI到页面
    function injectUI() {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'wc-modal-style';
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);

        const overlay = document.createElement('div');
        overlay.id = `${CSS_PREFIX}modal-overlay`;
        overlay.innerHTML = MODAL_HTML;
        document.body.appendChild(overlay);

        return overlay;
    }

    // 3. 定义功能函数
    function saveAsPdf() {
        // 调用浏览器的打印功能，用户可以选择“另存为PDF”
        // 在调用打印前隐藏UI，打印后恢复，避免UI出现在PDF中
        const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        overlay.style.display = 'none';
        window.print();
        overlay.style.display = 'flex';
    }

    function saveAsImage() {
        const statusDiv = document.getElementById(`${CSS_PREFIX}status`);
        statusDiv.textContent = '正在准备截图...';

        const libUrl = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

        const executeCapture = () => {
            statusDiv.textContent = '正在截取页面... 请稍候...';
            const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
            overlay.style.display = 'none'; // 截图前隐藏UI

            html2canvas(document.documentElement, {
                useCORS: true, // 尝试加载跨域图片
                scale: window.devicePixelRatio, // 使用设备像素比以获得更高分辨率
                logging: false, // 关闭控制台日志
                onclone: (clonedDoc) => {
                    // 在克隆的文档中，可以进行一些清理，例如移除我们的UI
                    const clonedOverlay = clonedDoc.getElementById(`${CSS_PREFIX}modal-overlay`);
                    if(clonedOverlay) clonedOverlay.remove();
                }
            }).then(canvas => {
                statusDiv.textContent = '截取成功，正在生成下载...';
                const link = document.createElement('a');
                link.download = (document.title || 'web-capture') + '.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                cleanup(); // 成功后关闭
            }).catch(err => {
                console.error('Web Converter Error:', err);
                statusDiv.textContent = '抱歉，截图失败。请查看控制台获取详情。';
                overlay.style.display = 'flex'; // 失败后恢复UI
            });
        };

        if (typeof html2canvas !== 'undefined') {
            executeCapture();
        } else {
            statusDiv.textContent = '首次使用，正在加载截图组件...';
            const script = document.createElement('script');
            script.src = libUrl;
            script.onload = executeCapture;
            script.onerror = () => {
                statusDiv.textContent = '无法加载截图组件，请检查网络或广告拦截器。';
            };
            document.head.appendChild(script);
        }
    }

    function cleanup() {
        const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        const style = document.getElementById('wc-modal-style');
        if (overlay) document.body.removeChild(overlay);
        if (style) document.head.removeChild(style);
    }

    // 4. 启动并绑定事件
    function init() {
        const overlay = injectUI();

        document.getElementById(`${CSS_PREFIX}save-pdf`).addEventListener('click', saveAsPdf);
        document.getElementById(`${CSS_PREFIX}save-image`).addEventListener('click', saveAsImage);
        document.getElementById(`${CSS_PREFIX}close`).addEventListener('click', cleanup);
        overlay.addEventListener('click', (e) => {
            if (e.target.id === `${CSS_PREFIX}modal-overlay`) {
                cleanup();
            }
        });
    }

    // 启动主程序
    init();

})();
