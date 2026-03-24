/**
 * site.js — shared header, footer, utilities, renderers, and initPage().
 * Included on every page. Must load before transitions.js.
 */
(function () {

  var NAV = [
    { label: 'NEW',     href: '/',             key: 'new'     },
    { label: 'Feed',    href: '/feed.html',    key: 'feed'    },
    { label: 'About',   href: '/about.html',   key: 'about'   },
    { label: 'Work',    href: '/work.html',    key: 'work'    },
    { label: 'Contact', href: '/contact.html', key: 'contact' },
  ];

  function getActiveKey(pathname) {
    var p = pathname || window.location.pathname;
    return p.includes('feed')    ? 'feed'    :
           p.includes('about')   ? 'about'   :
           p.includes('work')    ? 'work'    :
           p.includes('contact') ? 'contact' :
           p.includes('project') ? 'work'    : 'new';
  }

  function buildNavHTML() {
    var active = getActiveKey();
    return NAV.map(function (item, i) {
      var cls = 'nav-link' + (active === item.key ? ' active' : '');
      var sep = i > 0 ? '<span class="nav-sep">·</span>' : '';
      return sep + '<a href="' + item.href + '" class="' + cls + '">' + item.label + '</a>';
    }).join('');
  }

  // ── Render header ───────────────────────────────────────────────────────────
  var headerEl = document.getElementById('site-header');
  if (headerEl) {
    headerEl.className = 'site-header';
    headerEl.innerHTML =
      '<div class="info-row">' +
        '<div class="info-left">' +
          '<a href="/" class="header-name">Pavel Panioukin</a>' +
          '<span class="header-time" id="local-time"></span>' +
        '</div>' +
        '<div class="header-bio">Senior product designer, nearly two decades. I design complex products clearly — financial tools, professional software, and systems where the UX has real consequences.</div>' +
      '</div>';

    var navEl = document.createElement('div');
    navEl.className = 'nav-row';
    navEl.innerHTML = '<nav class="header-nav">' + buildNavHTML() + '</nav>';
    headerEl.insertAdjacentElement('afterend', navEl);
  }

  // ── Local time ──────────────────────────────────────────────────────────────
  function updateTime() {
    var el = document.getElementById('local-time');
    if (!el) return;
    var t = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Warsaw'
    });
    el.innerHTML = 'Local time — <span class="header-time-value">' + t + '</span> Krakow, PL';
  }
  updateTime();
  setInterval(updateTime, 60000);

  // ── Render footer shell ─────────────────────────────────────────────────────
  var footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.className = 'site-footer';
    footerEl.innerHTML =
      '<div class="footer-inner">' +
        '<a href="/" class="footer-name">Pavel Panioukin</a>' +
        '<div class="footer-social" id="footer-social"></div>' +
        '<span class="footer-copy" id="footer-copy"></span>' +
      '</div>';
  }

  // ── Escape key closes lightbox on any page ──────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

})();

// ── Utilities ─────────────────────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val || '';
}

// ── Footer data ───────────────────────────────────────────────────────────────

function renderFooterData(data) {
  var social = data.social || {};
  var links  = [
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'dribbble', label: 'Dribbble' },
    { key: 'twitter',  label: 'X'        },
  ];
  var el = document.getElementById('footer-social');
  if (el) {
    el.innerHTML = links
      .filter(function (l) { return social[l.key]; })
      .map(function (l) {
        return '<a class="footer-social-link" href="' + escHtml(social[l.key]) +
               '" target="_blank" rel="noopener">' + l.label + '</a>';
      }).join('');
  }
  setText('footer-copy', (data.meta || {}).copyright);
}

// ── Project card (work page grid) ─────────────────────────────────────────────

function buildProjectCard(p) {
  var thumbStyle   = p.thumbnail ? '' : 'background:' + (p.thumbnailGradient || '#ebebeb');
  var thumbContent = p.thumbnail
    ? '<img src="' + escHtml(p.thumbnail) + '" alt="' + escHtml(p.title) + '" loading="lazy">'
    : '<span class="project-card-label">' + escHtml(p.thumbnailLabel || p.title) + '</span>';
  return '<a class="project-card" href="/project.html?id=' + p.id + '">' +
    '<div class="project-card-thumb" style="' + thumbStyle + '">' + thumbContent + '</div>' +
    '<div class="project-card-info">' +
      '<div class="project-card-title">' + escHtml(p.title) + '</div>' +
      '<div class="project-card-sub">'   + escHtml(p.subtitle) + '</div>' +
    '</div></a>';
}

// ── Home page renderers ───────────────────────────────────────────────────────

