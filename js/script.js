/* ============================================================
   BAPAN SK — MAIN SCRIPT
   Handles: preloader, cursor, navbar, mobile menu, theme,
   typewriter, counters, slider, forms, scrollspy, back-to-top
============================================================ */
(function () {
    'use strict';

    /* -------------------- Utilities -------------------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -------------------- Preloader -------------------- */
    function initPreloader() {
        const preloader = $('#preloader');
        if (!preloader) return;
        const hide = () => preloader.classList.add('hidden');
        if (prefersReducedMotion) {
            hide();
            return;
        }
        // Hide once window is fully loaded, with a safety timeout
        window.addEventListener('load', () => setTimeout(hide, 400));
        setTimeout(hide, 3500); // fallback in case 'load' is slow
    }

    /* -------------------- Scroll progress bar -------------------- */
    function initScrollProgress() {
        const bar = $('#scroll-progress span');
        if (!bar) return;
        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = percent + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* -------------------- Custom cursor -------------------- */
    function initCursor() {
        const dot = $('.cursor-dot');
        const ring = $('.cursor-ring');
        if (!dot || !ring) return;
        // Only enable on devices that have a fine pointer
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        document.body.classList.add('custom-cursor');

        let mouseX = -100, mouseY = -100;
        let ringX = -100, ringY = -100;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        });

        // Smooth ring follow using requestAnimationFrame
        const follow = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(follow);
        };
        requestAnimationFrame(follow);

        // Grow ring over interactive elements
        $$('a, button, input, textarea, .skill-tag, .filter-btn').forEach((el) => {
            el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
        });
    }

    /* -------------------- Navbar state -------------------- */
    function initNavbar() {
        const navbar = $('#navbar');
        if (!navbar) return;
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* -------------------- Mobile menu -------------------- */
    function initMobileMenu() {
        const hamburger = $('#hamburger');
        const menu = $('#nav-menu');
        if (!hamburger || !menu) return;

        const close = () => {
            hamburger.classList.remove('open');
            menu.classList.remove('open');
            document.body.classList.remove('menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
        };

        hamburger.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            document.body.classList.toggle('menu-open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        // Close menu on link click
        $$('.nav-link', menu).forEach((link) => link.addEventListener('click', close));

        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    /* -------------------- Theme toggle (dark / light) -------------------- */
    function initTheme() {
        const toggle = $('#theme-toggle');
        const icon = toggle ? $('i', toggle) : null;
        const stored = localStorage.getItem('bsk-theme');

        const apply = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
            localStorage.setItem('bsk-theme', theme);
        };

        if (stored) {
            apply(stored);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            apply('light');
        }

        if (toggle) {
            toggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                apply(current === 'dark' ? 'light' : 'dark');
            });
        }
    }

    /* -------------------- Typewriter effect -------------------- */
    function initTypewriter() {
        const el = $('#typing-text');
        if (!el) return;

        const roles = [
            'Full Stack Developer',
            'Web Developer',
            'AI Enthusiast',
            'Problem Solver',
            'DevOps Learner',
            'Tech Explorer'
        ];

        let roleIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const type = () => {
            const current = roles[roleIndex];
            if (!deleting) {
                charIndex++;
                el.textContent = current.slice(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    setTimeout(type, 1800);
                    return;
                }
                setTimeout(type, 70);
            } else {
                charIndex--;
                el.textContent = current.slice(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    setTimeout(type, 400);
                    return;
                }
                setTimeout(type, 40);
            }
        };
        type();
    }

    /* -------------------- Animated counters -------------------- */
    function initCounters() {
        const counters = $$('.stat-number[data-target]');
        if (!counters.length) return;

        const animate = (counter) => {
            const target = parseInt(counter.dataset.target, 10) || 0;
            const duration = 2000;
            const startTime = performance.now();

            const step = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                counter.textContent = Math.floor(eased * target).toLocaleString();
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    counter.textContent = target.toLocaleString();
                }
            };
            requestAnimationFrame(step);
        };

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animate(entry.target);
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );

        counters.forEach((c) => io.observe(c));
    }

    /* -------------------- Education grade pie -------------------- */
    function initGradePie() {
        const pie = $('.grade-pie');
        if (!pie) return;
        const percent = parseInt(pie.dataset.percent || '0', 10);
        pie.style.setProperty('--percent', percent);
    }

    /* -------------------- Testimonials slider -------------------- */
    function initTestimonialSlider() {
        const track = $('#testimonial-track');
        const dotsWrap = $('#slider-dots');
        if (!track) return;

        const cards = $$('.testimonial-card', track);
        const total = cards.length;
        let index = 0;
        let timer = null;

        // Build dots
        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        });
        const dots = $$('button', dotsWrap);

        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        };

        const goTo = (i) => {
            index = (i + total) % total;
            update();
        };

        const next = () => goTo(index + 1);
        const prev = () => goTo(index - 1);

        const prevBtn = $('.slider-prev');
        const nextBtn = $('.slider-next');
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });

        const start = () => {
            if (prefersReducedMotion || total <= 1) return;
            timer = setInterval(next, 5000);
        };
        const restart = () => {
            clearInterval(timer);
            start();
        };

        // Pause on hover / touch
        const slider = $('.testimonial-slider');
        slider.addEventListener('mouseenter', () => clearInterval(timer));
        slider.addEventListener('mouseleave', start);

        // Touch swipe support
        let startX = 0;
        slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
        slider.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) next();
                else prev();
                restart();
            }
        }, { passive: true });

        update();
        start();
    }

    /* -------------------- Projects filter (projects page) -------------------- */
    function initProjectFilter() {
        const filters = $$('.filter-btn');
        if (!filters.length) return;

        filters.forEach((btn) => {
            btn.addEventListener('click', () => {
                filters.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                const cards = $$('.project-card[data-category]');
                let visible = 0;

                cards.forEach((card) => {
                    const match = filter === 'all' || card.dataset.category === filter;
                    card.style.display = match ? '' : 'none';
                    if (match) visible++;
                });

                const empty = $('#projects-empty');
                if (empty) empty.classList.toggle('hidden', visible > 0);
            });
        });
    }

    /* -------------------- Contact form -------------------- */
    function initContactForm() {
        const form = $('#contact-form');
        if (!form) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const status = $('#form-status');
        const submitBtn = $('#cf-submit');

        const setError = (input, message) => {
            const group = input.closest('.form-group');
            const errorEl = group ? $('.form-error', group) : null;
            input.classList.add('invalid');
            if (errorEl) errorEl.textContent = message;
        };

        const clearError = (input) => {
            const group = input.closest('.form-group');
            const errorEl = group ? $('.form-error', group) : null;
            input.classList.remove('invalid');
            if (errorEl) errorEl.textContent = '';
        };

        const validateField = (input) => {
            const value = input.value.trim();
            const id = input.id;

            if (id === 'cf-name') {
                if (!value) { setError(input, 'Please enter your name.'); return false; }
                if (value.length < 2) { setError(input, 'Name must be at least 2 characters.'); return false; }
            }
            if (id === 'cf-email') {
                if (!value) { setError(input, 'Please enter your email address.'); return false; }
                if (!emailRegex.test(value)) { setError(input, 'Please enter a valid email address (e.g. you@example.com).'); return false; }
            }
            if (id === 'cf-subject') {
                if (!value) { setError(input, 'Please enter a subject.'); return false; }
            }
            if (id === 'cf-message') {
                if (!value) { setError(input, 'Please write a message.'); return false; }
                if (value.length < 10) { setError(input, 'Message must be at least 10 characters.'); return false; }
            }
            clearError(input);
            return true;
        };

        // Live validation on blur
        ['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach((id) => {
            const input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) validateField(input);
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const fields = ['cf-name', 'cf-email', 'cf-subject', 'cf-message']
                .map((id) => document.getElementById(id))
                .filter(Boolean);

            let valid = true;
            fields.forEach((f) => { if (!validateField(f)) valid = false; });

            if (!valid) {
                showStatus('Please fix the highlighted fields and try again.', 'error');
                return;
            }

            // Simulate async send (mailto fallback keeps it dependency-free)
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            setTimeout(() => {
                const data = {
                    name: $('#cf-name').value.trim(),
                    email: $('#cf-email').value.trim(),
                    subject: $('#cf-subject').value.trim(),
                    message: $('#cf-message').value.trim()
                };

                // Open mail client prefilled as a working fallback
                const mailto = `mailto:bapansk.official@gmail.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent('From: ' + data.name + ' (' + data.email + ')\n\n' + data.message)}`;
                window.location.href = mailto;

                showStatus('Thank you! Your message is ready to send in your mail app.', 'success');
                form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }, 900);
        });

        function showStatus(message, type) {
            status.className = 'form-status ' + type;
            status.textContent = message;
            setTimeout(() => { status.className = 'form-status'; status.textContent = ''; }, 6000);
        }
    }

    /* -------------------- Newsletter form -------------------- */
    function initNewsletter() {
        const form = $('#newsletter-form');
        if (!form) return;
        const input = $('#newsletter-email');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = input.value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                input.style.borderColor = '#ef4444';
                setTimeout(() => { input.style.borderColor = ''; }, 2000);
                return;
            }
            input.value = '';
            input.placeholder = 'Subscribed! Thank you.';
            setTimeout(() => { input.placeholder = 'Your email address'; }, 3000);
        });
    }

    /* -------------------- Scrollspy (active nav link) -------------------- */
    function initScrollSpy() {
        const sections = $$('section[id]');
        const navLinks = $$('.nav-link');
        if (!sections.length || !navLinks.length) return;

        // Only run on pages with in-page sections (home)
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navLinks.forEach((link) => {
                            link.classList.toggle('active', link.getAttribute('href') === 'index.html#' + id);
                        });
                    }
                });
            },
            { rootMargin: '-40% 0px -55% 0px' }
        );

        sections.forEach((s) => io.observe(s));
    }

    /* -------------------- Back to top -------------------- */
    function initBackToTop() {
        const btn = $('#back-to-top');
        if (!btn) return;

        const onScroll = () => {
            btn.classList.toggle('visible', window.scrollY > 500);
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
        onScroll();
    }

    /* -------------------- Footer year -------------------- */
    function initYear() {
        const el = $('#year');
        if (el) el.textContent = new Date().getFullYear();
    }

    /* -------------------- AOS (scroll reveal) -------------------- */
    function initAOS() {
        if (typeof AOS === 'undefined') return;
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            disable: prefersReducedMotion || window.innerWidth < 768 ? 'phone' : false
        });
    }

    /* -------------------- Boot -------------------- */
    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initScrollProgress();
        initCursor();
        initNavbar();
        initMobileMenu();
        initTheme();
        initTypewriter();
        initCounters();
        initGradePie();
        initTestimonialSlider();
        initProjectFilter();
        initContactForm();
        initNewsletter();
        initScrollSpy();
        initBackToTop();
        initYear();
        initAOS();
    });
})();
