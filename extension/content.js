class TableExtractor {
  constructor() {
    this.tables = [];
    this.paginationConfig = null;
    this.isExtracting = false;
    this.extractedData = [];

    // 初始化调试日志
    console.log('Table Extractor content script loaded');
  }

  // 检测页面中的表格（包括传统表格和Div表格）
  detectTables() {
    try {
      console.log('Starting table detection...');
      const tableData = [];
      let index = 0;

      // 1. 检测传统HTML表格
      try {
        const htmlTables = document.querySelectorAll('table');
        console.log(`Found ${htmlTables.length} HTML tables`);

        htmlTables.forEach((table) => {
          try {
            const headers = this.extractHeaders(table);
            const rows = this.extractRows(table);

            if (rows.length > 0) { // 确保有数据行
              tableData.push({
                index: index++,
                element: table,
                type: 'html',
                headers: headers,
                rows: rows,
                rowCount: rows.length,
                columnCount: headers.length,
                visible: this.isElementVisible(table)
              });
            }
          } catch (tableError) {
            console.error('Error processing HTML table:', tableError);
          }
        });
      } catch (error) {
        console.error('Error detecting HTML tables:', error);
      }

      // 2. 检测Div表格（常见的类名模式）
      try {
        const divTables = this.detectDivTables();
        console.log(`Found ${divTables.length} Div tables`);

        divTables.forEach((divTable) => {
          if (divTable.rows.length > 0) { // 确保有数据行
            tableData.push({
              index: index++,
              element: divTable.element,
              type: 'div',
              headers: divTable.headers,
              rows: divTable.rows,
              rowCount: divTable.rows.length,
              columnCount: divTable.headers.length,
              visible: this.isElementVisible(divTable.element),
              structure: divTable.structure
            });
          }
        });
      } catch (error) {
        console.error('Error detecting Div tables:', error);
      }

      console.log(`Total tables found: ${tableData.length}`);
      this.tables = tableData;
      return tableData;
    } catch (error) {
      console.error('Critical error in detectTables:', error);
      return [];
    }
  }

  // 提取表头
  extractHeaders(table) {
    const headers = [];
    const thead = table.querySelector('thead');
    const thElements = table.querySelectorAll('th');
    const firstRow = table.querySelector('tr');

    if (thead) {
      const headerCells = thead.querySelectorAll('th, td');
      headerCells.forEach(cell => headers.push(cell.textContent.trim()));
    } else if (thElements.length > 0) {
      thElements.forEach(th => headers.push(th.textContent.trim()));
    } else if (firstRow) {
      const cells = firstRow.querySelectorAll('td, th');
      cells.forEach(cell => headers.push(cell.textContent.trim()));
    }

    return headers;
  }

  // 提取表格行数据
  extractRows(table) {
    const rows = [];
    const tbody = table.querySelector('tbody') || table;
    const trElements = tbody.querySelectorAll('tr');

    trElements.forEach((row, rowIndex) => {
      // 跳过表头行
      if (row.querySelectorAll('th').length > 0 && rowIndex === 0) return;

      const rowData = [];
      const cells = row.querySelectorAll('td, th');

      cells.forEach(cell => {
        // 处理包含链接、图片等复杂内容的单元格
        let cellText = cell.textContent.trim();

        // 如果有链接，优先使用链接文本
        const link = cell.querySelector('a');
        if (link) {
          cellText = link.textContent.trim() || link.href;
        }

        // 如果有图片，添加alt文本
        const img = cell.querySelector('img');
        if (img && img.alt) {
          cellText += ` [${img.alt}]`;
        }

        rowData.push(cellText);
      });

      if (rowData.length > 0) {
        rows.push(rowData);
      }
    });

    return rows;
  }

  // 检测Div表格（增强版本，支持ARIA角色和复杂结构）
  detectDivTables() {
    const divTables = [];

    try {
      console.log('🔍 开始检测Div表格...');

      // 1. 首先检测基于ARIA角色的表格（如Google关键词规划师）
      const ariaTables = this.detectAriaTables();
      console.log(`  检测到 ${ariaTables.length} 个ARIA表格`);
      divTables.push(...ariaTables);

      // 2. 检测常见的表格类名模式
      const tablePatterns = [
        '.table',
        '.grid',
        '.data-grid',
        '.ess-table',  // Google关键词规划师特定
        '.particle-table', // Google关键词规划师特定
        '[role="grid"]', // ARIA网格
        '[role="table"]' // ARIA表格
      ];

      // 行和列的常见类名模式
      const rowSelectors = [
        '.row',
        '.tr',
        '.particle-table-row', // Google关键词规划师特定
        '[role="row"]' // ARIA行
      ];

      const cellSelectors = [
        '.cell',
        '.td',
        '.col',
        '.ess-cell', // Google关键词规划师特定
        '[role="gridcell"]', // ARIA单元格
        '[role="cell"]' // ARIA单元格
      ];

      const headerSelectors = [
        '.header',
        '.th',
        '.particle-table-header-cell', // Google关键词规划师特定
        '[role="columnheader"]', // ARIA列头
        '[role="rowheader"]' // ARIA行头
      ];

      // 检测每个可能的表格容器
      tablePatterns.forEach(pattern => {
        try {
          const containers = document.querySelectorAll(pattern);
          console.log(`  检测模式 ${pattern}: 找到 ${containers.length} 个容器`);

          containers.forEach(container => {
            // 避免重复检测
            if (divTables.some(dt => dt.element === container)) return;

            const tableData = this.extractDivTableData(container, rowSelectors, cellSelectors, headerSelectors);
            if (tableData && tableData.rows.length > 0) {
              divTables.push({
                element: container,
                headers: tableData.headers,
                rows: tableData.rows,
                structure: tableData.structure
              });
              console.log(`    ✅ 找到有效表格: ${tableData.rows.length} 行`);
            }
          });
        } catch (e) {
          console.log(`  ⚠️ 模式 ${pattern} 检测失败:`, e.message);
        }
      });

      console.log(`🔍 Div表格检测完成，找到 ${divTables.length} 个表格`);
      return divTables;
    } catch (error) {
      console.error('❌ Div表格检测失败:', error);
      return [];
    }
  }

  // 检测基于ARIA角色的表格（如Google关键词规划师）
  detectAriaTables() {
    const ariaTables = [];

    try {
      // 查找所有具有grid角色的元素
      const gridElements = document.querySelectorAll('[role="grid"]');
      console.log(`  找到 ${gridElements.length} 个ARIA grid 元素`);

      gridElements.forEach((gridElement, index) => {
        try {
          const tableData = this.extractAriaTableData(gridElement);
          if (tableData && tableData.rows.length > 0) {
            ariaTables.push({
              element: gridElement,
              headers: tableData.headers,
              rows: tableData.rows,
              structure: 'aria-grid'
            });
            console.log(`    ✅ 找到ARIA表格 ${index + 1}: ${tableData.rows.length} 行, ${tableData.headers.length} 列`);
          }
        } catch (error) {
          console.warn(`  ⚠️ 处理ARIA grid 元素 ${index} 失败:`, error.message);
        }
      });

      return ariaTables;
    } catch (error) {
      console.error('❌ ARIA表格检测失败:', error);
      return [];
    }
  }

  // 提取ARIA表格数据
  extractAriaTableData(gridElement) {
    try {
      const headers = [];
      const rows = [];

      // 1. 提取表头 - 查找 role="columnheader" 或 role="rowheader"
      const headerElements = gridElement.querySelectorAll('[role="columnheader"], [role="rowheader"]');
      headerElements.forEach(header => {
        headers.push(this.extractCellText(header));
      });

      // 2. 提取数据行 - 查找 role="row"
      const rowElements = gridElement.querySelectorAll('[role="row"]');

      rowElements.forEach((rowElement, rowIndex) => {
        // 跳过表头行（通常包含header元素）
        if (rowElement.querySelectorAll('[role="columnheader"], [role="rowheader"]').length > 0) {
          return;
        }

        const rowData = [];

        // 查找行内的单元格
        const cellElements = rowElement.querySelectorAll('[role="gridcell"], [role="cell"]');

        if (cellElements.length > 0) {
          // 标准ARIA单元格
          cellElements.forEach(cell => {
            rowData.push(this.extractCellText(cell));
          });
        } else {
          // 如果没有标准单元格，尝试提取直接子元素的文本
          const directChildren = Array.from(rowElement.children).filter(child => {
            // 排除脚本、样式等非内容元素
            const tagName = child.tagName.toLowerCase();
            return !['script', 'style', 'noscript'].includes(tagName) &&
                   child.textContent &&
                   child.textContent.trim().length > 0;
          });

          directChildren.forEach(child => {
            rowData.push(this.extractCellText(child));
          });
        }

        if (rowData.length > 0) {
          rows.push(rowData);
        }
      });

      // 如果没有找到明确的表头，尝试使用第一行作为表头
      if (headers.length === 0 && rows.length > 0) {
        const firstRow = rows[0];
        headers.push(...firstRow);
        rows.shift(); // 移除第一行（作为表头）
      }

      return { headers, rows };
    } catch (error) {
      console.error('提取ARIA表格数据失败:', error);
      return { headers: [], rows: [] };
    }
  }

  // 提取Div表格数据
  extractDivTableData(container, rowSelectors, cellSelectors, headerSelectors) {
    try {
      // 尝试不同的行选择器
      let rows = [];
      let headers = [];
      let structure = 'unknown';

      // 方法1: 查找明确的行结构
      for (const rowSelector of rowSelectors) {
        try {
          const rowElements = container.querySelectorAll(rowSelector);
          if (rowElements.length > 1) { // 至少2行（1行表头+1行数据）
            rows = this.extractDivRows(rowElements, cellSelectors);

            // 尝试提取表头
            headers = this.extractDivHeaders(container, headerSelectors, rowElements);

            if (rows.length > 0) {
              structure = 'row-based';
              break;
            }
          }
        } catch (selectorError) {
          console.warn(`Error with selector ${rowSelector}:`, selectorError);
          continue;
        }
      }

      // 方法2: 如果没有找到行结构，尝试直接查找单元格
      if (rows.length === 0) {
        try {
          const cells = container.querySelectorAll(cellSelectors.join(', '));
          if (cells.length > 0) {
            const tableStructure = this.organizeDivCells(cells);
            rows = tableStructure.rows;
            headers = tableStructure.headers;
            structure = 'cell-based';
          }
        } catch (cellError) {
          console.warn('Error organizing cells:', cellError);
        }
      }

      // 方法3: 检测列表结构（如ul/li或div列表）
      if (rows.length === 0) {
        try {
          const listStructure = this.detectListStructure(container);
          if (listStructure) {
            rows = listStructure.rows;
            headers = listStructure.headers;
            structure = 'list-based';
          }
        } catch (listError) {
          console.warn('Error detecting list structure:', listError);
        }
      }

      return { headers, rows, structure };
    } catch (error) {
      console.error('提取Div表格数据失败:', error);
      return { headers: [], rows: [], structure: 'error' };
    }
  }

  // 提取Div行数据
  extractDivRows(rowElements, cellSelectors) {
    const rows = [];

    for (let i = 0; i < rowElements.length; i++) {
      try {
        const row = rowElements[i];
        const cells = [];

        // 尝试不同的单元格选择器
        let foundCells = false;
        for (const cellSelector of cellSelectors) {
          try {
            const cellElements = row.querySelectorAll(cellSelector);
            if (cellElements.length > 0) {
              cellElements.forEach(cell => {
                cells.push(this.extractCellText(cell));
              });
              foundCells = true;
              break;
            }
          } catch (selectorError) {
            console.warn(`Cell selector error: ${cellSelector}`, selectorError);
          }
        }

        // 如果没有找到标准单元格，尝试获取所有子元素的文本
        if (!foundCells && row.children) {
          try {
            const directChildren = Array.from(row.children).filter(child => {
              try {
                return child && child.textContent && child.textContent.trim().length > 0;
              } catch (e) {
                return false;
              }
            });

            directChildren.forEach(child => {
              cells.push(this.extractCellText(child));
            });
          } catch (childrenError) {
            console.warn('Error processing row children:', childrenError);
          }
        }

        if (cells.length > 0) {
          rows.push(cells);
        }
      } catch (rowError) {
        console.warn(`Error processing row ${i}:`, rowError);
      }
    }

    return rows;
  }

  // 提取Div表头
  extractDivHeaders(container, headerSelectors, rowElements) {
    let headers = [];

    // 方法1: 查找专门的表头元素
    for (const headerSelector of headerSelectors) {
      const headerElements = container.querySelectorAll(headerSelector);
      if (headerElements.length > 0) {
        headerElements.forEach(header => {
          headers.push(this.extractCellText(header));
        });
        if (headers.length > 0) break;
      }
    }

    // 方法2: 使用第一行作为表头
    if (headers.length === 0 && rowElements.length > 0) {
      const firstRow = rowElements[0];
      const headerCells = [];

      // 尝试不同的单元格选择器
      const cellSelectors = ['.cell', '.td', '.col', '[class*="cell"]', '[class*="col"]'];
      for (const cellSelector of cellSelectors) {
        const cells = firstRow.querySelectorAll(cellSelector);
        if (cells.length > 0) {
          cells.forEach(cell => {
            headerCells.push(this.extractCellText(cell));
          });
          break;
        }
      }

      // 如果没有找到标准单元格，使用直接子元素
      if (headerCells.length === 0) {
        const directChildren = Array.from(firstRow.children).filter(child =>
          child.textContent.trim().length > 0
        );
        directChildren.forEach(child => {
          headerCells.push(this.extractCellText(child));
        });
      }

      headers = headerCells;
    }

    return headers;
  }

  // 组织Div单元格为表格结构
  organizeDivCells(cells) {
    const rows = [];
    const headers = [];

    // 简单方法：假设所有单元格按行优先顺序排列
    const cellsPerRow = Math.sqrt(cells.length) || 1;

    for (let i = 0; i < cells.length; i += cellsPerRow) {
      const row = [];
      for (let j = 0; j < cellsPerRow && (i + j) < cells.length; j++) {
        row.push(this.extractCellText(cells[i + j]));
      }

      if (row.length > 0) {
        // 假设第一行是表头
        if (rows.length === 0 && headers.length === 0) {
          headers.push(...row);
        } else {
          rows.push(row);
        }
      }
    }

    return { headers, rows };
  }

  // 检测列表结构
  detectListStructure(container) {
    const listItems = container.querySelectorAll('li, .item, [class*="item"]');
    if (listItems.length < 2) return null;

    const rows = [];

    listItems.forEach(item => {
      const text = this.extractCellText(item);
      if (text.includes(':') || text.includes('：')) {
        // 可能是键值对结构
        const parts = text.split(/[:：]/);
        if (parts.length >= 2) {
          rows.push([parts[0].trim(), parts.slice(1).join(':').trim()]);
        }
      } else {
        // 简单的单行数据
        rows.push([text]);
      }
    });

    if (rows.length > 0) {
      return {
        headers: rows.length > 0 ? ['数据'] : [],
        rows: rows
      };
    }

    return null;
  }

  // 提取单元格文本
  extractCellText(element) {
    // 移除脚本和样式内容
    const clone = element.cloneNode(true);
    const scripts = clone.querySelectorAll('script, style, .hidden, [style*="display:none"]');
    scripts.forEach(script => script.remove());

    // 提取文本内容
    let text = clone.textContent || clone.innerText || '';

    // 清理文本
    text = text.replace(/\s+/g, ' ').trim();

    // 如果有链接，优先使用链接文本
    const links = element.querySelectorAll('a');
    if (links.length === 1) {
      const linkText = links[0].textContent.trim();
      if (linkText.length > 0) {
        text = linkText;
      }
    }

    return text;
  }

  // 检测元素是否可见
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return rect.width > 0 &&
           rect.height > 0 &&
           style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  // 检测分页配置（增强版本）
  detectPagination() {
    try {
      console.log('🔍 开始检测分页配置...');

      // 1. 检测常见的分页容器和按钮
      const paginationPatterns = [
        '.pagination',
        '.pager',
        '.page-nav',
        '.dataTables_paginate',
        '.pagination-wrapper',
        '.page-navigation',
        '[class*="pagination"]',
        '[class*="page-nav"]',
        '[role="navigation"]'
      ];

      let paginationContainer = null;
      let detectedType = 'unknown';

      // 查找分页容器
      for (const pattern of paginationPatterns) {
        const elements = document.querySelectorAll(pattern);
        if (elements.length > 0) {
          paginationContainer = elements[0];
          detectedType = 'container';
          console.log(`✅ 找到分页容器: ${pattern}`);
          break;
        }
      }

      // 2. 检测下一页按钮（多种方式）
      const nextButtonSelectors = [
        // 标准选择器
        '.next',
        '.next-page',
        '.pagination-next',
        '.pager-next',
        // ARIA标签
        '[aria-label="Next"]',
        '[aria-label="下一页"]',
        '[aria-label="转到下一页"]',
        // rel属性
        '[rel="next"]',
        // Material Design
        'material-button.next',
        'material-button[aria-label*="下一页"]',
        'material-button[aria-label*="next"]',
        // 文本内容
        'a:contains("下一页")',
        'button:contains("下一页")',
        'a:contains("Next")',
        'button:contains("Next")',
        // 图标类
        '[class*="next"]',
        '[class*="arrow-right"]',
        '[class*="chevron-right"]'
      ];

      let nextButton = null;
      let nextButtonSelector = null;

      // 尝试直接选择器
      for (const selector of nextButtonSelectors) {
        try {
          if (selector.includes(':contains')) {
            // 处理包含文本的选择器
            const match = selector.match(/([^:]+):contains\("([^"]+)"\)/);
            if (match) {
              const [, elementSelector, text] = match;
              const elements = document.querySelectorAll(elementSelector);
              for (const element of elements) {
                if (element.textContent.includes(text)) {
                  nextButton = element;
                  nextButtonSelector = selector;
                  break;
                }
              }
            }
          } else {
            const element = document.querySelector(selector);
            if (element && this.isElementVisible(element) && !element.disabled) {
              nextButton = element;
              nextButtonSelector = selector;
              break;
            }
          }
        } catch (e) {
          console.warn(`选择器错误: ${selector}`, e.message);
        }
        if (nextButton) break;
      }

      // 3. 智能文本分析查找
      if (!nextButton) {
        const allButtons = document.querySelectorAll('a, button, material-button, [role="button"]');
        for (const button of allButtons) {
          if (!this.isElementVisible(button) || button.disabled) continue;

          const text = button.textContent.trim().toLowerCase();
          const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();

          // 正向匹配
          const nextIndicators = [
            'next', '下一页', '下页', 'forward', '前进',
            '»', '→', '▶', '>', 'chevron_right', 'navigate_next'
          ];

          // 反向排除
          const excludeIndicators = [
            'prev', 'previous', '上一页', '上页', 'back', '后退',
            '«', '←', '◀', '<', 'chevron_left'
          ];

          const hasNextIndicator = nextIndicators.some(indicator =>
            text.includes(indicator) || ariaLabel.includes(indicator)
          );

          const hasExcludeIndicator = excludeIndicators.some(indicator =>
            text.includes(indicator) || ariaLabel.includes(indicator)
          );

          if (hasNextIndicator && !hasExcludeIndicator) {
            nextButton = button;
            nextButtonSelector = 'text-analysis';
            console.log(`✅ 通过文本分析找到下一页按钮: "${text || ariaLabel}"`);
            break;
          }
        }
      }

      // 4. 检测当前页码信息
      const currentPageInfo = this.detectCurrentPageInfo();

      // 5. 检测总页数信息
      const totalPagesInfo = this.detectTotalPagesInfo();

      // 6. URL模式检测
      const urlPatterns = this.detectURLPatterns();

      // 7. 智能计算总页数（如果其他方法失败）
      let calculatedTotalPages = null;
      if (!totalPagesInfo && currentPageInfo && currentPageInfo.pageNumber) {
        calculatedTotalPages = this.calculateTotalPages();
      }

      if (nextButton) {
        const paginationInfo = {
          type: 'button',
          selector: nextButtonSelector,
          element: nextButton,
          text: nextButton.textContent.trim(),
          container: paginationContainer,
          currentPage: currentPageInfo,
          totalPages: totalPagesInfo || calculatedTotalPages,
          urlPatterns: urlPatterns,
          isEnabled: !nextButton.disabled && nextButton.getAttribute('aria-disabled') !== 'true'
        };

        console.log('✅ 分页检测成功:', paginationInfo);
        return paginationInfo;
      }

      console.log('⚠️ 未检测到分页功能');
      return null;

    } catch (error) {
      console.error('❌ 分页检测失败:', error);
      return null;
    }
  }

  // 检测当前页码信息
  detectCurrentPageInfo() {
    try {
      // 查找当前页码元素
      const currentPageSelectors = [
        '.current',
        '.active',
        '.page-current',
        '[aria-current="page"]',
        '.pagination .current'
      ];

      for (const selector of currentPageSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent.trim();
          const pageNum = parseInt(text);
          if (!isNaN(pageNum)) {
            return {
              element: element,
              pageNumber: pageNum,
              text: text
            };
          }
        }
      }

      // 从URL中检测当前页码
      const url = window.location.href;
      const pageMatch = url.match(/[?&]page[=\/](\d+)/i) ||
                       url.match(/[?&]p[=\/](\d+)/i) ||
                       url.match(/[?&]offset[=\/](\d+)/i);

      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1]);
        if (!isNaN(pageNum)) {
          return {
            pageNumber: pageNum,
            source: 'url'
          };
        }
      }

      return null;
    } catch (error) {
      console.warn('检测当前页码失败:', error);
      return null;
    }
  }

  // 检测总页数信息
  detectTotalPagesInfo() {
    try {
      console.log('🔍 开始检测总页数信息...');

      // 优先查找常见的分页信息容器
      const paginationSelectors = [
        '.pagination',
        '.pager',
        '.page-nav',
        '.dataTables_paginate',
        '.pagination-wrapper',
        '.page-navigation',
        '[class*="pagination"]',
        '[class*="page-nav"]'
      ];

      let pageInfoElements = [];

      // 1. 优先在分页容器中查找
      for (const selector of paginationSelectors) {
        const containers = document.querySelectorAll(selector);
        if (containers.length > 0) {
          console.log(`✅ 找到分页容器: ${selector}`);
          // 在分页容器内查找页数信息
          for (const container of containers) {
            const infoElements = container.querySelectorAll('span, div, a, button');
            pageInfoElements.push(...infoElements);
          }
          break;
        }
      }

      // 2. 如果没有找到分页容器，查找特定的页数显示元素
      if (pageInfoElements.length === 0) {
        const specificSelectors = [
          '[class*="page-info"]',
          '[class*="page-count"]',
          '[class*="total-pages"]',
          '.page-info',
          '.page-count',
          '.total-pages'
        ];

        for (const selector of specificSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            console.log(`✅ 找到页数信息元素: ${selector}`);
            pageInfoElements = elements;
            break;
          }
        }
      }

      // 3. 最后才使用通用选择器，但限制范围
      if (pageInfoElements.length === 0) {
        // 只查找body下的直接文本元素，避免样式和脚本内容
        pageInfoElements = document.querySelectorAll('body span, body div, body a, body button, body p');
      }

      console.log(`📋 将在 ${pageInfoElements.length} 个元素中查找页数信息`);

      // 常见模式：共X页，Page X of Y，1 / 10 等
      const patterns = [
        /共\s*(\d+)\s*页/i,
        /Page\s*\d+\s*of\s*(\d+)/i,
        /(\d+)\s*\/\s*(\d+)/,
        /(\d+)\s*页\s*共/i,
        /总共\s*(\d+)\s*页/i,
        /Total:\s*(\d+)\s*pages?/i
      ];

      for (const element of pageInfoElements) {
        const text = element.textContent.trim();

        // 跳过过长的文本（可能是样式或脚本内容）
        if (text.length > 100) continue;

        // 跳过包含CSS样式的文本
        if (text.includes('{') || text.includes('}') || text.includes('::')) continue;

        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            const totalPages = parseInt(match[1]);
            if (!isNaN(totalPages) && totalPages > 0 && totalPages < 1000) { // 增加合理性检查
              console.log(`✅ 找到总页数: ${totalPages} 页，匹配文本: "${text}"，模式: ${pattern}`);
              return {
                totalPages: totalPages,
                text: text,
                pattern: pattern.toString()
              };
            }
          }
        }
      }

      console.log('⚠️ 未找到总页数信息');
      return null;
    } catch (error) {
      console.error('❌ 检测总页数失败:', error);
      return null;
    }
  }

  // 检测URL分页模式
  detectURLPatterns() {
    try {
      const url = window.location.href;
      const patterns = [];

      // 常见的分页参数模式
      const urlPatterns = [
        { pattern: /page[=\/]\d+/i, name: 'page' },
        { pattern: /p[=\/]\d+/i, name: 'p' },
        { pattern: /offset[=\/]\d+/i, name: 'offset' },
        { pattern: /start[=\/]\d+/i, name: 'start' },
        { pattern: /index[=\/]\d+/i, name: 'index' }
      ];

      urlPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(url)) {
          patterns.push({
            name: name,
            pattern: pattern,
            currentValue: this.extractPageNumberFromURL(pattern)
          });
        }
      });

      return patterns;
    } catch (error) {
      console.warn('检测URL模式失败:', error);
      return [];
    }
  }

  // 智能计算总页数（基于表格行数和当前页信息）
  calculateTotalPages() {
    try {
      console.log('🧮 开始智能计算总页数...');

      // 1. 获取当前页码
      const currentPageInfo = this.detectCurrentPageInfo();
      if (!currentPageInfo || !currentPageInfo.pageNumber) {
        console.log('⚠️ 无法获取当前页码，无法计算总页数');
        return null;
      }

      const currentPage = currentPageInfo.pageNumber;
      console.log(`📄 当前页码: ${currentPage}`);

      // 2. 获取当前表格数据
      const tables = this.detectTables();
      if (!tables || tables.length === 0) {
        console.log('⚠️ 未检测到表格，无法计算总页数');
        return null;
      }

      // 3. 查找页数信息元素
      const pageInfoPatterns = [
        /(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/i,  // 1-10 of 172
        /(\d+)\s*\/\s*(\d+)/,               // 1/18
        /显示\s*(\d+)\s*-\s*(\d+)\s*条.*共\s*(\d+)\s*条/i, // 显示 1-10 条，共 172 条
        /Showing\s*(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/i, // Showing 1-10 of 172
      ];

      // 4. 在页面中查找页数信息
      const elements = document.querySelectorAll('span, div, p, a');
      for (const element of elements) {
        const text = element.textContent.trim();

        // 跳过过长的文本
        if (text.length > 200) continue;

        for (const pattern of pageInfoPatterns) {
          const match = text.match(pattern);
          if (match) {
            let totalItems = 0;
            let itemsPerPage = 0;

            if (match.length === 4) { // 1-10 of 172 格式
              const startItem = parseInt(match[1]);
              const endItem = parseInt(match[2]);
              totalItems = parseInt(match[3]);
              itemsPerPage = endItem - startItem + 1;
            } else if (match.length === 3) { // 1/18 格式
              totalItems = parseInt(match[2]);
              itemsPerPage = 10; // 默认每页10条
            }

            if (totalItems > 0 && itemsPerPage > 0) {
              const calculatedPages = Math.ceil(totalItems / itemsPerPage);
              console.log(`✅ 智能计算总页数: ${calculatedPages} 页 (${totalItems}条数据，每页${itemsPerPage}条)`);

              return {
                totalPages: calculatedPages,
                text: text,
                pattern: 'smart-calculation',
                totalItems: totalItems,
                itemsPerPage: itemsPerPage,
                source: 'intelligent-calculation'
              };
            }
          }
        }
      }

      // 5. 如果还是无法计算，尝试基于表格行数估算
      const mainTable = tables[0]; // 假设第一个表格是主要数据表格
      if (mainTable && mainTable.rows.length > 0) {
        const currentRows = mainTable.rows.length;

        // 如果当前页不是第一页，我们可以估算总页数
        if (currentPage > 1) {
          // 假设所有页面行数相同（粗略估算）
          const estimatedPages = currentPage + 5; // 给一些余量
          console.log(`📊 基于当前页码估算总页数: ${estimatedPages} 页`);

          return {
            totalPages: estimatedPages,
            text: `Estimated ${estimatedPages} pages`,
            pattern: 'estimation',
            currentRows: currentRows,
            source: 'estimation'
          };
        }
      }

      console.log('⚠️ 无法智能计算总页数');
      return null;
    } catch (error) {
      console.error('❌ 智能计算总页数失败:', error);
      return null;
    }
  }

  // 从URL提取页码
  extractPageNumberFromURL(pattern) {
    try {
      const url = window.location.href;
      const match = url.match(pattern);
      if (match) {
        const numMatch = match[0].match(/\d+/);
        return numMatch ? parseInt(numMatch[0]) : 1;
      }
      return 1;
    } catch (error) {
      return 1;
    }
  }

  // 导出表格数据为CSV
  exportToCSV(tableIndex, includeHeaders = true) {
    const table = this.tables[tableIndex];
    if (!table) return null;

    let csv = '';

    // 添加表头
    if (includeHeaders && table.headers.length > 0) {
      csv += table.headers.map(header => this.escapeCSV(header)).join(',') + '\n';
    }

    // 添加数据行
    table.rows.forEach(row => {
      csv += row.map(cell => this.escapeCSV(cell)).join(',') + '\n';
    });

    return csv;
  }

  // CSV转义处理
  escapeCSV(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }

    // 如果包含逗号、引号或换行符，需要用引号包裹
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // 将双引号替换为两个双引号
      value = value.replace(/"/g, '""');
      return `"${value}"`;
    }

    return value;
  }

  // 下载CSV文件
  downloadCSV(csvContent, filename = 'table_export.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // 高亮表格
  highlightTable(tableIndex) {
    this.clearHighlights();

    const table = this.tables[tableIndex];
    if (table && table.element) {
      table.element.style.outline = '3px solid #007bff';
      table.element.style.outlineOffset = '2px';
      table.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // 清除高亮
  clearHighlights() {
    this.tables.forEach(table => {
      if (table.element) {
        table.element.style.outline = '';
        table.element.style.outlineOffset = '';
      }
    });
  }
}

// 初始化表格提取器
const tableExtractor = new TableExtractor();

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(async (request, _sender, sendResponse) => {
  console.log('📨 收到消息:', request);

  switch (request.action) {
    case 'ping':
      console.log('🏓 收到ping，返回pong');
      sendResponse({ pong: true });
      break;

    case 'detectTables':
      try {
        console.log('🔍 开始检测表格...');
        const tables = tableExtractor.detectTables();
        console.log(`✅ 检测完成，找到${tables.length}个表格`);
        sendResponse({ tables: tables });
      } catch (error) {
        console.error('❌ 检测表格失败:', error);
        sendResponse({ error: error.message });
      }
      break;

    case 'exportTable':
      const csv = tableExtractor.exportToCSV(request.tableIndex, request.includeHeaders);
      if (csv) {
        tableExtractor.downloadCSV(csv, request.filename);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Table not found' });
      }
      break;

    case 'highlightTable':
      tableExtractor.highlightTable(request.tableIndex);
      sendResponse({ success: true });
      break;

    case 'clearHighlights':
      tableExtractor.clearHighlights();
      sendResponse({ success: true });
      break;

    case 'detectPagination':
      const pagination = tableExtractor.detectPagination();
      sendResponse({ pagination: pagination });
      break;

    case 'startAutoExtraction':
      try {
        const extractionController = startAutoExtraction(request.config);
        tableExtractor.extractionController = extractionController;
        sendResponse({ success: true });
      } catch (error) {
        console.error('❌ 启动自动提取失败:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'cancelAutoExtraction':
      if (tableExtractor.extractionController) {
        tableExtractor.extractionController.cancel();
        tableExtractor.extractionController = null;
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No extraction in progress' });
      }
      break;

    case 'testPaginationConfig':
      try {
        const result = await testPaginationConfig(request.config);
        sendResponse(result);
      } catch (error) {
        console.error('测试分页配置失败:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'showNotification':
      showNotification(request.message);
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }

  return true; // 保持消息通道开放
});

// 测试分页配置
async function testPaginationConfig(config) {
  try {
    console.log('🧪 开始测试分页配置:', config);

    // 1. 测试下一页按钮选择器
    if (config.nextButtonSelector) {
      const button = document.querySelector(config.nextButtonSelector);
      if (!button) {
        return {
          success: false,
          error: `未找到选择器 "${config.nextButtonSelector}" 对应的元素`
        };
      }

      if (!tableExtractor.isElementVisible(button)) {
        return {
          success: false,
          error: '找到的元素不可见'
        };
      }

      if (button.disabled || button.getAttribute('aria-disabled') === 'true') {
        return {
          success: false,
          error: '按钮已禁用'
        };
      }

      // 验证按钮文本
      if (config.nextButtonText) {
        const actualText = button.textContent.trim();
        if (!actualText.includes(config.nextButtonText)) {
          return {
            success: false,
            error: `按钮文本不匹配。期望包含 "${config.nextButtonText}"，实际为 "${actualText}"`
          };
        }
      }
    }

    // 2. 测试自定义等待元素
    if (config.customWaitSelector) {
      const element = document.querySelector(config.customWaitSelector);
      if (!element) {
        return {
          success: false,
          error: `未找到自定义等待元素 "${config.customWaitSelector}"`
        };
      }
    }

    // 3. 测试分页检测功能
    const pagination = tableExtractor.detectPagination();
    if (!pagination || !pagination.element) {
      return {
        success: false,
        error: '无法检测到分页功能'
      };
    }

    console.log('✅ 分页配置测试通过');
    return {
      success: true,
      message: '配置测试成功！可以开始自动提取。'
    };

  } catch (error) {
    console.error('❌ 分页配置测试失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 自动提取功能（增强版本，支持自定义分页配置）
function startAutoExtraction(config) {
  console.log('🚀 开始自动提取函数，配置:', config);

  try {
    const { tableIndex, maxPages, delay, includeHeaders, paginationConfig = {} } = config;

    if (tableExtractor.isExtracting) {
      console.log('⚠️ 提取已在进行中，忽略新请求');
      return {
        cancel: () => {
          console.log('🛑 提取已在进行中，取消操作');
        }
      };
    }

    console.log('🚀 开始自动分页提取:', config);

    tableExtractor.isExtracting = true;
    tableExtractor.extractedData = [];
    tableExtractor.extractionConfig = config;

    // 显示开始通知
    showNotification('开始自动分页提取...');

    // 提取当前页面数据
    const firstPageRows = extractCurrentPageData(tableIndex, includeHeaders);
    console.log(`✅ 第一页提取完成，共 ${firstPageRows} 行数据`);

    let currentPage = 1;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    // 查找并点击下一页
    const extractNextPage = async () => {
      if (!tableExtractor.isExtracting) {
        console.log('⏹️ 提取已被取消');
        return;
      }

      if (tableExtractor.extractedData.length >= maxPages) {
        console.log(`✅ 已达到最大页数限制: ${maxPages}`);
        finishExtraction();
        return;
      }

      if (consecutiveErrors >= maxConsecutiveErrors) {
        console.error(`❌ 连续错误次数过多 (${consecutiveErrors})，停止提取`);
        showNotification(`提取失败：连续错误次数过多`);
        finishExtraction();
        return;
      }

      try {
        console.log(`📄 正在处理第 ${currentPage + 1} 页...`);
        const tables = tableExtractor.detectTables();

        // 查找下一页按钮（使用自定义配置或默认检测）
        let nextButton = null;

        if (paginationConfig.nextButtonSelector) {
          // 使用自定义选择器
          nextButton = document.querySelector(paginationConfig.nextButtonSelector);
          if (nextButton && paginationConfig.nextButtonText) {
            // 验证按钮文本
            const actualText = nextButton.textContent.trim();
            if (!actualText.includes(paginationConfig.nextButtonText)) {
              console.warn(`按钮文本不匹配。期望包含 "${paginationConfig.nextButtonText}"，实际为 "${actualText}"`);
            }
          }
        } else {
          // 使用默认检测
          nextButton = findNextPageButton();
        }

        if (!nextButton) {
          console.log('ℹ️ 未找到下一页按钮，可能已到达最后一页');
          showNotification('已到达最后一页，提取完成');
          finishExtraction();
          return;
        }

        // 检查按钮是否可用
        if (nextButton.disabled || nextButton.getAttribute('aria-disabled') === 'true') {
          console.log('ℹ️ 下一页按钮已禁用，可能已到达最后一页');
          showNotification('已到达最后一页，提取完成');
          finishExtraction();
          return;
        }

        // 记录当前页面信息用于验证和表格数据用于对比
        const pageInfoBefore = {
          url: window.location.href,
          title: document.title,
          timestamp: Date.now()
        };
        const previousTableData = tables[tableIndex] ? tables[tableIndex].rows : [];

        console.log('🔘 点击下一页按钮');

        // 点击下一页按钮
        nextButton.click();

        // 等待页面加载完成
        await waitForPageLoad(delay, pageInfoBefore, previousTableData);

        // 验证页面是否真的发生了变化
        const pageInfoAfter = {
          url: window.location.href,
          title: document.title,
          timestamp: Date.now()
        };

        if (pageInfoBefore.url === pageInfoAfter.url && pageInfoBefore.title === pageInfoAfter.title) {
          // 页面可能没有真正刷新，等待更长时间
          console.log('⚠️ 页面可能未刷新，等待额外时间...');
          await new Promise(resolve => setTimeout(resolve, delay * 2));
        }

        // 提取新页面的数据
        const extractedRows = extractCurrentPageData(tableIndex, includeHeaders);

        if (extractedRows === 0) {
          console.warn('⚠️ 未提取到数据，可能页面加载失败');
          consecutiveErrors++;
        } else {
          console.log(`✅ 成功提取 ${extractedRows} 行数据`);
          consecutiveErrors = 0; // 重置错误计数
          currentPage++;

          // 发送进度更新
          const progress = Math.min(100, Math.round((tableExtractor.extractedData.length / maxPages) * 100));
          chrome.runtime.sendMessage({
            action: 'updateExtractionProgress',
            progress: progress,
            currentPage: tableExtractor.extractedData.length,
            totalPages: maxPages
          });
        }

        // 继续下一页
        setTimeout(extractNextPage, delay);

      } catch (error) {
        console.error(`❌ 提取第 ${currentPage + 1} 页失败:`, error);
        consecutiveErrors++;

        showNotification(`提取第 ${currentPage + 1} 页失败: ${error.message}`);

        // 等待一段时间后重试
        setTimeout(extractNextPage, delay * 2);
      }
    };

    // 等待页面加载完成（支持自定义配置）
    function waitForPageLoad(delay, previousPageInfo, previousTableData) {
      return new Promise((resolve) => {
        let checkCount = 0;
        const maxChecks = paginationConfig.pageLoadTimeout ? Math.ceil(paginationConfig.pageLoadTimeout * 1000 / 500) : 20;
        const checkInterval = Math.max(500, delay / 4);

        const checkPageLoaded = () => {
          checkCount++;

          // 检查页面是否发生变化
          const currentUrl = window.location.href;
          const currentTitle = document.title;

          const urlChanged = currentUrl !== previousPageInfo.url;
          const titleChanged = currentTitle !== previousPageInfo.title;

          // 检查是否有加载指示器消失
          let isLoading = false;
          if (paginationConfig.waitForLoadingComplete !== false) {
            const loadingElements = document.querySelectorAll('.loading, .spinner, [class*="loading"], [class*="spinner"]');
            isLoading = Array.from(loadingElements).some(el => tableExtractor.isElementVisible(el));
          }

          // 检查自定义等待元素
          let customElementReady = true;
          if (paginationConfig.customWaitSelector) {
            const customElement = document.querySelector(paginationConfig.customWaitSelector);
            customElementReady = customElement !== null;
          }

          // 检查表格是否存在且有数据
          const tables = tableExtractor.detectTables();
          const hasValidTable = tables.length > 0 && tableIndex < tables.length && tables[tableIndex].rows.length > 0;

          // 检查表格内容是否变化 (核心改进)
          let tableContentChanged = false;
          if (hasValidTable && previousTableData) {
            const currentTableRows = tables[tableIndex].rows;
            // Simple check: compare row count. A more robust check would involve hashing or deep comparison.
            if (currentTableRows.length !== previousTableData.length ||
                JSON.stringify(currentTableRows) !== JSON.stringify(previousTableData)) {
              tableContentChanged = true;
            }
          } else if (hasValidTable && !previousTableData) {
            // If no previous data, any valid table is a change.
            tableContentChanged = true;
          }


          console.log(`⏳ 页面加载检查 ${checkCount}: URL变化=${urlChanged}, 标题变化=${titleChanged}, 加载中=${isLoading}, 自定义元素=${customElementReady}, 表格存在=${hasValidTable}, 表格内容变化=${tableContentChanged}`);

          // 根据配置决定何时继续
          let shouldContinue = false;

          if (paginationConfig.waitForUrlChange) {
            // 必须等待URL变化和表格内容变化
            shouldContinue = urlChanged && !isLoading && customElementReady && tableContentChanged;
          } else {
            // 默认逻辑：URL变化或标题变化或表格存在且内容变化，且没有加载中
            shouldContinue = (urlChanged || titleChanged || (hasValidTable && tableContentChanged)) && !isLoading && customElementReady;
          }

          if (shouldContinue) {
            console.log('✅ 页面加载完成');
            resolve();
          } else if (checkCount >= maxChecks) {
            console.log('⚠️ 达到最大检查次数，继续执行');
            resolve();
          } else {
            setTimeout(checkPageLoaded, checkInterval);
          }
        };

        // 开始检查
        const initialDelay = paginationConfig.pageLoadDelay ? paginationConfig.pageLoadDelay * 1000 : Math.max(1000, delay / 2);
        setTimeout(checkPageLoaded, initialDelay);
      });
    }

    // 完成提取
    function finishExtraction() {
      console.log('🏁 自动提取完成');
      console.log(`📊 总计提取了 ${tableExtractor.extractedData.length} 页数据`);

      tableExtractor.isExtracting = false;

      // 显示完成通知
      showNotification(`自动提取完成！共提取 ${tableExtractor.extractedData.length} 页数据`);

      // 发送数据到background
      chrome.runtime.sendMessage({
        action: 'autoExtractionComplete',
        data: tableExtractor.extractedData
      });
    }

    // 开始提取流程
    setTimeout(extractNextPage, delay);

    // 返回控制函数
    return {
      cancel: () => {
        console.log('🛑 用户取消自动提取');
        tableExtractor.isExtracting = false;
        showNotification('自动提取已取消');
      }
    };

  } catch (error) {
    console.error('❌ 自动提取初始化失败:', error);
    tableExtractor.isExtracting = false;
    showNotification('自动提取启动失败: ' + error.message);

    return {
      cancel: () => {
        console.log('🛑 提取初始化失败，无需取消');
      }
    };
  }
}

// 提取当前页面数据（增强版本）
function extractCurrentPageData(tableIndex, includeHeaders = true) {
  try {
    console.log(`📄 提取第 ${tableExtractor.extractedData.length + 1} 页数据...`);

    const tables = tableExtractor.detectTables();
    const table = tables[tableIndex];

    if (!table) {
      console.warn(`⚠️ 未找到表格 ${tableIndex}`);
      return 0;
    }

    if (!table.rows || table.rows.length === 0) {
      console.warn(`⚠️ 表格 ${tableIndex} 没有数据行`);
      return 0;
    }

    // 确定要提取的行（跳过表头，除了第一页）
    let rowsToExtract = table.rows;
    if (!includeHeaders && tableExtractor.extractedData.length > 0) {
      // 如果不是第一页，跳过表头行
      rowsToExtract = table.rows.slice(1);
    }

    const pageData = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      headers: table.headers,
      rows: rowsToExtract,
      pageNumber: tableExtractor.extractedData.length + 1,
      rowCount: rowsToExtract.length
    };

    tableExtractor.extractedData.push(pageData);

    console.log(`✅ 成功提取 ${rowsToExtract.length} 行数据`);
    return rowsToExtract.length;

  } catch (error) {
    console.error('❌ 提取当前页面数据失败:', error);
    return 0;
  }
}

// 查找下一页按钮（增强版本，支持Google关键词规划师等复杂结构）
function findNextPageButton() {
  const selectors = [
    // 标准分页按钮
    'a.next',
    'button.next',
    '.pagination .next',
    '[aria-label="Next"]',
    '[aria-label="转到下一页"]', // Google关键词规划师特定
    '[rel="next"]',

    // Material Design风格按钮（Google关键词规划师）
    'material-button.next',
    '.material-button.next',
    'material-button[aria-label*="下一页"]',
    'material-button[aria-label*="next"]',

    // 图标按钮
    '[aria-label*="chevron_right"]',
    'i.material-icons:contains("chevron_right")',
    '.material-icons:contains("chevron_right")',

    // 通用包含文本的按钮
    'button:contains("下一页")',
    'button:contains("Next")',
    'a:contains("下一页")',
    'a:contains("Next")',

    // 其他常见模式
    '.pager-next',
    '.page-next',
    '[class*="next"]',
    '[class*="pagination"] [class*="next"]'
  ];

  // 1. 尝试标准CSS选择器
  for (const selector of selectors) {
    try {
      let elements;

      // 处理包含:contains的选择器
      if (selector.includes(':contains')) {
        elements = findElementsByText(selector);
      } else {
        elements = document.querySelectorAll(selector);
      }

      for (const element of elements) {
        if (element && element.offsetParent !== null && !element.disabled && element.getAttribute('aria-disabled') !== 'true') {
          console.log(`✅ 找到下一页按钮: ${selector}`);
          return element;
        }
      }
    } catch (e) {
      // 忽略无效选择器
      console.warn(`选择器无效: ${selector}`, e.message);
    }
  }

  // 2. 使用文本内容查找（更智能的匹配）
  const allButtons = document.querySelectorAll('a, button, material-button, [role="button"]');
  for (const button of allButtons) {
    try {
      const text = button.textContent.trim().toLowerCase();
      const ariaLabel = button.getAttribute('aria-label');
      const ariaLabelLower = ariaLabel ? ariaLabel.toLowerCase() : '';

      // 检查各种文本指示器
      const textIndicators = [
        'next', '下一页', '下页', 'forward', '前进',
        '»', '→', '▶', '>', 'chevron_right'
      ];

      const hasNextIndicator = textIndicators.some(indicator =>
        text.includes(indicator) || ariaLabelLower.includes(indicator)
      );

      if (hasNextIndicator) {
        // 排除上一页按钮
        const excludeIndicators = ['prev', 'previous', '上一页', '上页', 'back', '后退', '«', '←', '◀', '<'];
        const isPrevButton = excludeIndicators.some(indicator =>
          text.includes(indicator) || ariaLabelLower.includes(indicator)
        );

        if (!isPrevButton && button.offsetParent !== null && !button.disabled) {
          console.log(`✅ 通过文本分析找到下一页按钮: "${text || ariaLabel}"`);
          return button;
        }
      }
    } catch (e) {
      console.warn('处理按钮文本时出错:', e.message);
    }
  }

  // 3. 查找图标按钮（基于Material Icons等）
  const iconButtons = document.querySelectorAll('i.material-icons, .material-icons, material-icon');
  for (const icon of iconButtons) {
    try {
      const iconText = icon.textContent.trim();
      const nextIcons = ['chevron_right', 'navigate_next', 'arrow_forward', 'play_arrow', '▶'];

      if (nextIcons.includes(iconText)) {
        // 找到包含这个图标的按钮元素
        const button = icon.closest('button, a, material-button, [role="button"]');
        if (button && button.offsetParent !== null && !button.disabled) {
          console.log(`✅ 通过图标找到下一页按钮: ${iconText}`);
          return button;
        }
      }
    } catch (e) {
      console.warn('处理图标时出错:', e.message);
    }
  }

  console.log('❌ 未找到下一页按钮');
  return null;
}

// 辅助函数：通过文本内容查找元素
function findElementsByText(selector) {
  const match = selector.match(/([^:]+):contains\("([^"]+)"\)/);
  if (!match) return [];

  const [, elementSelector, text] = match;
  const elements = document.querySelectorAll(elementSelector);
  const results = [];

  elements.forEach(element => {
    if (element.textContent.includes(text)) {
      results.push(element);
    }
  });

  return results;
}

// 显示通知
function showNotification(message) {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // 淡入动画
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 100);

  // 3秒后自动移除
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}