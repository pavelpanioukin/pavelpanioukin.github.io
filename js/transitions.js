(function () {

  // Stagger delays — extracted from guglieri.com source
  var DELAYS = [0.1, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.65, 0.7, 0.8, 0.9];

  // Spring physics approximation matching guglieri.com:
  // damping:30, stiffness:400, mass:1 → cubic-bezier(0.34,1.56,0.64,1)
  var SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  var DURATION = '0.35s';

  function runEntranceAnimation() {
    // Respect the user's motion preference — CSS !important cannot beat inline styles
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  // ── View-transition coordination ────────────────────────────────────────────
  //
  // Problem: CSS `.appear { opacity: 0 }` hides all content. When the browser
  // plays the page-sweep animation the new page slides in completely blank,
  // then content stagger starts separately — two disconnected motions.
  //
  // Fix: `pagereveal` fires on the new document BEFORE the first paint but
  // AFTER DOMContentLoaded. It carries the active ViewTransition object.
  // When present, we make all .appear elements immediately visible so the
  // page sweeps in fully rendered. We then skip the JS stagger (the sweep
  // itself is the entrance). On first load (no view transition) stagger runs
  // normally via the setTimeout(0) path below.
  //
  // pagereveal fires before requestAnimationFrame within the same rendering
  // update, but AFTER DOMContentLoaded. Using setTimeout(0) in the
  // DOMContentLoaded handler defers the stagger check to the next task,
  // by which time pagereveal has definitely fired and hasVT is set.

  var hasVT = false;

  if ('onpagereveal' in self) {
    self.addEventListener('pagereveal', function (e) {
      if (!e.viewTransition) return;
      hasVT = true;
      // Override CSS opacity:0 so the new page sweeps in fully rendered.
      // Also mark data-appeared so animatePageIn() calls are no-ops.
      document.querySelectorAll('.appear').forEach(function (el) {
        el.style.opacity = '1';
        el.dataset.appeared = '1';
      });
    });
  }

  // Defer stagger check to after pagereveal can fire (setTimeout = next task)
  function scheduleStagger() {
    setTimeout(function () {
      if (!hasVT) runEntranceAnimation();
    }, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleStagger);
  } else {
    scheduleStagger();
  }

  // ── JS fallback for browsers without @view-transition support ────────────
  // (Safari < 18, Firefox without flag)
  if (!('onpagereveal' in self)) {
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
      // Quick fade out — matches guglieri.com per-route exit (0.2s)
      document.body.style.transition = 'opacity 0.2s cubic-bezier(0.27, 0, 0.51, 1)';
      document.body.style.opacity = '0';
      setTimeout(function () { location.href = href; }, 210);
    });
  }

})();
