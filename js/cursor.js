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

  // ── Magnetic attraction ──────────────────────────────────────
  // Elements that attract the cursor. Excludes form fields and dense UI.
  const MAGNETIC_SELECTORS = '.nav-link, .project-card, .bento-item, .btn-submit, .cta-primary, .footer-name, .footer-social-link, .project-nav-link';
  const MAGNETIC_RADIUS   = 80;  // px from element center to start attracting
  const CURSOR_PULL       = 0.20; // how far cursor offsets toward element (0–1)
  const ELEMENT_NUDGE     = 0.12; // how far element moves toward cursor (0–1)
  const ELEMENT_SCALE     = 0.03; // max extra scale (1 + this)

  let magnetOffsetX = 0, magnetOffsetY = 0;
  let magnetEl = null;

  function updateMagnet(x, y) {
    const candidates = document.querySelectorAll(MAGNETIC_SELECTORS);
    let best = null, bestStrength = 0;

    candidates.forEach(el => {
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dist     = Math.hypot(x - cx, y - cy);
      const strength = Math.max(0, 1 - dist / MAGNETIC_RADIUS);
      if (strength > bestStrength) { best = el; bestStrength = strength; }
    });

    // Release previous element
    if (magnetEl && magnetEl !== best) {
      magnetEl.style.transform = '';
      magnetEl.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      magnetEl = null;
    }

    if (best && bestStrength > 0) {
      magnetEl = best;
      const r  = best.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = x - cx;
      const dy = y - cy;

      // Cursor pulled toward element center
      magnetOffsetX = -dx * bestStrength * CURSOR_PULL;
      magnetOffsetY = -dy * bestStrength * CURSOR_PULL;

      // Element nudged toward cursor
      const ex    = dx * bestStrength * ELEMENT_NUDGE;
      const ey    = dy * bestStrength * ELEMENT_NUDGE;
      const scale = 1 + ELEMENT_SCALE * bestStrength;

      best.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      best.style.transform  = `translate(${ex}px, ${ey}px) scale(${scale})`;
    } else {
      magnetOffsetX = 0;
      magnetOffsetY = 0;
    }
  }

  // Track mouse position + run magnet
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateMagnet(e.clientX, e.clientY);
  });

  // Release magnet when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    if (magnetEl) {
      magnetEl.style.transform = '';
      magnetEl.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      magnetEl = null;
    }
    magnetOffsetX = 0;
    magnetOffsetY = 0;
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

  // RAF loop — lerp toward mouse + magnetic offset
  const LERP = 0.15;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dot.style.transition = 'none';
    document.addEventListener('mousemove', e => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    return;
  }

  function tick() {
    dotX += (mouseX + magnetOffsetX - dotX) * LERP;
    dotY += (mouseY + magnetOffsetY - dotY) * LERP;
    dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
