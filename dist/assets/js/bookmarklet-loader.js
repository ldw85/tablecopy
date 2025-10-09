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
        let inComment = false; // // or /*
        let minified = '';
        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            const nextChar = code[i + 1];

            if (inString) {
                minified += char;
                if (char === '\\') { // 处理转义字符
                    minified += nextChar;
                    i++;
                } else if (char === inString) {
                    inString = false;
                }
            } else if (inComment) {
                if (inComment === '//' && char === '\n') inComment = false;
                if (inComment === '/*' && char === '*' && nextChar === '/') {
                    inComment = false;
                    i++;
                }
            } else {
                if (char === '/' && nextChar === '/') { inComment = '//'; i++; }
                else if (char === '/' && nextChar === '*') { inComment = '/*'; i++; }
                else if (char === "'" || char === '"' || char === '`') { inString = char; minified += char; }
                else if (/\s/.test(char)) {
                    // 如果周围是类单词字符，或者需要分隔操作符（如 `+ +` 或 `- -`），则添加一个空格
                    if (minified.length > 0 && !/\s$/.test(minified) && /[a-zA-Z0-9_$]/.test(minified.slice(-1)) && /[a-zA-Z0-9_$]/.test(nextChar)) {
                        minified += ' ';
                    } else if (/[+-]/.test(minified.slice(-1)) && minified.slice(-1) === nextChar) {
                        minified += ' ';
                    }
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