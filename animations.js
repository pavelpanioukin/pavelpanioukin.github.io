/**
 * animations.js — page enter, nav transitions, active link mark.
 * Vanilla JS only. No external libraries.
 */
(function () {

  // ── 1. Mark active nav link ────────────────────────────────────────────────

  function markActiveNavLink() {
    var current = window.location.pathname;
    document.querySelectorAll('.nav-row a').forEach(function (a) {
      var href;
      try {
        href = new URL(a.getAttribute('href') || '', window.location.origin).pathname;
      } catch (_) {
        return;
      }
      if (href === current ||
          (href === '/index.html' && (current === '/' || current === ''))) {
        a.classList.add('active');
      }
    });
  }

  // ── 2. Page enter — lift in from below ────────────────────────────────────

  function initPageEnter() {
    var content = document.querySelector('.page-content');
    if (!content) return;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        content.classList.add('is-visible');
        content.addEventListener('transitionend', function () {
          content.style.willChange = 'auto';
        }, { once: true });
      });
    });
  }

  // ── 3. Nav click — fade-out content then navigate ─────────────────────────

  function initNavTransitions() {
    document.querySelectorAll('.nav-row a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel')) return;

        try {
          var url = new URL(href, window.location.href);
          if (url.origin !== window.location.origin) return;
          if (url.pathname === window.location.pathname) return;
        } catch (_) {
          return;
        }

        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        e.preventDefault();
        var content = document.querySelector('.page-content');
        if (content) {
          content.style.transition = 'opacity 0.18s ease-in, transform 0.18s ease-in';
          content.style.opacity = '0';
          content.style.transform = 'translateY(-12px)';
        }
        setTimeout(function () {
          window.location.href = href;
        }, 200);
      });
    });
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    markActiveNavLink();
    initPageEnter();
    initNavTransitions();
  });

})();
