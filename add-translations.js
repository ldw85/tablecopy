/**
 * Helper script to add translations for new tools to all locale files
 * Usage: node add-translations.js
 */

const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, 'src/locales');

// English master translations (from en.json)
const enTranslations = {
    sendToAi: {
        nav: "Send to AI",
        meta_title: "Send to AI - Quick Text Transfer to ChatGPT, Claude & Perplexity | TableCopy",
        meta_description: "Send selected text from any webpage to ChatGPT, Claude, or Perplexity with one click. The fastest way to get AI assistance while browsing.",
        meta_keywords: "send to ai, chatgpt bookmarklet, claude bookmarklet, perplexity bookmarklet, ai assistant, text to ai",
        logo: "Send to AI",
        hero_h1: "Send Web Text to AI in One Click",
        hero_slogan: "Quickly send selected text from any webpage to ChatGPT, Claude, or Perplexity for instant AI assistance.",
        install_cta: "Install Now",
        features_title: "Features — Send to AI",
        install_title: "3-Second Install, Use Forever",
        bookmarklet_button_text: "Send to AI",
        modal_title: "Choose AI Service"
    },
    qrCode: {
        nav: "QR Code",
        meta_title: "QR Code Generator - Create QR Codes for Any Webpage | TableCopy",
        meta_description: "Generate QR codes for any webpage URL instantly. Perfect for sharing links on mobile devices, print materials, or presentations.",
        meta_keywords: "qr code generator, webpage qr code, url to qr code, bookmarklet, free qr code",
        logo: "QR Code Generator",
        hero_h1: "Generate QR Codes Instantly",
        hero_slogan: "Create QR codes for any webpage with one click. Download, share, or print QR codes for easy mobile access.",
        install_cta: "Install Now",
        features_title: "Features — QR Code Generator",
        install_title: "3-Second Install, Use Forever",
        bookmarklet_button_text: "QR Code",
        modal_title: "QR Code for Current Page"
    },
    translator: {
        nav: "Translator",
        meta_title: "Web Translator - Translate Any Webpage Instantly | TableCopy",
        meta_description: "Translate any webpage to your language using Google Translate. One-click bookmarklet for instant webpage translation.",
        meta_keywords: "web translator, translate webpage, google translate bookmarklet, page translator, free translation",
        logo: "Web Translator",
        hero_h1: "Translate Any Webpage Instantly",
        hero_slogan: "Break language barriers with one click. Translate any webpage to your preferred language using Google Translate.",
        install_cta: "Install Now",
        features_title: "Features — Web Translator",
        install_title: "3-Second Install, Use Forever",
        bookmarklet_button_text: "Translate"
    },
    enableCopy: {
        nav: "Enable Copy",
        meta_title: "Enable Copy - Remove Copy Restrictions from Any Website | TableCopy",
        meta_description: "Remove right-click and copy restrictions from any website. Re-enable text selection, copying, and context menus instantly.",
        meta_keywords: "enable copy, remove copy restrictions, allow copy, bypass copy protection, right-click enable",
        logo: "Enable Copy",
        hero_h1: "Remove Copy Restrictions Instantly",
        hero_slogan: "Re-enable right-click, text selection, and copying on any website. Bypass annoying copy restrictions with one click.",
        install_cta: "Install Now",
        features_title: "Features — Enable Copy",
        install_title: "3-Second Install, Use Forever",
        bookmarklet_button_text: "Enable Copy"
    },
    darkMode: {
        nav: "Dark Mode",
        meta_title: "Dark Mode - Add Dark Mode to Any Website | TableCopy",
        meta_description: "Enable dark mode on any website instantly. Reduce eye strain and save battery with one-click dark mode bookmarklet.",
        meta_keywords: "dark mode, night mode, website dark mode, bookmarklet, eye protection",
        logo: "Dark Mode",
        hero_h1: "Dark Mode for Any Website",
        hero_slogan: "Transform bright websites into comfortable dark mode. Reduce eye strain and save battery with one click.",
        install_cta: "Install Now",
        features_title: "Features — Dark Mode",
        install_title: "3-Second Install, Use Forever",
        bookmarklet_button_text: "Dark Mode",
        modal_title: "Dark Mode"
    },
    wayback: {
        nav: "Wayback Machine",
        meta_title: "Wayback Machine - View Webpage History | TableCopy",
        meta_description: "Instantly view archived versions of any webpage using the Internet Archive Wayback Machine. See how websites looked in the past.",
        meta_keywords: "wayback machine, webpage history, internet archive, view old websites, archived pages",
        logo: "Wayback Machine",
        hero_h1: "View Webpage History Instantly",
        hero_slogan: "Access archived versions of any website using the Internet Archive Wayback Machine. See the web as it was.",
        install_cta: "Install Now",
        features_title: "Features — Wayback Machine",
        install_title: "3-Second Install, Use Forever",
        bookmarklet_button_text: "Wayback"
    },
    highlight: {
        nav: "Highlight Structure",
        meta_title: "Highlight Structure - Visualize Webpage Layout | TableCopy",
        meta_description: "Highlight all divs and headers on any webpage. Visualize page structure for debugging, SEO analysis, or web development.",
        meta_keywords: "highlight structure, visualize webpage, page structure, web debugging, seo analysis",
        logo: "Highlight Structure",
        hero_h1: "Visualize Webpage Structure",
        hero_slogan: "See the hidden structure of any webpage. Highlight divs and headers for debugging, analysis, or learning web design.",
        install_cta: "Install Now",
        features_title: "Features — Highlight Structure",
        install_title: "3-Second Install, Use Forever",
        bookmarklet_button_text: "Highlight",
        modal_title: "Page Structure Highlight"
    }
};

