/* ============================================================
   BAPAN SK — GITHUB SECTION
   Fetches GitHub profile data + contribution calendar via the
   GitHub REST API and a free contribution service.
   ------------------------------------------------------------
   To use your own account, change GITHUB_USERNAME below.
============================================================ */
(function () {
    'use strict';

    /* Change this to your GitHub username */
    const GITHUB_USERNAME = 'BapanSk';

    const $ = (sel) => document.querySelector(sel);

    const profileBox = $('#github-profile');
    const loadingBox = $('#github-loading');
    const errorBox = $('#github-error');

    /* -------------------- Helpers -------------------- */
    async function fetchJSON(url) {
        const res = await fetch(url, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!res.ok) throw new Error('GitHub API error: ' + res.status);
        return res.json();
    }

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function isoDate(d) {
        return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
    }

    function showError() {
        if (loadingBox) loadingBox.classList.add('hidden');
        if (errorBox) errorBox.classList.remove('hidden');
        if (profileBox) profileBox.classList.add('hidden');
    }

    /* -------------------- Profile -------------------- */
    async function loadProfile() {
        try {
            const [user, repos] = await Promise.all([
                fetchJSON('https://api.github.com/users/' + GITHUB_USERNAME),
                fetchJSON('https://api.github.com/users/' + GITHUB_USERNAME + '/repos?per_page=100&sort=updated')
            ]);

            $('#gh-avatar').src = user.avatar_url || '';
            $('#gh-avatar').alt = (user.name || GITHUB_USERNAME) + ' avatar';
            $('#gh-name').textContent = user.name || GITHUB_USERNAME;
            $('#gh-bio').textContent = user.bio || 'Open source enthusiast';
            $('#gh-link').href = user.html_url || ('https://github.com/' + GITHUB_USERNAME);

            $('#gh-followers').textContent = (user.followers || 0).toLocaleString();
            $('#gh-following').textContent = (user.following || 0).toLocaleString();
            $('#gh-repos').textContent = (user.public_repos || 0).toLocaleString();

            const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
            $('#gh-stars').textContent = stars.toLocaleString();
        } catch (err) {
            console.warn('GitHub profile load failed:', err.message);
            showError();
            return;
        }
        return true;
    }

    /* -------------------- Contribution calendar -------------------- */
    function renderContributions(data) {
        const container = $('#gh-contributions');
        const monthsEl = $('#gh-months');
        const totalEl = $('#gh-total-contrib');
        if (!container) return;

        let contributions;
        let total = 0;

        if (data && Array.isArray(data.contributions)) {
            contributions = data.contributions;
            if (Array.isArray(data.years) && data.years.length) {
                total = data.years.reduce((s, y) => s + (parseInt(y.total, 10) || 0), 0);
            } else {
                total = contributions.reduce((s, c) => s + (parseInt(c.count, 10) || 0), 0);
            }
        } else {
            // Unexpected payload shape — nothing to render
            showError();
            return;
        }

        // Map date -> level / count for fast lookup
        const levelByDate = {};
        const countByDate = {};
        contributions.forEach((c) => {
            levelByDate[c.date] = parseInt(c.intensity ?? c.level ?? 0, 10) || 0;
            countByDate[c.date] = parseInt(c.count, 10) || 0;
        });

        // Build a GitHub-style grid: last 53 weeks, 7 rows (Sun..Sat)
        const cells = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Move back to most recent Sunday
        const endSunday = new Date(today);
        endSunday.setDate(today.getDate() - today.getDay());
        // Grid starts 52 weeks before endSunday
        const start = new Date(endSunday);
        start.setDate(endSunday.getDate() - 52 * 7);

        const monthLabels = [];
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let w = 0; w < 53; w++) {
            for (let d = 0; d < 7; d++) {
                const date = new Date(start);
                date.setDate(start.getDate() + w * 7 + d);
                const iso = isoDate(date);
                const level = levelByDate[iso] || 0;

                const cell = document.createElement('i');
                const lvl = levelByDate[iso] || 0;
                const cnt = countByDate[iso] || 0;
                cell.className = 'gh-cell' + (lvl > 0 ? ' lvl-' + Math.min(lvl, 4) : '');
                cell.title = iso + ': ' + cnt + ' contribution' + (cnt === 1 ? '' : 's');
                cells.push(cell);
                container.appendChild(cell);
            }

            // Month label for the week containing its 1st day
            const weekStart = new Date(start);
            weekStart.setDate(start.getDate() + w * 7);
            const monthName = weekStart.toLocaleString('en-US', { month: 'short' });
            if (!monthLabels.includes(monthName) || w === 52) {
                monthLabels.push(monthName);
            }
        }

        // Render month labels evenly
        if (monthsEl) {
            monthsEl.innerHTML = '';
            const labels = Array.from(new Set(monthLabels)).slice(0, 12);
            labels.forEach((m) => {
                const span = document.createElement('span');
                span.textContent = m;
                monthsEl.appendChild(span);
            });
            // Fill remaining space so labels spread across the row
            while (monthsEl.children.length < 6) {
                const span = document.createElement('span');
                span.textContent = '';
                monthsEl.appendChild(span);
            }
        }

        if (totalEl) {
            totalEl.textContent = total.toLocaleString() + ' contributions in the last year';
        }
    }

    async function loadContributions() {
        try {
            // Free public service that exposes contribution data without auth
            const res = await fetch('https://github-contributions.vercel.app/api/v1/' + GITHUB_USERNAME);
            if (!res.ok) throw new Error('Contrib service error: ' + res.status);
            const data = await res.json();
            renderContributions(data);
        } catch (err) {
            console.warn('Contribution calendar unavailable:', err.message);
            const card = document.querySelector('.gh-contrib-card');
            if (card) {
                card.innerHTML =
                    '<div class="github-error">' +
                    '<i class="fas fa-calendar-times"></i>' +
                    '<p>Contribution calendar is temporarily unavailable.</p>' +
                    '</div>';
            }
        }
    }

    /* -------------------- Boot -------------------- */
    async function init() {
        if (!profileBox || !loadingBox || !errorBox) return;

        const profileOk = await loadProfile();
        if (profileOk) {
            loadingBox.classList.add('hidden');
            profileBox.classList.remove('hidden');
            loadContributions();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
