class PopupManager {
    constructor() {
        this.currentTab = null;
        this.detectedTables = [];
        this.selectedTables = new Set();
        this.extractionSession = null;
        this.settings = {};
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.getCurrentTab();
        this.setupEventListeners();
        this.detectTables();
    }

    // 获取当前标签页
    async getCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;
        } catch (error) {
            console.error('获取当前标签页失败:', error);
            this.showError('无法获取当前标签页信息');
        }
    }

    // 加载设置
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['popupSettings']);
            this.settings = result.popupSettings || {
                defaultDelay: 2000,
                defaultMaxPages: 10,
                autoDetectPagination: true,
                highlightTables: true
            };
            this.updateSettingsUI();
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    // 保存设置
    async saveSettings() {
        try {
            this.settings = {
                defaultDelay: parseInt(document.getElementById('defaultDelay').value),
                defaultMaxPages: parseInt(document.getElementById('defaultMaxPages').value),
                autoDetectPagination: document.getElementById('autoDetectPagination').checked,
                highlightTables: document.getElementById('highlightTables').checked
            };

            await chrome.storage.local.set({ popupSettings: this.settings });
            this.hideModal('settingsModal');
            this.showSuccess('设置已保存');
        } catch (error) {
            console.error('保存设置失败:', error);
            this.showError('保存设置失败');
        }
    }

    // 更新设置UI
    updateSettingsUI() {
        document.getElementById('defaultDelay').value = this.settings.defaultDelay;
        document.getElementById('defaultMaxPages').value = this.settings.defaultMaxPages;
        document.getElementById('autoDetectPagination').checked = this.settings.autoDetectPagination;
        document.getElementById('highlightTables').checked = this.settings.highlightTables;

        // 更新提取设置默认值
        document.getElementById('extractDelay').value = Math.max(1, this.settings.defaultDelay / 1000);
        document.getElementById('maxPages').value = this.settings.defaultMaxPages;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 表格相关
        document.getElementById('tableList').addEventListener('click', (e) => {
            const tableItem = e.target.closest('.table-item');
            if (tableItem) {
                this.selectTable(parseInt(tableItem.dataset.index));
            }
        });

        // 导出按钮
        document.getElementById('exportCSV').addEventListener('click', () => this.exportData('csv'));
        document.getElementById('exportJSON').addEventListener('click', () => this.exportData('json'));

        // 自动提取
        document.getElementById('startAutoExtract').addEventListener('click', () => this.startAutoExtraction());
        document.getElementById('cancelExtract').addEventListener('click', () => this.cancelExtraction());

        // 结果处理
        document.getElementById('downloadResult').addEventListener('click', () => this.downloadResult());
        document.getElementById('viewResult').addEventListener('click', () => this.viewResult());

        // 设置
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('cancelSettings').addEventListener('click', () => this.hideModal('settingsModal'));
        document.getElementById('closeSettings').addEventListener('click', () => this.hideModal('settingsModal'));

        // 数据预览
        document.getElementById('closeDataModal').addEventListener('click', () => this.hideModal('dataModal'));
        document.getElementById('closePreview').addEventListener('click', () => this.hideModal('dataModal'));
        document.getElementById('copyData').addEventListener('click', () => this.copyData());

        // 帮助
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());

        // 分页配置
        document.getElementById('paginationConfigBtn').addEventListener('click', () => this.configurePagination());

        // 分页配置模态框事件
        document.getElementById('closePaginationConfig').addEventListener('click', () => this.hideModal('paginationConfigModal'));
        document.getElementById('savePaginationConfig').addEventListener('click', () => this.savePaginationConfig());
        document.getElementById('cancelPaginationConfig').addEventListener('click', () => this.hideModal('paginationConfigModal'));
        document.getElementById('testPaginationConfig').addEventListener('click', () => this.testPaginationConfig());

        // 连接测试
        document.getElementById('testConnection').addEventListener('click', () => this.testConnection());
        document.getElementById('retryConnection').addEventListener('click', () => this.retryConnection());
    }

    // 检测表格 - 增强版连接诊断
    async detectTables() {
        this.updateStatus('检测中...', 'loading');

        try {
            // 步骤1: 检查当前标签页状态
            console.log('=== 开始表格检测流程 ===');
            console.log('当前标签页信息:', this.currentTab);

            if (!this.currentTab || !this.currentTab.id) {
                console.error('❌ 无效的标签页信息');
                this.updateStatus('标签页无效', 'error');
                this.showError('无法获取当前标签页信息');
                return;
            }

            // 步骤2: 检查内容脚本是否存在
            console.log(`🔄 正在检查内容脚本是否存在，标签页ID: ${this.currentTab.id}`);
            const scriptCheck = await this.checkContentScriptExists();

            if (!scriptCheck.exists) {
                console.log('⚠️ 内容脚本不存在，尝试注入...');
                const injectResult = await this.injectContentScript();
                if (!injectResult.success) {
                    this.updateStatus('注入失败', 'error');
                    this.showError('无法注入内容脚本：' + injectResult.error);
                    return;
                }
                console.log('✅ 内容脚本注入成功');
            } else {
                console.log('✅ 内容脚本已存在');
            }

            // 步骤3: 发送检测消息
            console.log('📤 发送 detectTables 消息到标签页:', this.currentTab.id);
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'detectTables' });
            console.log('📥 收到响应:', response);

            // 步骤4: 处理响应
            if (response && response.tables) {
                this.detectedTables = response.tables;
                this.updateTableCount();
                this.updateStatus(`检测到 ${response.tables.length} 个表格`, 'success');

                // 批量渲染，避免频繁DOM更新
                requestAnimationFrame(() => {
                    this.renderTablesList();
                });

                // 检测分页
                if (this.settings.autoDetectPagination) {
                    this.detectPagination();
                }
            } else if (response && response.tables && response.tables.length === 0) {
                this.updateStatus('未检测到表格', 'info');
                this.showEmptyState();
            } else {
                console.error('❌ 响应格式错误:', response);
                this.updateStatus('检测失败', 'error');
                this.showError('检测返回数据格式错误');
            }
        } catch (error) {
            console.error('❌ 检测过程失败:', error);
            this.updateStatus('检测失败', 'error');

            // 精确的错误分类
            this.handleConnectionError(error);
        }
    }

    // 检查内容脚本是否存在
    async checkContentScriptExists() {
        try {
            console.log('🔍 检查内容脚本存在性...');
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'ping' });
            console.log('Ping响应:', response);
            return { exists: response && response.pong === true };
        } catch (error) {
            console.log('Ping失败，内容脚本可能不存在:', error.message);
            return { exists: false, error: error.message };
        }
    }

    // 注入内容脚本
    async injectContentScript() {
        try {
            console.log('💉 正在注入内容脚本...');
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                files: ['content.js']
            });
            console.log('✅ 内容脚本注入完成');
            return { success: true };
        } catch (error) {
            console.error('❌ 内容脚本注入失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 处理连接错误
    handleConnectionError(error) {
        const errorMessage = error.message || '';
        console.log('错误详情:', errorMessage);

        // 显示连接测试按钮
        document.getElementById('connectionTest').style.display = 'block';
        document.getElementById('testConnection').style.display = 'inline-block';
        document.getElementById('retryConnection').style.display = 'none';

        if (errorMessage.includes('Could not establish connection')) {
            this.showError('无法建立连接，页面可能未完全加载，请刷新页面后重试');
        } else if (errorMessage.includes('Receiving end does not exist')) {
            this.showError('内容脚本未加载，请刷新页面或重新打开扩展');
        } else if (errorMessage.includes('Cannot access contents of url')) {
            this.showError('无法访问此页面内容（可能是浏览器内部页面或受限制页面）');
        } else {
            this.showError('连接失败：' + errorMessage);
        }
    }

    // 测试连接
    async testConnection() {
        console.log('🧪 开始连接测试...');
        this.updateStatus('测试中...', 'loading');
        document.getElementById('testConnection').textContent = '测试中...';
        document.getElementById('testConnection').disabled = true;

        try {
            const testResults = await this.runConnectionDiagnostics();
            console.log('测试结果:', testResults);

            if (testResults.allPassed) {
                this.updateStatus('连接正常', 'success');
                this.showSuccess('连接测试通过！');
                document.getElementById('connectionTest').style.display = 'none';

                // 自动开始检测表格
                setTimeout(() => this.detectTables(), 1000);
            } else {
                this.updateStatus('连接异常', 'error');
                this.showError('连接测试失败：' + testResults.summary);
                document.getElementById('retryConnection').style.display = 'inline-block';
            }
        } catch (error) {
            console.error('测试失败:', error);
            this.updateStatus('测试失败', 'error');
            this.showError('连接测试失败：' + error.message);
            document.getElementById('retryConnection').style.display = 'inline-block';
        } finally {
            document.getElementById('testConnection').textContent = '测试连接';
            document.getElementById('testConnection').disabled = false;
        }
    }

    // 运行连接诊断
    async runConnectionDiagnostics() {
        const results = {
            tabAccessible: false,
            contentScriptExists: false,
            messagePassing: false,
            allPassed: false,
            summary: ''
        };

        try {
            // 测试1: 标签页可访问性
            console.log('📋 测试1: 检查标签页可访问性');
            if (!this.currentTab || !this.currentTab.id) {
                results.summary = '无法获取标签页信息';
                return results;
            }
            results.tabAccessible = true;
            console.log('✅ 标签页可访问');

            // 测试2: 内容脚本存在性
            console.log('📋 测试2: 检查内容脚本存在性');
            const scriptCheck = await this.checkContentScriptExists();
            results.contentScriptExists = scriptCheck.exists;
            if (!scriptCheck.exists) {
                results.summary = '内容脚本未加载';
                console.log('⚠️ 内容脚本不存在');
                return results;
            }
            console.log('✅ 内容脚本存在');

            // 测试3: 消息传递
            console.log('📋 测试3: 测试消息传递');
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'detectTables' });
            results.messagePassing = !!(response && (response.tables || response.error));
            if (!results.messagePassing) {
                results.summary = '消息传递失败';
                console.log('❌ 消息传递失败');
                return results;
            }
            console.log('✅ 消息传递正常');

            results.allPassed = true;
            results.summary = '所有测试通过';
            return results;

        } catch (error) {
            console.error('诊断测试失败:', error);
            results.summary = '诊断过程失败: ' + error.message;
            return results;
        }
    }

    // 重试连接
    async retryConnection() {
        console.log('🔄 开始重试连接...');
        this.updateStatus('重试中...', 'loading');
        document.getElementById('retryConnection').textContent = '重试中...';
        document.getElementById('retryConnection').disabled = true;

        try {
            // 步骤1: 重新获取标签页信息
            console.log('🔄 重新获取标签页信息');
            await this.getCurrentTab();

            // 步骤2: 强制重新注入内容脚本
            console.log('💉 强制重新注入内容脚本');
            const injectResult = await this.injectContentScript();
            if (!injectResult.success) {
                throw new Error('内容脚本注入失败: ' + injectResult.error);
            }

            // 步骤3: 等待一小段时间让脚本初始化
            await new Promise(resolve => setTimeout(resolve, 500));

            // 步骤4: 重新检测
            console.log('🔍 重新检测表格');
            await this.detectTables();

        } catch (error) {
            console.error('重试失败:', error);
            this.updateStatus('重试失败', 'error');
            this.showError('重试连接失败：' + error.message);
        } finally {
            document.getElementById('retryConnection').textContent = '重试连接';
            document.getElementById('retryConnection').disabled = false;
        }
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 检测分页
    async detectPagination() {
        try {
            const response = await chrome.tabs.sendMessage(this.currentTab.id, { action: 'detectPagination' });

            if (response && response.pagination) {
                this.paginationData = response.pagination;
                this.showPaginationInfo(response.pagination);
            } else {
                this.paginationData = null;
                this.hidePaginationSection();
            }
        } catch (error) {
            console.error('检测分页失败:', error);
            this.paginationData = null;
            this.hidePaginationSection();
        }
    }

    // 显示分页信息
    showPaginationInfo(pagination) {
        const section = document.getElementById('paginationSection');
        const status = document.getElementById('paginationStatus');
        const configBtn = document.getElementById('paginationConfigBtn');

        status.textContent = '已检测到分页功能';
        configBtn.style.display = 'inline-block';
        section.style.display = 'block';

        // 显示自动提取选项
        document.getElementById('autoExtractSection').style.display = 'block';
    }

    // 隐藏分页部分
    hidePaginationSection() {
        document.getElementById('paginationSection').style.display = 'none';
        document.getElementById('autoExtractSection').style.display = 'none';
    }

    // 渲染表格列表
    renderTablesList() {
        const tableList = document.getElementById('tableList');
        tableList.innerHTML = '';

        if (this.detectedTables.length === 0) {
            this.showEmptyState();
            return;
        }

        this.detectedTables.forEach((table, index) => {
            const tableItem = this.createTableItem(table, index);
            tableList.appendChild(tableItem);
        });

        // 显示导出选项
        document.getElementById('exportSection').style.display = 'block';
    }

    // 创建表格项目
    createTableItem(table, index) {
        const item = document.createElement('div');
        item.className = 'table-item';
        item.dataset.index = index;

        const visibilityIcon = table.visible ? '👁️' : '🚫';
        const visibilityText = table.visible ? '可见' : '隐藏';
        const tableType = table.type === 'div' ? '📋 Div表格' : '📊 HTML表格';
        const structureInfo = table.structure ? ` | ${table.structure}` : '';

        item.innerHTML = `
            <div class="table-info">
                <div class="table-name">表格 ${index + 1} ${visibilityIcon} ${tableType}</div>
                <div class="table-details">
                    ${table.rowCount} 行 × ${table.columnCount} 列 | ${visibilityText}${structureInfo}
                </div>
            </div>
            <div class="table-actions">
                <button class="btn btn-small btn-secondary preview-btn" data-index="${index}">
                    预览
                </button>
            </div>
        `;

        // 添加预览按钮事件
        item.querySelector('.preview-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.previewTable(index);
        });

        return item;
    }

    // 选择表格
    selectTable(index) {
        const tableItem = document.querySelector(`[data-index="${index}"]`);

        if (this.selectedTables.has(index)) {
            this.selectedTables.delete(index);
            tableItem.classList.remove('selected');
        } else {
            this.selectedTables.add(index);
            tableItem.classList.add('selected');
        }

        // 高亮表格
        if (this.settings.highlightTables) {
            this.highlightTable(index);
        }
    }

    // 高亮表格
    async highlightTable(index) {
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'highlightTable',
                tableIndex: index
            });
        } catch (error) {
            console.error('高亮表格失败:', error);
        }
    }

    // 预览表格
    async previewTable(index) {
        try {
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'exportTable',
                tableIndex: index,
                includeHeaders: true
            });

            if (response && response.success) {
                // 获取表格数据用于预览
                const table = this.detectedTables[index];
                this.showDataPreview(table);
            }
        } catch (error) {
            console.error('预览表格失败:', error);
            this.showError('无法预览表格');
        }
    }

    // 显示数据预览
    showDataPreview(table) {
        const modal = document.getElementById('dataModal');
        const preview = document.getElementById('dataPreview');

        // 创建预览表格
        let html = '<table>';

        // 表头
        if (table.headers.length > 0) {
            html += '<thead><tr>';
            table.headers.forEach(header => {
                html += `<th>${this.escapeHtml(header)}</th>`;
            });
            html += '</tr></thead>';
        }

        // 数据行（只显示前5行）
        html += '<tbody>';
        const displayRows = table.rows.slice(0, 5);
        displayRows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${this.escapeHtml(cell)}</td>`;
            });
            html += '</tr>';
        });

        if (table.rows.length > 5) {
            html += `<tr><td colspan="${table.headers.length}" style="text-align: center; font-style: italic;">... 还有 ${table.rows.length - 5} 行数据 ...</td></tr>`;
        }

        html += '</tbody></table>';
        preview.innerHTML = html;

        this.showModal('dataModal');
    }

    // 导出数据
    async exportData(format) {
        if (this.selectedTables.size === 0) {
            this.showError('请先选择要导出的表格');
            return;
        }

        const includeHeaders = document.getElementById('exportHeaders').checked;
        const exportSelectedOnly = document.getElementById('exportSelectedOnly').checked;

        try {
            for (const tableIndex of this.selectedTables) {
                const filename = `table_${tableIndex + 1}_${new Date().getTime()}.${format}`;

                if (format === 'csv') {
                    await chrome.tabs.sendMessage(this.currentTab.id, {
                        action: 'exportTable',
                        tableIndex: tableIndex,
                        includeHeaders: includeHeaders,
                        filename: filename
                    });
                } else if (format === 'json') {
                    await this.exportJSON(tableIndex, filename);
                }
            }

            this.showSuccess(`成功导出 ${this.selectedTables.size} 个表格`);
        } catch (error) {
            console.error('导出失败:', error);
            this.showError('导出失败，请重试');
        }
    }

    // 导出JSON
    async exportJSON(tableIndex, filename) {
        const table = this.detectedTables[tableIndex];
        if (!table) return;

        const jsonData = {
            url: this.currentTab.url,
            timestamp: new Date().toISOString(),
            tableIndex: tableIndex,
            headers: table.headers,
            rows: table.rows,
            metadata: {
                rowCount: table.rowCount,
                columnCount: table.columnCount,
                visible: table.visible
            }
        };

        const content = JSON.stringify(jsonData, null, 2);
        await this.downloadFile(filename, content, 'application/json');
    }

    // 开始自动提取
    async startAutoExtraction() {
        if (this.selectedTables.size === 0) {
            this.showError('请先选择要提取的表格');
            return;
        }

        const maxPages = parseInt(document.getElementById('maxPages').value);
        const delay = parseInt(document.getElementById('extractDelay').value) * 1000;
        const includeHeaders = document.getElementById('includeHeaders').checked;

        // 获取分页配置
        const paginationConfig = await this.getPaginationConfig();

        const config = {
            tableIndex: Array.from(this.selectedTables)[0], // 只处理第一个选中的表格
            maxPages: maxPages,
            delay: delay,
            includeHeaders: includeHeaders,
            paginationConfig: paginationConfig // 添加分页配置
        };

        try {
            this.showProgressSection();
            this.updateProgress(0, '开始自动提取...');

            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'startAutoExtraction',
                config: config
            });

            this.extractionSession = {
                startTime: Date.now(),
                config: config,
                progress: 0
            };

        } catch (error) {
            console.error('自动提取失败:', error);
            this.showError('自动提取启动失败');
            this.hideProgressSection();
        }
    }

    // 获取分页配置
    async getPaginationConfig() {
        try {
            const result = await chrome.storage.local.get(['paginationConfig']);
            return result.paginationConfig || {};
        } catch (error) {
            console.error('获取分页配置失败:', error);
            return {};
        }
    }

    // 取消提取
    async cancelExtraction() {
        try {
            // 发送取消消息到内容脚本
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'cancelAutoExtraction'
            });

            this.extractionSession = null;
            this.hideProgressSection();
            this.showInfo('提取已取消');
        } catch (error) {
            console.error('取消提取失败:', error);
            this.extractionSession = null;
            this.hideProgressSection();
            this.showInfo('提取已取消');
        }
    }

    // 显示进度
    showProgressSection() {
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('autoExtractSection').style.display = 'none';
        document.getElementById('exportSection').style.display = 'none';
    }

    // 隐藏进度
    hideProgressSection() {
        document.getElementById('progressSection').style.display = 'none';
    }

    // 更新进度
    updateProgress(percent, text) {
        document.getElementById('progressFill').style.width = `${percent}%`;
        document.getElementById('progressPercent').textContent = `${percent}%`;
        document.getElementById('progressText').textContent = text;
    }

    // 显示结果
    showResult(data) {
        this.hideProgressSection();
        document.getElementById('resultSection').style.display = 'block';

        const totalRows = data.reduce((sum, page) => sum + page.rows.length, 0);
        document.getElementById('extractedPages').textContent = data.length;
        document.getElementById('extractedRows').textContent = totalRows;

        this.extractionResult = data;
    }

    // 下载结果
    async downloadResult() {
        if (!this.extractionResult) return;

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'mergeCSVData',
                data: this.extractionResult
            });

            if (response && response.csv) {
                const filename = `auto_extract_${new Date().getTime()}.csv`;
                await chrome.runtime.sendMessage({
                    action: 'downloadFile',
                    filename: filename,
                    content: response.csv,
                    mimeType: 'text/csv'
                });

                this.showSuccess('文件下载成功');
            }
        } catch (error) {
            console.error('下载结果失败:', error);
            this.showError('下载失败');
        }
    }

    // 查看结果
    viewResult() {
        if (!this.extractionResult) return;

        const mergedData = this.extractionResult.reduce((merged, page) => {
            const rowsToAdd = merged.rows.length === 0 ? page.rows : page.rows.slice(1);
            merged.rows.push(...rowsToAdd);
            return merged;
        }, { headers: this.extractionResult[0].headers, rows: [] });

        this.showDataPreview(mergedData);
    }

    // 显示设置
    showSettings() {
        this.updateSettingsUI();
        this.showModal('settingsModal');
    }

    // 显示帮助
    showHelp() {
        const helpText = `
Table Export Pro 使用帮助：

1. 自动检测页面中的表格
2. 点击表格项目进行选择
3. 支持导出为CSV或JSON格式
4. 自动翻页提取功能可以抓取多页数据
5. 在设置中可以调整提取参数

快捷键：
- Ctrl+S: 快速导出选中表格
- Esc: 关闭弹窗
        `;

        alert(helpText);
    }

    // 配置分页
    configurePagination() {
        this.showPaginationConfigModal();
    }

    // 显示分页配置模态框
    showPaginationConfigModal() {
        // 显示当前分页信息
        this.updatePaginationInfo();

        // 加载已保存的配置
        this.loadPaginationConfig();

        this.showModal('paginationConfigModal');
    }

    // 更新分页信息显示
    updatePaginationInfo() {
        const infoBox = document.getElementById('paginationInfo');

        if (!this.paginationData) {
            infoBox.innerHTML = '<div class="info-item"><span>未检测到分页信息</span></div>';
            return;
        }

        const pagination = this.paginationData;
        let infoHTML = '';

        // 基本信息
        infoHTML += `<div class="info-item">
            <span class="info-label">检测状态:</span>
            <span class="info-value">${pagination.isEnabled ? '✅ 可用' : '❌ 不可用'}</span>
        </div>`;

        // 按钮信息
        if (pagination.text) {
            infoHTML += `<div class="info-item">
                <span class="info-label">按钮文本:</span>
                <span class="info-value">"${pagination.text}"</span>
            </div>`;
        }

        if (pagination.selector) {
            infoHTML += `<div class="info-item">
                <span class="info-label">选择器:</span>
                <span class="info-value">${pagination.selector}</span>
            </div>`;
        }

        // 当前页码
        if (pagination.currentPage && pagination.currentPage.pageNumber) {
            infoHTML += `<div class="info-item">
                <span class="info-label">当前页码:</span>
                <span class="info-value">第 ${pagination.currentPage.pageNumber} 页</span>
            </div>`;
        }

        // 总页数
        if (pagination.totalPages && pagination.totalPages.totalPages) {
            infoHTML += `<div class="info-item">
                <span class="info-label">总页数:</span>
                <span class="info-value">${pagination.totalPages.totalPages} 页</span>
            </div>`;
        }

        // URL模式
        if (pagination.urlPatterns && pagination.urlPatterns.length > 0) {
            infoHTML += `<div class="info-item">
                <span class="info-label">URL模式:</span>
                <span class="info-value">${pagination.urlPatterns.map(p => p.name).join(', ')}</span>
            </div>`;
        }

        infoBox.innerHTML = infoHTML;
    }

    // 加载分页配置
    async loadPaginationConfig() {
        try {
            const result = await chrome.storage.local.get(['paginationConfig']);
            const config = result.paginationConfig || {};

            // 填充表单字段
            document.getElementById('nextButtonSelector').value = config.nextButtonSelector || '';
            document.getElementById('nextButtonText').value = config.nextButtonText || '';
            document.getElementById('pageLoadDelay').value = config.pageLoadDelay || 2;
            document.getElementById('pageLoadTimeout').value = config.pageLoadTimeout || 10;
            document.getElementById('waitForUrlChange').checked = config.waitForUrlChange || false;
            document.getElementById('waitForLoadingComplete').checked = config.waitForLoadingComplete || false;
            document.getElementById('customWaitSelector').value = config.customWaitSelector || '';
            document.getElementById('maxRetries').value = config.maxRetries || 3;
            document.getElementById('retryDelay').value = config.retryDelay || 2;

        } catch (error) {
            console.error('加载分页配置失败:', error);
        }
    }

    // 保存分页配置
    async savePaginationConfig() {
        try {
            const config = {
                nextButtonSelector: document.getElementById('nextButtonSelector').value.trim(),
                nextButtonText: document.getElementById('nextButtonText').value.trim(),
                pageLoadDelay: parseInt(document.getElementById('pageLoadDelay').value) || 2,
                pageLoadTimeout: parseInt(document.getElementById('pageLoadTimeout').value) || 10,
                waitForUrlChange: document.getElementById('waitForUrlChange').checked,
                waitForLoadingComplete: document.getElementById('waitForLoadingComplete').checked,
                customWaitSelector: document.getElementById('customWaitSelector').value.trim(),
                maxRetries: parseInt(document.getElementById('maxRetries').value) || 3,
                retryDelay: parseInt(document.getElementById('retryDelay').value) || 2,
                timestamp: Date.now()
            };

            await chrome.storage.local.set({ paginationConfig: config });

            this.hideModal('paginationConfigModal');
            this.showSuccess('分页配置已保存');

            // 更新当前配置
            this.paginationConfig = config;

        } catch (error) {
            console.error('保存分页配置失败:', error);
            this.showError('保存配置失败');
        }
    }

    // 测试分页配置
    async testPaginationConfig() {
        try {
            const config = this.getPaginationConfigFromForm();

            this.showInfo('正在测试分页配置...');

            // 发送测试请求到内容脚本
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'testPaginationConfig',
                config: config
            });

            if (response && response.success) {
                this.showSuccess(`配置测试成功！${response.message || ''}`);
            } else {
                this.showError(`配置测试失败：${(response && response.error) || '未知错误'}`);
            }

        } catch (error) {
            console.error('测试分页配置失败:', error);
            this.showError('测试配置失败：' + error.message);
        }
    }

    // 从表单获取分页配置
    getPaginationConfigFromForm() {
        return {
            nextButtonSelector: document.getElementById('nextButtonSelector').value.trim(),
            nextButtonText: document.getElementById('nextButtonText').value.trim(),
            pageLoadDelay: parseInt(document.getElementById('pageLoadDelay').value) || 2,
            pageLoadTimeout: parseInt(document.getElementById('pageLoadTimeout').value) || 10,
            waitForUrlChange: document.getElementById('waitForUrlChange').checked,
            waitForLoadingComplete: document.getElementById('waitForLoadingComplete').checked,
            customWaitSelector: document.getElementById('customWaitSelector').value.trim(),
            maxRetries: parseInt(document.getElementById('maxRetries').value) || 3,
            retryDelay: parseInt(document.getElementById('retryDelay').value) || 2
        };
    }

    // 复制数据
    copyData() {
        const preview = document.getElementById('dataPreview');
        const text = preview.innerText;

        navigator.clipboard.writeText(text).then(() => {
            this.showSuccess('数据已复制到剪贴板');
        }).catch(error => {
            console.error('复制失败:', error);
            this.showError('复制失败');
        });
    }

    // 下载文件
    async downloadFile(filename, content, mimeType) {
        try {
            await chrome.runtime.sendMessage({
                action: 'downloadFile',
                filename: filename,
                content: content,
                mimeType: mimeType
            });
        } catch (error) {
            console.error('下载文件失败:', error);
            throw error;
        }
    }

    // 更新状态
    updateStatus(text, type = 'loading') {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.querySelector('.status-text');

        statusText.textContent = text;
        indicator.className = `status-indicator ${type}`;
    }

    // 更新表格计数
    updateTableCount() {
        document.getElementById('tableCount').textContent = this.detectedTables.length;
    }

    // 显示空状态
    showEmptyState() {
        const tableList = document.getElementById('tableList');
        tableList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <div class="empty-state-text">未检测到表格</div>
                <div class="empty-state-hint" style="font-size: 12px; color: #6c757d; margin-top: 8px;">
                    请确保页面已完全加载，或尝试刷新页面
                </div>
            </div>
        `;
    }

    // 显示成功
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // 显示信息
    showInfo(message) {
        this.showMessage(message, 'info');
    }

    // 显示消息
    showMessage(message, type) {
        // 简单的消息显示，可以扩展为更好的UI
        const colors = {
            error: '#dc3545',
            success: '#28a745',
            info: '#17a2b8'
        };

        console.log(`[${type.toUpperCase()}] ${message}`);

        // 可以在这里添加更好的消息显示UI
        if (type === 'error') {
            alert(`错误: ${message}`);
        }
    }

    // 显示模态框
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    // 隐藏模态框
    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showExtractionResult') {
        // 自动提取完成，显示结果
        if (window.popupManager) {
            window.popupManager.showResult(request.data);
        }
    } else if (request.action === 'updateExtractionProgress') {
        // 更新提取进度
        if (window.popupManager) {
            window.popupManager.updateProgress(request.progress,
                `正在提取第 ${request.currentPage} 页，共 ${request.totalPages} 页`);
        }
    }
});

// 初始化popup管理器
window.popupManager = new PopupManager();