#!/usr/bin/env python3
"""
Update locale JSON files
"""

import json
from pathlib import Path


def update_locale_file(
    locale_path: str,
    section: str,
    new_labels: dict
) -> bool:
    """
    Update a locale file's section
    """
    file_path = Path(locale_path)

    # Load existing data
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {}

    # Ensure section exists
    if section not in data:
        data[section] = {}

    # Add new labels
    for key, value in new_labels.items():
        if key not in data[section]:
            data[section][key] = value

    # Save
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    return True


def add_labels_to_all_locales(
    locales_dir: str,
    section: str,
    translations: dict
) -> dict:
    """
    Batch update all locale files
    """
    results = {}
    locales_path = Path(locales_dir)

    for lang, translation_dict in translations.items():
        file_path = locales_path / f'{lang}.json'
        update_locale_file(str(file_path), section, translation_dict)
        results[lang] = str(file_path)

    return results
