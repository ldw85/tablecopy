#!/usr/bin/env python3
"""
Convert markdown blog articles to HTML format
"""
import os
import re
from datetime import datetime

# Configuration
SOURCE_DIR = "/Users/hmr/Documents/program/tablecopy/src/blog/articles"
OUTPUT_DIR = "/Users/hmr/Documents/program/tablecopy/blog"

def read_markdown(file_path):
    """Read markdown file and extract frontmatter and content"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse frontmatter
    frontmatter = {}
    content_start = 0

    if content.startswith('---'):
        # Extract frontmatter
        lines = content.split('\n')
        in_frontmatter = False
        frontmatter_lines = []

        for i, line in enumerate(lines):
            if line.strip() == '---' and not in_frontmatter:
                in_frontmatter = True
                content_start = i + 1
            elif line.strip() == '---' and in_frontmatter:
                content_start = i + 1
                break
            elif in_frontmatter and line.startswith('---'):
                break
            elif in_frontmatter:
                frontmatter_lines.append(line)

        # Parse frontmatter
        for line in frontmatter_lines:
            if ':' in line:
                key, value = line.split(':', 1)
                frontmatter[key.strip()] = value.strip().strip('"')

        # Get remaining content
        content = '\n'.join(lines[content_start:])

    return frontmatter, content

def markdown_to_html(content):
    """Convert markdown content to HTML"""
    html = content

    # Headers
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # Bold text
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)

    # Italic text
    html = re.sub(r'(?<!\*)\*([^\*]+?)\*(?!\*)', r'<em>\1</em>', html)

    # Code blocks
    html = re.sub(r'```(\w+)?\n([\s\S]*?)```', r'<pre><code>\2</code></pre>', html)

    # Inline code
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)

    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)

    # Unordered lists
    html = re.sub(r'^\s*[-*] (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)

    # Ordered lists
    html = re.sub(r'^\s*(\d+)\. (.+)$', r'<li>\2</li>', html, flags=re.MULTILINE)

    # Tables - simple conversion
    # This is a basic table converter - may need manual adjustment
    html = re.sub(r'\|\s*-+\s*\|', r'</th></tr>\n<tr><th>', html)
    html = re.sub(r'\|\s*(\w+)\s*\|', r'</th><th>\1', html)
    html = re.sub(r'\|\s*(\w+)\s*\|', r'</td><td>\1', html)
    html = re.sub(r'^\s*<td', r'<tr><td', html)

    # Blockquotes
    html = re.sub(r'^>\s*(.+)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)

    # Horizontal rules
    html = re.sub(r'^---+$', '<hr>', html)

    # Line breaks for paragraphs
    html = re.sub(r'\n\n+', '</p>\n\n<p>', html)
    html = '<p>' + html + '</p>'

    # Clean up empty paragraphs and extra newlines
    html = re.sub(r'<p>\s*</p>', '', html)
    html = re.sub(r'<p>(<h[123]>)', r'\1', html)
    html = re.sub(r'(</h[123]>)\s*</p>', r'\1', html)
    html = re.sub(r'<p>(<pre>)', r'\1', html)
    html = re.sub(r'(</pre>)\s*</p>', r'\1', html)
    html = re.sub(r'<p>(<blockquote>)', r'\1', html)
    html = re.sub(r'(</blockquote>)\s*</p>', r'\1', html)
    html = re.sub(r'<p>\s*<li>', r'<li>', html)
    html = re.sub(r'</li>\s*</p>\s*<li>', r'</li><li>', html)
    html = re.sub(r'</li>\s*</p>\s*<h', r'</li></ul><h', html)

    # Wrap consecutive list items in ul
    html = re.sub(r'(<li>.*?</li>)\n(<li>.*?</li>)', r'\1</ul>\n<ul>\2', html)

    return html

def generate_html_file(frontmatter, html_content, lang='en'):
    """Generate complete HTML file"""
    title = frontmatter.get('title', 'Blog Article')
    description = frontmatter.get('description', '')
    keywords = frontmatter.get('keywords', '')
    article_id = frontmatter.get('article_id', '')

    # Generate Chinese version URL
    en_url = f"https://tablecopy.pro/blog/{article_id}-en.html"
    zh_url = f"https://tablecopy.pro/zh/blog/{article_id}-zh.html"

    canonical_url = en_url if lang == 'en' else zh_url
    alternate_url = zh_url if lang == 'en' else en_url

    date = datetime.now().strftime('%Y-%m-%d')

    html = f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">

    <!-- Ezoic Privacy Scripts -->
    <script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js"></script>
    <script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js"></script>

    <!-- Ezoic Header Script -->
    <script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
    <script>
        window.ezstandalone = window.ezstandalone || {{}};
        ezstandalone.cmd = ezstandalone.cmd || [];
    </script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>{title} | TableCopy Blog</title>
    <meta name="description" content="{description}">
    <meta name="keywords" content="{keywords}">

    <link rel="canonical" href="{canonical_url}">
    <link rel="alternate" hreflang="zh" href="{zh_url}">
    <link rel="alternate" hreflang="en" href="{en_url}">
    <link rel="alternate" hreflang="x-default" href="{en_url}">

    <link rel="icon" type="image/png" href="/assets/tc_icon.png">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/assets/css/main.css">
    <link rel="stylesheet" href="/assets/css/blog.css">

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17402862141"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'AW-17402862141');
    </script>
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <a href="/" class="logo">TableCopy</a>
            <div style="display:flex; align-items:center; gap:20px;">
                <ul class="nav-links">
                    <li><a href="/">Home</a></li>
                    <li><a href="/blog/">Blog</a></li>
                </ul>
                <select id="lang-switcher" data-current-page="blog-{article_id}" style="font-weight:500; background:transparent; border:1px solid #ddd; border-radius:6px; padding:6px; font-size:15px;">
                    <option value="zh" {'selected' if lang == 'zh' else ''}>中文</option>
                    <option value="en" {'selected' if lang == 'en' else ''}>English</option>
                </select>
            </div>
        </div>
    </nav>

    <main class="blog-main">
        <header class="blog-header">
            <div class="container">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        </header>

        <div class="blog-content">
            {html_content}
        </div>
    </main>

    <footer class="blog-footer">
        <div class="container">
            <p>&copy; 2025 TableCopy. All rights reserved.</p>
            <p><a href="/">Back to TableCopy</a> | <a href="/blog/">Blog Home</a></p>
        </div>
    </footer>

    <script>
        document.getElementById('lang-switcher').addEventListener('change', function() {{
            var lang = this.value;
            var articleId = this.dataset.currentPage;
            if (articleId && articleId.indexOf('blog-') === 0) {{
                var articleName = articleId.replace('blog-', '');
                window.location.href = (lang === 'en' ? '/blog/' : '/zh/blog/') + articleName + '-' + lang + '.html';
            }}
        }});
    </script>
</body>
</html>'''

    return html

def main():
    """Main conversion function"""
    # Get all markdown files
    files = [f for f in os.listdir(SOURCE_DIR) if f.endswith('.md')]

    for file in files:
        file_path = os.path.join(SOURCE_DIR, file)
        frontmatter, content = read_markdown(file_path)

        lang = frontmatter.get('lang', 'en')
        article_id = frontmatter.get('article_id', 'unknown')

        # Convert content
        html_content = markdown_to_html(content)

        # Generate complete HTML
        full_html = generate_html_file(frontmatter, html_content, lang)

        # Determine output path
        if lang == 'zh':
            output_dir = os.path.join(OUTPUT_DIR, 'zh')
        else:
            output_dir = OUTPUT_DIR

        os.makedirs(output_dir, exist_ok=True)

        output_file = os.path.join(output_dir, f'{article_id}-{lang}.html')

        # Write HTML file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(full_html)

        print(f'Created: {output_file}')

if __name__ == '__main__':
    main()
