#!/usr/bin/env python3
"""LLM Translation Interface using MiniMax API"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
MINIMAX_API_KEY = os.environ.get('MINIMAX_API_KEY')
MINIMAX_GROUP_ID = os.environ.get('MINIMAX_GROUP_ID', '')


def translate_with_llm(texts, languages, language_names):
    """Batch translate texts using MiniMax LLM"""
    if not MINIMAX_API_KEY:
        print("Warning: MINIMAX_API_KEY not set. Using placeholder translations.")
        return create_placeholder_translations(texts, languages, language_names)

    results = {lang: [] for lang in languages}
    english_texts = texts

    for lang in languages[1:]:
        target_name = language_names.get(lang, lang)
        translations = []
        batch_size = 20

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_translations = translate_batch(batch, target_name, lang)
            translations.extend(batch_translations)

        results[lang] = translations

    results['en'] = english_texts
    return results


def translate_batch(texts, target_language, target_code):
    """Translate a batch of texts using MiniMax"""
    prompt = f"""Translate the following English texts to {target_language} ({target_code}).
Return ONLY a JSON array with the translations, in the same order.

Texts:
{chr(10).join([f"{i+1}. {text}" for i, text in enumerate(texts)])}"""

    url = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    headers = {
        "Authorization": f"Bearer {MINIMAX_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "MiniMax-Text-01",  # or MiniMax-Text-01
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 4096,
        "temperature": 0.1
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        result = response.json()

        if result.get("base_resp", {}).get("status_code") == 0:
            content = result["choices"][0]["message"]["content"].strip()
            if content.startswith('```json'):
                content = content[7:-3]
            elif content.startswith('```'):
                content = content[3:-3]
            return json.loads(content)
        else:
            print(f"MiniMax API error: {result}")
            return texts

    except Exception as e:
        print(f"Error translating batch: {e}")
        return texts


def create_placeholder_translations(texts, languages, language_names=None):
    """Create placeholder translations when no API key is available"""
    if language_names is None:
        language_names = {}
    results = {lang: [] for lang in languages}

    for lang in languages:
        for text in texts:
            if lang == 'en':
                results[lang].append(text)
            else:
                lang_name = language_names.get(lang, lang)
                results[lang].append(f"[TODO: Translate to {lang_name}] {text}")

    return results
