// Section indicator in the nav ("01 · Projects") and mobile menu.
(function () {
  var spy = document.getElementById('spy');
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = document.querySelectorAll('[data-spy]');

  function update() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    if (spy && current) {
      spy.innerHTML = '<b>' + current.dataset.spy + '</b> · <span>' + current.dataset.label + '</span>';
    }
    links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + current.id); });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  var burger = document.getElementById('burger');
  var nav = document.getElementById('navlinks');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }
})();

// Interactive layer: reveal on scroll, count-up stats, lightbox, skill → project highlight.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal (with a safety net so nothing stays hidden)
  var items = document.querySelectorAll('.rv');
  function showAll() { items.forEach(function (el) { el.classList.add('in'); }); }
  if (reduce || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 2500);
  }

  // count-up for numbers in stat strips
  function countUp(el) {
    var txt = el.textContent, m = txt.match(/[\d,.]+/);
    if (!m || reduce) return;
    var target = parseFloat(m[0].replace(/,/g, '')), decimals = (m[0].split('.')[1] || '').length;
    var comma = m[0].indexOf(',') > -1, t0 = null, dur = 900;
    function fmt(v) { var s = v.toFixed(decimals); return comma ? Number(s).toLocaleString('en-US') : s; }
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = txt.replace(m[0], fmt(target * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); so.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stats b').forEach(function (b) { so.observe(b); });
  }

  // lightbox
  var lb = document.getElementById('lightbox');
  if (lb && lb.showModal) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap');
    document.querySelectorAll('img.zoom').forEach(function (img) {
      img.addEventListener('click', function () {
        lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt; lb.showModal();
      });
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-x')) lb.close(); });
  }

  // hovering a skill row lights up the project or section it links to
  document.querySelectorAll('.srow a[href^="#"]').forEach(function (a) {
    var row = a.closest('.srow'), target = document.querySelector(a.getAttribute('href'));
    if (!row || !target) return;
    row.addEventListener('mouseenter', function () { target.classList.add('lit'); });
    row.addEventListener('mouseleave', function () { target.classList.remove('lit'); });
  });
})();
