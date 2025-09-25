document.addEventListener('DOMContentLoaded', function() {
    // --- Language Switcher Logic ---
    const langSwitcher = document.getElementById('lang-switcher');
    if (langSwitcher) {
        langSwitcher.addEventListener('change', function() {
            const targetLang = this.value;
            const pageName = this.dataset.currentPage;
            
            // 默认语言 'zh' 在根目录
            const langPath = targetLang === 'zh' ? '' : `/${targetLang}`;
            
            // 构造新 URL
            // index 页面跳转到语言目录的根
            // 其他页面跳转到对应的 html 文件
            const pageFile = pageName === 'index' ? '' : `${pageName}.html`;
            
            // 如果是 index 页面且是默认语言，直接跳转到根
            let finalUrl = `${langPath}/${pageFile}`;
            if (pageName === 'index' && targetLang === 'zh') {
                finalUrl = '/';
            }

            window.location.href = finalUrl;
        });
    }

    // --- Navbar Scroll Effect ---
    const nav = document.getElementById('main-nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            const answer = item.querySelector('.faq-answer');
            question.addEventListener('click', () => {
                const isActive = item.classList.toggle('active');
                answer.style.maxHeight = isActive ? answer.scrollHeight + "px" : null;
            });
        }
    });
});