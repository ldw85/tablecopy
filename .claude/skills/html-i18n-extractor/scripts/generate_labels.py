#!/usr/bin/env python3
"""
Generate i18n label keys
"""

import re
import hashlib


def generate_label_key(text: str, section: str, existing_keys: set = None) -> str:
    """
    Generate a label key from text content
    Uses snake_case format
    """
    if existing_keys is None:
        existing_keys = set()

    # Clean text and generate key
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', '', text)
    # Remove special characters, keep only alphanumeric
    clean_text = re.sub(r'[^\w\s]', '', clean_text)
    # Convert to lowercase
    clean_text = clean_text.lower().strip()
    # Split into words
    words = clean_text.split()

    # Choose appropriate key format based on text length
    if len(words) <= 3:
        # Short text: combine words directly
        key = '_'.join(words[:4])
    else:
        # Long text: extract keywords
        key = '_'.join(words[:3]) + '_desc'

    # If key is too short or empty, use hash
    if len(key) < 3:
        short_hash = hashlib.md5(text.encode()).hexdigest()[:6]
        key = f'item_{short_hash}'

    # If key already exists, add counter
    original_key = key
    counter = 1
    while key in existing_keys:
        key = f'{original_key}_{counter}'
        counter += 1

    existing_keys.add(key)
    return key
