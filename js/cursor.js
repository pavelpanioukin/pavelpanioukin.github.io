// ── Custom Cursor ─────────────────────────────────────────────
(function() {
  // Only run on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const dot = document.createElement('div');
  dot.id = 'custom-cursor';
  document.body.appendChild(dot);

  const SVG_VIEW = `<svg width="22" height="17" viewBox="-13 -10 26 20"
    xmlns="http://www.w3.org/2000/svg"
    style="display:block;pointer-events:none;flex-shrink:0;">
    <path d="M-13,0 Q-7,-10 0,-10 Q7,-10 13,0 Q7,10 0,10 Q-7,10 -13,0 Z"
      fill="none" stroke="currentColor" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="5"
      fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle cx="0" cy="0" r="1.8" fill="currentColor"/>
  </svg>`;

  const SVG_PLAY = `<svg width="18" height="18" viewBox="-12 -12 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style="display:block;pointer-events:none;flex-shrink:0;">
    <polygon points="-7,-9 -7,9 10,0"
      fill="none" stroke="currentColor" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  let mouseX = -100, mouseY = -100;
  let dotX = -100, dotY = -100;
  let currentState = 'default'; // 'default' | 'hover' | 'view' | 'play' | 'external' | 'close'

  // Track mouse position
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
  });

  // Detect hover targets
  function getState(target) {
    if (!target) return 'default';
    // Lightbox open = "close" state
    const lb = document.getElementById('feed-lightbox');
    if (lb && lb.classList.contains('open')) return 'close';
    // Video / reel = "play" state
    if (target.closest('[data-cursor="play"], video, .reel, .case-video, .video-thumb')) {
      return 'play';
    }
    // Project card / image = "view" state
    if (target.closest('.project-card, .featured-project, .bento-item, [data-cursor="view"]')) {
      return 'view';
    }
    // External links = "external" state
    if (target.closest('a[target="_blank"]')) return 'external';
    // Links, buttons, nav = "hover" state
    if (target.closest('a, button, [role="button"], .nav-link, label')) {
      return 'hover';
    }
    return 'default';
  }

  document.addEventListener('mouseover', e => {
    const state = getState(e.target);
    if (state !== currentState) {
      currentState = state;
      dot.className = 'cursor-' + state;
      if (state === 'view') {
        dot.innerHTML = SVG_VIEW;
      } else if (state === 'play') {
        dot.innerHTML = SVG_PLAY;
      } else {
        dot.innerHTML = '';
      }
    }
  });

  // RAF loop — lerp toward mouse
  const LERP = 0.12;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Snap directly — no lerp, no transitions
    dot.style.transition = 'none';
    document.addEventListener('mousemove', e => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    return;
  }

  function tick() {
    dotX += (mouseX - dotX) * LERP;
    dotY += (mouseY - dotY) * LERP;
    dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
