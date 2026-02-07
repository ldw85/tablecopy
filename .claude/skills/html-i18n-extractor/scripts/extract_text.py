#!/usr/bin/env python3
"""
Extract hardcoded text from HTML
"""

import re
from bs4 import BeautifulSoup


def extract_hardcoded_text(html_content: str) -> list:
    """
    Extract all hardcoded text nodes from HTML
    Excludes content already using {{ T.xxx }} format
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    texts = []

    for element in soup.find_all(string=True):
        text = element.strip()
        if not text:
            continue

        # Exclude Nunjucks template tags
        if re.search(r'\{\{\s*T\.', text):
            continue

        # Exclude text in script and style tags
        parent = element.parent
        if parent and parent.name in ['script', 'style', 'code']:
            continue

        # Exclude text nodes with only tags/symbols
        if re.match(r'^[\{\}\[\]<>\/\s]+$', text):
            continue

        # Exclude HTML entity encoded tags
        if '&lt;' in text or '&gt;' in text:
            continue

        if text and text not in texts:
            texts.append(text)

    return texts
