// ── Custom Cursor ─────────────────────────────────────────────
(function() {
  // Only run on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const dot = document.createElement('div');
  dot.id = 'custom-cursor';
  document.body.appendChild(dot);

  let mouseX = -100, mouseY = -100;
  let dotX = -100, dotY = -100;
  let currentState = 'default'; // 'default' | 'hover' | 'external' | 'close'

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
    // External links = "external" state
    if (target.closest('a[target="_blank"]')) return 'external';
    // Links, buttons, nav, bento images = "hover" state
    if (target.closest('a, button, [role="button"], .nav-link, label, .bento-item')) {
      return 'hover';
    }
    return 'default';
  }

  document.addEventListener('mouseover', e => {
    const state = getState(e.target);
    if (state !== currentState) {
      currentState = state;
      dot.className = 'cursor-' + state;
      dot.innerHTML = '';
    }
  });

  // RAF loop — lerp toward mouse
  const LERP = 0.15;

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
