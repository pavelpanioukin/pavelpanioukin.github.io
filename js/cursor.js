// ── Pill-morph cursor ─────────────────────────────────────────
(function () {
  if (window.matchMedia('(hover: none)').matches) return;

  var cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);

  // Padding around hovered element when in pill mode
  var PAD = 6;
  // Elements larger than these are treated as non-interactive for pill purposes
  var SIZE_CAP_W = 500;
  var SIZE_CAP_H = 72;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var posX   = mouseX;
  var posY   = mouseY;
  var mode   = 'dot'; // 'dot' | 'pill'
  var pillEl = null;
  var lastW  = 8;
  var lastH  = 8;

  // ── Theme ─────────────────────────────────────────────────────
  function updateTheme() {
    var dark = document.body.classList.contains('page-new');
    cursor.style.borderColor = dark ? '#f0ede8' : '#111111';
  }
  window.updateCursorTheme = updateTheme;
  updateTheme();

  // ── Hover detection ───────────────────────────────────────────
  var HOVER_SEL = 'a, button, [role="button"], label, .bento-item, .nav-link, .project-nav-link';

  document.addEventListener('mouseover', function (e) {
    var target = e.target && e.target.closest ? e.target.closest(HOVER_SEL) : null;
    if (target) {
      if (target === pillEl) return; // already tracking this element
      var r = target.getBoundingClientRect();
      if (r.width > SIZE_CAP_W || r.height > SIZE_CAP_H) {
        toDot();
        return;
      }
      toPill(target);
    } else {
      toDot();
    }
  });

  function toDot() {
    if (mode === 'dot') return;
    mode   = 'dot';
    pillEl = null;
    cursor.style.width        = '8px';
    cursor.style.height       = '8px';
    cursor.style.borderRadius = '50%';
    lastW = 8;
    lastH = 8;
  }

  function toPill(el) {
    mode   = 'pill';
    pillEl = el;
    var r  = el.getBoundingClientRect();
    var w  = Math.round(r.width  + PAD * 2);
    var h  = Math.round(r.height + PAD * 2);
    cursor.style.width        = w + 'px';
    cursor.style.height       = h + 'px';
    cursor.style.borderRadius = '100px';
    lastW = w;
    lastH = h;
  }

  // ── Mouse tracking ────────────────────────────────────────────
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function () {
    cursor.style.opacity = '1';
    updateTheme();
  });

  // ── Reduced motion: snap instead of lerp ─────────────────────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', function (e) {
      cursor.style.transform = 'translate(' + (e.clientX - 4) + 'px,' + (e.clientY - 4) + 'px)';
    });
    return;
  }

  // ── RAF loop ──────────────────────────────────────────────────
  var LERP_DOT  = 0.15;
  var LERP_PILL = 0.20;

  function tick() {
    var tx, ty;

    if (mode === 'pill' && pillEl) {
      var r = pillEl.getBoundingClientRect();
      if (r.width > SIZE_CAP_W || r.height > SIZE_CAP_H) {
        toDot();
      } else {
        // Track element size (handles window resize / reflow)
        var w = Math.round(r.width  + PAD * 2);
        var h = Math.round(r.height + PAD * 2);
        if (w !== lastW) { cursor.style.width  = w + 'px'; lastW = w; }
        if (h !== lastH) { cursor.style.height = h + 'px'; lastH = h; }
        tx = r.left - PAD;
        ty = r.top  - PAD;
      }
    }

    if (mode === 'dot') {
      tx = mouseX - 4; // center 8px dot on pointer
      ty = mouseY - 4;
    }

    var lerp = mode === 'pill' ? LERP_PILL : LERP_DOT;
    posX += (tx - posX) * lerp;
    posY += (ty - posY) * lerp;

    cursor.style.transform = 'translate(' + posX + 'px,' + posY + 'px)';

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
