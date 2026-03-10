/**
 * animations.js — sticky nav, page transitions, scroll reveal, hero words.
 * Vanilla JS only. No external libraries.
 */
(function () {

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ── 1. Sticky nav — frosted glass on scroll ────────────────────────────────

  function initStickyNav() {
    var navRow = document.querySelector('.header-row2');
    if (!navRow) return;

    // Zero-height sentinel placed just before the nav row.
    // When it leaves the viewport the nav is "stuck" — apply frosted glass.
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'height:1px;pointer-events:none;margin-bottom:-1px;';
    navRow.parentNode.insertBefore(sentinel, navRow);

    new IntersectionObserver(function (entries) {
      navRow.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  // ── 2. Page transition — exit + enter ─────────────────────────────────────

  function initPageTransition() {
    var content = document.querySelector('.page-content');
    if (!content) return;

    // ENTER: fade + rise on page load
    setTimeout(function () {
      content.classList.add('page-enter');
    }, 30);

    // EXIT: fade + rise upward before navigating away
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      // Never intercept modifier-key clicks, new-tab links, or special urls
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target === '_blank') return;
      if (href.startsWith('#')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

      // Only intercept same-origin links
      try {
        var url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch (_) {
        return;
      }

      e.preventDefault();
      content.classList.add('page-exit');
      setTimeout(function () { window.location.href = href; }, 280);
    });
  }

  // ── 3. Scroll reveal ───────────────────────────────────────────────────────

  var REVEAL_SELECTORS = [
    'main h1',
    'main h2',
    'main h3',
    '.project-card',
    '.work-card',
    '.timeline-item',
    '.philosophy-card',
    '.bento-item',
    '.feed-image',
    '.artifact-item',
    '.contact-section > *',
  ];

  var GRID_SELECTORS = [
    '.project-grid',
    '.bento-grid',
    '.philosophy-grid',
    '.work-grid',
  ];

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Set JS-driven stagger delays on grid children (resets every 4 = new row)
  function applyGridStagger(scope) {
    var root = scope || document;
    GRID_SELECTORS.forEach(function (containerSel) {
      root.querySelectorAll(containerSel).forEach(function (grid) {
        Array.from(grid.children).forEach(function (child, i) {
          child.style.transitionDelay = ((i % 4) * 80) + 'ms';
        });
      });
    });
  }

  function attachReveal(scope) {
    var root = scope || document;
    applyGridStagger(root);

    REVEAL_SELECTORS.forEach(function (sel) {
      root.querySelectorAll(sel).forEach(function (el) {
        if (el.closest('.site-header')) return;   // header is always visible
        if (el.classList.contains('reveal')) return; // already wired up
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    });
  }

  // Re-run whenever dynamic content is injected (project cards, bento items…)
  function watchForDynamicContent() {
    var main = document.querySelector('main');
    if (!main) return;
    new MutationObserver(function () {
      attachReveal(main);
      tryInitHeroWords();
    }).observe(main, { childList: true, subtree: true });
  }

  // ── 4. Hero headline — word-by-word entrance ───────────────────────────────

  var heroWordsDone = false;

  function tryInitHeroWords() {
    if (heroWordsDone) return;

    // Static pages: first main h1
    // index.html: .featured-hero-title rendered dynamically after data fetch
    var hero =
      document.querySelector('main h1') ||
      document.querySelector('.featured-hero-title');

    if (!hero || !hero.textContent.trim()) return;
    heroWordsDone = true;

    var words = hero.textContent.trim().split(/\s+/);
    hero.innerHTML = words.map(function (w) {
      return '<span class="word">' + w + '</span>';
    }).join(' ');

    // Remove from scroll-reveal so it doesn't double-animate
    hero.classList.remove('reveal');
    revealObserver.unobserve(hero);

    setTimeout(function () {
      hero.querySelectorAll('.word').forEach(function (span, i) {
        setTimeout(function () { span.classList.add('visible'); }, i * 60);
      });
    }, 100);
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  ready(function () {
    initStickyNav();
    initPageTransition();
    attachReveal();
    tryInitHeroWords();
    watchForDynamicContent();
  });

})();
