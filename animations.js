/**
 * animations.js — page transitions, scroll reveal, hero word entrance.
 * Vanilla JS only. No external libraries.
 */
(function () {

  // ── Utility ────────────────────────────────────────────────────────────────

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ── 1. Page Transition ─────────────────────────────────────────────────────

  function initPageTransition() {
    const content = document.querySelector('.page-content');
    if (!content) return;

    // Fade in on load
    setTimeout(() => content.classList.add('is-visible'), 50);

    // Intercept internal link clicks — fade out before navigating
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('//') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      ) return;

      e.preventDefault();
      content.classList.remove('is-visible');
      setTimeout(() => { window.location.href = href; }, 300);
    });
  }

  // ── 2. Scroll Reveal ───────────────────────────────────────────────────────

  const REVEAL_SELECTORS = [
    'main h1',
    'main h2',
    '.project-card',
    '.timeline-item',
    '.philosophy-card',
    '.bento-item',
  ];

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  function attachReveal(scope) {
    var root = scope || document;
    REVEAL_SELECTORS.forEach(function (sel) {
      root.querySelectorAll(sel).forEach(function (el) {
        if (el.closest('.site-header')) return;   // never animate header
        if (el.classList.contains('reveal')) return; // already processed
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    });
  }

  // Re-run when dynamic content (project cards, bento items) is injected
  function watchForDynamicContent() {
    var main = document.querySelector('main');
    if (!main) return;
    new MutationObserver(function () {
      attachReveal(main);
      tryInitHeroWords();
    }).observe(main, { childList: true, subtree: true });
  }

  // ── 5. Hero Headline Word Animation ────────────────────────────────────────

  var heroWordsDone = false;

  function tryInitHeroWords() {
    if (heroWordsDone) return;

    // Static h1 pages (work, feed, about, contact, project)
    // Dynamic index.html uses .featured-hero-title (a div, rendered after fetch)
    var hero =
      document.querySelector('main h1') ||
      document.querySelector('.featured-hero-title');

    if (!hero || !hero.textContent.trim()) return;
    heroWordsDone = true;

    var words = hero.textContent.trim().split(/\s+/);
    hero.innerHTML = words.map(function (w) {
      return '<span class="word">' + w + '</span>';
    }).join(' ');

    // Don't double-animate via scroll reveal
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
    initPageTransition();
    attachReveal();
    tryInitHeroWords();
    watchForDynamicContent();
  });

})();
