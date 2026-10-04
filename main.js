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
      navToggle.addEventListener('click', () => header.classList.toggle('open'));
    }

    if (window.PROJECTS && document.getElementById('project-grid')) {
      initProjects(window.PROJECTS);
    }
  });

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
      return '<article class="card" data-category="' + p.category + '">'
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
