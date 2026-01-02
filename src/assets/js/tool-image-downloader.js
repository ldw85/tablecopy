/**
 * =============================================================
 * Image Downloader (图片下载器)
 * =============================================================
 *
 * 功能: 提取当前网页的高清图片，并以画廊形式展示，支持批量下载为ZIP
 * Features: Extract high-resolution images from webpage, display in gallery, download as ZIP
 *
 * 版本: 1.0
 */
(function() {

    // 1. 语言检测
    const lang = (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
    const validLangs = ['zh', 'en', 'es', 'pt', 'de', 'fr', 'ja', 'ko', 'ru'];
    const detectedLang = validLangs.includes(lang) ? lang : 'en';

    // 2. 翻译
    const translations = {
        en: {
            modal_title: "Image Downloader",
            close_button: "Close",
            stats_found: "Found {count} high-resolution images",
            stats_filtered: "Showing {count} of {total}",
            filter_size_label: "Filter by Size",
            filter_type_label: "Filter by Type",
            filter_all: "All",
            filter_large: "Large (>1000px)",
            filter_medium: "Medium (500-1000px)",
            filter_small: "Small (<500px)",
            type_all: "All Types",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "Select All",
            deselect_all: "Deselect All",
            download_selected: "Download Selected ({count})",
            download_all: "Download All as ZIP",
            downloading: "Downloading...",
            preparing_zip: "Preparing ZIP file...",
            generating_zip: "Generating ZIP...",
            download_complete: "Download complete!",
            download_failed: "Download failed: {reason}",
            no_images: "No high-resolution images found on this page.",
            scanning: "Scanning page for images...",
            error_fetch: "Failed to fetch image",
            error_cors: "Blocked by CORS policy",
            error_network: "Network error",
            dimensions: "{width}×{height}",
            preview_button: "Preview",
            download_single: "Download",
            close_preview: "Close Preview",
            images_selected: "{count} image(s) selected",
            zip_filename: "images-{date}",
            warning_cors: "Some images couldn't be downloaded due to CORS restrictions"
        },
        zh: {
            modal_title: "图片下载器",
            close_button: "关闭",
            stats_found: "找到 {count} 张高清图片",
            stats_filtered: "显示 {count}/{total}",
            filter_size_label: "按尺寸筛选",
            filter_type_label: "按类型筛选",
            filter_all: "全部",
            filter_large: "大图 (>1000px)",
            filter_medium: "中图 (500-1000px)",
            filter_small: "小图 (<500px)",
            type_all: "全部类型",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "全选",
            deselect_all: "取消全选",
            download_selected: "下载选中 ({count})",
            download_all: "下载全部为ZIP",
            downloading: "下载中...",
            preparing_zip: "准备ZIP文件...",
            generating_zip: "生成ZIP...",
            download_complete: "下载完成！",
            download_failed: "下载失败：{reason}",
            no_images: "此页面未找到高清图片。",
            scanning: "正在扫描页面图片...",
            error_fetch: "获取图片失败",
            error_cors: "被CORS策略阻止",
            error_network: "网络错误",
            dimensions: "{width}×{height}",
            preview_button: "预览",
            download_single: "下载",
            close_preview: "关闭预览",
            images_selected: "已选择 {count} 张图片",
            zip_filename: "图片-{date}",
            warning_cors: "部分图片因CORS限制无法下载"
        },
        es: {
            modal_title: "Descargador de Imágenes",
            close_button: "Cerrar",
            stats_found: "Se encontraron {count} imágenes de alta resolución",
            stats_filtered: "Mostrando {count} de {total}",
            filter_size_label: "Filtrar por Tamaño",
            filter_type_label: "Filtrar por Tipo",
            filter_all: "Todas",
            filter_large: "Grandes (>1000px)",
            filter_medium: "Medianas (500-1000px)",
            filter_small: "Pequeñas (<500px)",
            type_all: "Todos los Tipos",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "Seleccionar Todo",
            deselect_all: "Deseleccionar Todo",
            download_selected: "Descargar Seleccionadas ({count})",
            download_all: "Descargar Todo como ZIP",
            downloading: "Descargando...",
            preparing_zip: "Preparando archivo ZIP...",
            generating_zip: "Generando ZIP...",
            download_complete: "¡Descarga completa!",
            download_failed: "Descarga fallida: {reason}",
            no_images: "No se encontraron imágenes de alta resolución en esta página.",
            scanning: "Escaneando página en busca de imágenes...",
            error_fetch: "Error al obtener imagen",
            error_cors: "Bloqueado por política CORS",
            error_network: "Error de red",
            dimensions: "{width}×{height}",
            preview_button: "Vista Previa",
            download_single: "Descargar",
            close_preview: "Cerrar Vista Previa",
            images_selected: "{count} imagen(es) seleccionada(s)",
            zip_filename: "imagenes-{date}",
            warning_cors: "Algunas imágenes no se pudieron descargar debido a restricciones CORS"
        },
        pt: {
            modal_title: "Baixador de Imagens",
            close_button: "Fechar",
            stats_found: "Encontradas {count} imagens de alta resolução",
            stats_filtered: "Mostrando {count} de {total}",
            filter_size_label: "Filtrar por Tamanho",
            filter_type_label: "Filtrar por Tipo",
            filter_all: "Todas",
            filter_large: "Grandes (>1000px)",
            filter_medium: "Médias (500-1000px)",
            filter_small: "Pequenas (<500px)",
            type_all: "Todos os Tipos",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "Selecionar Tudo",
            deselect_all: "Deselecionar Tudo",
            download_selected: "Baixar Selecionadas ({count})",
            download_all: "Baixar Tudo como ZIP",
            downloading: "Baixando...",
            preparing_zip: "Preparando arquivo ZIP...",
            generating_zip: "Gerando ZIP...",
            download_complete: "Download completo!",
            download_failed: "Download falhou: {reason}",
            no_images: "Nenhuma imagem de alta resolução encontrada nesta página.",
            scanning: "Escaneando página por imagens...",
            error_fetch: "Falha ao obter imagem",
            error_cors: "Bloqueado por política CORS",
            error_network: "Erro de rede",
            dimensions: "{width}×{height}",
            preview_button: "Visualizar",
            download_single: "Baixar",
            close_preview: "Fechar Visualização",
            images_selected: "{count} imagem(ns) selecionada(s)",
            zip_filename: "imagens-{date}",
            warning_cors: "Algumas imagens não puderam ser baixadas devido a restrições CORS"
        },
        de: {
            modal_title: "Bild-Downloader",
            close_button: "Schließen",
            stats_found: "{count} hochauflösende Bilder gefunden",
            stats_filtered: "Zeige {count} von {total}",
            filter_size_label: "Nach Größe filtern",
            filter_type_label: "Nach Typ filtern",
            filter_all: "Alle",
            filter_large: "Groß (>1000px)",
            filter_medium: "Mittel (500-1000px)",
            filter_small: "Klein (<500px)",
            type_all: "Alle Typen",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "Alle auswählen",
            deselect_all: "Alle abwählen",
            download_selected: "Ausgewählte herunterladen ({count})",
            download_all: "Alle als ZIP herunterladen",
            downloading: "Herunterladen...",
            preparing_zip: "ZIP-Datei wird vorbereitet...",
            generating_zip: "ZIP wird generiert...",
            download_complete: "Download abgeschlossen!",
            download_failed: "Download fehlgeschlagen: {reason}",
            no_images: "Keine hochauflösenden Bilder auf dieser Seite gefunden.",
            scanning: "Seite wird nach Bildern durchsucht...",
            error_fetch: "Bild konnte nicht geladen werden",
            error_cors: "Durch CORS-Richtlinie blockiert",
            error_network: "Netzwerkfehler",
            dimensions: "{width}×{height}",
            preview_button: "Vorschau",
            download_single: "Herunterladen",
            close_preview: "Vorschau schließen",
            images_selected: "{count} Bild(er) ausgewählt",
            zip_filename: "bilder-{date}",
            warning_cors: "Einige Bilder konnten aufgrund von CORS-Einschränkungen nicht heruntergeladen werden"
        },
        fr: {
            modal_title: "Téléchargeur d'Images",
            close_button: "Fermer",
            stats_found: "{count} images haute résolution trouvées",
            stats_filtered: "Affichage {count} sur {total}",
            filter_size_label: "Filtrer par Taille",
            filter_type_label: "Filtrer par Type",
            filter_all: "Toutes",
            filter_large: "Grandes (>1000px)",
            filter_medium: "Moyennes (500-1000px)",
            filter_small: "Petites (<500px)",
            type_all: "Tous les Types",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "Tout sélectionner",
            deselect_all: "Tout désélectionner",
            download_selected: "Télécharger Sélectionnées ({count})",
            download_all: "Tout Télécharger en ZIP",
            downloading: "Téléchargement...",
            preparing_zip: "Préparation du fichier ZIP...",
            generating_zip: "Génération du ZIP...",
            download_complete: "Téléchargement terminé !",
            download_failed: "Échec du téléchargement : {reason}",
            no_images: "Aucune image haute résolution trouvée sur cette page.",
            scanning: "Recherche d'images sur la page...",
            error_fetch: "Échec de la récupération de l'image",
            error_cors: "Bloqué par la politique CORS",
            error_network: "Erreur réseau",
            dimensions: "{width}×{height}",
            preview_button: "Aperçu",
            download_single: "Télécharger",
            close_preview: "Fermer l'Aperçu",
            images_selected: "{count} image(s) sélectionnée(s)",
            zip_filename: "images-{date}",
            warning_cors: "Certaines images n'ont pas pu être téléchargées en raison des restrictions CORS"
        },
        ja: {
            modal_title: "画像ダウンローダー",
            close_button: "閉じる",
            stats_found: "{count}枚の高解像度画像が見つかりました",
            stats_filtered: "{total}枚中{count}枚を表示",
            filter_size_label: "サイズでフィルター",
            filter_type_label: "タイプでフィルター",
            filter_all: "すべて",
            filter_large: "大 (>1000px)",
            filter_medium: "中 (500-1000px)",
            filter_small: "小 (<500px)",
            type_all: "すべてのタイプ",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "すべて選択",
            deselect_all: "すべて選択解除",
            download_selected: "選択したものをダウンロード ({count})",
            download_all: "すべてをZIPでダウンロード",
            downloading: "ダウンロード中...",
            preparing_zip: "ZIPファイルを準備中...",
            generating_zip: "ZIPを生成中...",
            download_complete: "ダウンロード完了！",
            download_failed: "ダウンロード失敗: {reason}",
            no_images: "このページでは高解像度画像が見つかりませんでした。",
            scanning: "画像をスキャン中...",
            error_fetch: "画像の取得に失敗しました",
            error_cors: "CORSポリシーによってブロックされました",
            error_network: "ネットワークエラー",
            dimensions: "{width}×{height}",
            preview_button: "プレビュー",
            download_single: "ダウンロード",
            close_preview: "プレビューを閉じる",
            images_selected: "{count}枚の画像が選択されました",
            zip_filename: "画像-{date}",
            warning_cors: "CORS制限により、一部の画像をダウンロードできませんでした"
        },
        ko: {
            modal_title: "이미지 다운로더",
            close_button: "닫기",
            stats_found: "{count}개의 고해상도 이미지를 찾았습니다",
            stats_filtered: "{total}개 중 {count}개 표시",
            filter_size_label: "크기로 필터링",
            filter_type_label: "유형으로 필터링",
            filter_all: "전체",
            filter_large: "큰 이미지 (>1000px)",
            filter_medium: "중간 (500-1000px)",
            filter_small: "작은 이미지 (<500px)",
            type_all: "모든 유형",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "모두 선택",
            deselect_all: "모두 선택 해제",
            download_selected: "선택항목 다운로드 ({count})",
            download_all: "전체 ZIP으로 다운로드",
            downloading: "다운로드 중...",
            preparing_zip: "ZIP 파일 준비 중...",
            generating_zip: "ZIP 생성 중...",
            download_complete: "다운로드 완료!",
            download_failed: "다운로드 실패: {reason}",
            no_images: "이 페이지에서 고해상도 이미지를 찾을 수 없습니다.",
            scanning: "이미지 스캔 중...",
            error_fetch: "이미지 가져오기 실패",
            error_cors: "CORS 정책으로 차단됨",
            error_network: "네트워크 오류",
            dimensions: "{width}×{height}",
            preview_button: "미리보기",
            download_single: "다운로드",
            close_preview: "미리보기 닫기",
            images_selected: "{count}개의 이미지가 선택되었습니다",
            zip_filename: "이미지-{date}",
            warning_cors: "CORS 제한으로 인해 일부 이미지를 다운로드할 수 없습니다"
        },
        ru: {
            modal_title: "Загрузчик Изображений",
            close_button: "Закрыть",
            stats_found: "Найдено {count} изображений высокого разрешения",
            stats_filtered: "Показано {count} из {total}",
            filter_size_label: "Фильтр по размеру",
            filter_type_label: "Фильтр по типу",
            filter_all: "Все",
            filter_large: "Большие (>1000px)",
            filter_medium: "Средние (500-1000px)",
            filter_small: "Маленькие (<500px)",
            type_all: "Все типы",
            type_jpg: "JPG/PNG",
            type_webp: "WebP",
            type_gif: "GIF",
            select_all: "Выбрать все",
            deselect_all: "Снять выбор",
            download_selected: "Скачать выбранные ({count})",
            download_all: "Скачать все как ZIP",
            downloading: "Загрузка...",
            preparing_zip: "Подготовка ZIP-файла...",
            generating_zip: "Создание ZIP...",
            download_complete: "Загрузка завершена!",
            download_failed: "Ошибка загрузки: {reason}",
            no_images: "На этой странице не найдено изображений высокого разрешения.",
            scanning: "Сканирование страницы на наличие изображений...",
            error_fetch: "Не удалось получить изображение",
            error_cors: "Заблокировано политикой CORS",
            error_network: "Ошибка сети",
            dimensions: "{width}×{height}",
            preview_button: "Предпросмотр",
            download_single: "Скачать",
            close_preview: "Закрыть предпросмотр",
            images_selected: "Выбрано {count} изображений",
            zip_filename: "изображения-{date}",
            warning_cors: "Некоторые изображения не удалось загрузить из-за ограничений CORS"
        }
    };

    const t = (key, params = {}) => {
        let text = translations[detectedLang][key] || translations['en'][key];
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        return text;
    };

    // 3. CSS前缀
    const CSS_PREFIX = 'img-dl-';

    // 4. 检查是否已经执行过
    if (document.getElementById(`${CSS_PREFIX}modal-overlay`)) {
        return;
    }

    // 5. 配置
    const CONFIG = {
        MIN_WIDTH: 300,
        MIN_HEIGHT: 300,
        MIN_AREA: 90000,
        MAX_RATIO: 10,
        MAX_IMAGES: 200,
        JSZIP_URL: 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
    };

    // 6. 样式
    const STYLES = `
        #${CSS_PREFIX}modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 2147483646;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #${CSS_PREFIX}modal {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 900px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
        }
        #${CSS_PREFIX}header {
            padding: 20px 24px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        #${CSS_PREFIX}header h3 {
            margin: 0;
            font-size: 20px;
            color: #333;
            font-weight: 600;
        }
        #${CSS_PREFIX}stats {
            font-size: 14px;
            color: #666;
        }
        #${CSS_PREFIX}close {
            width: 32px;
            height: 32px;
            border: none;
            background: none;
            color: #888;
            font-size: 24px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.2s, color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #${CSS_PREFIX}close:hover {
            color: #333;
            background-color: #f0f0f0;
        }
        #${CSS_PREFIX}controls {
            padding: 12px 24px;
            background-color: #f9f9f9;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
            flex-shrink: 0;
        }
        #${CSS_PREFIX}controls select {
            padding: 6px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            background-color: #fff;
            cursor: pointer;
        }
        #${CSS_PREFIX}controls label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            cursor: pointer;
        }
        #${CSS_PREFIX}gallery {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
        }
        #${CSS_PREFIX}gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
        }
        .${CSS_PREFIX}card {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            transition: border-color 0.2s, box-shadow 0.2s;
            cursor: pointer;
            position: relative;
        }
        .${CSS_PREFIX}card:hover {
            border-color: #9B59B6;
            box-shadow: 0 4px 12px rgba(155, 89, 182, 0.2);
        }
        .${CSS_PREFIX}card.selected {
            border-color: #9B59B6;
            background-color: rgba(155, 89, 182, 0.05);
        }
        .${CSS_PREFIX}checkbox {
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: 2;
        }
        .${CSS_PREFIX}preview {
            width: 100%;
            height: 120px;
            object-fit: cover;
            background-color: #f0f0f0;
        }
        .${CSS_PREFIX}info {
            padding: 8px;
            font-size: 12px;
            color: #666;
            background-color: #fff;
        }
        .${CSS_PREFIX}dims {
            font-weight: 600;
            margin-bottom: 4px;
        }
        .${CSS_PREFIX}type {
            color: #888;
            text-transform: uppercase;
        }
        .${CSS_PREFIX}actions {
            display: flex;
            gap: 4px;
            margin-top: 8px;
        }
        .${CSS_PREFIX}btn {
            flex: 1;
            padding: 4px 8px;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .${CSS_PREFIX}btn:hover {
            background-color: #f0f0f0;
        }
        #${CSS_PREFIX}footer {
            padding: 16px 24px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 12px;
            align-items: center;
            flex-shrink: 0;
            background-color: #f9f9f9;
        }
        #${CSS_PREFIX}progress {
            flex: 1;
            display: none;
        }
        #${CSS_PREFIX}progress.active {
            display: block;
        }
        #${CSS_PREFIX}progress-bar {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            background-color: #e0e0e0;
        }
        #${CSS_PREFIX}progress-fill {
            height: 100%;
            background-color: #9B59B6;
            transition: width 0.3s;
        }
        #${CSS_PREFIX}progress-text {
            font-size: 13px;
            color: #666;
            margin-top: 4px;
        }
        #${CSS_PREFIX}download-btn {
            padding: 10px 20px;
            background-color: #9B59B6;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
        }
        #${CSS_PREFIX}download-btn:hover:not(:disabled) {
            background-color: #8E44AD;
            transform: translateY(-1px);
        }
        #${CSS_PREFIX}download-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        #${CSS_PREFIX}empty-state {
            text-align: center;
            padding: 40px;
            color: #888;
        }
        #${CSS_PREFIX}loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        #${CSS_PREFIX}loading::after {
            content: "";
            display: inline-block;
            width: 24px;
            height: 24px;
            border: 3px solid #f0f0f0;
            border-top-color: #9B59B6;
            border-radius: 50%;
            animation: ${CSS_PREFIX}spin 0.8s linear infinite;
            margin-left: 12px;
            vertical-align: middle;
        }
        @keyframes ${CSS_PREFIX}spin {
            to { transform: rotate(360deg); }
        }
    `;

    // 7. 数据存储
    let allImages = [];
    let filteredImages = [];
    let selectedImages = new Set();

    // 8. 工具函数
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getFileExtension(url) {
        const match = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(?:\?|#|$)/i);
        return match ? match[1].toLowerCase() : 'jpg';
    }

    function generateFilename(img, index) {
        const urlParts = img.url.split('/');
        let filename = urlParts[urlParts.length - 1];
        filename = filename.split('?')[0].split('#')[0];
        if (!filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            filename = `image-${index + 1}.${img.type}`;
        }
        return `${img.width}x${img.height}_${filename}`;
    }

    // 9. 图片发现
    function discoverImages() {
        const images = [];
        const seenUrls = new Set();

        // 9.1 img标签
        document.querySelectorAll('img[src]').forEach(img => {
            const url = img.src || img.dataset.src || img.dataset.original;
            if (!url || url.startsWith('data:') || seenUrls.has(url)) return;

            const width = img.naturalWidth || img.width || 0;
            const height = img.naturalHeight || img.height || 0;

            images.push({
                url,
                width,
                height,
                type: getFileExtension(url),
                element: img
            });
            seenUrls.add(url);
        });

        // 9.2 背景图片
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            const bgImage = style.backgroundImage;

            if (bgImage && bgImage !== 'none') {
                const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match) {
                    let url = match[1];
                    if (url.startsWith('data:') || seenUrls.has(url)) return;

                    // 创建临时img获取尺寸
                    const tempImg = new Image();
                    tempImg.src = url;

                    images.push({
                        url,
                        width: tempImg.naturalWidth || 0,
                        height: tempImg.naturalHeight || 0,
                        type: getFileExtension(url),
                        element: el,
                        isBackground: true
                    });
                    seenUrls.add(url);
                }
            }
        });

        // 9.3 srcset
        document.querySelectorAll('img[srcset], picture source[srcset]').forEach(el => {
            const srcset = el.srcset || el.getAttribute('srcset');
            if (!srcset) return;

            const candidates = srcset.split(',').map(s => s.trim().split(' ')[0]);
            candidates.forEach(url => {
                if (!url || seenUrls.has(url)) return;

                const img = new Image();
                img.src = url;

                images.push({
                    url,
                    width: img.naturalWidth || 0,
                    height: img.naturalHeight || 0,
                    type: getFileExtension(url),
                    element: el
                });
                seenUrls.add(url);
            });
        });

        // 9.4 video poster
        document.querySelectorAll('video[poster]').forEach(video => {
            const url = video.poster;
            if (!url || seenUrls.has(url)) return;

            images.push({
                url,
                width: video.videoWidth || 0,
                height: video.videoHeight || 0,
                type: getFileExtension(url),
                element: video
            });
            seenUrls.add(url);
        });

        return images;
    }

    // 10. 高清过滤
    function filterHighResolution(images) {
        return images.filter(img => {
            const width = img.width || 0;
            const height = img.height || 0;

            // 跳过小图标
            if (width < CONFIG.MIN_WIDTH || height < CONFIG.MIN_HEIGHT) return false;

            // 跳过长条形
            const ratio = Math.max(width, height) / Math.min(width, height);
            if (ratio > CONFIG.MAX_RATIO) return false;

            // 确保足够面积
            const area = width * height;
            if (area < CONFIG.MIN_AREA) return false;

            // 跳过SVG（通常是图标）
            if (img.type === 'svg') return false;

            return true;
        });
    }

    // 11. UI创建
    function injectUI() {
        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}style`;
        styleSheet.innerText = STYLES;
        document.head.appendChild(styleSheet);

        const overlay = document.createElement('div');
        overlay.id = `${CSS_PREFIX}modal-overlay`;
        overlay.innerHTML = `
            <div id="${CSS_PREFIX}modal">
                <div id="${CSS_PREFIX}header">
                    <h3>${t('modal_title')}</h3>
                    <div id="${CSS_PREFIX}stats">${t('scanning')}</div>
                    <button id="${CSS_PREFIX}close" title="${t('close_button')}">×</button>
                </div>
                <div id="${CSS_PREFIX}controls">
                    <select id="${CSS_PREFIX}filter-size">
                        <option value="all">${t('filter_all')}</option>
                        <option value="large">${t('filter_large')}</option>
                        <option value="medium">${t('filter_medium')}</option>
                        <option value="small">${t('filter_small')}</option>
                    </select>
                    <select id="${CSS_PREFIX}filter-type">
                        <option value="all">${t('type_all')}</option>
                        <option value="jpg">${t('type_jpg')}</option>
                        <option value="webp">${t('type_webp')}</option>
                        <option value="gif">${t('type_gif')}</option>
                    </select>
                    <label>
                        <input type="checkbox" id="${CSS_PREFIX}select-all">
                        <span>${t('select_all')}</span>
                    </label>
                </div>
                <div id="${CSS_PREFIX}gallery">
                    <div id="${CSS_PREFIX}loading">${t('scanning')}</div>
                </div>
                <div id="${CSS_PREFIX}footer">
                    <div id="${CSS_PREFIX}progress">
                        <div id="${CSS_PREFIX}progress-bar">
                            <div id="${CSS_PREFIX}progress-fill" style="width: 0%"></div>
                        </div>
                        <div id="${CSS_PREFIX}progress-text"></div>
                    </div>
                    <button id="${CSS_PREFIX}download-btn">${t('download_all')}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        return overlay;
    }

    function renderGallery() {
        const gallery = document.getElementById(`${CSS_PREFIX}gallery`);
        const stats = document.getElementById(`${CSS_PREFIX}stats`);

        if (filteredImages.length === 0) {
            gallery.innerHTML = `<div id="${CSS_PREFIX}empty-state">${t('no_images')}</div>`;
            stats.textContent = t('stats_filtered', { count: 0, total: allImages.length });
            return;
        }

        const grid = document.createElement('div');
        grid.id = `${CSS_PREFIX}gallery-grid`;

        filteredImages.forEach((img, index) => {
            const card = document.createElement('div');
            card.className = `${CSS_PREFIX}card`;
            card.dataset.url = img.url;

            if (selectedImages.has(img.url)) {
                card.classList.add('selected');
            }

            card.innerHTML = `
                <input type="checkbox" class="${CSS_PREFIX}checkbox" ${selectedImages.has(img.url) ? 'checked' : ''}>
                <img class="${CSS_PREFIX}preview" src="${img.url}" loading="lazy" alt="">
                <div class="${CSS_PREFIX}info">
                    <div class="${CSS_PREFIX}dims">${t('dimensions', { width: img.width, height: img.height })}</div>
                    <div class="${CSS_PREFIX}type">${img.type.toUpperCase()}</div>
                    <div class="${CSS_PREFIX}actions">
                        <button class="${CSS_PREFIX}btn ${CSS_PREFIX}btn-download">${t('download_single')}</button>
                    </div>
                </div>
            `;

            // 点击卡片选择
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains(`${CSS_PREFIX}btn-download`)) {
                    e.stopPropagation();
                    downloadSingleImage(img, index);
                    return;
                }
                if (e.target.classList.contains(`${CSS_PREFIX}checkbox`)) return;

                const checkbox = card.querySelector(`.${CSS_PREFIX}checkbox`);
                checkbox.checked = !checkbox.checked;
                toggleSelection(img.url, card);
            });

            // 复选框变化
            const checkbox = card.querySelector(`.${CSS_PREFIX}checkbox`);
            checkbox.addEventListener('change', () => toggleSelection(img.url, card));

            // 下载按钮
            const downloadBtn = card.querySelector(`.${CSS_PREFIX}btn-download`);
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadSingleImage(img, index);
            });

            grid.appendChild(card);
        });

        gallery.innerHTML = '';
        gallery.appendChild(grid);

        stats.textContent = t('stats_filtered', { count: filteredImages.length, total: allImages.length });
        updateDownloadButton();
    }

    function toggleSelection(url, card) {
        if (selectedImages.has(url)) {
            selectedImages.delete(url);
            card.classList.remove('selected');
        } else {
            selectedImages.add(url);
            card.classList.add('selected');
        }
        updateDownloadButton();
        updateSelectAllCheckbox();
    }

    function updateSelectAllCheckbox() {
        const checkbox = document.getElementById(`${CSS_PREFIX}select-all`);
        const allSelected = filteredImages.length > 0 && filteredImages.every(img => selectedImages.has(img.url));
        checkbox.checked = allSelected;
    }

    function updateDownloadButton() {
        const btn = document.getElementById(`${CSS_PREFIX}download-btn`);
        const count = selectedImages.size;
        btn.textContent = count > 0 ? t('download_selected', { count }) : t('download_all');
        btn.disabled = filteredImages.length === 0;
    }

    function applyFilters() {
        const sizeFilter = document.getElementById(`${CSS_PREFIX}filter-size`).value;
        const typeFilter = document.getElementById(`${CSS_PREFIX}filter-type`).value;

        filteredImages = allImages.filter(img => {
            // 尺寸过滤
            if (sizeFilter !== 'all') {
                const maxDimension = Math.max(img.width, img.height);
                if (sizeFilter === 'large' && maxDimension <= 1000) return false;
                if (sizeFilter === 'medium' && (maxDimension > 1000 || maxDimension < 500)) return false;
                if (sizeFilter === 'small' && maxDimension >= 500) return false;
            }

            // 类型过滤
            if (typeFilter !== 'all') {
                if (typeFilter === 'jpg' && !['jpg', 'jpeg', 'png'].includes(img.type)) return false;
                if (typeFilter === 'webp' && img.type !== 'webp') return false;
                if (typeFilter === 'gif' && img.type !== 'gif') return false;
            }

            return true;
        });

        // 限制数量
        if (filteredImages.length > CONFIG.MAX_IMAGES) {
            filteredImages = filteredImages.slice(0, CONFIG.MAX_IMAGES);
        }

        renderGallery();
    }

    // 12. 下载功能
    async function downloadSingleImage(img, index) {
        try {
            const response = await fetch(img.url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = generateFilename(img, index);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error(`${t('error_fetch')}:`, error);
            alert(`${t('error_fetch')}: ${img.url}`);
        }
    }

    async function downloadAsZip() {
        const imagesToDownload = selectedImages.size > 0
            ? allImages.filter(img => selectedImages.has(img.url))
            : filteredImages;

        if (imagesToDownload.length === 0) return;

        // 加载JSZip
        if (typeof JSZip === 'undefined') {
            await loadJSZip();
        }

        const progress = document.getElementById(`${CSS_PREFIX}progress`);
        const progressFill = document.getElementById(`${CSS_PREFIX}progress-fill`);
        const progressText = document.getElementById(`${CSS_PREFIX}progress-text`);
        const downloadBtn = document.getElementById(`${CSS_PREFIX}download-btn`);

        progress.classList.add('active');
        downloadBtn.disabled = true;

        try {
            const zip = new JSZip();
            const folder = zip.folder('images');
            const errors = [];

            for (let i = 0; i < imagesToDownload.length; i++) {
                const img = imagesToDownload[i];

                progressText.textContent = t('downloading') + ` ${i + 1}/${imagesToDownload.length}`;
                progressFill.style.width = `${((i + 1) / imagesToDownload.length) * 100}%`;

                try {
                    const response = await fetch(img.url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const blob = await response.blob();
                    const filename = generateFilename(img, i);
                    folder.file(filename, blob);
                } catch (error) {
                    console.error(`${t('error_fetch')}:`, img.url, error);
                    errors.push(`${img.url}: ${error.message}`);
                }
            }

            progressText.textContent = t('generating_zip');

            if (errors.length > 0) {
                folder.file('error_log.txt', errors.join('\n'));
            }

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `images-${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            progressText.textContent = t('download_complete');
            setTimeout(() => cleanup(), 1500);

        } catch (error) {
            console.error('Download error:', error);
            alert(t('download_failed', { reason: error.message }));
            downloadBtn.disabled = false;
            progress.classList.remove('active');
        }
    }

    function loadJSZip() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = CONFIG.JSZIP_URL;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load JSZip'));
            document.head.appendChild(script);
        });
    }

    // 13. 清理
    function cleanup() {
        const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        const style = document.getElementById(`${CSS_PREFIX}style`);
        if (overlay) document.body.removeChild(overlay);
        if (style) document.head.removeChild(style);
    }

    // 14. 初始化
    function init() {
        injectUI();

        // 扫描并过滤图片
        setTimeout(() => {
            allImages = discoverImages();
            allImages = filterHighResolution(allImages);

            // 初始选择所有
            allImages.forEach(img => selectedImages.add(img.url));

            applyFilters();
            updateSelectAllCheckbox();
        }, 100);

        // 事件绑定
        document.getElementById(`${CSS_PREFIX}close`).addEventListener('click', cleanup);
        document.getElementById(`${CSS_PREFIX}modal-overlay`).addEventListener('click', (e) => {
            if (e.target.id === `${CSS_PREFIX}modal-overlay`) cleanup();
        });

        document.getElementById(`${CSS_PREFIX}filter-size`).addEventListener('change', applyFilters);
        document.getElementById(`${CSS_PREFIX}filter-type`).addEventListener('change', applyFilters);

        document.getElementById(`${CSS_PREFIX}select-all`).addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll(`.${CSS_PREFIX}checkbox`);
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                const card = cb.closest(`.${CSS_PREFIX}card`);
                const url = card.dataset.url;
                if (e.target.checked) {
                    selectedImages.add(url);
                    card.classList.add('selected');
                } else {
                    selectedImages.delete(url);
                    card.classList.remove('selected');
                }
            });
            updateDownloadButton();
        });

        document.getElementById(`${CSS_PREFIX}download-btn`).addEventListener('click', downloadAsZip);

        // ESC关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cleanup();
        });
    }

    // 启动
    init();

})();
