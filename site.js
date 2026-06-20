/**
 * site.js — shared header, footer, utilities, renderers, and initPage().
 * Included on every page. Must load before transitions.js.
 */
(function () {

  var NAV = [
    { label: 'About',   href: '/about.html',   key: 'about'   },
    { label: 'Work',    href: '/work.html',    key: 'work'    },
    { label: 'Feed',    href: '/feed.html',    key: 'feed'    },
  ];

  function getActiveKey(pathname) {
    var p = pathname || window.location.pathname;
    return p.includes('feed')    ? 'feed'    :
           p.includes('about')   ? 'about'   :
           p.includes('work')    ? 'work'    :
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
        '<div class="header-bio">Designing digital products since 2007</div>' +
      '</div>';

    var infoRowEl = headerEl.querySelector('.info-row');
    if (infoRowEl) {
      infoRowEl.addEventListener('click', function (e) {
        if (!e.target.closest('a')) window.location.href = '/';
      });
    }

    var navEl = document.createElement('div');
    navEl.className = 'nav-row';
    navEl.innerHTML = '<div class="nav-row-inner"><nav class="header-nav">' + buildNavHTML() + '</nav></div>';
    headerEl.insertAdjacentElement('afterend', navEl);
  }

  // ── Header height CSS var (for homepage below-fold footer) ─────────────────
  function syncHeaderHeight() {
    if (!document.body.classList.contains('page-new')) return;
    var h = 0;
    var hdr = document.getElementById('site-header');
    var nav = document.querySelector('.nav-row');
    if (hdr) h += hdr.offsetHeight;
    if (nav) h += nav.offsetHeight;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  // Run after layout settles, and on resize
  setTimeout(syncHeaderHeight, 0);
  window.addEventListener('resize', syncHeaderHeight);

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

  // ── Render footer ───────────────────────────────────────────────────────────
  var footerEl = document.getElementById('site-footer');
  if (footerEl) {
    footerEl.className = 'site-footer';
    var em = 'pavel.panioukin' + '\x40' + 'gmail' + '\x2e' + 'com';
    footerEl.innerHTML =
      '<div class="footer-contact-row">' +
        '<div class="footer-col">' +
          '<a class="footer-reach" href="mailto:' + em + '">Drop me an email</a>' +
        '</div>' +
        '<div class="footer-col footer-col--right">' +
          '<a class="footer-col-link" href="https://www.linkedin.com/in/pavelpanioukin/" target="_blank" rel="noopener">LinkedIn</a>' +
          '<a class="footer-col-link" href="https://dribbble.com/pavelpanioukin" target="_blank" rel="noopener">Dribbble</a>' +
        '</div>' +
      '</div>' +
      '<a class="footer-next-row" id="footer-next-link" href="/about.html">Next \u2192 About</a>';
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
  var thumbStyle   = p.thumbnail ? '' : 'background:#fafafa';
  var thumbContent = p.thumbnail
    ? '<img src="' + escHtml(p.thumbnail) + '" alt="' + escHtml(p.title) + '" loading="lazy">'
    : '<span class="project-card-label">' + escHtml(p.thumbnailLabel || p.title) + '</span>';
  var badge = p.available === false
    ? '<span class="project-card-badge">Coming soon</span>'
    : '';
  var tagLine = (p.tags || []).join(', ');
  return '<a class="project-card" href="/project.html?id=' + p.id + '">' +
    '<div class="project-card-thumb" style="' + thumbStyle + '">' + badge + thumbContent + '</div>' +
    '<div class="project-card-info">' +
      '<div class="project-card-title">' + escHtml(p.title) + '</div>' +
      '<div class="project-card-sub">'   + escHtml(tagLine) + '</div>' +
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

// ── Homepage project list ─────────────────────────────────────────────────────
// Renders projects flagged homepage:true, sorted by homepageOrder.
// Titles link only when available:true AND sections exist.
// "Available on request" badge shown when available:false and subtitle isn't "—".

function renderHomepageProjects(projects) {
  var el = document.getElementById('homepage-projects');
  if (!el) return;
  var list = projects
    .filter(function (p) { return p.homepage === true; })
    .sort(function (a, b) { return (a.homepageOrder || 99) - (b.homepageOrder || 99); });
  if (!list.length) { el.innerHTML = ''; return; }
  el.innerHTML = list.map(function (p) {
    var hasSections = p.sections && p.sections.length > 0;
    var isLinked    = p.available === true && hasSections;
    var muted       = p.title === 'Coming soon' ? ' homepage-project--muted' : '';
    var titleInner  = escHtml(p.title);
    var titleEl = isLinked
      ? '<a class="homepage-project-title" href="/project.html?id=' + p.id + '">' + titleInner + '</a>'
      : '<div class="homepage-project-title">' + titleInner + '</div>';
    var metaContent = escHtml(p.subtitle || '');
    if (p.available === false && p.subtitle && p.subtitle !== '—') {
      metaContent += (metaContent ? ' &middot; ' : '') + '<span class="project-nda">Available on request</span>';
    }
    return '<article class="homepage-project' + muted + '">' +
      titleEl +
      '<div class="homepage-project-tension">' + escHtml(p.tension || '') + '</div>' +
      '<div class="homepage-project-meta">' + metaContent + '</div>' +
      '</article>';
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

// ── Footer next-page link (updated after each SPA navigation) ────────────────

function updateFooterNext() {
  var p = window.location.pathname;
  var dest = p.includes('about') ? { href: '/work.html',  label: 'Work'  } :
             p.includes('work')  ? { href: '/feed.html',  label: 'Feed'  } :
             p.includes('feed')  ? { href: '/about.html', label: 'About' } :
                                   { href: '/about.html', label: 'About' };
  var el = document.getElementById('footer-next-link');
  if (el) {
    el.href        = dest.href;
    el.textContent = 'Next \u2192 ' + dest.label;
  }
}

// ── Nav active state (called after each SPA navigation) ──────────────────────

function updateNavActive() {
  var p = window.location.pathname;
  var pageKey = p.includes('feed')    ? 'feed'    :
                p.includes('about')   ? 'about'   :
                p.includes('work')    ? 'work'    :
                p.includes('project') ? 'work'    : 'new';

  document.querySelectorAll('.nav-link').forEach(function (a) {
    a.classList.remove('active');
    try {
      var href = new URL(a.getAttribute('href'), location.origin).pathname;
      var key  = href.includes('feed')    ? 'feed'    :
                 href.includes('about')   ? 'about'   :
                 href.includes('work')    ? 'work'    :
                 'new';
      if (key === pageKey) a.classList.add('active');
    } catch (_) {}
  });

  // Toggle dark home-page theme
  var isHome = (p === '/' || p.endsWith('/index.html'));
  document.body.classList.toggle('page-new', isHome);
}

// ── Central page initialiser ──────────────────────────────────────────────────
// Called by transitions.js on first load and after every SPA navigation.

window.initPage = async function () {
  updateNavActive();

  var data = await fetch('/data.json?v=' + Date.now()).then(function (r) { return r.json(); });
  updateFooterNext();

  var p = window.location.pathname;

  if (p === '/' || p.endsWith('/index.html')) {
    renderHomepageProjects(data.projects || []);

  } else if (p.includes('work')) {
    var grid = document.getElementById('work-grid');
    if (grid) grid.innerHTML = (data.projects || []).map(buildProjectCard).join('');

  } else if (p.includes('feed')) {
    renderBento(data.feed || []);

  } else if (p.includes('project')) {
    renderProjectPage(data);
  }
  // about.html: static <main> — no dynamic rendering needed

  if (window.animatePageIn) window.animatePageIn();
  if (window.initPhilosophySpotlight) window.initPhilosophySpotlight();
  if (window.updateCursorTheme) window.updateCursorTheme();
};
