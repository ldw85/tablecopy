---
name: html-i18n-extractor
description: Extracts hardcoded text from HTML pages and generates i18n labels with translations for all 9 supported languages.
---

# HTML多语言标签提取工具

## 概述

当用户提供一个HTML页面时，自动提取硬编码文字，生成 `{{ T.section.key }}` 格式的多语言标签，并为所有9种语言（zh, en, es, pt, de, fr, ja, ko, ru）生成翻译。

## 使用方式

用户提供HTML文件路径，Claude会：
1. 提取所有硬编码文本节点
2. 生成唯一的标签键名
3. 使用Claude API翻译为其他8种语言
4. 更新locales JSON文件
5. 替换HTML中的文字为标签引用

## 关键文件路径

- 多语言文件：`src/locales/*.json`
- HTML页面：`src/pages/*.html`
- 页面section规则：
  - `index.html` → `index`
  - `about.html` → `about`
  - `web-tools.html` → `web_tools`
  - 其他 → 去除.html后缀

## 标签命名

- 使用 snake_case（如 `hero_title`）
- 根据元素类型生成（h1→title，p→description）
- 同页面内不重复

## 资源

### scripts/
- `main.py` - 主脚本，调用其他模块
- `extract_text.py` - 提取HTML文本
- `generate_labels.py` - 生成标签键名
- `update_locales.py` - 更新翻译文件
- `llm_translate.py` - LLM翻译接口

### references/
- `i18n-patterns.md` - 多语言标签命名规范
