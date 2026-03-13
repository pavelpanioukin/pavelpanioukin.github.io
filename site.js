/**
 * site.js — shared header, footer, and utility functions.
 * Included on every page.
 */
(function () {

  const NAV = [
    { label: 'NEW',     href: '/',            key: 'new' },
    { label: 'Feed',    href: '/feed.html',   key: 'feed' },
    { label: 'About',   href: '/about.html',  key: 'about' },
    { label: 'Work',    href: '/work.html',   key: 'work' },
    { label: 'Contact', href: '/contact.html',key: 'contact' },
  ];

  // Determine active page from URL
  const p = window.location.pathname;
  const activeKey =
    p.includes('feed')    ? 'feed'    :
    p.includes('about')   ? 'about'   :
    p.includes('work')    ? 'work'    :
    p.includes('contact') ? 'contact' : 'new';

  // Build nav HTML
  const navHTML = NAV.map((item, i) => {
    const active = activeKey === item.key ? ' active' : '';
    const sep = i > 0 ? '<span class="nav-sep">·</span>' : '';
    return `${sep}<a href="${item.href}" class="nav-link${active}">${item.label}</a>`;
  }).join('');

  // ── Render header ──────────────────────────────────────────────────────────
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.className = 'site-header';
    headerEl.innerHTML = `
      <div class="info-row">
        <div class="info-left">
          <a href="/" class="header-name">Pavel Panioukin</a>
          <span class="header-time" id="local-time"></span>
        </div>
        <div class="header-bio">Digital product designer &amp; leader with 12 years across fintech, edtech, and SaaS.</div>
      </div>`;

    // Nav row is a sibling of the header so it can be independently sticky
    const navEl = document.createElement('div');
    navEl.className = 'nav-row';
    navEl.innerHTML = `<nav class="header-nav">${navHTML}</nav>`;
    headerEl.insertAdjacentElement('afterend', navEl);
  }

  // ── Local time (Krakow) ────────────────────────────────────────────────────
  function updateTime() {
    const el = document.getElementById('local-time');
    if (!el) return;
    const t = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'Europe/Warsaw'
    });
    el.textContent = `Local time — ${t} Krakow, PL`;
  }
  updateTime();
  setInterval(updateTime, 60000);

  // ── Render footer ──────────────────────────────────────────────────────────
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.className = 'site-footer';
    footerEl.innerHTML = `
      <div class="footer-inner">
        <a href="/" class="footer-name">Pavel Panioukin</a>
        <div class="footer-social" id="footer-social"></div>
        <span class="footer-copy" id="footer-copy"></span>
      </div>`;
  }

})();

// ── Shared utilities ─────────────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '';
}

function renderFooterData(data) {
  const social = data.social || {};
  const links = [
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'dribbble', label: 'Dribbble' },
    { key: 'twitter',  label: 'X' },
  ];
  const el = document.getElementById('footer-social');
  if (el) {
    el.innerHTML = links
      .filter(l => social[l.key])
      .map(l => `<a class="footer-social-link" href="${escHtml(social[l.key])}" target="_blank" rel="noopener">${l.label}</a>`)
      .join('');
  }
  setText('footer-copy', (data.meta || {}).copyright);
}

// ── Shared project card renderer ─────────────────────────────────────────────

function buildProjectCard(p) {
  const thumbStyle = p.thumbnail
    ? ''
    : `background:${p.thumbnailGradient || '#ebebeb'}`;
  const thumbContent = p.thumbnail
    ? `<img src="${escHtml(p.thumbnail)}" alt="${escHtml(p.title)}" loading="lazy">`
    : `<span class="project-card-label">${escHtml(p.thumbnailLabel || p.title)}</span>`;
  return `
    <a class="project-card" href="/project.html?id=${p.id}">
      <div class="project-card-thumb" style="${thumbStyle}">${thumbContent}</div>
      <div class="project-card-info">
        <div class="project-card-title">${escHtml(p.title)}</div>
        <div class="project-card-sub">${escHtml(p.subtitle)}</div>
      </div>
    </a>`;
}
