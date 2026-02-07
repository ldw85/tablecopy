#!/usr/bin/env python3
"""
HTML i18n Label Extractor - Main Script
Usage: python main.py <html-file-path>
"""

import sys
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

from extract_text import extract_hardcoded_text
from generate_labels import generate_label_key
from llm_translate import translate_with_llm

LANGUAGES = ['zh', 'en', 'es', 'pt', 'de', 'fr', 'ja', 'ko', 'ru']
LANGUAGE_NAMES = {
    'zh': 'Chinese',
    'en': 'English',
    'es': 'Spanish',
    'pt': 'Portuguese',
    'de': 'German',
    'fr': 'French',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ru': 'Russian'
}
LOCALES_DIR = Path(__file__).parent.parent.parent / 'tablecopy' / 'src' / 'locales'


def get_section_name(filename: str) -> str:
    """Determine section name from HTML filename"""
    name = Path(filename).stem
    # Special page name mappings
    special_mappings = {
        'web-tools': 'web_tools',
        'web-to-pdf': 'web_to_pdf',
        'web-to-image': 'web_to_image',
        'web-to-markdown': 'web_to_markdown',
        'web-to-text': 'web_to_text',
        'web-to-word': 'web_to_word',
        'enable-copy': 'enable_copy',
        'highlight-structure': 'highlight_structure',
        'image-downloader': 'image_downloader',
        'qr-code-generator': 'qr_code_generator',
        'wayback-machine': 'wayback_machine',
        'privacy': 'privacy',
        'terms': 'terms',
    }
    return special_mappings.get(name, name)


def load_locale_file(lang: str) -> dict:
    """Load locale file"""
    file_path = LOCALES_DIR / f'{lang}.json'
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {'lang_code': lang}


def save_locale_file(lang: str, data: dict):
    """Save locale file"""
    file_path = LOCALES_DIR / f'{lang}.json'
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py <html-file-path>")
        print("Example: python main.py src/pages/new-feature.html")
        sys.exit(1)

    html_path = sys.argv[1]
    if not os.path.exists(html_path):
        print(f"Error: File not found: {html_path}")
        sys.exit(1)

    print(f"Processing: {html_path}")

    # Step 1: Extract hardcoded text
    print("\n[1/4] Extracting hardcoded text...")
    with open(html_path, 'r', encoding='utf-8') as f:
        original_html = f.read()

    texts = extract_hardcoded_text(original_html)
    print(f"Found {len(texts)} text nodes to extract")

    if not texts:
        print("No hardcoded text found. HTML may already use i18n labels.")
        return

    # Step 2: Generate label keys
    print("\n[2/4] Generating label keys...")
    section_name = get_section_name(html_path)
    label_mapping = {}  # text -> label_key

    for text in texts:
        key = generate_label_key(text, section_name)
        label_mapping[text] = key

    # Show mappings
    for text, key in label_mapping.items():
        truncated = text[:30] + '...' if len(text) > 30 else text
        print(f"  {key}: {truncated}")

    # Step 3: Translate with LLM
    print("\n[3/4] Translating with LLM...")
    translations = {}

    for lang in LANGUAGES:
        translations[lang] = {}

    texts_to_translate = list(label_mapping.keys())

    # Batch translate with LLM
    translated_texts = translate_with_llm(texts_to_translate, LANGUAGES, LANGUAGE_NAMES)

    # Organize translation results
    for i, text in enumerate(texts_to_translate):
        key = label_mapping[text]
        for lang in LANGUAGES:
            translations[lang][key] = translated_texts[lang][i]

    # Step 4: Update locale files
    print("\n[4/4] Updating locale files...")

    for lang in LANGUAGES:
        locale_data = load_locale_file(lang)

        # Ensure section exists
        if section_name not in locale_data:
            locale_data[section_name] = {}

        # Add new labels
        for key in label_mapping.values():
            if key not in locale_data[section_name]:
                locale_data[section_name][key] = translations[lang][key]

        save_locale_file(lang, locale_data)
        print(f"  Updated {lang}.json")

    print("\nDone! Please verify the translations and run `npm run build`.")
    print(f"\nTo update the HTML file, replace text with:")
    for text, key in list(label_mapping.items())[:5]:
        print(f"  {{{{ T.{section_name}.{key} }}}}")


if __name__ == "__main__":
    main()
