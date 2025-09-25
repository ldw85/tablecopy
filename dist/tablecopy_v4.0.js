/**
 * =============================================================
 * 表格助手 (Table Copier)
 * =============================================================
 *
 * 功能: 允许用户通过选择表格的一部分，然后点击书签，弹出一个
 * 功能浮层，用于以多种格式复制表格或特定列。
 *
 * 作者: Gemini (AI Assistant)
 * 版本: 5.3 (兼容 Google Trusted Types, 修复在 Google 页面无法使用的问题)
 */
(function() {

    // --- NEW: I18n ---
    const translations = {
        en: {
            alert_select_first: 'Please select part of a table first, then click me!',
            alert_no_table_found: 'Could not find a valid table or grid structure in your selection.',
            modal_title: 'Table Copy v5.3',
            modal_close_title: 'Close',
            copy_dropdown_button: 'Copy Full Table ▼',
            copy_dropdown_html: 'Copy (Recommended, for Excel/WPS)',
            copy_dropdown_tsv: 'Copy as TSV (Tab-separated)',
            copy_dropdown_csv: 'Copy as CSV (Comma-separated)',
            copy_dropdown_json: 'Copy as JSON',
            copy_dropdown_html_source: 'Copy as HTML Source',
            export_csv_button: 'Export as CSV',
            export_picture_button: 'Export as Picture',
            footer_tip: 'Tip: Click a header to copy the column',
            message_csv_downloading: 'CSV file download has started!',
            message_picture_downloading: 'Picture download has started!',
            message_library_loading: 'Loading required library...',
            alert_library_failed: 'Failed to load the required library. Please check your network or ad blocker.',
            col_menu_copy_comma: 'Copy (Comma-separated)',
            col_menu_copy_newline: 'Copy (Newline-separated)',
            message_copied: 'Copied to clipboard!'
        },
        zh: {
            alert_select_first: '请先用鼠标选中表格的一部分，再点击我哦！',
            alert_no_table_found: '无法在您选择的区域内找到一个有效的表格或Grid结构。',
            modal_title: '表格助手 v5.3',
            modal_close_title: '关闭',
            copy_dropdown_button: '复制整个表格 ▼',
            copy_dropdown_html: '复制 (推荐, 用于Excel/WPS)',
            copy_dropdown_tsv: '复制为 TSV (制表符分隔)',
            copy_dropdown_csv: '复制为 CSV (逗号分隔)',
            copy_dropdown_json: '复制为 JSON',
            copy_dropdown_html_source: '复制为 HTML 源码',
            export_csv_button: '导出为 CSV',
            export_picture_button: '导出为图片',
            footer_tip: '提示：点击表头可复制整列',
            message_csv_downloading: 'CSV 文件已开始下载！',
            message_picture_downloading: '图片已开始下载！',
            message_library_loading: '正在加载所需组件...',
            alert_library_failed: '无法加载所需组件。请检查您的网络连接或广告拦截器。',
            col_menu_copy_comma: '复制 (逗号分隔)',
            col_menu_copy_newline: '复制 (换行分隔)',
            message_copied: '已复制到剪贴板！'
        }
    };

    const lang = (navigator.language || navigator.userLanguage).toLowerCase().startsWith('zh') ? 'zh' : 'en';
    const t = (key) => translations[lang][key] || translations['en'][key];

    // --- 1. 配置和样式 (来自 v3.0) ---
    const CSS_PREFIX = 'tc-gemini-v5-'; // 使用新的前缀以避免缓存
    const STYLES = `
        .${CSS_PREFIX}overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background-color: rgba(0, 0, 0, 0.6); z-index: 999999;
            display: flex; justify-content: center; align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .${CSS_PREFIX}modal {
            background-color: #ffffff; border-radius: 8px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            width: 80vw; max-width: 1000px; height: 80vh; display: flex; flex-direction: column; overflow: hidden;
        }
        .${CSS_PREFIX}header {
            padding: 12px 20px; border-bottom: 1px solid #e0e0e0; display: flex;
            justify-content: space-between; align-items: center; flex-shrink: 0;
        }
        .${CSS_PREFIX}header h3 { margin: 0; font-size: 16px; color: #333; }
        .${CSS_PREFIX}close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #888; padding: 0; line-height: 1; }
        .${CSS_PREFIX}close-btn:hover { color: #000; }
        .${CSS_PREFIX}table-container { padding: 20px; overflow: auto; flex-grow: 1; }
        .${CSS_PREFIX}table-container table { width: 100%; border-collapse: collapse; }
        .${CSS_PREFIX}table-container th, .${CSS_PREFIX}table-container td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; color: #000; }
        .${CSS_PREFIX}table-container th { background-color: #f2f2f2; cursor: pointer; }
        .${CSS_PREFIX}col-highlight { background-color: #d9edf7 !important; }
        .${CSS_PREFIX}footer {
            padding: 12px 20px; border-top: 1px solid #e0e0e0; background-color: #f9f9f9;
            flex-shrink: 0; display: flex; align-items: center; position: relative;
        }
        .${CSS_PREFIX}button {
            padding: 8px 16px; border: 1px solid #ccc; border-radius: 5px; background-color: #fff;
            cursor: pointer; font-size: 14px; margin-right: 10px;
        }
        .${CSS_PREFIX}button:hover { background-color: #f0f0f0; border-color: #bbb; }
        .${CSS_PREFIX}dropdown { display: inline-block; position: relative; }
        .${CSS_PREFIX}dropdown-content {
            display: none; position: absolute; background-color: #f1f1f1; min-width: 220px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 1;
            bottom: 100%; margin-bottom: 5px; border-radius: 5px; overflow: hidden;
        }
        .${CSS_PREFIX}dropdown-content button {
            color: black; padding: 12px 16px; text-decoration: none; display: block;
            width: 100%; text-align: left; border: none; border-radius: 0;
            background-color: #fff; border-bottom: 1px solid #e0e0e0; font-size:14px;
        }
        .${CSS_PREFIX}dropdown-content button:first-child { font-weight: bold; }
        .${CSS_PREFIX}dropdown-content button:last-child { border-bottom: none; }
        .${CSS_PREFIX}dropdown-content button:hover { background-color: #ddd; }
        .${CSS_PREFIX}col-menu {
            position: absolute; display: block; background-color: #fff;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); z-index: 10;
            border-radius: 5px; overflow: hidden;
        }
        .${CSS_PREFIX}col-menu button {
            display: block; width: 100%; padding: 10px 15px; border: none;
            background: none; text-align: left; cursor: pointer;
        }
        .${CSS_PREFIX}col-menu button:hover { background-color: #f0f0f0; }
        .${CSS_PREFIX}message {
            position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
            background-color: #28a745; color: white; padding: 10px 20px;
            border-radius: 5px; font-size: 14px; z-index: 100001; opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
    `;

    // --- 2. 核心检测与解析函数 (v4.0 功能集成) ---
    
    function injectStyles() {
        if (document.getElementById(`${CSS_PREFIX}styles`)) return;
        const styleSheet = document.createElement("style");
        styleSheet.id = `${CSS_PREFIX}styles`;
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);
    }

    function findParentStructure(selection) {
        const range = selection.getRangeAt(0);
        let currentNode = range.commonAncestorContainer;
        if (currentNode.nodeType === Node.TEXT_NODE) {
            currentNode = currentNode.parentElement;
        }
        let element = currentNode;
        while (element) {
            if (element.tagName === 'TABLE') {
                return { element, type: 'TABLE' };
            }
            const role = element.getAttribute('role');
            if (role === 'grid' || role === 'table') {
                return { element, type: 'ARIA_GRID' };
            }
                // [NEW] Heuristic for DIV-based tables
            // A potential "table" container is an element that has at least 2 children,
            // and a high percentage of them are "rows".
            // A "row" is an element that has at least 2 children which are "cells".
            if (element.children.length > 1 && ['DIV', 'UL', 'OL'].includes(element.tagName)) { // Only check common list/div containers
                let potentialRows = Array.from(element.children).filter(
                    child => child.children.length > 1 && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(child.tagName)
                );
                
                // If more than 70% of children look like rows, and we have at least 2 rows.
                if (potentialRows.length > 1 && (potentialRows.length / element.children.length > 0.7)) {
                    // To be more certain, check if the first two rows have the same number of cells.
                    if (potentialRows[0].children.length > 0 && potentialRows[0].children.length === potentialRows[1].children.length) {
                         return { element, type: 'HEURISTIC_DIV' };
                    }
                }
            }

            // [NEW] Heuristic for simple UL/OL lists. This is checked *after* the HEURISTIC_DIV check.
            if (['UL', 'OL'].includes(element.tagName) && element.children.length > 1) {
                const listItems = Array.from(element.children).filter(child => child.tagName === 'LI');
                // If it's mostly LIs, we can treat it as a list. The more complex list-based tables
                // would have been caught by the HEURISTIC_DIV check above.
                if (listItems.length / element.children.length > 0.8) {
                    return { element, type: 'LIST' };
                }
            }

            element = element.parentElement;
        }
        return null;
    }
    
    function parseAriaGridToTable(gridElement) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const rows = gridElement.querySelectorAll('[role="row"]');
        rows.forEach((rowElement) => {
            const tr = document.createElement('tr');
            let isHeaderRow = false;
            const cells = rowElement.querySelectorAll('[role="gridcell"], [role="columnheader"], [role="cell"]');
            cells.forEach(cellElement => {
                const cellRole = cellElement.getAttribute('role');
                if (cellRole === 'columnheader') isHeaderRow = true;
                const cell = document.createElement(isHeaderRow ? 'th' : 'td');
                cell.innerText = cellElement.innerText;
                tr.appendChild(cell);
            });
            if (isHeaderRow) {
                thead.appendChild(tr);
            } else {
                tbody.appendChild(tr);
            }
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        return table;
    }

    function parseHeuristicDivToTable(divTableElement) {
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        
        const potentialRows = Array.from(divTableElement.children).filter(
            child => child.children.length > 0 && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(child.tagName)
        );

        if (potentialRows.length === 0) return null;

        let headerRowElement = null;
        let bodyRows = potentialRows;

        const firstRow = potentialRows[0];
        const firstRowClass = (firstRow.className && typeof firstRow.className === 'string') ? firstRow.className.toLowerCase() : '';
        
        // Simple, safe header detection: class contains 'header'/'head' or element is a common header tag.
        if (firstRowClass.includes('header') || firstRowClass.includes('head') || ['THEAD'].includes(firstRow.tagName)) {
            headerRowElement = firstRow;
            bodyRows = potentialRows.slice(1);
        }

        if (headerRowElement) {
            const thead = document.createElement('thead');
            const tr = document.createElement('tr');
            for (const cellElement of headerRowElement.children) {
                const th = document.createElement('th');
                th.innerText = cellElement.innerText;
                tr.appendChild(th);
            }
            thead.appendChild(tr);
            table.appendChild(thead);
        }

        for (const rowElement of bodyRows) {
            const tr = document.createElement('tr');
            for (const cellElement of rowElement.children) {
                const td = document.createElement('td');
                td.innerText = cellElement.innerText;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        
        table.appendChild(tbody);
        return table;
    }

    function parseListToTable(listElement) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        // Create header
        const trHead = document.createElement('tr');
        const th = document.createElement('th');
        th.innerText = 'Item'; // A generic header for the single column
        trHead.appendChild(th);
        thead.appendChild(trHead);
        table.appendChild(thead);

        // Create body from LI elements
        Array.from(listElement.children).forEach(child => {
            if (child.tagName === 'LI') {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.innerText = child.innerText.trim();
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
        });
        
        table.appendChild(tbody);
        return table;
    }

    function findAndParseStructure(selection) {
        const structure = findParentStructure(selection);
        if (!structure) return null;
        if (structure.type === 'TABLE') {
            return structure.element; // 直接返回原始元素
        }
        if (structure.type === 'ARIA_GRID') {
            return parseAriaGridToTable(structure.element); // 返回虚拟表格
        }
        if (structure.type === 'HEURISTIC_DIV') {
            return parseHeuristicDivToTable(structure.element);
        }
        if (structure.type === 'LIST') {
            return parseListToTable(structure.element);
        }
        return null;
    }
    
    // --- 3. 主函数 (MODIFIED) ---
    
    function main() {
        if (document.querySelector(`.${CSS_PREFIX}overlay`)) return;
        injectStyles();
        const selection = window.getSelection();
        if (selection.rangeCount === 0 || selection.isCollapsed) {
            alert(t('alert_select_first'));
            return;
        }
        
        // [MODIFIED] 调用新的检测/解析函数
        const tableElement = findAndParseStructure(selection);
        
        if (tableElement) {
            createModal(tableElement);
        } else {
            alert(t('alert_no_table_found'));
        }
    }

    // --- 4. UI 和事件处理函数 (来自 v3.0, 完全兼容) ---

    /**
     * [MODIFIED in v5.3] Creates the modal UI programmatically to avoid `innerHTML`
     * and comply with Trusted Types policies on sites like Google Trends.
     * @param {HTMLTableElement} tableElement The table to display.
     */
    function createModal(tableElement) {
        const overlay = document.createElement('div');
        overlay.className = `${CSS_PREFIX}overlay`;

        const modal = document.createElement('div');
        modal.className = `${CSS_PREFIX}modal`;

        // Header
        const header = document.createElement('div');
        header.className = `${CSS_PREFIX}header`;
        const h3 = document.createElement('h3');
        h3.innerText = t('modal_title');
        const closeBtn = document.createElement('button');
        closeBtn.className = `${CSS_PREFIX}close-btn`;
        closeBtn.title = t('modal_close_title');
        closeBtn.innerText = '×'; // Use innerText instead of innerHTML for &times;
        header.appendChild(h3);
        header.appendChild(closeBtn);

        // Tip container
        const tipContainer = document.createElement('div');
        tipContainer.style.cssText = 'padding: 0 20px; margin-top: 10px;';
        const tipSpan = document.createElement('span');
        tipSpan.style.cssText = 'font-size: 13px; color: #666; font-weight: bold;';
        tipSpan.innerText = t('footer_tip');
        tipContainer.appendChild(tipSpan);

        // Table container
        const tableContainer = document.createElement('div');
        tableContainer.className = `${CSS_PREFIX}table-container`;

        // Footer
        const footer = document.createElement('div');
        footer.className = `${CSS_PREFIX}footer`;
        const dropdown = document.createElement('div');
        dropdown.className = `${CSS_PREFIX}dropdown`;
        const copyTableBtn = document.createElement('button');
        copyTableBtn.className = `${CSS_PREFIX}button`;
        copyTableBtn.id = `${CSS_PREFIX}copy-table-btn`;
        copyTableBtn.innerText = t('copy_dropdown_button');
        const dropdownContent = document.createElement('div');
        dropdownContent.className = `${CSS_PREFIX}dropdown-content`;
        dropdownContent.id = `${CSS_PREFIX}table-dropdown`;
        const formats = [
            { format: 'html', textKey: 'copy_dropdown_html' }, { format: 'tsv', textKey: 'copy_dropdown_tsv' },
            { format: 'csv', textKey: 'copy_dropdown_csv' }, { format: 'json', textKey: 'copy_dropdown_json' },
            { format: 'html_source', textKey: 'copy_dropdown_html_source' }
        ];
        formats.forEach(item => {
            const btn = document.createElement('button');
            btn.setAttribute('data-format', item.format);
            btn.innerText = t(item.textKey);
            dropdownContent.appendChild(btn);
        });
        dropdown.appendChild(copyTableBtn);
        dropdown.appendChild(dropdownContent);
        const exportCsvBtn = document.createElement('button');
        exportCsvBtn.className = `${CSS_PREFIX}button`;
        exportCsvBtn.id = `${CSS_PREFIX}export-csv-btn`;
        exportCsvBtn.innerText = t('export_csv_button');
        const exportPicBtn = document.createElement('button');
        exportPicBtn.className = `${CSS_PREFIX}button`;
        exportPicBtn.id = `${CSS_PREFIX}export-pic-btn`;
        exportPicBtn.innerText = t('export_picture_button');
        footer.appendChild(dropdown);
        footer.appendChild(exportCsvBtn);
        footer.appendChild(exportPicBtn);
        modal.append(header, tipContainer, tableContainer, footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        const clonedTable = tableElement.cloneNode(true);
        tableContainer.appendChild(clonedTable);
        addEventListeners(overlay, clonedTable);
    }

    function addEventListeners(overlay, table) {
        const tableDropdown = document.getElementById(`${CSS_PREFIX}table-dropdown`);
        overlay.querySelector(`.${CSS_PREFIX}close-btn`).addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) document.body.removeChild(overlay);
            if (!e.target.closest(`.${CSS_PREFIX}dropdown`)) {
                tableDropdown.style.display = 'none';
            }
        });
        document.getElementById(`${CSS_PREFIX}copy-table-btn`).addEventListener('click', (e) => {
            e.stopPropagation();
            tableDropdown.style.display = tableDropdown.style.display === 'block' ? 'none' : 'block';
        });
        tableDropdown.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const format = e.target.getAttribute('data-format');
                switch(format) {
                    case 'html': copyTableAsRichText(table); break;
                    case 'tsv': copyTableWithSeparator(table, '\t'); break;
                    case 'csv': copyTableWithSeparator(table, ','); break;
                    case 'json': copyTableAsJSON(table); break;
                    case 'html_source': copyTableAsHtmlSource(table); break;
                }
                tableDropdown.style.display = 'none';
                showMessage(overlay);
            }
        });

        document.getElementById(`${CSS_PREFIX}export-csv-btn`).addEventListener('click', () => {
            const csvString = generateSeparatorString(table, ',');
            downloadFile(csvString, 'table-export.csv', 'text/csv;charset=utf-8;');
            showMessage(overlay, t('message_csv_downloading'));
        });

        document.getElementById(`${CSS_PREFIX}export-pic-btn`).addEventListener('click', () => {
            exportTableAsPicture(table, overlay);
        });

        // [MODIFIED] Attach column-related events to the entire table for better flexibility.
        // This allows clicking any cell (td or th) to copy the column, solving issues
        // with tables without <thead> or with complex headers.
        table.addEventListener('mouseover', e => {
            const cell = e.target.closest('td, th');
            handleColumnHighlight(cell, table, true);
        });
        table.addEventListener('mouseout', e => {
            // If the mouse leaves the table area, remove the highlight
            if (!table.contains(e.relatedTarget)) {
                handleColumnHighlight(null, table, false);
            }
        });
        table.addEventListener('click', e => {
            const cell = e.target.closest('td, th');
            if (cell) showColumnCopyMenu(cell, table, overlay);
        });
    }

    // --- 5. 文件下载功能 (v5.0 新增) ---

    function downloadFile(content, fileName, mimeType) { // mimeType is optional
        const a = document.createElement('a');
        let url;
        if (content.startsWith('data:')) {
            a.href = content;
        } else {
            const blob = new Blob([content], { type: mimeType });
            url = URL.createObjectURL(blob);
            a.href = url;
        }
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (url) {
            URL.revokeObjectURL(url);
        }
    }

    // --- NEW: Export as Picture ---
    function exportTableAsPicture(table, overlay) {
        const libUrl = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';

        const executeExport = () => {
            showMessage(overlay, t('message_picture_downloading'));
            html2canvas(table, {
                useCORS: true,
                scale: 2, // for better resolution
                backgroundColor: '#FFFFFF' // Avoid transparent background
            }).then(canvas => {
                downloadFile(canvas.toDataURL('image/png'), 'table-export.png');
            }).catch(err => { console.error('html2canvas error:', err); alert('Sorry, failed to create picture.'); });
        };

        if (typeof html2canvas !== 'undefined') return executeExport();
        const script = document.createElement('script');
        script.src = libUrl;
        script.onload = executeExport;
        script.onerror = () => { showMessage(overlay, t('alert_library_failed')); };
        document.head.appendChild(script);
    }

    // --- 6. 核心复制功能函数 (来自 v3.0, 完全兼容) ---

    /**
     * [NEW in v5.1] Copies the table's HTML source code (with styles) as plain text.
     * @param {HTMLTableElement} table The table element to copy.
     */
    function copyTableAsHtmlSource(table) {
        // We include the styles to make the copied HTML self-contained and render nicely.
        const styledHtml = `<style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; }</style>\n${table.outerHTML}`;
        navigator.clipboard.writeText(styledHtml);
    }

    async function copyTableAsRichText(table) {
        try {
            const tsvString = generateSeparatorString(table, '\t');
            const styledHtml = `<style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; }</style>${table.outerHTML}`;
            const htmlBlob = new Blob([styledHtml], { type: 'text/html' });
            const textBlob = new Blob([tsvString], { type: 'text/plain' });
            const clipboardItem = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
            await navigator.clipboard.write([clipboardItem]);
        } catch (err) {
            console.error('Failed to copy rich text, falling back to plain text: ', err);
            copyTableWithSeparator(table, '\t');
        }
    }
    
    function generateSeparatorString(table, separator) {
        let text = '';
        table.querySelectorAll('tr').forEach(row => {
            const rowData = [];
            row.querySelectorAll('th, td').forEach(cell => {
                rowData.push(escapeCellText(cell.innerText, separator));
            });
            text += rowData.join(separator) + '\n';
        });
        return text.endsWith('\n') ? text.slice(0, -1) : text;
    }

    async function copyTableWithSeparator(table, separator) {
        const textToCopy = generateSeparatorString(table, separator);
        try {
            // 使用更可靠的 ClipboardItem API，明确指定内容为纯文本。
            // 这能显著提高 Excel 等应用正确解析制表符（Tab）的几率。
            const textBlob = new Blob([textToCopy], { type: 'text/plain' });
            const clipboardItem = new ClipboardItem({ 'text/plain': textBlob });
            await navigator.clipboard.write([clipboardItem]);
        } catch (err) {
            // 如果新 API 失败（例如在非常旧的浏览器中），则回退到原始方法。
            console.error('ClipboardItem API failed, falling back to writeText:', err);
            navigator.clipboard.writeText(textToCopy);
        }
    }
    
    function escapeCellText(text, separator) {
        const cleanText = text.trim();
        if (cleanText.includes(separator) || cleanText.includes('\n') || cleanText.includes('"')) {
            return `"${cleanText.replace(/"/g, '""')}"`;
        }
        return cleanText;
    }

    function copyColumn(cell, table, separator) {
        const columnIndex = cell.cellIndex;
        const columnData = [];
        // [MODIFIED] Iterate over all rows to get the full column data, not just tbody
        table.querySelectorAll('tr').forEach(row => {
            if (row.cells[columnIndex]) {
                columnData.push(row.cells[columnIndex].innerText.trim());
            }
        });
        navigator.clipboard.writeText(columnData.join(separator));
    }

    function copyTableAsJSON(table) {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const rows = [];
        table.querySelectorAll('tbody tr').forEach(row => {
            const rowData = {};
            row.querySelectorAll('td').forEach((cell, index) => {
                rowData[headers[index] || `column_${index + 1}`] = cell.innerText.trim();
            });
            rows.push(rowData);
        });
        navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
    }

    // --- 7. UI 辅助函数 (来自 v3.0, 部分修改) ---

    /**
     * [MODIFIED in v5.3] Creates the column copy menu programmatically to avoid `innerHTML`
     * and comply with Trusted Types.
     */
    function showColumnCopyMenu(cellElement, table, overlay) {
        let existingMenu = overlay.querySelector(`.${CSS_PREFIX}col-menu`);
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.className = `${CSS_PREFIX}col-menu`;

        const commaBtn = document.createElement('button');
        commaBtn.setAttribute('data-separator', ',');
        commaBtn.innerText = t('col_menu_copy_comma');
        const newlineBtn = document.createElement('button');
        newlineBtn.setAttribute('data-separator', '\\n');
        newlineBtn.innerText = t('col_menu_copy_newline');
        menu.append(commaBtn, newlineBtn);

        const rect = cellElement.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();
        menu.style.top = `${rect.bottom - overlayRect.top}px`;
        menu.style.left = `${rect.left - overlayRect.left}px`;
        overlay.appendChild(menu);
        menu.addEventListener('click', e => {
            if(e.target.tagName === 'BUTTON') {
                const separator = e.target.getAttribute('data-separator');
                copyColumn(cellElement, table, separator === '\\n' ? '\n' : ',');
                showMessage(overlay);
                menu.remove();
            }
        });
        setTimeout(() => { overlay.addEventListener('click', () => menu.remove(), { once: true }); }, 0);
    }

    function handleColumnHighlight(cell, table, isHighlighting) {
        table.querySelectorAll(`.${CSS_PREFIX}col-highlight`).forEach(cell => cell.classList.remove(`${CSS_PREFIX}col-highlight`));
        if (isHighlighting && cell) {
            const columnIndex = cell.cellIndex;
            table.querySelectorAll('tr').forEach(row => {
                if(row.cells[columnIndex]) row.cells[columnIndex].classList.add(`${CSS_PREFIX}col-highlight`);
            });
        }
    }
    
    function showMessage(overlay, text = t('message_copied')) {
        const message = document.createElement('div');
        message.className = `${CSS_PREFIX}message`;
        message.innerText = text;
        overlay.appendChild(message);
        setTimeout(() => { message.style.opacity = '1'; }, 10);
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => { if(message.parentElement) message.parentElement.removeChild(message); }, 300);
        }, 2000);
    }

    // --- 8. 启动脚本 ---
    main();

})();