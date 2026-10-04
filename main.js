// Theme: follow saved choice, else OS preference. Persist on toggle.
(function () {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      const render = () => { toggle.textContent = root.getAttribute('data-theme') === 'dark' ? '☀' : '☾'; };
      render();
      toggle.addEventListener('click', function () {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
        render();
      });
    }

    const navToggle = document.querySelector('.nav-toggle');
    const header = document.querySelector('.site-header');
    if (navToggle && header) {
      navToggle.addEventListener('click', () => {
        const open = header.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(open));
      });
    }

    if (window.PROJECTS && document.getElementById('project-grid')) {
      initProjects(window.PROJECTS);
    }

    initMotion();
  });

  // Intentional motion layer: scroll-edge blur, cursor-aware card hover, click sparks.
  function initMotion() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Gradual blur at the scroll edges
    for (const side of ['top', 'bottom']) {
      const el = document.createElement('div');
      el.className = 'scroll-fade scroll-fade--' + side;
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }

    // Cursor-aware highlight on cards (the lightweight Shape Blur stand-in)
    document.addEventListener('pointermove', function (e) {
      const card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });

    // Hero tiles: scroll-reactive backgrounds (parallax) + cursor-aware highlight.
    // --sy is set on :root so any tile can read it via inheritance.
    const root = document.documentElement;
    let ticking = false;
    const onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        root.style.setProperty('--sy', String(window.scrollY));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.querySelectorAll('.hero-tile, .glass-card').forEach(function (tile) {
      tile.addEventListener('pointermove', function (e) {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    // Click sparks
    const canvas = document.createElement('canvas');
    canvas.className = 'spark-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let sparks = [];
    let raf = null;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0d9488';

    document.addEventListener('click', function (e) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
        const sp = 3.5 + Math.random() * 3;
        sparks.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1 });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    });

    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.lineCap = 'round';
      sparks = sparks.filter(s => s.life > 0);
      for (const s of sparks) {
        ctx.globalAlpha = Math.max(s.life, 0);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 2.2, s.y - s.vy * 2.2);
        ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.vy += 0.12; s.vx *= 0.92; s.vy *= 0.92; s.life -= 0.045;
      }
      ctx.globalAlpha = 1;
      raf = sparks.length ? requestAnimationFrame(tick) : null;
    }
  }

  // Rendered only on projects.html
  function initProjects(projects) {
    const grid = document.getElementById('project-grid');
    const filters = document.getElementById('filters');
    const order = { featured: 0, earlier: 1 };
    const sorted = projects.slice().sort((a, b) => order[a.tier] - order[b.tier]);

    function card(p) {
      const tags = p.tags.map(t => '<span class="tag">' + t + '</span>').join('');
      const links = [];
      if (p.detail) links.push('<a href="' + p.detail + '">Details</a>');
      if (p.repo) links.push('<a href="' + p.repo + '" target="_blank" rel="noopener">GitHub</a>');
      if (p.link) links.push('<a href="' + p.link + '" target="_blank" rel="noopener">More</a>');
      const title = p.detail
        ? '<a href="' + p.detail + '">' + p.title + '</a>'
        : p.title;
      return '<article class="card' + (p.electric ? ' card--electric' : '') + '" data-category="' + p.category + '">'
        + '<span class="eyebrow">' + p.category + '</span>'
        + '<h3>' + title + '</h3>'
        + '<p>' + p.blurb + '</p>'
        + '<div class="tag-row">' + tags + '</div>'
        + '<div class="card__links">' + links.join('') + '</div>'
        + '</article>';
    }

    grid.innerHTML = sorted.map(card).join('');

    if (filters) {
      const categories = ['All'].concat(Array.from(new Set(sorted.map(p => p.category))));
      filters.innerHTML = categories.map((c, i) =>
        '<button class="filter" aria-pressed="' + (i === 0) + '" data-filter="' + c + '">' + c + '</button>'
      ).join('');
      filters.addEventListener('click', function (e) {
        const btn = e.target.closest('.filter');
        if (!btn) return;
        const value = btn.dataset.filter;
        filters.querySelectorAll('.filter').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        grid.querySelectorAll('.card').forEach(c => {
          c.style.display = (value === 'All' || c.dataset.category === value) ? '' : 'none';
        });
      });
    }
  }
})();