function renderFeatured(p) {
  var el = document.getElementById('featured-project');
  if (!el) return;
  var bgStyle = p.thumbnail ? '' : 'background:' + (p.thumbnailGradient || '#111');
  var imgHTML = p.thumbnail
    ? '<img src="' + escHtml(p.thumbnail) + '" alt="' + escHtml(p.title) + '">'
    : '<span class="featured-label">' + escHtml(p.thumbnailLabel || p.title) + '</span>';
  el.innerHTML =
    '<a href="/project.html?id=' + p.id + '">' +
      '<div class="featured-image" style="' + bgStyle + '">' + imgHTML + '</div>' +
      '<div class="featured-meta">' +
        '<h2 class="featured-title">'    + escHtml(p.title)    + '</h2>' +
        '<p class="featured-subtitle">'  + escHtml(p.subtitle) + '</p>' +
      '</div>' +
    '</a>';
}

function renderGrid(projects) {
  var el = document.getElementById('projects-grid');
  if (!el) return;
  el.innerHTML = projects.map(function (p) {
    var bgStyle = p.thumbnail ? '' : 'background:' + (p.thumbnailGradient || '#111');
    var imgHTML = p.thumbnail
      ? '<img src="' + escHtml(p.thumbnail) + '" alt="' + escHtml(p.title) + '">'
      : '';
    return '<a class="project-card" href="/project.html?id=' + p.id + '">' +
      '<div class="card-image" style="' + bgStyle + '">' + imgHTML + '</div>' +
      '<div class="card-meta">' +
        '<h3>' + escHtml(p.title) + '</h3>' +
        '<p>'  + escHtml(p.subtitle) + '</p>' +
      '</div></a>';
  }).join('');
}

// ── Feed / bento renderer ─────────────────────────────────────────────────────

function renderBento(feed) {
  var grid = document.getElementById('bento-grid');
  if (!grid) return;
  if (!feed.length) {
    grid.innerHTML = '<p class="bento-empty">Nothing here yet.</p>';
    return;
  }
  var cols = [
    document.getElementById('bento-col-0'),
    document.getElementById('bento-col-1'),
    document.getElementById('bento-col-2'),
  ];
  feed.forEach(function (a, i) {
    var div = document.createElement('div');
    div.className = 'bento-item';
    div.style.setProperty('--delay', Math.min(i * 15, 600) + 'ms');
    div.onclick = function () { openLightbox(a.url, a.alt || ''); };
    var img = document.createElement('img');
    img.src = a.url;
    img.alt = a.alt || '';
    div.appendChild(img);
    if (cols[i % 3]) cols[i % 3].appendChild(div);
  });
}

