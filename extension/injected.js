// 注入脚本 - 用于处理需要更高权限的操作
(function() {
    'use strict';

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('Table Export Pro 注入脚本已加载');

        // 监听来自内容脚本的消息
        window.addEventListener('message', handleMessage);

        // 暴露全局API供内容脚本调用
        window.tableExportPro = {
            getPageInfo: getPageInfo,
            simulateClick: simulateClick,
            waitForElement: waitForElement,
            detectTableChanges: detectTableChanges
        };
    }

    // 处理消息
    function handleMessage(event) {
        if (event.source !== window) return;

        const message = event.data;
        if (message.type !== 'TABLE_EXPORT_PRO') return;

        switch (message.action) {
            case 'getPageInfo':
                const pageInfo = getPageInfo();
                window.postMessage({
                    type: 'TABLE_EXPORT_PRO_RESPONSE',
                    action: 'getPageInfo',
                    data: pageInfo
                }, '*');
                break;

            case 'simulateClick':
                const result = simulateClick(message.selector);
                window.postMessage({
                    type: 'TABLE_EXPORT_PRO_RESPONSE',
                    action: 'simulateClick',
                    success: result
                }, '*');
                break;

            case 'waitForElement':
                waitForElement(message.selector, message.timeout)
                    .then(element => {
                        window.postMessage({
                            type: 'TABLE_EXPORT_PRO_RESPONSE',
                            action: 'waitForElement',
                            success: true,
                            element: element ? true : false
                        }, '*');
                    })
                    .catch(error => {
                        window.postMessage({
                            type: 'TABLE_EXPORT_PRO_RESPONSE',
                            action: 'waitForElement',
                            success: false,
                            error: error.message
                        }, '*');
                    });
                break;

            case 'detectTableChanges':
                detectTableChanges(message.callbackId);
                break;
        }
    }

    // 获取页面信息
    function getPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            tables: document.querySelectorAll('table').length,
            pagination: detectPaginationElements(),
            loadingIndicators: detectLoadingElements()
        };
    }

    // 检测分页元素
    function detectPaginationElements() {
        const paginationSelectors = [
            '.pagination',
            '.pager',
            '.page-nav',
            '[class*="pagination"]',
            '[class*="page"]',
            '.next',
            '.next-page',
            '[aria-label="Next"]',
            '[rel="next"]'
        ];

        const elements = [];
        paginationSelectors.forEach(selector => {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    elements.push({
                        selector: selector,
                        text: element.textContent.trim(),
                        visible: isElementVisible(element),
                        enabled: !element.disabled
                    });
                }
            } catch (e) {
                // 忽略无效选择器
            }
        });

        return elements;
    }

    // 检测加载指示器
    function detectLoadingElements() {
        const loadingSelectors = [
            '.loading',
            '.spinner',
            '[class*="loading"]',
            '[class*="spinner"]',
            '.progress',
            '.busy'
        ];

        const elements = [];
        loadingSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (isElementVisible(element)) {
                        elements.push({
                            selector: selector,
                            visible: true
                        });
                    }
                });
            } catch (e) {
                // 忽略无效选择器
            }
        });

        return elements;
    }

    // 模拟点击
    function simulateClick(selector) {
        try {
            const element = document.querySelector(selector);
            if (!element) {
                console.warn('元素未找到:', selector);
                return false;
            }

            // 检查元素是否可见和可用
            if (!isElementVisible(element) || element.disabled) {
                console.warn('元素不可见或不可用:', selector);
                return false;
            }

            // 创建并触发点击事件
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            element.dispatchEvent(clickEvent);
            console.log('点击事件已触发:', selector);
            return true;

        } catch (error) {
            console.error('模拟点击失败:', error);
            return false;
        }
    }

    // 等待元素出现
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            function check() {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`等待元素超时: ${selector}`));
                    return;
                }

                setTimeout(check, 100);
            }

            check();
        });
    }

    // 检测表格变化
    function detectTableChanges(callbackId) {
        const tables = document.querySelectorAll('table');
        const initialTableCount = tables.length;

        // 使用 MutationObserver 监听DOM变化
        const observer = new MutationObserver((mutations) => {
            const currentTables = document.querySelectorAll('table');
            const currentTableCount = currentTables.length;

            if (currentTableCount !== initialTableCount) {
                // 表格数量发生变化
                window.postMessage({
                    type: 'TABLE_EXPORT_PRO_RESPONSE',
                    action: 'detectTableChanges',
                    callbackId: callbackId,
                    changed: true,
                    tableCount: currentTableCount
                }, '*');

                observer.disconnect();
                return;
            }

            // 检查现有表格内容是否变化
            let contentChanged = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const target = mutation.target;
                    if (target.closest('table')) {
                        contentChanged = true;
                    }
                }
            });

            if (contentChanged) {
                window.postMessage({
                    type: 'TABLE_EXPORT_PRO_RESPONSE',
                    action: 'detectTableChanges',
                    callbackId: callbackId,
                    changed: true,
                    tableCount: currentTableCount
                }, '*');
            }
        });

        // 开始监听
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });

        // 30秒后自动停止监听
        setTimeout(() => {
            observer.disconnect();
            window.postMessage({
                type: 'TABLE_EXPORT_PRO_RESPONSE',
                action: 'detectTableChanges',
                callbackId: callbackId,
                changed: false,
                timeout: true
            }, '*');
        }, 30000);
    }

    // 检查元素是否可见
    function isElementVisible(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return rect.width > 0 &&
               rect.height > 0 &&
               style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               element.offsetParent !== null;
    }

    // 高级分页导航
    function advancedPaginationNavigation(callback) {
        const strategies = [
            // 策略1: 标准分页按钮
            () => {
                const nextButtons = [
                    'a.next',
                    'button.next',
                    '.pagination .next',
                    '[aria-label="Next"]',
                    '[rel="next"]'
                ];

                for (const selector of nextButtons) {
                    const element = document.querySelector(selector);
                    if (element && isElementVisible(element) && !element.disabled) {
                        return element;
                    }
                }
                return null;
            },

            // 策略2: 文本内容匹配
            () => {
                const textPatterns = [
                    /next/i,
                    /下一页/i,
                    /下页/i,
                    /»/,
                    /→/,
                    />/
                ];

                const links = document.querySelectorAll('a, button');
                for (const link of links) {
                    const text = link.textContent.trim();
                    for (const pattern of textPatterns) {
                        if (pattern.test(text) && isElementVisible(link) && !link.disabled) {
                            return link;
                        }
                    }
                }
                return null;
            },

            // 策略3: 页码导航
            () => {
                const currentPage = document.querySelector('.current, .active, [class*="current"]');
                if (currentPage) {
                    const nextSibling = currentPage.nextElementSibling;
                    if (nextSibling && (nextSibling.tagName === 'A' || nextSibling.tagName === 'BUTTON')) {
                        const link = nextSibling.querySelector('a') || nextSibling;
                        if (isElementVisible(link) && !link.disabled) {
                            return link;
                        }
                    }
                }
                return null;
            },

            // 策略4: URL参数递增
            () => {
                const url = window.location.href;
                const pagePatterns = [
                    /page[=\/](\d+)/i,
                    /p[=\/](\d+)/i,
                    /offset[=\/](\d+)/i,
                    /start[=\/](\d+)/i
                ];

                for (const pattern of pagePatterns) {
                    const match = url.match(pattern);
                    if (match) {
                        const currentPage = parseInt(match[1]);
                        const nextPage = currentPage + 1;
                        const nextUrl = url.replace(pattern, match[0].replace(currentPage, nextPage));

                        // 创建虚拟链接
                        const virtualLink = document.createElement('a');
                        virtualLink.href = nextUrl;
                        virtualLink.style.display = 'none';
                        document.body.appendChild(virtualLink);

                        return virtualLink;
                    }
                }
                return null;
            }
        ];

        // 执行所有策略
        for (const strategy of strategies) {
            const result = strategy();
            if (result) {
                if (callback) callback(result);
                return result;
            }
        }

        return null;
    }

    // 等待页面加载完成
    function waitForPageLoad(timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            function check() {
                // 检查是否还在加载
                if (document.readyState === 'loading') {
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('等待页面加载超时'));
                        return;
                    }
                    setTimeout(check, 100);
                    return;
                }

                // 检查是否有加载指示器
                const loadingElements = detectLoadingElements();
                if (loadingElements.length > 0) {
                    if (Date.now() - startTime > timeout) {
                        reject(new Error('等待加载指示器消失超时'));
                        return;
                    }
                    setTimeout(check, 100);
                    return;
                }

                resolve();
            }

            check();
        });
    }

    // 暴露高级API
    window.tableExportPro.advanced = {
        advancedPaginationNavigation: advancedPaginationNavigation,
        waitForPageLoad: waitForPageLoad,
        isElementVisible: isElementVisible
    };

})();