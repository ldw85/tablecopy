# 多语言标签命名规范

## 通用规则

- 使用 **snake_case**（小写下划线分隔）
- 键名要简洁但有意义
- 同页面内不能重复
- 避免使用缩写

## 页面Section映射

| HTML文件 | Section名称 |
|----------|-------------|
| index.html | index |
| about.html | about |
| contact.html | contact |
| web-tools.html | web_tools |
| web-to-pdf.html | web_to_pdf |
| web-to-image.html | web_to_image |
| enable-copy.html | enable_copy |
| highlight-structure.html | highlight_structure |
| image-downloader.html | image_downloader |
| qr-code-generator.html | qr_code_generator |
| wayback-machine.html | wayback_machine |
| privacy.html | privacy |
| terms.html | terms |

## 元素类型命名

| HTML元素 | 推荐后缀 | 示例 |
|----------|----------|------|
| h1 | `_title`, `_heading` | `hero_title`, `page_title` |
| h2 | `_subtitle` | `feature_subtitle` |
| h3 | `_section_title` | `pricing_section_title` |
| p | `_description`, `_text` | `hero_description` |
| a (链接) | `_link`, `_button` | `cta_button`, `learn_more_link` |
| li | `_item`, `_feature` | `benefit_item` |
| th | `_header` | `table_header` |
| td | `_cell` | `price_cell` |
| alt属性 | `_alt` | `logo_alt` |

## 短文本处理

少于4个单词的文本直接使用单词组合：
- "Get Started" → `get_started`
- "Learn More" → `learn_more`

## 长文本处理

超过4个单词的文本使用关键词+`_desc`：
- "Discover the ultimate web transformation tools" → `ultimate_web_desc` 或 `discover_tools_desc`

## 常用键名示例

```json
{
  "index": {
    "hero_title": "Transform Any Website",
    "hero_slogan": "The ultimate all-in-one solution",
    "hero_cta": "Get Started Free",
    "features_title": "Powerful Features",
    "features_subtitle": "Everything you need",
    "how_it_works": "How It Works"
  }
}
```

## 避免的模式

❌ 不要使用：
- camelCase（如 `heroTitle`）
- kebab-case（如 `hero-title`）
- 数字开头（如 `1st_item`）
- 特殊字符（如 `item!`, `item?`）
- 冗长命名（如 `this_is_the_hero_title_of_the_page`）