function openLightbox(src, alt) {
  var lb  = document.getElementById('feed-lightbox');
  var img = document.getElementById('feed-lightbox-img');
  if (!lb || !img) return;
  img.src = src;
  img.alt = alt;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var lb = document.getElementById('feed-lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Project page renderer ─────────────────────────────────────────────────────

function renderSection(s) {
  if (s.type === 'text') {
    return '<div class="ps-text">' +
      (s.heading ? '<h2 class="ps-heading">' + escHtml(s.heading) + '</h2>' : '') +
      '<p class="ps-body">' + escHtml(s.body || '').replace(/\n/g, '<br>') + '</p>' +
      '</div>';
  }
  if (s.type === 'image') {
    return '<div class="ps-image">' +
      '<img src="' + escHtml(s.url) + '" alt="' + escHtml(s.caption || '') + '">' +
      (s.caption ? '<p class="ps-caption">' + escHtml(s.caption) + '</p>' : '') +
      '</div>';
  }
  if (s.type === 'metrics') {
    var items = (s.items || []).map(function (m) {
      return '<div class="ps-metric">' +
        '<div class="ps-metric-value">' + escHtml(m.value) + '</div>' +
        '<div class="ps-metric-label">' + escHtml(m.label) + '</div>' +
        '</div>';
    }).join('');
    return '<div class="ps-metrics">' + items + '</div>';
  }
  if (s.type === 'quote') {
    return '<blockquote class="ps-quote">' +
      '<p class="ps-quote-text">' + escHtml(s.text) + '</p>' +
      (s.attribution ? '<cite class="ps-quote-cite">— ' + escHtml(s.attribution) + '</cite>' : '') +
      '</blockquote>';
  }
  return '';
}

function renderProjectPage(data) {
  var params   = new URLSearchParams(window.location.search);
  var id       = parseInt(params.get('id'), 10);
  var projects = data.projects || [];
  var project  = projects.find(function (p) { return p.id === id; });

  if (!project) {
    var sec = document.getElementById('project-sections');
    if (sec) sec.innerHTML = '<p style="padding:80px 0;color:var(--text-muted)">Project not found.</p>';
    return;
  }

  document.title = project.title + ' — Pavel Panioukin';

  var heroEl = document.getElementById('project-hero');
  if (heroEl) {
    if (project.thumbnail) {
      heroEl.innerHTML = '<img src="' + escHtml(project.thumbnail) + '" alt="' + escHtml(project.title) + '">';
    } else {
      heroEl.style.background = project.thumbnailGradient || '#ebebeb';
      heroEl.innerHTML = '<span class="project-hero-label">' + escHtml(project.thumbnailLabel || project.title) + '</span>';
    }
  }

  var tags      = (project.tags || []).map(function (t) { return '<span class="modal-tag">' + escHtml(t) + '</span>'; }).join('');
  var headerEl  = document.getElementById('project-header');
  if (headerEl) {
    headerEl.innerHTML =
      '<div class="project-page-tags">' + tags + '<span class="project-page-year">' + escHtml(project.year || '') + '</span></div>' +
      '<h1 class="project-page-title">'    + escHtml(project.title)    + '</h1>' +
      '<p class="project-page-subtitle">'  + escHtml(project.subtitle) + '</p>';
  }

  var sections   = project.sections || [];
  var sectionsEl = document.getElementById('project-sections');
  if (sectionsEl) {
    sectionsEl.innerHTML = sections.length
      ? sections.map(renderSection).join('')
      : '<p class="ps-body" style="padding-top:8px;">' + escHtml(project.description) + '</p>';
  }

  var idx   = projects.findIndex(function (p) { return p.id === id; });
  var prev  = projects[idx - 1];
  var next  = projects[idx + 1];
  var navEl = document.getElementById('project-nav');
  if (navEl) {
    navEl.innerHTML =
      '<div class="project-page-nav-inner">' +
        (prev ? '<a href="project.html?id=' + prev.id + '" class="project-nav-link">← ' + escHtml(prev.title) + '</a>' : '<span></span>') +
        (next ? '<a href="project.html?id=' + next.id + '" class="project-nav-link">'   + escHtml(next.title) + ' →</a>' : '<span></span>') +
      '</div>';
  }
}

// ── Contact form ──────────────────────────────────────────────────────────────

function handleSubmit(e) {
  e.preventDefault();
  var name    = document.getElementById('name').value;
  var email   = document.getElementById('email').value;
  var message = document.getElementById('message').value;
  var subject = encodeURIComponent('Portfolio inquiry from ' + name);
  var body    = encodeURIComponent('From: ' + name + ' <' + email + '>\n\n' + message);
  window.location.href = 'mailto:hello@panioukin.design?subject=' + subject + '&body=' + body;
  var note = document.getElementById('form-note');
  if (note) note.textContent = 'Opening your email client…';
}

// ── Nav active state (called after each SPA navigation) ──────────────────────

function updateNavActive() {
  var p = window.location.pathname;
  var pageKey = p.includes('feed')    ? 'feed'    :
                p.includes('about')   ? 'about'   :
                p.includes('work')    ? 'work'    :
                p.includes('contact') ? 'contact' :
                p.includes('project') ? 'work'    : 'new';

  document.querySelectorAll('.nav-link').forEach(function (a) {
    a.classList.remove('active');
    try {
      var href = new URL(a.getAttribute('href'), location.origin).pathname;
      var key  = href.includes('feed')    ? 'feed'    :
                 href.includes('about')   ? 'about'   :
                 href.includes('work')    ? 'work'    :
                 href.includes('contact') ? 'contact' : 'new';
      if (key === pageKey) a.classList.add('active');
    } catch (_) {}
  });

  // Toggle dark home-page theme
  var isHome = (p === '/' || p.endsWith('/index.html'));
  document.body.className = isHome ? 'page-new' : '';
}

// ── Central page initialiser ──────────────────────────────────────────────────
// Called by transitions.js on first load and after every SPA navigation.

window.initPage = async function () {
  updateNavActive();

  var data = await fetch('/data.json?v=' + Date.now()).then(function (r) { return r.json(); });
  renderFooterData(data);

  var p = window.location.pathname;

  if (p === '/' || p.endsWith('/index.html')) {
    var projects = data.projects || [];
    if (projects[0])              renderFeatured(projects[0]);
    if (projects.slice(1,4).length) renderGrid(projects.slice(1, 4));

  } else if (p.includes('work')) {
    var grid = document.getElementById('work-grid');
    if (grid) grid.innerHTML = (data.projects || []).map(buildProjectCard).join('');

  } else if (p.includes('feed')) {
    renderBento(data.feed || []);

  } else if (p.includes('project')) {
    renderProjectPage(data);
  }
  // about.html and contact.html: static <main> — no dynamic rendering needed

  if (window.animatePageIn) window.animatePageIn();
};
