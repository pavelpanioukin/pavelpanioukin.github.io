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

  document.addEventListener('DOMContentLoaded', markActiveNavLink);

})();
