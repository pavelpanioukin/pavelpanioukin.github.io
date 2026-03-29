/**
 * animations.js — marks the active nav link.
 * Page transitions and element stagger are handled by transitions.js.
 */
(function () {

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

  function initPhilosophySpotlight() {
    var items = document.querySelectorAll('.philosophy-item');
    if (!items.length) return;

    // rootMargin: top offset covers the sticky nav (44px) + H2 padding-top (40px);
    // bottom is pulled up so only the item alongside the H2 activates.
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('active', entry.isIntersecting);
      });
    }, {
      rootMargin: '-84px 0px -40% 0px',
      threshold: 0
    });

    items.forEach(function (item) { observer.observe(item); });
  }

  document.addEventListener('DOMContentLoaded', markActiveNavLink);
  document.addEventListener('DOMContentLoaded', initPhilosophySpotlight);

})();
