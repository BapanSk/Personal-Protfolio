/* ============================================================
   BAPAN SK — PARTICLE BACKGROUND
   Lightweight canvas particle network with connecting lines.
   Respects reduced-motion and pauses when the tab is hidden.
============================================================ */
(function () {
    'use strict';

    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;
    let animationId = null;
    let running = false;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6'];

    function resize() {
        w = canvas.width = window.innerWidth * DPR;
        h = canvas.height = window.innerHeight * DPR;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }

    function particleCount() {
        const area = window.innerWidth * window.innerHeight;
        const count = Math.floor(area / 16000);
        return Math.min(Math.max(count, 30), 90);
    }

    function createParticles() {
        const count = particleCount();
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Particles
        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < -20) p.x = w + 20;
            if (p.x > w + 20) p.x = -20;
            if (p.y < -20) p.y = h + 20;
            if (p.y > h + 20) p.y = -20;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * DPR, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.55;
            ctx.fill();
        });

        // Connecting lines
        ctx.globalAlpha = 1;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 130 * DPR;

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = '#06b6d4';
                    ctx.globalAlpha = opacity;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    function loop() {
        draw();
        animationId = requestAnimationFrame(loop);
    }

    function start() {
        if (running) return;
        running = true;
        loop();
    }

    function stop() {
        running = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function init() {
        resize();
        createParticles();

        if (prefersReducedMotion) {
            // Static single frame, no animation
            draw();
            return;
        }
        start();
    }

    // Pause when tab hidden to save CPU
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (!prefersReducedMotion) start();
    });

    // Recreate on resize (debounced)
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createParticles();
        }, 200);
    });

    init();
})();
