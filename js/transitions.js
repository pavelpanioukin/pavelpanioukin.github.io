(function () {

  // ── Stagger entrance animation ──────────────────────────────────────────────
  var DELAYS = [0.1, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.65, 0.7, 0.8, 0.9];
  var SPRING  = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  var DURATION = '0.35s';

  function runEntranceAnimation() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = document.querySelectorAll('.appear:not([data-appeared])');
    els.forEach(function (el, i) {
      el.dataset.appeared = '1';
      var delay = DELAYS[Math.min(i, DELAYS.length - 1)];
      el.style.opacity = '0';
      el.style.transition = 'opacity ' + DURATION + ' ' + SPRING + ' ' + delay + 's';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.style.opacity = '1'; });
      });
    });
  }

  window.animatePageIn = runEntranceAnimation;

  // ── No View Transition support — plain fade fallback ───────────────────────
  if (!('startViewTransition' in document)) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.getAttribute('target') === '_blank') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try {
        var url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search) return;
      } catch (_) { return; }
      e.preventDefault();
      document.body.style.transition = 'opacity 0.2s cubic-bezier(0.27, 0, 0.51, 1)';
      document.body.style.opacity = '0';
      setTimeout(function () { location.href = href; }, 210);
    });
    scheduleFirstLoad();
    return;
  }

  // ── SPA navigate: fetch → swap <main> → re-init ────────────────────────────
  async function navigate(url) {
    var res  = await fetch(url);
    var html = await res.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');

    var newMain = doc.querySelector('main');
    var curMain = document.querySelector('main');
    if (newMain && curMain) {
      curMain.className   = newMain.className;
      curMain.innerHTML   = newMain.innerHTML;
    }

    document.title = doc.title;
    history.pushState({}, doc.title, url);

    // Reset appear states so stagger replays on new content
    document.querySelectorAll('[data-appeared]').forEach(function (el) {
      delete el.dataset.appeared;
      el.style.opacity    = '';
      el.style.transition = '';
    });

    if (typeof window.initPage === 'function') await window.initPage();
  }

  // ── Intercept internal link clicks ─────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.getAttribute('target') === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url;
    try {
      url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
    } catch (_) { return; }
    e.preventDefault();
    document.startViewTransition(function () { return navigate(url.href); });
  });

  // ── Browser back / forward ─────────────────────────────────────────────────
  window.addEventListener('popstate', function () {
    document.startViewTransition(function () { return navigate(location.href); });
  });

  // ── First-load: run stagger + initPage ─────────────────────────────────────
  function scheduleFirstLoad() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', firstLoad);
    } else {
      firstLoad();
    }
  }

  function firstLoad() {
    runEntranceAnimation();
    if (typeof window.initPage === 'function') window.initPage();
  }

  scheduleFirstLoad();

})();
