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
            backdrop-filter: blur(4px);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #${CSS_PREFIX}modal {
            background: #fff;
            position: relative;
            padding: 20px 28px 15px 28px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 420px;
            width: 90%;
        }
        #${CSS_PREFIX}modal h3 {
            margin-top: 0;
            margin-bottom: 24px;
            color: #333;
            font-size: 20px;
            font-weight: 600;
        }
        #${CSS_PREFIX}modal .button-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
        }
        #${CSS_PREFIX}modal button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 90px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.2s;
            color: #fff;
            background-color: #f0f2f5;
            color: #333;
            border: 1px solid #e0e2e5;
        }
        #${CSS_PREFIX}modal button:not([disabled]):hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-color: #d0d2d5;
        }
        #${CSS_PREFIX}modal button svg {
            width: 28px;
            height: 28px;
            margin-bottom: 8px;
        }
        #${CSS_PREFIX}save-pdf {
            /* PDF Red */
            color: #D9534F;
        }
        #${CSS_PREFIX}save-image {
            /* Image Green */
            color: #5CB85C;
        }
        #${CSS_PREFIX}save-word {
            /* Word Blue */
            color: #2B579A;
        }
        #${CSS_PREFIX}save-markdown {
            /* Markdown Neutral */
            color: #333;
        }
        #${CSS_PREFIX}save-text {
            /* Text/Reader mode - a calm blue */
            color: #17A2B8;
        }
        #${CSS_PREFIX}close {
            position: absolute;
            top: 8px; right: 8px;
            width: 26px; height: 26px;
            background: none; border: none;
            border: none;
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
            justify-content: space-between;
            align-items: center;
        }
        #${CSS_PREFIX}logo {
            font-size: 14px;
            font-weight: bold;
            color: #aaa;
            text-decoration: none;
        }
        #${CSS_PREFIX}status {
            font-size: 14px;
            color: #555;
            min-height: 20px;
        }
    `;

    const MODAL_HTML = `
        <div id="${CSS_PREFIX}modal">
            <button id="${CSS_PREFIX}close" title="Close">×</button>
            <h3>Web Page Converter</h3>
            <div class="button-container">
                <button id="${CSS_PREFIX}save-pdf">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9.5 11.5c0 .83-.67 1.5-1.5 1.5H7v2H5.5V9H8c.83 0 1.5.67 1.5 1.5v1zm-1.5-1H7v1h1v-1zm7 3.5H15v-1h-1.5v-1H15v-1h-2.5V9h4v6h-1.5zm-5-3.5c0-.83.67-1.5 1.5-1.5h2.5v6H13V9h-1.5c-.83 0-1.5.67-1.5 1.5v4h-1.5V9h1.5v2.5zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"></path></svg>
                    <span>Save as PDF</span>
                </button>
                <button id="${CSS_PREFIX}save-image">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
                    <span>Save as Image</span>
                </button>
                <button id="${CSS_PREFIX}save-word">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm8 7h-2v8h2v-8zm-4 0H8v8h2v-8zm8-6.17L19.17 8H18V2.83z"></path></svg>
                    <span>Save as Word</span>
                </button>
                <button id="${CSS_PREFIX}save-markdown">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.56 15.2c.29-.29.44-.68.44-1.07v-4.26c0-.39-.15-.78-.44-1.07l-2.13-2.13c-.29-.29-.68-.44-1.07-.44H6.63c-.79 0-1.44.65-1.44 1.44v8.58c0 .79.65 1.44 1.44 1.44h12.86c.39 0 .78-.15 1.07-.44l.01-.01zm-3.5-4.52H15.5v3.5h-1.5v-3.5h-1.56L15 8.1l2.56 2.58zM9.5 14H8v-4h1.5v4zm3.5 0h-1.5V8.5H13v5.5z"></path></svg>
                    <span>Save as Markdown</span>
                </button>
                <button id="${CSS_PREFIX}save-text">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path></svg>
                    <span>Save as Text</span>
                </button>
            </div>
            <div id="${CSS_PREFIX}footer">
                <div id="${CSS_PREFIX}status"></div>
                <a href="https://tablecopy.pro" target="_blank" id="${CSS_PREFIX}logo">TableCopy.pro</a>
            </div>
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
        
        // Localize texts
        overlay.querySelector('h3').textContent = 'Save Current Page';
        overlay.querySelector(`#${CSS_PREFIX}close`).title = 'Close';

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

    /**
     * 优化后的图片保存功能
     * - 采用分块截图 + 拼接的方式，解决超长页面截图模糊或失败的问题。
     * - 使用 JPEG 格式并设置压缩质量，以显著减小图片文件大小。
     */
    function saveAsImage() {
        const statusDiv = document.getElementById(`${CSS_PREFIX}status`);
        statusDiv.textContent = '正在准备截图...';

        const libUrl = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

        // 核心截图逻辑
        const executeCapture = () => {
            const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
            if (overlay) overlay.style.display = 'none'; // 截图前隐藏UI

            const body = document.documentElement;
            const totalHeight = body.scrollHeight;
            const viewportHeight = window.innerHeight;
            const scale = window.devicePixelRatio || 1;
            const chunks = [];
            let capturedHeight = 0;

            // 分块截图函数
            async function captureChunk(y) {
                const chunkCanvas = await html2canvas(body, {
                    useCORS: true,
                    scale: scale,
                    logging: false,
                    height: Math.min(viewportHeight, totalHeight - y), // 截图高度
                    width: body.clientWidth,
                    x: 0,
                    y: y, // 截图起始的Y轴位置
                    windowHeight: viewportHeight, // 告诉html2canvas窗口的高度
                    onclone: (clonedDoc) => {
                        // 在克隆的文档中，移除UI元素
                        const clonedOverlay = clonedDoc.getElementById(`${CSS_PREFIX}modal-overlay`);
                        if (clonedOverlay) clonedOverlay.remove();
                    }
                });
                chunks.push(chunkCanvas);
                capturedHeight += chunkCanvas.height / scale;
                statusDiv.textContent = `正在截取页面... (${Math.round((capturedHeight / totalHeight) * 100)}%)`;
            }

            // 拼接所有截图块
            function stitchChunks() {
                statusDiv.textContent = '截图完成，正在拼接图片...';
                const finalCanvas = document.createElement('canvas');
                // 设置最终画布的尺寸，考虑设备像素比
                finalCanvas.width = chunks[0].width;
                finalCanvas.height = chunks.reduce((total, chunk) => total + chunk.height, 0);

                const ctx = finalCanvas.getContext('2d');
                let currentY = 0;
                chunks.forEach(chunk => {
                    ctx.drawImage(chunk, 0, currentY);
                    currentY += chunk.height;
                });
                return finalCanvas;
            }

            // 启动分块截图流程
            (async () => {
                try {
                    for (let y = 0; y < totalHeight; y += viewportHeight) {
                        await captureChunk(y);
                    }

                    const finalCanvas = stitchChunks();

                    statusDiv.textContent = '拼接成功，正在生成下载...';
                    const link = document.createElement('a');
                    // 使用JPEG格式并设置0.9的质量，以获得较小的文件体积
                    link.download = (document.title || 'web-capture') + '.jpeg';
                    link.href = finalCanvas.toDataURL('image/jpeg', 0.9);
                    link.click();
                    cleanup(); // 成功后关闭
                } catch (err) {
                    console.error('Web Converter Error:', err);
                    statusDiv.textContent = '抱歉，截图失败。请查看控制台获取详情。';
                    overlay.style.display = 'flex'; // 失败后恢复UI
                }
            })();
        };

        // 检查 html2canvas 库是否已加载
        if (typeof html2canvas !== 'undefined') {
            executeCapture();
        } else {
            statusDiv.textContent = '首次使用，正在加载截图组件...';
            const script = document.createElement('script');
            script.src = libUrl;
            // [FIX] 将 executeCapture 的逻辑直接放入 onload 回调，确保作用域正确
            script.onload = function() {
                executeCapture();
            };
            script.onerror = () => {
                statusDiv.textContent = '无法加载截图组件，请检查网络或广告拦截器。';
            };
            document.head.appendChild(script);
        }
    }

    /**
     * 保存为 Word (.docx) 功能
     * - 动态加载 html-to-docx-js 库。
     * - 将当前页面的 <body> 内容转换为 .docx 文件。
     * - 注意：样式和布局的保真度有限。
     */
    function saveAsWord() {
        const statusDiv = document.getElementById(`${CSS_PREFIX}status`);
        statusDiv.textContent = '正在准备转换为 Word...';

        // 使用为浏览器打包的 `html-docx-js` 版本
        const libUrl = 'https://unpkg.com/html-docx-js/dist/html-docx.js';

        const executeConversion = () => {
            try {
                statusDiv.textContent = '正在转换，请稍候...';
                // 复制一份DOM，避免直接修改原页面，并移除脚本自身的UI
                const content = document.documentElement.cloneNode(true);
                const overlay = content.querySelector(`#${CSS_PREFIX}modal-overlay`);
                if (overlay) overlay.remove();
                
                // [FIX] 移除所有 <style> 和 <script> 标签，避免它们的内容被当成文字渲染
                content.querySelectorAll('style, script').forEach(el => el.remove());
                
                // html-to-docx-js 接受HTML字符串作为输入
                const contentHtml = content.outerHTML;

                // 使用库生成DOCX文件
                // [FIX] 浏览器版本导出的全局变量是 `htmlDocx` (驼峰式)
                if (window.htmlDocx) {
                    const fileBlob = window.htmlDocx.asBlob(contentHtml);

                    // 创建下载链接并触发
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(fileBlob);
                    link.download = (document.title || 'web-page') + '.docx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    cleanup(); // 成功后关闭
                } else {
                    throw new Error('htmlDocx global object not found after script load.');
                }
            } catch (err) {
                console.error('Web Converter to Word Error:', err);
                statusDiv.textContent = '抱歉，转换为Word失败。请查看控制台获取详情。';
            }
        };

        // 检查正确的全局变量 `htmlDocx`
        if (typeof window.htmlDocx !== 'undefined') {
            executeConversion();
        } else {
            statusDiv.textContent = '首次使用，正在加载Word转换组件...';
            const script = document.createElement('script');
            script.src = libUrl;
            
            script.onload = executeConversion;
            script.onerror = (err) => {
                console.error(`[Web Converter] Failed to load script from: ${libUrl}`, err);
                statusDiv.textContent = '无法加载Word转换组件，请检查网络或广告拦截器。';
            };
            document.head.appendChild(script);
        }
    }

    /**
     * 保存为 Markdown (.md) 功能
     * - 动态加载 turndown 库。
     * - 提取页面主要内容（尝试寻找 <article> 或 <main>）。
     * - 将 HTML 转换为 Markdown 并触发下载。
     */
    function saveAsMarkdown() {
        const statusDiv = document.getElementById(`${CSS_PREFIX}status`);
        statusDiv.textContent = '正在准备转换为 Markdown...';

        const libUrl = 'https://unpkg.com/turndown/dist/turndown.js';

        const executeConversion = () => {
            try {
                if (typeof TurndownService === 'undefined') {
                    throw new Error('TurndownService is not defined after script load.');
                }
                statusDiv.textContent = '正在转换，请稍候...';

                const turndownService = new TurndownService({
                    headingStyle: 'atx',
                    codeBlockStyle: 'fenced'
                });

                // 优先转换 <article> 或 <main> 标签，如果找不到则转换整个 <body>
                const mainContent = document.querySelector('article, main') || document.body;
                const markdown = turndownService.turndown(mainContent);

                // 创建下载链接并触发
                const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = (document.title || 'web-page') + '.md';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                cleanup(); // 成功后关闭
            } catch (err) {
                console.error('Web Converter to Markdown Error:', err);
                statusDiv.textContent = '抱歉，转换为Markdown失败。请查看控制台。';
            }
        };

        if (typeof TurndownService !== 'undefined') {
            executeConversion();
        } else {
            statusDiv.textContent = '首次使用，正在加载Markdown转换组件...';
            const script = document.createElement('script');
            script.src = libUrl;
            script.onload = executeConversion;
            script.onerror = () => {
                statusDiv.textContent = '无法加载Markdown转换组件，请检查网络或广告拦截器。';
            };
            document.head.appendChild(script);
        }
    }

    /**
     * 保存为纯文本 (阅读模式)
     * - 动态加载 Mozilla 的 Readability.js 库。
     * - 提取页面主要内容，生成干净的纯文本版本。
     * - 触发 .txt 文件下载。
     */
    function saveAsText() {
        const statusDiv = document.getElementById(`${CSS_PREFIX}status`);
        statusDiv.textContent = '正在准备阅读模式...';

        const libUrl = 'https://cdn.jsdelivr.net/npm/@mozilla/readability@0.5.0/Readability.js';

        const executeExtraction = () => {
            try {
                if (typeof Readability === 'undefined') {
                    throw new Error('Readability is not defined after script load.');
                }
                statusDiv.textContent = '正在提取正文...';

                // 使用 Readability 提取文章
                const reader = new Readability(document.cloneNode(true));
                const article = reader.parse();

                if (!article || !article.textContent) {
                    throw new Error('Failed to extract article content.');
                }

                // 创建下载链接并触发
                const blob = new Blob([article.textContent], { type: 'text/plain;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = (article.title || document.title || 'web-page') + '.txt';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                cleanup(); // 成功后关闭
            } catch (err) {
                console.error('Web Converter to Text Error:', err);
                statusDiv.textContent = '抱歉，提取正文失败。此页面可能不适用。';
            }
        };

        // 动态加载 Readability.js
        loadScript(libUrl, 'Readability', executeExtraction, '阅读模式组件');
    }


    function cleanup() {
        const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        const style = document.getElementById('wc-modal-style');
        if (overlay) document.body.removeChild(overlay);
        if (style) document.head.removeChild(style);
    }

    /**
     * 通用的脚本加载函数
     * @param {string} url - 脚本的URL
     * @param {string} globalVar - 脚本加载后暴露的全局变量名
     * @param {function} callback - 脚本加载成功后执行的回调
     * @param {string} componentName - 用于在状态消息中显示的组件名称
     */
    function loadScript(url, globalVar, callback, componentName = '组件') {
        if (typeof window[globalVar] !== 'undefined') {
            callback();
        } else {
            const statusDiv = document.getElementById(`${CSS_PREFIX}status`);
            statusDiv.textContent = `首次使用，正在加载${componentName}...`;
            const script = document.createElement('script');
            script.src = url;
            script.onload = callback;
            script.onerror = () => {
                statusDiv.textContent = `无法加载${componentName}，请检查网络或广告拦截器。`;
            };
            document.head.appendChild(script);
        }
    }

    // 4. 启动并绑定事件
    function init() {
        const overlay = injectUI();

        document.getElementById(`${CSS_PREFIX}save-pdf`).addEventListener('click', saveAsPdf);
        document.getElementById(`${CSS_PREFIX}save-image`).addEventListener('click', saveAsImage);
        document.getElementById(`${CSS_PREFIX}save-word`).addEventListener('click', saveAsWord);
        document.getElementById(`${CSS_PREFIX}save-markdown`).addEventListener('click', saveAsMarkdown);
        document.getElementById(`${CSS_PREFIX}close`).addEventListener('click', cleanup);
        overlay.addEventListener('click', (e) => {
            if (e.target.id === `${CSS_PREFIX}modal-overlay`) {
                cleanup();
            }
        });
        document.getElementById(`${CSS_PREFIX}save-text`).addEventListener('click', saveAsText);
    }

    // 启动主程序
    init();

})();
