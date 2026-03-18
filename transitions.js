(function () {

  // Stagger delays matching guglieri.com exactly
  var DELAYS = [0.1, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.65, 0.7, 0.8, 0.9];

  function animatePageIn() {
    // Make the page wrapper immediately visible (no transition — child .appear elements handle animation)
    var content = document.querySelector('.page-content');
    if (content) content.classList.add('is-visible');

    // Stagger-animate each .appear element that hasn't already animated
    var els = document.querySelectorAll('.appear:not(.is-visible)');
    els.forEach(function (el, i) {
      var delay = DELAYS[Math.min(i, DELAYS.length - 1)];
      el.style.transitionDelay = delay + 's';
      // Force a reflow so opacity:0 is painted before transition starts
      void el.offsetWidth;
      el.classList.add('is-visible');
    });
  }

  // Expose for dynamic pages to call after content renders
  window.animatePageIn = animatePageIn;

  // Run on initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animatePageIn);
  } else {
    requestAnimationFrame(function () { requestAnimationFrame(animatePageIn); });
  }

  // Intercept all internal link clicks — exit animation then navigate
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (link.getAttribute('target') === '_blank') return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var isInternal;
    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Skip if same page + same query (pure anchor navigation)
      if (url.pathname === window.location.pathname &&
          url.search === window.location.search) return;
      isInternal = true;
    } catch (_) {
      isInternal = href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
    }

    if (!isInternal) return;

    e.preventDefault();

    // Fade out .appear elements
    document.querySelectorAll('.appear').forEach(function (el) {
      el.style.transitionDelay = '0s';
      el.style.transition = 'opacity 0.15s ease';
      el.classList.remove('is-visible');
    });

    // Fade out page wrapper too for a clean exit
    var content = document.querySelector('.page-content');
    if (content) {
      content.style.transition = 'opacity 0.15s ease';
      content.classList.remove('is-visible');
    }

    setTimeout(function () {
      window.location.href = href;
    }, 160);
  });

})();
