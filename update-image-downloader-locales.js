/**
 * Update image-downloader translations for all languages
 * This script adds the new SEO fields to all locale files
 */

const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, 'src/locales');

// Read the English version to get the structure
const enContent = fs.readJsonSync(path.join(srcDir, 'en.json'));
const imageDownloaderEN = enContent['image-downloader'];

// Languages to update
const languages = ['zh', 'es', 'pt', 'de', 'fr', 'ja', 'ko', 'ru'];

// Fields that need translation (keep English for now, can be translated later)
const fieldsToAdd = [
    'meta_title',
    'meta_description',
    'meta_keywords',
    'intro_title',
    'intro_content',
    'how_to_use_title',
    'how_to_use_content',
    'faq_title',
    'faq_list',
    'languages_title',
    'languages_intro',
    'languages_list',
    'schema_name',
    'schema_description',
    'schema_url',
    'schema_features',
    'schema_faq',
    'schema_howto_name',
    'schema_howto_description',
    'schema_howto_steps'
];

languages.forEach(lang => {
    const localePath = path.join(srcDir, `${lang}.json`);
    const localeContent = fs.readJsonSync(localePath);

    if (!localeContent['image-downloader']) {
        console.log(`⚠️  ${lang}: No image-downloader section found, skipping`);
        return;
    }

    // Update the locale file with new fields
    fieldsToAdd.forEach(field => {
        // For German, we have special translations
        if (lang === 'de') {
            // Keep the German values that already exist
            if (!localeContent['image-downloader'][field]) {
                localeContent['image-downloader'][field] = imageDownloaderEN[field];
            }
        } else {
            // For other languages, use English for now
            if (!localeContent['image-downloader'][field]) {
                localeContent['image-downloader'][field] = imageDownloaderEN[field];
            }
        }
    });

    // Update schema_url for the specific language
    if (localeContent['image-downloader']['schema_url']) {
        localeContent['image-downloader']['schema_url'] = `https://tablecopy.pro/${lang === 'en' ? '' : lang + '/'}image-downloader.html`;
    }

    // Write back to file
    fs.writeJsonSync(localePath, localeContent, { spaces: 4 });
    console.log(`✅ Updated ${lang}.json`);
});

console.log('\n🎉 All locale files updated successfully!');
