(async function () {
    'use strict';

    // Load i18n JSON files
    let i18n = {};
    async function loadI18n() {
        const [ptRes, enRes] = await Promise.all([
            fetch('i18n/pt.json'),
            fetch('i18n/en.json')
        ]);
        const [pt, en] = await Promise.all([ptRes.json(), enRes.json()]);
        i18n = { pt, en };
    }

    await loadI18n();

    let currentLang = 'pt';

    // ========== Apply translations ==========
    function applyTranslations(lang) {
        const dict = i18n[lang];
        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            const key = el.getAttribute('data-i18n-key');
            if (dict && dict[key]) {
                // Preserve any highlight spans for the hero title
                if (key === 'hero_title_prefix') {
                    el.innerHTML = dict[key] + '<span class="highlight">Fidelis</span>';
                } else {
                    el.textContent = dict[key];
                }
            }
        });
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

        // Update lang switch buttons
        document.querySelectorAll('.lang-switch').forEach(btn => {
            btn.classList.toggle('active-lang', btn.getAttribute('data-lang') === lang);
        });
    }

    // ========== Language switcher ==========
    document.querySelectorAll('.lang-switch').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang === currentLang) return;
            currentLang = lang;
            applyTranslations(lang);
            localStorage.setItem('wf-lang', lang);
            showToast(i18n[lang].toast_lang);
        });
    });

    // Restore saved language
    const savedLang = localStorage.getItem('wf-lang');
    if (savedLang && i18n[savedLang]) {
        currentLang = savedLang;
        applyTranslations(currentLang);
    } else {
        // apply default on first load
        applyTranslations(currentLang);
    }

    // ========== Theme toggle ==========
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');

    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'dark' ? '☀' : '☽';
        localStorage.setItem('wf-theme', theme);
    }

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        showToast(newTheme === 'dark' ? i18n[currentLang].toast_theme_dark : i18n[currentLang].toast_theme_light);
    });

    const savedTheme = localStorage.getItem('wf-theme');
    if (savedTheme) setTheme(savedTheme);

    const projectsGrid = document.getElementById('projects-grid');
    const loadMoreButton = document.getElementById('load-more-projects');
    const initialProjectCount = 4;
    let projectsData = [];
    let visibleProjectCount = initialProjectCount;

    async function loadProjects() {
        if (!projectsGrid) return;
        try {
            const response = await fetch('assets/projects-data.json');
            projectsData = await response.json();
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            projectsGrid.innerHTML = '<p class="project-error">Não foi possível carregar os projetos.</p>';
            if (loadMoreButton) loadMoreButton.style.display = 'none';
            return;
        }
        renderProjects();
    }

    function isValidUrl(url) {
        try {
            return !!url && ['http:', 'https:'].includes(new URL(url).protocol);
        } catch (error) {
            return false;
        }
    }

    function projectCardMarkup(project, dataIndex) {
        const imageUrl = project.images && project.images.length ? project.images[0] : '';
        const githubLink = isValidUrl(project.github_url) ? `<a href="${project.github_url}" target="_blank" rel="noopener" class="project-link project-link-github" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.372 0 0 5.372 0 12c0 5.303 3.438 9.8 8.205 11.387.6.111.82-.261.82-.579 0-.287-.01-1.046-.016-2.051-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.085 1.839 1.238 1.839 1.238 1.07 1.835 2.809 1.305 3.495.998.108-.775.42-1.305.762-1.605-2.665-.304-5.467-1.333-5.467-5.93 0-1.31.468-2.381 1.235-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.61-2.807 5.624-5.48 5.921.431.371.815 1.103.815 2.222 0 1.605-.014 2.896-.014 3.289 0 .32.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.628-5.372-12-12-12z"/></svg></a>` : '';
        const siteLink = isValidUrl(project.publication_url) ? `<a href="${project.publication_url}" target="_blank" rel="noopener" class="project-link project-link-site" aria-label="Site"><svg viewBox="0 0 496 496" fill="currentColor" aria-hidden="true"><path d="M 248 8 C 111.03 8 0 119.03 0 256 s 111.03 248 248 248 s 248 -111.03 248 -248 S 384.97 8 248 8 Z m 82.29 357.6 c -3.9 3.88 -7.99 7.95 -11.31 11.28 c -2.99 3 -5.1 6.7 -6.17 10.71 c -1.51 5.66 -2.73 11.38 -4.77 16.87 l -17.39 46.85 c -13.76 3 -28 4.69 -42.65 4.69 v -27.38 c 1.69 -12.62 -7.64 -36.26 -22.63 -51.25 c -6 -6 -9.37 -14.14 -9.37 -22.63 v -32.01 c 0 -11.64 -6.27 -22.34 -16.46 -27.97 c -14.37 -7.95 -34.81 -19.06 -48.81 -26.11 c -11.48 -5.78 -22.1 -13.14 -31.65 -21.75 l -0.8 -0.72 a 114.792 114.792 0 0 1 -18.06 -20.74 c -9.38 -13.77 -24.66 -36.42 -34.59 -51.14 c 20.47 -45.5 57.36 -82.04 103.2 -101.89 l 24.01 12.01 C 203.48 89.74 216 82.01 216 70.11 v -11.3 c 7.99 -1.29 16.12 -2.11 24.39 -2.42 l 28.3 28.3 c 6.25 6.25 6.25 16.38 0 22.63 L 264 112 l -10.34 10.34 c -3.12 3.12 -3.12 8.19 0 11.31 l 4.69 4.69 c 3.12 3.12 3.12 8.19 0 11.31 l -8 8 a 8.008 8.008 0 0 1 -5.66 2.34 h -8.99 c -2.08 0 -4.08 0.81 -5.58 2.27 l -9.92 9.65 a 8.008 8.008 0 0 0 -1.58 9.31 l 15.59 31.19 c 2.66 5.32 -1.21 11.58 -7.15 11.58 h -5.64 c -1.93 0 -3.79 -0.7 -5.24 -1.96 l -9.28 -8.06 a 16.017 16.017 0 0 0 -15.55 -3.1 l -31.17 10.39 a 11.95 11.95 0 0 0 -8.17 11.34 c 0 4.53 2.56 8.66 6.61 10.69 l 11.08 5.54 c 9.41 4.71 19.79 7.16 30.31 7.16 s 22.59 27.29 32 32 h 66.75 c 8.49 0 16.62 3.37 22.63 9.37 l 13.69 13.69 a 30.503 30.503 0 0 1 8.93 21.57 a 46.536 46.536 0 0 1 -13.72 32.98 Z M 417 274.25 c -5.79 -1.45 -10.84 -5 -14.15 -9.97 l -17.98 -26.97 a 23.97 23.97 0 0 1 0 -26.62 l 19.59 -29.38 c 2.32 -3.47 5.5 -6.29 9.24 -8.15 l 12.98 -6.49 C 440.2 193.59 448 223.87 448 256 c 0 8.67 -0.74 17.16 -1.82 25.54 L 417 274.25 Z"/></svg></a>` : '';
        const linkRow = githubLink || siteLink ? `<div class="project-links">${githubLink}${siteLink}</div>` : '';

        return `
            <div class="project-card" data-project-index="${dataIndex}">
                <div class="project-image">
                    ${imageUrl?.length ? `<img src="${imageUrl}" alt="${project.title}">` : '🧩'}
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.technology || ''}</p>
                    ${linkRow}
                </div>
            </div>
        `;
    }

    function renderProjects() {
        if (!projectsGrid) return;
        const visibleProjects = projectsData.slice(0, visibleProjectCount);
        projectsGrid.innerHTML = visibleProjects.map((p, i) => projectCardMarkup(p, i)).join('');
        if (loadMoreButton) {
            loadMoreButton.style.display = visibleProjectCount < projectsData.length ? 'inline-flex' : 'none';
        }
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => {
            visibleProjectCount = projectsData.length;
            renderProjects();
        });
    }

    // ========== Project modal ==========
    const projectModal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-project-title');
    const carouselTrack = document.getElementById('carousel-track');
    const carouselDots = document.getElementById('carousel-dots');
    const carouselCounter = document.getElementById('carousel-counter');
    const carouselPrev = document.getElementById('carousel-prev');
    const carouselNext = document.getElementById('carousel-next');
    let carouselIndex = 0;
    let carouselImages = [];

    function updateCarousel() {
        carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
        carouselCounter.textContent = `${carouselIndex + 1} / ${carouselImages.length}`;
        carouselPrev.disabled = carouselIndex === 0;
        carouselNext.disabled = carouselIndex === carouselImages.length - 1;
        carouselDots.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === carouselIndex);
        });
    }

    function openProjectModal(project) {
        carouselImages = project.images && project.images.length ? project.images : [];
        carouselIndex = 0;
        modalTitle.textContent = project.title;

        if (!carouselImages.length) {
            carouselTrack.innerHTML = '<div class="carousel-no-images">🧩</div>';
            carouselDots.innerHTML = '';
            carouselCounter.textContent = '';
            carouselPrev.style.display = 'none';
            carouselNext.style.display = 'none';
        } else {
            carouselTrack.innerHTML = carouselImages
                .map(src => `<div class="carousel-slide"><img src="${src}" alt="${project.title}" loading="lazy"></div>`)
                .join('');
            carouselDots.innerHTML = carouselImages
                .map((_, i) => `<button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Imagem ${i + 1}"></button>`)
                .join('');
            carouselPrev.style.display = '';
            carouselNext.style.display = '';
            updateCarousel();
        }

        projectModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        projectModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    carouselPrev.addEventListener('click', () => {
        if (carouselIndex > 0) { carouselIndex--; updateCarousel(); }
    });

    carouselNext.addEventListener('click', () => {
        if (carouselIndex < carouselImages.length - 1) { carouselIndex++; updateCarousel(); }
    });

    carouselDots.addEventListener('click', (e) => {
        const dot = e.target.closest('.carousel-dot');
        if (!dot) return;
        carouselIndex = parseInt(dot.dataset.index);
        updateCarousel();
    });

    document.getElementById('modal-close').addEventListener('click', closeProjectModal);

    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) closeProjectModal();
    });

    document.addEventListener('keydown', (e) => {
        if (!projectModal.classList.contains('open')) return;
        if (e.key === 'Escape') closeProjectModal();
        if (e.key === 'ArrowLeft' && carouselIndex > 0) { carouselIndex--; updateCarousel(); }
        if (e.key === 'ArrowRight' && carouselIndex < carouselImages.length - 1) { carouselIndex++; updateCarousel(); }
    });

    if (projectsGrid) {
        projectsGrid.addEventListener('click', (e) => {
            if (e.target.closest('.project-link')) return;
            const card = e.target.closest('.project-card');
            if (!card) return;
            const index = parseInt(card.dataset.projectIndex);
            if (!isNaN(index) && projectsData[index]) openProjectModal(projectsData[index]);
        });
    }

    loadProjects();

    // ========== Mobile menu ==========
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('nav');
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('open');
        mobileMenuBtn.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });

    // Close mobile menu on nav click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            mobileMenuBtn.textContent = '☰';
        });
    });

    // ========== Scroll animations ==========
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll, .timeline-item').forEach(el => {
        scrollObserver.observe(el);
    });

    // ========== Active nav link ==========
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => navObserver.observe(s));

    // ========== Toast ==========
    const toast = document.getElementById('toast');
    let toastTimer;

    function showToast(msg) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ========== Contact form ==========
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        const subject = encodeURIComponent(`Contato via portfólio: ${name}`);
        const body = encodeURIComponent(`Nome: ${name}\nEmail: ${email}\n\n${message}`);
        const mailtoUrl = `mailto:contato@welingtonfidelis.com.br?subject=${subject}&body=${body}`;

        window.location.href = mailtoUrl;
        showToast(i18n[currentLang].toast_form_sent);
        contactForm.reset();
    });

    // ========== Resume download ==========
    const resumeDownloadLink = document.getElementById('download-resume');
    if (resumeDownloadLink) {
        resumeDownloadLink.addEventListener('click', (e) => {
            e.preventDefault();
            generateCurriculumPDF(currentLang);
            showToast(i18n[currentLang].toast_resume_download);
        });
    }

    // ========== Smooth scroll for all anchor links ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const actualYear = new Date().getFullYear();
    document.getElementById('current-year').textContent = actualYear;


})();