// Translations for "common" section navigation items
const commonNavTranslations = {
    es: {
        nav_send_to_ai: "Enviar a IA",
        nav_qr_code: "Código QR",
        nav_translator: "Traductor",
        nav_enable_copy: "Habilitar Copia",
        nav_dark_mode: "Modo Oscuro",
        nav_wayback: "Máquina del Tiempo",
        nav_highlight: "Resaltar Estructura"
    },
    pt: {
        nav_send_to_ai: "Enviar para IA",
        nav_qr_code: "Código QR",
        nav_translator: "Tradutor",
        nav_enable_copy: "Permitir Copiar",
        nav_dark_mode: "Modo Escuro",
        nav_wayback: "Wayback Machine",
        nav_highlight: "Destacar Estrutura"
    },
    de: {
        nav_send_to_ai: "An KI senden",
        nav_qr_code: "QR-Code",
        nav_translator: "Übersetzer",
        nav_enable_copy: "Kopieren aktivieren",
        nav_dark_mode: "Dunkelmodus",
        nav_wayback: "Wayback Machine",
        nav_highlight: "Struktur hervorheben"
    },
    fr: {
        nav_send_to_ai: "Envoyer à l'IA",
        nav_qr_code: "Code QR",
        nav_translator: "Traducteur",
        nav_enable_copy: "Activer la copie",
        nav_dark_mode: "Mode sombre",
        nav_wayback: "Wayback Machine",
        nav_highlight: "Mettre en évidence la structure"
    },
    ja: {
        nav_send_to_ai: "AIに送信",
        nav_qr_code: "QRコード",
        nav_translator: "翻訳",
        nav_enable_copy: "コピーを有効化",
        nav_dark_mode: "ダークモード",
        nav_wayback: "Wayback Machine",
        nav_highlight: "構造をハイライト"
    },
    ko: {
        nav_send_to_ai: "AI로 전송",
        nav_qr_code: "QR 코드",
        nav_translator: "번역기",
        nav_enable_copy: "복사 사용",
        nav_dark_mode: "다크 모드",
        nav_wayback: "Wayback Machine",
        nav_highlight: "구조 강조"
    },
    ru: {
        nav_send_to_ai: "Отправить в ИИ",
        nav_qr_code: "QR-код",
        nav_translator: "Переводчик",
        nav_enable_copy: "Разрешить копирование",
        nav_dark_mode: "Темный режим",
        nav_wayback: "Wayback Machine",
        nav_highlight: "Выделить структуру"
    }
};

console.log('Translation helper script created. Please add translations manually for quality assurance.');
console.log('Refer to en.json for the complete structure to translate.');
console.log('\nNavigation translations for "common" section:');
console.log(JSON.stringify(commonNavTranslations, null, 2));
