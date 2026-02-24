/**
 * =============================================================
 * Video Downloader (视频下载器)
 * =============================================================
 *
 * 功能: 提取当前网页的视频，并以画廊形式展示，支持批量下载
 * Features: Extract videos from webpage, display in gallery, download individually or as ZIP
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
            modal_title: "Video Downloader",
            close_button: "Close",
            stats_found: "Found {count} videos",
            stats_filtered: "Showing {count} of {total}",
            filter_size_label: "Filter by Size",
            filter_type_label: "Filter by Type",
            filter_all: "All",
            filter_large: "Large (>1000px)",
            filter_medium: "Medium (500-1000px)",
            filter_small: "Small (<500px)",
            type_all: "All Types",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "Other",
            select_all: "Select All",
            deselect_all: "Deselect All",
            download_selected: "Download Selected ({count})",
            download_all: "Download All as ZIP",
            downloading: "Downloading...",
            preparing_zip: "Preparing ZIP file...",
            generating_zip: "Generating ZIP...",
            download_complete: "Download complete!",
            download_failed: "Download failed: {reason}",
            no_videos: "No videos found on this page.",
            scanning: "Scanning page for videos...",
            error_fetch: "Failed to fetch video",
            error_cors: "Blocked by CORS policy",
            error_network: "Network error",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "Preview",
            download_single: "Download",
            close_preview: "Close Preview",
            videos_selected: "{count} video(s) selected",
            zip_filename: "videos-{date}",
            warning_cors: "Some videos couldn't be downloaded due to CORS restrictions",
            warning_stream: "Streaming videos (YouTube, Vimeo, etc.) cannot be downloaded directly",
            streaming_note: "Use a dedicated YouTube downloader or browser extension for downloading.",
            online_video: "Online Video",
            unknown_size: "Unknown size",
            unknown_duration: "Unknown duration",
            load_more: "Load More"
        },
        zh: {
            modal_title: "视频下载器",
            close_button: "关闭",
            stats_found: "找到 {count} 个视频",
            stats_filtered: "显示 {count}/{total}",
            filter_size_label: "按尺寸筛选",
            filter_type_label: "按类型筛选",
            filter_all: "全部",
            filter_large: "大图 (>1000px)",
            filter_medium: "中图 (500-1000px)",
            filter_small: "小图 (<500px)",
            type_all: "全部类型",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "其他",
            select_all: "全选",
            deselect_all: "取消全选",
            download_selected: "下载选中 ({count})",
            download_all: "下载全部为ZIP",
            downloading: "下载中...",
            preparing_zip: "准备ZIP文件...",
            generating_zip: "生成ZIP...",
            download_complete: "下载完成！",
            download_failed: "下载失败：{reason}",
            no_videos: "此页面未找到视频。",
            scanning: "正在扫描页面视频...",
            error_fetch: "获取视频失败",
            error_cors: "被CORS策略阻止",
            error_network: "网络错误",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "预览",
            download_single: "下载",
            close_preview: "关闭预览",
            videos_selected: "已选择 {count} 个视频",
            zip_filename: "视频-{date}",
            warning_cors: "部分视频因CORS限制无法下载",
            warning_stream: "流媒体视频（YouTube、Vimeo等）无法直接下载",
            streaming_note: "请使用专门的 YouTube 下载器或浏览器扩展来下载。",
            online_video: "在线视频",
            unknown_size: "未知尺寸",
            unknown_duration: "未知时长",
            load_more: "加载更多"
        },
        es: {
            modal_title: "Descargador de Videos",
            close_button: "Cerrar",
            stats_found: "Se encontraron {count} videos",
            stats_filtered: "Mostrando {count} de {total}",
            filter_size_label: "Filtrar por Tamaño",
            filter_type_label: "Filtrar por Tipo",
            filter_all: "Todos",
            filter_large: "Grandes (>1000px)",
            filter_medium: "Medianos (500-1000px)",
            filter_small: "Pequeños (<500px)",
            type_all: "Todos los Tipos",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "Otros",
            select_all: "Seleccionar Todo",
            deselect_all: "Deseleccionar Todo",
            download_selected: "Descargar Seleccionados ({count})",
            download_all: "Descargar Todo como ZIP",
            downloading: "Descargando...",
            preparing_zip: "Preparando archivo ZIP...",
            generating_zip: "Generando ZIP...",
            download_complete: "¡Descarga completa!",
            download_failed: "Descarga fallida: {reason}",
            no_videos: "No se encontraron videos en esta página.",
            scanning: "Escaneando página en busca de videos...",
            error_fetch: "Error al obtener video",
            error_cors: "Bloqueado por política CORS",
            error_network: "Error de red",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "Vista Previa",
            download_single: "Descargar",
            close_preview: "Cerrar Vista Previa",
            videos_selected: "{count} video(s) seleccionado(s)",
            zip_filename: "videos-{date}",
            warning_cors: "Algunos videos no pudieron descargarse debido a restricciones CORS",
            warning_stream: "Los videos en streaming (YouTube, Vimeo, etc.) no se pueden descargar directamente",
            streaming_note: "Utilice un descargador de YouTube dedicado o una extensión del navegador.",
            online_video: "Video Online",
            unknown_size: "Tamaño desconocido",
            unknown_duration: "Duración desconocida",
            load_more: "Cargar Más"
        },
        pt: {
            modal_title: "Baixador de Vídeos",
            close_button: "Fechar",
            stats_found: "Encontrados {count} vídeos",
            stats_filtered: "Mostrando {count} de {total}",
            filter_size_label: "Filtrar por Tamanho",
            filter_type_label: "Filtrar por Tipo",
            filter_all: "Todos",
            filter_large: "Grandes (>1000px)",
            filter_medium: "Médios (500-1000px)",
            filter_small: "Pequenos (<500px)",
            type_all: "Todos os Tipos",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "Outros",
            select_all: "Selecionar Tudo",
            deselect_all: "Deselecionar Tudo",
            download_selected: "Baixar Selecionados ({count})",
            download_all: "Baixar Tudo como ZIP",
            downloading: "Baixando...",
            preparing_zip: "Preparando arquivo ZIP...",
            generating_zip: "Gerando ZIP...",
            download_complete: "Download completo!",
            download_failed: "Download falhou: {reason}",
            no_videos: "Nenhum vídeo encontrado nesta página.",
            scanning: "Escaneando página por vídeos...",
            error_fetch: "Falha ao obter vídeo",
            error_cors: "Bloqueado por política CORS",
            error_network: "Erro de rede",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "Visualizar",
            download_single: "Baixar",
            close_preview: "Fechar Visualização",
            videos_selected: "{count} vídeo(s) selecionado(s)",
            zip_filename: "videos-{date}",
            warning_cors: "Alguns vídeos não puderam ser baixados devido a restrições CORS",
            warning_stream: "Vídeos de streaming (YouTube, Vimeo, etc.) não podem ser baixados diretamente",
            streaming_note: "Use um baixador dedicado do YouTube ou uma extensão do navegador.",
            online_video: "Vídeo Online",
            unknown_size: "Tamanho desconhecido",
            unknown_duration: "Duração desconhecida",
            load_more: "Carregar Mais"
        },
        de: {
            modal_title: "Video-Downloader",
            close_button: "Schließen",
            stats_found: "{count} Videos gefunden",
            stats_filtered: "Zeige {count} von {total}",
            filter_size_label: "Nach Größe filtern",
            filter_type_label: "Nach Typ filtern",
            filter_all: "Alle",
            filter_large: "Groß (>1000px)",
            filter_medium: "Mittel (500-1000px)",
            filter_small: "Klein (<500px)",
            type_all: "Alle Typen",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "Andere",
            select_all: "Alle auswählen",
            deselect_all: "Alle abwählen",
            download_selected: "Ausgewählte herunterladen ({count})",
            download_all: "Alle als ZIP herunterladen",
            downloading: "Herunterladen...",
            preparing_zip: "ZIP-Datei wird vorbereitet...",
            generating_zip: "ZIP wird generiert...",
            download_complete: "Download abgeschlossen!",
            download_failed: "Download fehlgeschlagen: {reason}",
            no_videos: "Keine Videos auf dieser Seite gefunden.",
            scanning: "Seite wird nach Videos durchsucht...",
            error_fetch: "Video konnte nicht geladen werden",
            error_cors: "Durch CORS-Richtlinie blockiert",
            error_network: "Netzwerkfehler",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "Vorschau",
            download_single: "Herunterladen",
            close_preview: "Vorschau schließen",
            videos_selected: "{count} Video(s) ausgewählt",
            zip_filename: "videos-{date}",
            warning_cors: "Einige Videos konnten aufgrund von CORS-Einschränkungen nicht heruntergeladen werden",
            warning_stream: "Streaming-Videos (YouTube, Vimeo, etc.) können nicht direkt heruntergeladen werden",
            streaming_note: "Verwenden Sie einen dedizierten YouTube-Downloader oder eine Browser-Erweiterung.",
            online_video: "Online-Video",
            unknown_size: "Unbekannte Größe",
            unknown_duration: "Unbekannte Dauer",
            load_more: "Mehr laden"
        },
        fr: {
            modal_title: "Téléchargeur de Vidéos",
            close_button: "Fermer",
            stats_found: "{count} vidéos trouvées",
            stats_filtered: "Affichage {count} sur {total}",
            filter_size_label: "Filtrer par Taille",
            filter_type_label: "Filtrer par Type",
            filter_all: "Toutes",
            filter_large: "Grandes (>1000px)",
            filter_medium: "Moyennes (500-1000px)",
            filter_small: "Petites (<500px)",
            type_all: "Tous les Types",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "Autres",
            select_all: "Tout sélectionner",
            deselect_all: "Tout désélectionner",
            download_selected: "Télécharger Sélectionnées ({count})",
            download_all: "Tout Télécharger en ZIP",
            downloading: "Téléchargement...",
            preparing_zip: "Préparation du fichier ZIP...",
            generating_zip: "Génération du ZIP...",
            download_complete: "Téléchargement terminé !",
            download_failed: "Échec du téléchargement : {reason}",
            no_videos: "Aucune vidéo trouvée sur cette page.",
            scanning: "Recherche de vidéos sur la page...",
            error_fetch: "Échec de la récupération de la vidéo",
            error_cors: "Bloqué par la politique CORS",
            error_network: "Erreur réseau",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "Aperçu",
            download_single: "Télécharger",
            close_preview: "Fermer l'Aperçu",
            videos_selected: "{count} vidéo(s) sélectionnée(s)",
            zip_filename: "videos-{date}",
            warning_cors: "Certaines vidéos n'ont pas pu être téléchargées en raison des restrictions CORS",
            warning_stream: "Les vidéos en streaming (YouTube, Vimeo, etc.) ne peuvent pas être téléchargées directement",
            streaming_note: "Utilisez un téléchargeur YouTube dédié ou une extension de navigateur.",
            online_video: "Vidéo en Ligne",
            unknown_size: "Taille inconnue",
            unknown_duration: "Durée inconnue",
            load_more: "Charger Plus"
        },
        ja: {
            modal_title: "動画ダウンローダー",
            close_button: "閉じる",
            stats_found: "{count}件の動画が見つかりました",
            stats_filtered: "{total}件中{count}件を表示",
            filter_size_label: "サイズでフィルター",
            filter_type_label: "タイプでフィルター",
            filter_all: "すべて",
            filter_large: "大 (>1000px)",
            filter_medium: "中 (500-1000px)",
            filter_small: "小 (<500px)",
            type_all: "すべてのタイプ",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "その他",
            select_all: "すべて選択",
            deselect_all: "すべて選択解除",
            download_selected: "選択したものをダウンロード ({count})",
            download_all: "すべてをZIPでダウンロード",
            downloading: "ダウンロード中...",
            preparing_zip: "ZIPファイルを準備中...",
            generating_zip: "ZIPを生成中...",
            download_complete: "ダウンロード完了！",
            download_failed: "ダウンロード失敗: {reason}",
            no_videos: "このページでは動画が見つかりませんでした。",
            scanning: "動画をスキャン中...",
            error_fetch: "動画の取得に失敗しました",
            error_cors: "CORSポリシーによってブロックされました",
            error_network: "ネットワークエラー",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "プレビュー",
            download_single: "ダウンロード",
            close_preview: "プレビューを閉じる",
            videos_selected: "{count}件の動画が選択されました",
            zip_filename: "動画-{date}",
            warning_cors: "CORS制限により、一部の動画をダウンロードできませんでした",
            warning_stream: "ストリーミング動画（YouTube、Vimeoなど）は直接ダウンロードできません",
            streaming_note: "専用のYouTubeダウンローダーまたはブラウザ拡張機能を使用してください。",
            online_video: "オンライン動画",
            unknown_size: "不明なサイズ",
            unknown_duration: "不明な再生時間",
            load_more: "もっと読み込む"
        },
        ko: {
            modal_title: "비디오 다운로더",
            close_button: "닫기",
            stats_found: "{count}개의 비디오를 찾았습니다",
            stats_filtered: "{total}개 중 {count}개 표시",
            filter_size_label: "크기로 필터링",
            filter_type_label: "유형으로 필터링",
            filter_all: "전체",
            filter_large: "큰 이미지 (>1000px)",
            filter_medium: "중간 (500-1000px)",
            filter_small: "작은 이미지 (<500px)",
            type_all: "모든 유형",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "기타",
            select_all: "모두 선택",
            deselect_all: "모두 선택 해제",
            download_selected: "선택항목 다운로드 ({count})",
            download_all: "전체 ZIP으로 다운로드",
            downloading: "다운로드 중...",
            preparing_zip: "ZIP 파일 준비 중...",
            generating_zip: "ZIP 생성 중...",
            download_complete: "다운로드 완료!",
            download_failed: "다운로드 실패: {reason}",
            no_videos: "이 페이지에서 비디오를 찾을 수 없습니다.",
            scanning: "비디오 스캔 중...",
            error_fetch: "비디오 가져오기 실패",
            error_cors: "CORS 정책으로 차단됨",
            error_network: "네트워크 오류",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "미리보기",
            download_single: "다운로드",
            close_preview: "미리보기 닫기",
            videos_selected: "{count}개의 비디오가 선택되었습니다",
            zip_filename: "비디오-{date}",
            warning_cors: "CORS 제한으로 인해 일부 비디오를 다운로드할 수 없습니다",
            warning_stream: "스트리밍 비디오(YouTube, Vimeo 등)는 직접 다운로드할 수 없습니다",
            streaming_note: "전용 YouTube_DOWNLOADER 또는 브라우저 확장을 사용하세요.",
            online_video: "온라인 비디오",
            unknown_size: "알 수 없는 크기",
            unknown_duration: "알 수 없는 재생 시간",
            load_more: "더 보기"
        },
        ru: {
            modal_title: "Загрузчик Видео",
            close_button: "Закрыть",
            stats_found: "Найдено {count} видео",
            stats_filtered: "Показано {count} из {total}",
            filter_size_label: "Фильтр по размеру",
            filter_type_label: "Фильтр по типу",
            filter_all: "Все",
            filter_large: "Большие (>1000px)",
            filter_medium: "Средние (500-1000px)",
            filter_small: "Маленькие (<500px)",
            type_all: "Все типы",
            type_mp4: "MP4",
            type_webm: "WebM",
            type_hls: "HLS (m3u8)",
            type_other: "Другие",
            select_all: "Выбрать все",
            deselect_all: "Снять выбор",
            download_selected: "Скачать выбранные ({count})",
            download_all: "Скачать все как ZIP",
            downloading: "Загрузка...",
            preparing_zip: "Подготовка ZIP-файла...",
            generating_zip: "Создание ZIP...",
            download_complete: "Загрузка завершена!",
            download_failed: "Ошибка загрузки: {reason}",
            no_videos: "На этой странице не найдено видео.",
            scanning: "Сканирование страницы на наличие видео...",
            error_fetch: "Не удалось получить видео",
            error_cors: "Заблокировано политикой CORS",
            error_network: "Ошибка сети",
            dimensions: "{width}×{height}",
            duration: "{minutes}:{seconds}",
            filesize: "{size}",
            preview_button: "Предпросмотр",
            download_single: "Скачать",
            close_preview: "Закрыть предпросмотр",
            videos_selected: "Выбрано {count} видео",
            zip_filename: "видео-{date}",
            warning_cors: "Некоторые видео не удалось загрузить из-за ограничений CORS",
            warning_stream: "Видео стриминговых сервисов (YouTube, Vimeo и т.д.) нельзя скачать напрямую",
            streaming_note: "Используйте специальный загрузчик YouTube или расширение браузера.",
            online_video: "Онлайн Видео",
            unknown_size: "Неизвестный размер",
            unknown_duration: "Неизвестная длительность",
            load_more: "Загрузить еще"
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
    const CSS_PREFIX = 'vid-dl-';

    // 4. 检查是否已经执行过
    if (document.getElementById(`${CSS_PREFIX}modal-overlay`)) {
        return;
    }

    // 5. 配置
    const CONFIG = {
        MIN_WIDTH: 300,
        MIN_HEIGHT: 300,
        MIN_DURATION: 1, // 最小1秒
        MAX_RATIO: 10,
        MAX_VIDEOS: 100,
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
            max-width: 1000px;
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
        #${CSS_PREFIX}warning {
            padding: 10px 24px;
            background-color: #fff3cd;
            border-bottom: 1px solid #ffeeba;
            font-size: 13px;
            color: #856404;
            display: none;
        }
        #${CSS_PREFIX}gallery {
            flex: 1;
            overflow-y: auto;
            padding: 20px 24px;
        }
        #${CSS_PREFIX}gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
        }
        .${CSS_PREFIX}card {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            transition: border-color 0.2s, box-shadow 0.2s;
            cursor: pointer;
            position: relative;
            background-color: #f5f5f5;
        }
        .${CSS_PREFIX}card:hover {
            border-color: #9B59B6;
            box-shadow: 0 4px 12px rgba(155, 89, 182, 0.2);
        }
        .${CSS_PREFIX}card.selected {
            border-color: #9B59B6;
            background-color: rgba(155, 89, 182, 0.05);
        }
        .${CSS_PREFIX}card.streaming {
            border-color: #ffc107;
            background-color: rgba(255, 193, 7, 0.05);
        }
        .${CSS_PREFIX}card.youtube {
            border-color: #FF0000;
            background-color: rgba(255, 0, 0, 0.03);
        }
        .${CSS_PREFIX}preview.youtube-thumb {
            background-color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .${CSS_PREFIX}preview.youtube-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .${CSS_PREFIX}youtube-icon {
            position: absolute;
            width: 40px;
            height: 40px;
            background: rgba(255, 0, 0, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .${CSS_PREFIX}youtube-icon::after {
            content: '';
            border-style: solid;
            border-width: 8px 0 8px 14px;
            border-color: transparent transparent transparent white;
        }
        .${CSS_PREFIX}checkbox {
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: 2;
            width: 20px;
            height: 20px;
        }
        .${CSS_PREFIX}preview {
            width: 100%;
            height: 140px;
            object-fit: contain;
            background-color: #000;
        }
        .${CSS_PREFIX}info {
            padding: 10px;
            font-size: 12px;
            color: #666;
            background-color: #fff;
        }
        .${CSS_PREFIX}dims {
            font-weight: 600;
            margin-bottom: 4px;
            color: #333;
        }
        .${CSS_PREFIX}meta {
            display: flex;
            justify-content: space-between;
            color: #888;
            font-size: 11px;
            margin-bottom: 6px;
        }
        .${CSS_PREFIX}type {
            color: #9B59B6;
            text-transform: uppercase;
            font-weight: 600;
            font-size: 10px;
        }
        .${CSS_PREFIX}actions {
            display: flex;
            gap: 4px;
            margin-top: 8px;
        }
        .${CSS_PREFIX}btn {
            flex: 1;
            padding: 6px 8px;
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
        .${CSS_PREFIX}btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
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
    let allVideos = [];
    let filteredVideos = [];
    let selectedVideos = new Set();

    // 8. 工具函数
    function formatBytes(bytes) {
        if (bytes === 0 || !bytes) return t('unknown_size');
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return t('unknown_duration');
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return t('duration', { minutes: String(mins).padStart(2, '0'), seconds: String(secs).padStart(2, '0') });
    }

    function getFileType(url) {
        if (!url) return 'unknown';
        if (url.includes('.m3u8') || url.includes('m3u8')) return 'hls';
        if (url.includes('.mp4') || url.includes('mp4')) return 'mp4';
        if (url.includes('.webm')) return 'webm';
        if (url.includes('.ogg') || url.includes('.ogv')) return 'ogg';
        if (url.includes('.avi') || url.includes('.mov') || url.includes('.mkv')) return 'other';
        return 'unknown';
    }

    function getVideoTypeLabel(type) {
        const labels = {
            mp4: 'MP4',
            webm: 'WebM',
            hls: 'HLS',
            ogg: 'OGG',
            other: t('type_other'),
            unknown: t('type_other')
        };
        return labels[type] || t('type_other');
    }

    function generateFilename(video, index) {
        const urlParts = video.url.split('/');
        let filename = urlParts[urlParts.length - 1];
        filename = filename.split('?')[0].split('#')[0];
        const ext = video.type === 'hls' ? 'mp4' : (video.type === 'webm' ? 'webm' : 'mp4');
        if (!filename.match(/\.(mp4|webm|m3u8|ogg)$/i)) {
            filename = `video-${index + 1}.${ext}`;
        }
        return `${video.width || 0}x${video.height || 0}_${filename}`;
    }

    // 9. 检测在线视频平台
    function detectStreamingPlatform(url) {
        if (!url) return null;
        const patterns = [
            { name: 'YouTube', regex: /(youtube\.com|youtu\.be|youtube-nocookie\.com)/i },
            { name: 'Vimeo', regex: /vimeo\.com/i },
            { name: 'Dailymotion', regex: /dailymotion\.com/i },
            { name: 'Twitch', regex: /twitch\.tv/i },
            { name: 'Bilibili', regex: /bilibili\.com|bilivideo\.com/i }
        ];
        for (const p of patterns) {
            if (p.regex.test(url)) return p.name;
        }
        return null;
    }

    // 10. 视频发现
    function discoverVideos() {
        const videos = [];
        const seenUrls = new Set();
        let hasStreamingVideo = false;

        // 10.0 检测YouTube视频播放页
        const youtubeMatch = window.location.href.match(/(youtube\.com\/watch|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (youtubeMatch) {
            const videoId = youtubeMatch[2];
            hasStreamingVideo = true;

            // 尝试从页面提取YouTube视频信息
            let videoTitle = 'YouTube Video';
            let thumbnail = null;

            // 尝试获取视频标题
            const titleEl = document.querySelector('h1.ytd-video-primary-info-renderer, h1.ytd-watch-metadata, yt-formatted-string.ytd-video-primary-info-renderer');
            if (titleEl) {
                videoTitle = titleEl.textContent.trim();
            } else {
                // 备用方法：从页面标题获取
                const pageTitle = document.title;
                const match = pageTitle.match(/^(.+?)\s*[-|]/);
                if (match) {
                    videoTitle = match[1].trim();
                }
            }

            // 尝试获取缩略图
            const thumbnailEl = document.querySelector('link[rel="image_src"]');
            if (thumbnailEl) {
                thumbnail = thumbnailEl.href;
            } else {
                thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }

            videos.push({
                url: `https://www.youtube.com/watch?v=${videoId}`,
                width: 1280,
                height: 720,
                duration: 0,
                type: 'streaming',
                element: null,
                isStreaming: true,
                platform: 'YouTube',
                poster: thumbnail,
                title: videoTitle,
                videoId: videoId
            });
            seenUrls.add(`https://www.youtube.com/watch?v=${videoId}`);
        }

        // 10.1 video 标签带 src
        document.querySelectorAll('video[src]').forEach(video => {
            const url = video.src;
            if (!url || url.startsWith('data:') || seenUrls.has(url)) return;

            const platform = detectStreamingPlatform(url);
            if (platform) {
                hasStreamingVideo = true;
            }

            videos.push({
                url,
                width: video.videoWidth || video.offsetWidth || 0,
                height: video.videoHeight || video.offsetHeight || 0,
                duration: video.duration || 0,
                type: getFileType(url),
                element: video,
                isStreaming: !!platform,
                platform: platform,
                poster: video.poster || null
            });
            seenUrls.add(url);
        });

        // 10.2 video source 子元素
        document.querySelectorAll('video source[src]').forEach(source => {
            const url = source.src;
            if (!url || seenUrls.has(url)) return;

            const video = source.parentElement;
            const platform = detectStreamingPlatform(url);
            if (platform) {
                hasStreamingVideo = true;
            }

            videos.push({
                url,
                width: (video && video.videoWidth) || (video && video.offsetWidth) || 0,
                height: (video && video.videoHeight) || (video && video.offsetHeight) || 0,
                duration: (video && video.duration) || 0,
                type: getFileType(url),
                element: video,
                isStreaming: !!platform,
                platform: platform,
                poster: (video && video.poster) || null
            });
            seenUrls.add(url);
        });

        // 10.3 video currentSrc
        document.querySelectorAll('video').forEach(video => {
            if (video.currentSrc && !seenUrls.has(video.currentSrc)) {
                const url = video.currentSrc;
                const platform = detectStreamingPlatform(url);
                if (platform) {
                    hasStreamingVideo = true;
                }

                videos.push({
                    url,
                    width: video.videoWidth || video.offsetWidth || 0,
                    height: video.videoHeight || video.offsetHeight || 0,
                    duration: video.duration || 0,
                    type: getFileType(url),
                    element: video,
                    isStreaming: !!platform,
                    platform: platform,
                    poster: video.poster || null
                });
                seenUrls.add(url);
            }
        });

        // 10.4 iframe 中的视频（YouTube, Vimeo 等）
        document.querySelectorAll('iframe[src]').forEach(iframe => {
            const src = iframe.src;
            const platform = detectStreamingPlatform(src);
            if (platform) {
                hasStreamingVideo = true;
                videos.push({
                    url: src,
                    width: iframe.offsetWidth || 640,
                    height: iframe.offsetHeight || 360,
                    duration: 0,
                    type: 'streaming',
                    element: iframe,
                    isStreaming: true,
                    platform: platform,
                    poster: null
                });
            }
        });

        // 10.5 检测 embed 的 YouTube 视频
        document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
            const src = iframe.src;
            const match = src.match(/(youtube\.com\/embed\/|youtube\.com\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (match) {
                const videoId = match[2];
                const url = `https://www.youtube.com/watch?v=${videoId}`;
                if (!seenUrls.has(url)) {
                    hasStreamingVideo = true;
                    videos.push({
                        url: url,
                        width: iframe.offsetWidth || 640,
                        height: iframe.offsetHeight || 360,
                        duration: 0,
                        type: 'streaming',
                        element: iframe,
                        isStreaming: true,
                        platform: 'YouTube',
                        poster: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                        videoId: videoId
                    });
                    seenUrls.add(url);
                }
            }
        });

        // 10.6 检查是否有流媒体视频，显示警告
        if (hasStreamingVideo) {
            setTimeout(() => {
                const warning = document.getElementById(`${CSS_PREFIX}warning`);
                if (warning) {
                    warning.style.display = 'block';
                    warning.innerHTML = `<strong>${t('warning_stream')}</strong><br><small>${t('streaming_note')}</small>`;
                }
            }, 500);
        }

        return videos;
    }

    // 11. 视频过滤
    function filterVideos(videos) {
        return videos.filter(video => {
            // 跳过非YouTube的流媒体视频（无法直接下载）
            // 但保留YouTube视频用于显示
            if (video.isStreaming && video.platform !== 'YouTube') return false;

            // YouTube 视频总是显示
            if (video.platform === 'YouTube') return true;

            const width = video.width || 0;
            const height = video.height || 0;

            // 跳过太小的视频
            if (width < CONFIG.MIN_WIDTH && height < CONFIG.MIN_HEIGHT) return false;

            // 跳过长宽比异常的
            const minDim = Math.min(width, height);
            const maxDim = Math.max(width, height);
            if (minDim > 0 && maxDim / minDim > CONFIG.MAX_RATIO) return false;

            return true;
        });
    }

    // 12. 获取视频文件大小
    async function getVideoFileSize(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                return parseInt(response.headers.get('content-length')) || 0;
            }
        } catch (e) {
            // CORS 或其他错误
        }
        return 0;
    }

    // 13. UI创建 - 使用安全的DOM操作
    function createElementFromHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body.firstChild;
    }

    function injectUI() {
        const styleSheet = document.createElement('style');
        styleSheet.id = `${CSS_PREFIX}style`;
        styleSheet.textContent = STYLES;
        document.head.appendChild(styleSheet);

        const overlay = document.createElement('div');
        overlay.id = `${CSS_PREFIX}modal-overlay`;

        // 使用安全的DOM操作构建UI
        const modal = document.createElement('div');
        modal.id = `${CSS_PREFIX}modal`;

        // Header
        const header = document.createElement('div');
        header.id = `${CSS_PREFIX}header`;

        const title = document.createElement('h3');
        title.textContent = t('modal_title');
        header.appendChild(title);

        const stats = document.createElement('div');
        stats.id = `${CSS_PREFIX}stats`;
        stats.textContent = t('scanning');
        header.appendChild(stats);

        const closeBtn = document.createElement('button');
        closeBtn.id = `${CSS_PREFIX}close`;
        closeBtn.title = t('close_button');
        closeBtn.textContent = '×';
        header.appendChild(closeBtn);

        modal.appendChild(header);

        // Warning
        const warning = document.createElement('div');
        warning.id = `${CSS_PREFIX}warning`;
        warning.textContent = t('warning_stream');
        modal.appendChild(warning);

        // Controls
        const controls = document.createElement('div');
        controls.id = `${CSS_PREFIX}controls`;

        const sizeFilter = document.createElement('select');
        sizeFilter.id = `${CSS_PREFIX}filter-size`;
        sizeFilter.innerHTML = `
            <option value="all">${t('filter_all')}</option>
            <option value="large">${t('filter_large')}</option>
            <option value="medium">${t('filter_medium')}</option>
            <option value="small">${t('filter_small')}</option>
        `;
        controls.appendChild(sizeFilter);

        const typeFilter = document.createElement('select');
        typeFilter.id = `${CSS_PREFIX}filter-type`;
        typeFilter.innerHTML = `
            <option value="all">${t('type_all')}</option>
            <option value="mp4">${t('type_mp4')}</option>
            <option value="webm">${t('type_webm')}</option>
            <option value="hls">${t('type_hls')}</option>
        `;
        controls.appendChild(typeFilter);

        const label = document.createElement('label');
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = `${CSS_PREFIX}select-all`;
        label.appendChild(selectAllCheckbox);
        const selectAllSpan = document.createElement('span');
        selectAllSpan.textContent = t('select_all');
        label.appendChild(selectAllSpan);
        controls.appendChild(label);

        modal.appendChild(controls);

        // Gallery
        const gallery = document.createElement('div');
        gallery.id = `${CSS_PREFIX}gallery`;
        const loading = document.createElement('div');
        loading.id = `${CSS_PREFIX}loading`;
        loading.textContent = t('scanning');
        gallery.appendChild(loading);
        modal.appendChild(gallery);

        // Footer
        const footer = document.createElement('div');
        footer.id = `${CSS_PREFIX}footer`;

        const progress = document.createElement('div');
        progress.id = `${CSS_PREFIX}progress`;
        progress.innerHTML = `
            <div id="${CSS_PREFIX}progress-bar">
                <div id="${CSS_PREFIX}progress-fill" style="width: 0%"></div>
            </div>
            <div id="${CSS_PREFIX}progress-text"></div>
        `;
        footer.appendChild(progress);

        const downloadBtn = document.createElement('button');
        downloadBtn.id = `${CSS_PREFIX}download-btn`;
        downloadBtn.textContent = t('download_all');
        footer.appendChild(downloadBtn);

        modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        return overlay;
    }

    function renderGallery() {
        const gallery = document.getElementById(`${CSS_PREFIX}gallery`);
        const stats = document.getElementById(`${CSS_PREFIX}stats`);

        // 清空画廊
        gallery.innerHTML = '';

        if (filteredVideos.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.id = `${CSS_PREFIX}empty-state`;
            emptyState.textContent = t('no_videos');
            gallery.appendChild(emptyState);
            stats.textContent = t('stats_filtered', { count: 0, total: allVideos.length });
            return;
        }

        const grid = document.createElement('div');
        grid.id = `${CSS_PREFIX}gallery-grid`;

        filteredVideos.forEach((video, index) => {
            const card = document.createElement('div');
            card.className = `${CSS_PREFIX}card`;
            if (selectedVideos.has(video.url)) {
                card.classList.add('selected');
            }
            if (video.isStreaming) {
                card.classList.add('streaming');
                if (video.platform === 'YouTube') {
                    card.classList.add('youtube');
                }
            }
            card.dataset.url = video.url;

            const videoTypeLabel = video.isStreaming ? t('online_video') : getVideoTypeLabel(video.type);
            const dims = (video.width && video.height) ? t('dimensions', { width: video.width, height: video.height }) : t('unknown_size');
            const duration = video.duration ? formatDuration(video.duration) : t('unknown_duration');

            // 使用安全的DOM操作构建卡片
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = `${CSS_PREFIX}checkbox`;
            checkbox.checked = selectedVideos.has(video.url);
            card.appendChild(checkbox);

            // YouTube 视频显示缩略图，普通视频显示 video 元素
            if (video.platform === 'YouTube' && video.poster) {
                const previewContainer = document.createElement('div');
                previewContainer.className = `${CSS_PREFIX}preview ${CSS_PREFIX}youtube-thumb`;
                previewContainer.style.position = 'relative';

                const thumbnail = document.createElement('img');
                thumbnail.src = video.poster;
                thumbnail.alt = video.title || 'YouTube Video';
                thumbnail.style.width = '100%';
                thumbnail.style.height = '100%';
                thumbnail.style.objectFit = 'cover';
                previewContainer.appendChild(thumbnail);

                // YouTube 播放图标
                const playIcon = document.createElement('div');
                playIcon.className = `${CSS_PREFIX}youtube-icon`;
                playIcon.style.position = 'absolute';
                playIcon.style.top = '50%';
                playIcon.style.left = '50%';
                playIcon.style.transform = 'translate(-50%, -50%)';
                previewContainer.appendChild(playIcon);

                card.appendChild(previewContainer);
            } else {
                const videoEl = document.createElement('video');
                videoEl.className = `${CSS_PREFIX}preview`;
                videoEl.muted = true;
                videoEl.loop = true;
                videoEl.preload = 'metadata';
                if (video.poster) {
                    videoEl.poster = video.poster;
                }
                const source = document.createElement('source');
                source.src = video.url;
                source.type = `video/${video.type}`;
                videoEl.appendChild(source);
                card.appendChild(videoEl);
            }

            const info = document.createElement('div');
            info.className = `${CSS_PREFIX}info`;

            const dimsDiv = document.createElement('div');
            dimsDiv.className = `${CSS_PREFIX}dims`;
            dimsDiv.textContent = dims;
            info.appendChild(dimsDiv);

            const metaDiv = document.createElement('div');
            metaDiv.className = `${CSS_PREFIX}meta`;

            const typeSpan = document.createElement('span');
            typeSpan.className = `${CSS_PREFIX}type`;
            typeSpan.textContent = videoTypeLabel;
            metaDiv.appendChild(typeSpan);

            const durationSpan = document.createElement('span');
            durationSpan.textContent = duration;
            metaDiv.appendChild(durationSpan);

            info.appendChild(metaDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = `${CSS_PREFIX}actions`;

            const previewBtn = document.createElement('button');
            previewBtn.className = `${CSS_PREFIX}btn ${CSS_PREFIX}btn-preview`;
            previewBtn.textContent = t('preview_button');
            actionsDiv.appendChild(previewBtn);

            const downloadBtn = document.createElement('button');
            downloadBtn.className = `${CSS_PREFIX}btn ${CSS_PREFIX}btn-download`;
            downloadBtn.textContent = t('download_single');
            if (video.isStreaming) {
                downloadBtn.disabled = true;
            }
            actionsDiv.appendChild(downloadBtn);

            info.appendChild(actionsDiv);
            card.appendChild(info);

            // 点击卡片选择
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains(`${CSS_PREFIX}btn-download`)) {
                    e.stopPropagation();
                    if (!video.isStreaming) {
                        downloadSingleVideo(video, index);
                    }
                    return;
                }
                if (e.target.classList.contains(`${CSS_PREFIX}btn-preview`)) {
                    e.stopPropagation();
                    togglePreview(video, card);
                    return;
                }
                if (e.target.classList.contains(`${CSS_PREFIX}checkbox`)) return;

                const cardCheckbox = card.querySelector(`.${CSS_PREFIX}checkbox`);
                cardCheckbox.checked = !cardCheckbox.checked;
                toggleSelection(video.url, card);
            });

            // 复选框变化
            const cardCheckboxEl = card.querySelector(`.${CSS_PREFIX}checkbox`);
            cardCheckboxEl.addEventListener('change', () => toggleSelection(video.url, card));

            // 预览按钮事件（previewBtn 已在上面创建）
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePreview(video, card);
            });

            // 下载按钮事件（downloadBtn 已在上面创建）
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!video.isStreaming) {
                    downloadSingleVideo(video, index);
                }
            });

            grid.appendChild(card);
        });

        gallery.innerHTML = '';
        gallery.appendChild(grid);

        stats.textContent = t('stats_filtered', { count: filteredVideos.length, total: allVideos.length });
        updateDownloadButton();
    }

    function togglePreview(video, card) {
        const videoEl = card.querySelector(`.${CSS_PREFIX}preview`);
        const previewBtn = card.querySelector(`.${CSS_PREFIX}btn-preview`);

        if (videoEl.paused) {
            videoEl.play();
            previewBtn.textContent = t('close_preview');
        } else {
            videoEl.pause();
            videoEl.currentTime = 0;
            previewBtn.textContent = t('preview_button');
        }
    }

    function toggleSelection(url, card) {
        if (selectedVideos.has(url)) {
            selectedVideos.delete(url);
            card.classList.remove('selected');
        } else {
            selectedVideos.add(url);
            card.classList.add('selected');
        }
        updateDownloadButton();
        updateSelectAllCheckbox();
    }

    function updateSelectAllCheckbox() {
        const checkbox = document.getElementById(`${CSS_PREFIX}select-all`);
        const allSelected = filteredVideos.length > 0 && filteredVideos.every(v => selectedVideos.has(v.url));
        checkbox.checked = allSelected;
    }

    function updateDownloadButton() {
        const btn = document.getElementById(`${CSS_PREFIX}download-btn`);
        const count = selectedVideos.size;
        btn.textContent = count > 0 ? t('download_selected', { count }) : t('download_all');
        btn.disabled = filteredVideos.length === 0;
    }

    function applyFilters() {
        const sizeFilter = document.getElementById(`${CSS_PREFIX}filter-size`).value;
        const typeFilter = document.getElementById(`${CSS_PREFIX}filter-type`).value;

        filteredVideos = allVideos.filter(video => {
            // 跳过流媒体视频（不显示在可下载列表中）
            if (video.isStreaming) return false;

            // 尺寸过滤
            if (sizeFilter !== 'all') {
                const maxDimension = Math.max(video.width || 0, video.height || 0);
                if (sizeFilter === 'large' && maxDimension <= 1000) return false;
                if (sizeFilter === 'medium' && (maxDimension > 1000 || maxDimension < 500)) return false;
                if (sizeFilter === 'small' && maxDimension >= 500) return false;
            }

            // 类型过滤
            if (typeFilter !== 'all') {
                if (typeFilter === 'mp4' && video.type !== 'mp4') return false;
                if (typeFilter === 'webm' && video.type !== 'webm') return false;
                if (typeFilter === 'hls' && video.type !== 'hls') return false;
            }

            return true;
        });

        // 限制数量
        if (filteredVideos.length > CONFIG.MAX_VIDEOS) {
            filteredVideos = filteredVideos.slice(0, CONFIG.MAX_VIDEOS);
        }

        renderGallery();
    }

    // 14. 下载功能
    async function downloadSingleVideo(video, index) {
        try {
            const response = await fetch(video.url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = generateFilename(video, index);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error(`${t('error_fetch')}:`, error);
            alert(`${t('error_fetch')}: ${video.url}`);
        }
    }

    async function downloadAsZip() {
        const videosToDownload = selectedVideos.size > 0
            ? allVideos.filter(v => selectedVideos.has(v.url) && !v.isStreaming)
            : filteredVideos.filter(v => !v.isStreaming && v.platform !== 'YouTube');

        if (videosToDownload.length === 0) return;

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
            const folder = zip.folder('videos');
            const errors = [];

            for (let i = 0; i < videosToDownload.length; i++) {
                const video = videosToDownload[i];

                progressText.textContent = t('downloading') + ` ${i + 1}/${videosToDownload.length}`;
                progressFill.style.width = `${((i + 1) / videosToDownload.length) * 100}%`;

                try {
                    const response = await fetch(video.url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const blob = await response.blob();
                    const filename = generateFilename(video, i);
                    folder.file(filename, blob);
                } catch (error) {
                    console.error(`${t('error_fetch')}:`, video.url, error);
                    errors.push(`${video.url}: ${error.message}`);
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
            link.download = `videos-${Date.now()}.zip`;
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

    // 15. 清理
    function cleanup() {
        const overlay = document.getElementById(`${CSS_PREFIX}modal-overlay`);
        const style = document.getElementById(`${CSS_PREFIX}style`);
        if (overlay) document.body.removeChild(overlay);
        if (style) document.head.removeChild(style);
    }

    // 16. 初始化
    function init() {
        injectUI();

        // 扫描并过滤视频
        setTimeout(() => {
            allVideos = discoverVideos();
            allVideos = filterVideos(allVideos);

            // 初始选择所有可下载的视频（非流媒体）
            allVideos.forEach(video => {
                if (!video.isStreaming || video.platform === 'YouTube') {
                    // YouTube 视频不默认选择（因为无法下载）
                    if (video.platform !== 'YouTube') {
                        selectedVideos.add(video.url);
                    }
                }
            });

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
                const video = allVideos.find(v => v.url === url);
                if (e.target.checked && video && !video.isStreaming) {
                    selectedVideos.add(url);
                    card.classList.add('selected');
                } else {
                    selectedVideos.delete(url);
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
