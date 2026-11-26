// Motion layer: staggered entrances, image wipes, self-drawing line art,
// word-by-word headings, and a cursor glow + slight tilt on boxes.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  if (reduce) { window.kvMotion = function () {}; return; }

  var groups = '.grid, .xp-grid, .co-list, .skills, .list, .pgrid, .res-grid, .about, .cgrid';

  // After an element has finished coming in, drop the reveal classes so hover effects work freely.
  function settle(el) {
    if (el.dataset.settled) return;
    el.dataset.settled = 1;
    var delay = parseFloat(getComputedStyle(el).transitionDelay) * 1000 || 0;
    setTimeout(function () { el.classList.remove('rv', 'in', 'from-l', 'from-r'); el.style.removeProperty('--i'); }, 1100 + delay);
  }
  var watch = new MutationObserver(function (list) {
    list.forEach(function (m) { if (m.target.classList.contains('in')) settle(m.target); });
  });

  function prep(root) {
    root = root || document;

    // stagger children and alternate directions
    root.querySelectorAll(groups).forEach(function (g) {
      var kids = g.querySelectorAll(':scope > .rv');
      kids.forEach(function (k, i) {
        k.style.setProperty('--i', i);
        if (g.matches('.grid, .xp-grid, .pgrid, .res-grid, .cgrid')) k.classList.add(i % 2 ? 'from-r' : 'from-l');
        if (g.matches('.skills, .list')) k.classList.add('from-l');
      });
    });
    document.querySelectorAll('.rv').forEach(function (el) {
      if (!el.dataset.watched) { el.dataset.watched = 1; watch.observe(el, { attributes: true, attributeFilter: ['class'] }); }
      if (el.classList.contains('in')) settle(el);
    });

    // headings: rise in word by word
    document.querySelectorAll('.sec-head h2:not([data-split]), .contact h2:not([data-split])').forEach(function (h) {
      h.dataset.split = 1;
      var parts = h.innerHTML.split(/(<br\s*\/?>)/i), n = 0;
      h.innerHTML = parts.map(function (p) {
        if (/^<br/i.test(p)) return p;
        return p.split(/(\s+)/).map(function (w) {
          if (!w.trim()) return w;
          return '<span class="wd"><span style="--w:' + (n++) + '">' + w + '</span></span>';
        }).join('');
      }).join('');
      headIO.observe(h);
    });

    // line art: draw strokes on first view
    document.querySelectorAll('.hero-art svg, .board svg, .bd svg').forEach(function (svg) {
      if (svg.dataset.draw) return;
      svg.dataset.draw = 1;
      var shapes = svg.querySelectorAll('.la path, .la rect, .la circle, .t-wave path, .t-bus path, .co path, .bd-box rect, .bd-wire path, .seg path');
      shapes.forEach(function (s) {
        if (s.classList.contains('pulse') || s.getAttribute('stroke-dasharray')) return;
        var len = 0;
        try { len = s.getTotalLength(); } catch (e) {}
        if (!len) return;
        s.style.strokeDasharray = len;
        s.style.strokeDashoffset = len;
        s.classList.add('drawable');
      });
      svg.classList.add('pre-draw');
      drawIO.observe(svg);
    });

    // cursor glow + tilt
    document.querySelectorAll('.card, .feat, .xp, .co, .pcard, .res, .citem').forEach(function (box) {
      if (box.dataset.glow) return;
      box.dataset.glow = 1;
      box.classList.add('glow');
      var tilt = !box.classList.contains('feat') && !box.classList.contains('co');
      box.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        box.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        box.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (tilt) {
          box.style.setProperty('--ry', ((x - 0.5) * 5).toFixed(2) + 'deg');
          box.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg');
        }
      });
      box.addEventListener('pointerleave', function () {
        box.style.setProperty('--rx', '0deg'); box.style.setProperty('--ry', '0deg');
      });
    });
  }

  var headIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('words-in'); headIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });

  var drawIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var svg = e.target, shapes = svg.querySelectorAll('.drawable');
      shapes.forEach(function (s, i) {
        s.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.6,0,.2,1) ' + Math.min(i * 25, 900) + 'ms';
        s.style.strokeDashoffset = 0;
      });
      svg.classList.remove('pre-draw');
      setTimeout(function () { shapes.forEach(function (s) { s.style.strokeDasharray = ''; s.style.strokeDashoffset = ''; s.style.transition = ''; }); }, 2600);
      drawIO.unobserve(svg);
    });
  }, { threshold: 0.25 });

  // safety net: if anything never scrolls into view, show it anyway
  setTimeout(function () {
    document.querySelectorAll('.sec-head h2, .contact h2').forEach(function (h) { h.classList.add('words-in'); });
  }, 2500);

  window.kvMotion = prep;
  prep(document);
})();
