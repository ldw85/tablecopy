/**
 * 动态加载、压缩并设置书签脚本.
 * @param {string} scriptPath - 要加载的 bookmarklet 脚本的路径.
 * @param {string} alertText - 当用户点击 bookmarklet 按钮时显示的提示文本.
 */
function setupBookmarklet(scriptPath, alertText) {
    /**
     * 一个专业的书签工具代码压缩器。
     * 它能移除注释和不必要的空白，而不会破坏代码。
     * @param {string} code - 要压缩的 JavaScript 代码.
     * @returns {string} 压缩后的代码.
     */
    function minifyJS(code) {
        let inString = false; // ', " or `
        let stringChar = false; // the character that started the string
        let inComment = false; // // or /*
        let minified = '';
        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            const nextChar = code[i + 1];

            if (inString) {
                // 在字符串内部，直接复制所有字符，不做任何处理
                minified += char;
                if (char === '\\' && i + 1 < code.length) { // 处理转义字符
                    minified += code[i + 1];
                    i++;
                } else if (char === stringChar) {
                    // 字符串结束
                    inString = false;
                    stringChar = false;
                }
                // 注意：在模板字符串内，双引号和单引号不会结束字符串（因为 stringChar 是反引号）
            } else if (inComment) {
                if (inComment === '//' && char === '\n') inComment = false;
                if (inComment === '/*' && char === '*' && nextChar === '/') {
                    inComment = false;
                    i++;
                }
            } else {
                if (char === '/' && nextChar === '/') { inComment = '//'; i++; }
                else if (char === '/' && nextChar === '*') { inComment = '/*'; i++; }
                else if (char === "'" || char === '"' || char === '`') {
                    inString = true;
                    stringChar = char;
                    minified += char;
                }
                else if (/\s/.test(char)) {
                    // 处理空白字符 - 只在非字符串区域内
                    if (minified.length > 0 && !/\s$/.test(minified) && /[a-zA-Z0-9_$]/.test(minified.slice(-1)) && nextChar && /[a-zA-Z0-9_$]/.test(nextChar)) {
                        minified += ' ';
                    } else if (minified.length > 0 && /[+-]$/.test(minified) && nextChar === minified.slice(-1)) {
                        minified += ' ';
                    }
                    // 其他空白字符直接跳过
                } else {
                    minified += char;
                }
            }
        }
        return minified;
    }

    fetch(scriptPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(scriptContent => {
            const minifiedScript = minifyJS(scriptContent);
            const bookmarkletHref = `javascript:!function(){${encodeURIComponent(minifiedScript)}}();`;

            const bookmarkletLink = document.getElementById('bookmarklet-link');
            if (bookmarkletLink) {
                bookmarkletLink.setAttribute('href', bookmarkletHref);

                // 为桌面用户添加提示，阻止默认点击行为
                bookmarkletLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof gtag_report_conversion === 'function') {
                        gtag_report_conversion();
                    }
                    alert(alertText);
                });
            }
        })
        .catch(error => console.error('Error loading bookmarklet script:', error));
}