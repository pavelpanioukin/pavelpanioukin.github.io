(function () {

  // Stagger delays — extracted from guglieri.com source
  var DELAYS = [0.1, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.65, 0.7, 0.8, 0.9];

  // Spring physics approximation matching guglieri.com:
  // damping:30, stiffness:400, mass:1 → cubic-bezier(0.34,1.56,0.64,1)
  var SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  var DURATION = '0.35s';

  function runEntranceAnimation() {
    // Only animate elements that haven't started yet — prevents double-call
    // flash on dynamic pages that call animatePageIn() after async data renders
    var els = document.querySelectorAll('.appear:not([data-appeared])');
    els.forEach(function (el, i) {
      el.dataset.appeared = '1';
      var delay = DELAYS[Math.min(i, DELAYS.length - 1)];
      el.style.opacity = '0';
      el.style.transition = 'opacity ' + DURATION + ' ' + SPRING + ' ' + delay + 's';
      // Double rAF ensures initial opacity:0 is painted before transition starts
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.opacity = '1';
        });
      });
    });
  }

  // Expose for dynamic pages to call after async content renders
  window.animatePageIn = runEntranceAnimation;

  // Run entrance on every page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEntranceAnimation);
  } else {
    requestAnimationFrame(function () { requestAnimationFrame(runEntranceAnimation); });
  }

  // JS fallback for browsers without native @view-transition support
  // (Safari < 18, Firefox without flag)
  if (!CSS.supports('view-transition-name', 'none') &&
      !document.startViewTransition) {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.getAttribute('target') === '_blank') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var isInternal;
      try {
        var url = new URL(href, location.href);
        if (url.origin !== location.origin) return;
        if (url.pathname === location.pathname && url.search === location.search) return;
        isInternal = true;
      } catch (_) {
        isInternal = href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
      }
      if (!isInternal) return;
      e.preventDefault();
      // Quick fade out then navigate
      document.body.style.transition = 'opacity 0.18s ease';
      document.body.style.opacity = '0';
      setTimeout(function () { location.href = href; }, 190);
    });
  }

})();
