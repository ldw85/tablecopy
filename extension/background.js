// 后台脚本 - 处理跨页面数据存储和管理
class BackgroundService {
  constructor() {
    this.autoExtractionData = new Map();
    this.extractionSessions = new Map();
    this.init();
  }

  init() {
    // 监听安装事件
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Table Export Pro installed');
      this.createContextMenu();
    });

    // 监听消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'contentScriptMissing') {
        console.log(`Content script missing for tab ${request.tabId}, attempting to inject...`);
        // 尝试重新注入内容脚本
        chrome.scripting.executeScript({
          target: { tabId: request.tabId },
          files: ['content.js']
        }).then(() => {
          console.log('Content script injected successfully');
        }).catch(err => {
          console.error('Failed to inject content script:', err);
        });
        return;
      }

      this.handleMessage(request, sender, sendResponse);
      return true; // 保持消息通道开放
    });

    // 监听标签页更新
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        this.handleTabComplete(tabId, tab);
      }
    });
  }

  // 创建右键菜单
  createContextMenu() {
    try {
      // 检查 chrome.contextMenus 是否可用
      if (!chrome.contextMenus) {
        console.error('chrome.contextMenus is not available. Make sure contextMenus permission is granted.');
        return;
      }

      // 先清除已存在的菜单项（如果存在）
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: 'exportTable',
          title: '导出表格数据',
          contexts: ['all']
        });
      });

      chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'exportTable') {
          this.handleContextMenuClick(tab);
        }
      });
    } catch (error) {
      console.error('Failed to create context menu:', error);
    }
  }

  // 处理右键菜单点击
  async handleContextMenuClick(tab) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const tables = document.querySelectorAll('table');
          return Array.from(tables).map((table, index) => ({
            index: index,
            rows: table.rows.length,
            visible: table.offsetParent !== null
          }));
        }
      });

      const tables = results[0].result;
      if (tables.length > 0) {
        // 发送消息到内容脚本显示通知
        chrome.tabs.sendMessage(tab.id, {
          action: 'showNotification',
          message: `检测到 ${tables.length} 个表格，点击扩展图标查看导出选项`
        }).catch(error => {
          console.log('Could not send message to tab:', error);
        });
      }
    } catch (error) {
      console.error('Context menu error:', error);
    }
  }

  // 处理消息
  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'autoExtractionComplete':
          await this.handleAutoExtractionComplete(request.data, sender.tab.id);
          sendResponse({ success: true });
          break;

        case 'updateExtractionProgress':
          await this.handleExtractionProgressUpdate(request.progress, request.currentPage, request.totalPages);
          sendResponse({ success: true });
          break;

        case 'getExtractionData':
          const data = await this.getExtractionData(request.sessionId);
          sendResponse({ data: data });
          break;

        case 'saveExtractionConfig':
          await this.saveExtractionConfig(request.config);
          sendResponse({ success: true });
          break;

        case 'getExtractionConfig':
          const config = await this.getExtractionConfig();
          sendResponse({ config: config });
          break;

        case 'mergeCSVData':
          const mergedCSV = await this.mergeCSVData(request.data);
          sendResponse({ csv: mergedCSV });
          break;

        case 'downloadFile':
          await this.downloadFile(request.filename, request.content, request.mimeType);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background message error:', error);
      sendResponse({ error: error.message });
    }
  }

  // 处理提取进度更新
  async handleExtractionProgressUpdate(progress, currentPage, totalPages) {
    try {
      // 发送进度更新到popup
      chrome.runtime.sendMessage({
        action: 'updateExtractionProgress',
        progress: progress,
        currentPage: currentPage,
        totalPages: totalPages
      }).catch(error => {
        console.log('Failed to send progress update to popup:', error);
      });
    } catch (error) {
      console.error('Error handling extraction progress update:', error);
    }
  }

  // 处理自动提取完成
  async handleAutoExtractionComplete(data, tabId) {
    const sessionId = `session_${Date.now()}_${tabId}`;

    // 存储提取数据
    this.autoExtractionData.set(sessionId, data);

    // 合并所有页面的数据
    const mergedData = this.mergeMultiPageData(data);

    // 转换为CSV
    const csv = this.convertToCSV(mergedData);

    // 发送到popup进行下载
    chrome.runtime.sendMessage({
      action: 'showExtractionResult',
      sessionId: sessionId,
      data: mergedData,
      csv: csv
    });

    // 清理过期数据
    this.cleanupOldData();
  }

  // 合并多页面数据
  mergeMultiPageData(pagesData) {
    if (!pagesData || pagesData.length === 0) return [];

    const merged = {
      headers: pagesData[0].headers,
      rows: []
    };

    pagesData.forEach(pageData => {
      // 跳过表头（除了第一页）
      const rowsToAdd = pageData === pagesData[0] ? pageData.rows : pageData.rows.slice(1);
      merged.rows.push(...rowsToAdd);
    });

    return merged;
  }

  // 转换为CSV格式
  convertToCSV(data) {
    if (!data || !data.headers || !data.rows) return '';

    let csv = '';

    // 添加表头
    if (data.headers.length > 0) {
      csv += data.headers.map(header => this.escapeCSV(header)).join(',') + '\n';
    }

    // 添加数据行
    data.rows.forEach(row => {
      csv += row.map(cell => this.escapeCSV(cell)).join(',') + '\n';
    });

    return csv;
  }

  // CSV转义
  escapeCSV(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }

    // 如果包含逗号、引号或换行符，需要用引号包裹
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      value = value.replace(/"/g, '""');
      return `"${value}"`;
    }

    return value;
  }

  // 获取提取数据
  async getExtractionData(sessionId) {
    return this.autoExtractionData.get(sessionId) || null;
  }

  // 保存提取配置
  async saveExtractionConfig(config) {
    await chrome.storage.local.set({ extractionConfig: config });
  }

  // 获取提取配置
  async getExtractionConfig() {
    const result = await chrome.storage.local.get('extractionConfig');
    return result.extractionConfig || {
      defaultDelay: 2000,
      maxPages: 10,
      includeHeaders: true,
      autoDetectPagination: true
    };
  }

  // 合并CSV数据
  async mergeCSVData(dataArray) {
    if (!dataArray || dataArray.length === 0) return '';

    const mergedData = this.mergeMultiPageData(dataArray);
    return this.convertToCSV(mergedData);
  }

  // 下载文件
  async downloadFile(filename, content, mimeType = 'text/csv') {
    try {
      // 创建blob
      const blob = new Blob([content], { type: mimeType });

      // 创建下载URL
      const url = URL.createObjectURL(blob);

      // 创建下载任务
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });

      // 清理URL
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // 处理标签页加载完成
  async handleTabComplete(tabId, tab) {
    console.log(`Tab ${tabId} loaded: ${tab.url}`);

    // 确保内容脚本已注入
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: (currentTabId) => {
          // 检查内容脚本是否已存在
          if (window.tableExtractor) {
            console.log('Content script already exists');
            return;
          }

          // 如果内容脚本不存在，发送消息让background知道
          chrome.runtime.sendMessage({
            action: 'contentScriptMissing',
            tabId: currentTabId
          });
        },
        args: [tabId]
      });
    } catch (error) {
      console.log('Tab complete check failed:', error);
    }
  }

  // 清理过期数据
  cleanupOldData() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    for (const [sessionId, data] of this.autoExtractionData.entries()) {
      const timestamp = parseInt(sessionId.split('_')[1]);
      if (now - timestamp > maxAge) {
        this.autoExtractionData.delete(sessionId);
      }
    }
  }

  // 获取浏览器信息
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);

    return {
      isChrome,
      isEdge,
      userAgent
    };
  }
}

// 初始化后台服务
const backgroundService = new BackgroundService();

// 监听扩展图标点击
chrome.action.onClicked.addListener((tab) => {
  // 如果需要在图标点击时执行特殊操作
  console.log('Extension icon clicked on tab:', tab.id);
});

// 错误处理
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundService;
}