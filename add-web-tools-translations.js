const fs = require('fs');
const path = require('path');

const translations = {
    'zh': {
        'toolbox_badge': '工具箱',
        'nav_web_to_converter': '网页转换器',
        'toolbox_collections_title': '工具箱集合',
        'toolbox_collections_subtitle': '更喜欢一站式？使用我们的工具箱，一个书签即可访问多个工具。',
        'individual_tools_title': '单独工具',
        'individual_tools_subtitle': '更喜欢专用书签？每个工具都可以单独使用，快速访问。'
    },
    'es': {
        'toolbox_badge': 'Caja de herramientas',
        'nav_web_to_converter': 'Conversor Web',
        'toolbox_collections_title': 'Colecciones de Herramientas',
        'toolbox_collections_subtitle': '¿Prefieres todo en uno? Usa nuestras cajas de herramientas para acceder a múltiples herramientas con un solo marcador.',
        'individual_tools_title': 'Herramientas Individuales',
        'individual_tools_subtitle': '¿Prefieres marcadores dedicados? Cada herramienta está disponible individualmente para acceso rápido.'
    },
    'pt': {
        'toolbox_badge': 'Caixa de Ferramentas',
        'nav_web_to_converter': 'Conversor Web',
        'toolbox_collections_title': 'Coleções de Ferramentas',
        'toolbox_collections_subtitle': 'Prefere tudo em um? Use nossas caixas de ferramentas para acessar múltiplas ferramentas com um único marcador.',
        'individual_tools_title': 'Ferramentas Individuais',
        'individual_tools_subtitle': 'Prefere marcadores dedicados? Cada ferramenta está disponível individualmente para acesso rápido.'
    },
    'de': {
        'toolbox_badge': 'Werkzeugkasten',
        'nav_web_to_converter': 'Web-Konverter',
        'toolbox_collections_title': 'Werkzeugkasten-Sammlungen',
        'toolbox_collections_subtitle': 'Bevorzugen Sie alles in einem? Verwenden Sie unsere Werkzeugkästen, um mit einem Lesezeichen auf mehrere Tools zuzugreifen.',
        'individual_tools_title': 'Einzelne Tools',
        'individual_tools_subtitle': 'Bevorzugen Sie dedizierte Lesezeichen? Jedes Tool ist einzeln für schnellen Zugriff verfügbar.'
    },
    'fr': {
        'toolbox_badge': 'Boîte à Outils',
        'nav_web_to_converter': 'Convertisseur Web',
        'toolbox_collections_title': 'Collections de Boîtes à Outils',
        'toolbox_collections_subtitle': 'Préférez-vous tout en un? Utilisez nos boîtes à outils pour accéder à plusieurs outils avec un seul signet.',
        'individual_tools_title': 'Outils Individuels',
        'individual_tools_subtitle': 'Préférez-vous des signets dédiés? Chaque outil est disponible individuellement pour un accès rapide.'
    },
    'ja': {
        'toolbox_badge': 'ツールボックス',
        'nav_web_to_converter': 'Webコンバーター',
        'toolbox_collections_title': 'ツールボックスコレクション',
        'toolbox_collections_subtitle': 'オールインワンをお好みですか？ツールボックスを使用して、1つのブックマークで複数のツールにアクセスしましょう。',
        'individual_tools_title': '個別ツール',
        'individual_tools_subtitle': '専用ブックマークをお好みですか？各ツールは個別に利用でき、素早くアクセスできます。'
    },
    'ko': {
        'toolbox_badge': '도구상자',
        'nav_web_to_converter': '웹 변환기',
        'toolbox_collections_title': '도구상자 컬렉션',
        'toolbox_collections_subtitle': '올인원을 선호하시나요? 도구상자를 사용하여 하나의 북마크로 여러 도구에 액세스하세요.',
        'individual_tools_title': '개별 도구',
        'individual_tools_subtitle': '전용 북마크를 선호하시나요? 각 도구는 개별적으로 사용 가능하여 빠르게 액세스할 수 있습니다.'
    },
    'ru': {
        'toolbox_badge': 'Панель инструментов',
        'nav_web_to_converter': 'Веб-конвертер',
        'toolbox_collections_title': 'Коллекции панелей инструментов',
        'toolbox_collections_subtitle': 'Предпочитаете всё в одном? Используйте наши панели инструментов для доступа к нескольким инструментам с одной закладкой.',
        'individual_tools_title': 'Индивидуальные инструменты',
        'individual_tools_subtitle': 'Предпочитаете Dedicated закладки? Каждый инструмент доступен индивидуально для быстрого доступа.'
    }
};

const localesDir = path.join(__dirname, 'src/locales');

Object.keys(translations).forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);

        // Add common keys
        if (json.common) {
            json.common.toolbox_badge = translations[lang].toolbox_badge;
            json.common.nav_web_to_converter = translations[lang].nav_web_to_converter;
        }

        // Add index keys
        if (json.index) {
            json.index.toolbox_collections_title = translations[lang].toolbox_collections_title;
            json.index.toolbox_collections_subtitle = translations[lang].toolbox_collections_subtitle;
            json.index.individual_tools_title = translations[lang].individual_tools_title;
            json.index.individual_tools_subtitle = translations[lang].individual_tools_subtitle;
        }

        // Add web-to object (copy from English and translate basic keys)
        const enContent = fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8');
        const enJson = JSON.parse(enContent);
        json['web-to'] = enJson['web-to'];
        // Translate the web-to object's key fields
        json['web-to'].logo = translations[lang].nav_web_to_converter;
        json['web-to'].hero_h1 = `5 Web Conversion Tools<br>in One Bookmark`; // Keep English for now
        json['web-to'].hero_slogan = `PDF, Image, Word, Markdown, Text. All your web conversion tools in one place.`; // Keep English for now

        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf8');
        console.log(`✅ Updated ${lang}.json`);
    } catch (error) {
        console.error(`❌ Error updating ${lang}.json:`, error.message);
    }
});

console.log('\n✨ All translations updated successfully!');
