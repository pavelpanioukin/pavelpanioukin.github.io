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

  // ── Philosophy spotlight ──────────────────────────────────────────────────────
  // Reads the sticky H2's live bounding rect on each scroll tick and activates
  // whichever item(s) vertically overlap it. Children carry the opacity so the
  // parent entrance animation (.appear → style.opacity) doesn't interfere.

  var _philosophyScrollFn = null;

  function initPhilosophySpotlight() {
    // Remove any handler from a previous page visit
    if (_philosophyScrollFn) {
      window.removeEventListener('scroll', _philosophyScrollFn);
      _philosophyScrollFn = null;
    }

    var items = document.querySelectorAll('.philosophy-item');
    if (!items.length) return;

    function update() {
      // On mobile the layout is single-column — H2 is above items, not beside them.
      if (window.innerWidth <= 768) {
        items.forEach(function (item) { item.classList.add('active'); });
        return;
      }

      var mid = window.innerHeight / 2;

      items.forEach(function (item) {
        var r = item.getBoundingClientRect();
        var overlaps = r.top < mid && r.bottom > mid;
        item.classList.toggle('active', overlaps);
      });
    }

    _philosophyScrollFn = update;
    window.addEventListener('scroll', update, { passive: true });
    // Run immediately so the correct item is active without needing a scroll
    update();
  }

  window.initPhilosophySpotlight = initPhilosophySpotlight;

  document.addEventListener('DOMContentLoaded', markActiveNavLink);
  document.addEventListener('DOMContentLoaded', initPhilosophySpotlight);

})();
