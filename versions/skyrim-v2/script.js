const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TIPS = [
  'LDO Voltage Regulator PCB — manufacturable board with zero DRC violations; DC bias verified with Murata SimSurface.',
  'SerialScope — live oscilloscope, I²C scanner, and interactive pinout for Uno, ESP32, and STM32.',
  'Arduino Radio Controlled Car — stable up to 20 m, <5% packet loss, <100 ms latency.',
  'Waterloo Aerial Robotics Group — contributing to electrical design on competition UAVs for the AEAC Student Competition.',
  'TalkToMedi — built a web scraper retrieving 1,000+ clinic records in under two minutes.',
];


function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}


function initLoader() {
  if (REDUCED || !document.body.classList.contains('home')) {
    return;
  }

  try {
    if (sessionStorage.getItem('kv-loaded')) {
      return;
    }
    sessionStorage.setItem('kv-loaded', '1');
  } catch (err) {
    return;
  }

  const loader = el('div', 'loader');
  loader.setAttribute('aria-hidden', 'true');

  const ring = el('div', 'loader-ring');
  ring.appendChild(el('span', '', 'ᛉ'));

  loader.append(ring, el('p', 'loader-tip', TIPS[Math.floor(Math.random() * TIPS.length)]), el('p', 'loader-label', 'Loading'));
  document.body.appendChild(loader);

  const finish = () => {
    loader.classList.add('done');
    setTimeout(() => loader.remove(), 1000);
  };

  loader.addEventListener('click', finish);
  setTimeout(finish, 1200);
}


function initSnow() {
  const canvas = document.getElementById('snow');
  if (!canvas || REDUCED) {
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let flakes = [];
  let wind = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min(160, (width * height) / 11000));
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      vy: Math.random() * 0.5 + 0.25,
      drift: Math.random() * Math.PI * 2,
      a: Math.random() * 0.5 + 0.25,
    }));
  };

  const tick = () => {
    ctx.clearRect(0, 0, width, height);
    wind += 0.004;

    flakes.forEach(f => {
      f.drift += 0.01;
      f.y += f.vy * (1 + f.r * 0.35);
      f.x += Math.sin(f.drift) * 0.35 + Math.sin(wind) * 0.25 * f.r;

      if (f.y > height + 4) {
        f.y = -4;
        f.x = Math.random() * width;
      }
      if (f.x > width + 4) {
        f.x = -4;
      }
      if (f.x < -4) {
        f.x = width + 4;
      }

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 242, 250, ' + f.a + ')';
      ctx.fill();
    });

    requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(tick);
}


function initCompass() {
  const track = document.getElementById('compass-track');
  if (!track) {
    return;
  }

  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const cycle = points.length * 90;

  for (let round = 0; round < 4; round++) {
    points.forEach(p => {
      const mark = el('span', '', p);
      if (p.length === 1) {
        mark.classList.add('cardinal');
      }
      if (p === 'N') {
        mark.classList.add('north');
      }
      track.appendChild(mark);
    });
  }

  const box = track.parentElement;

  const update = () => {
    const centre = box.clientWidth / 2 - 45;
    const offset = (window.scrollY * 0.45) % cycle;
    track.style.transform = 'translateX(' + (centre - cycle - offset).toFixed(1) + 'px)';
  };

  update();
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
}


function initTopbar() {
  const bar = document.getElementById('topbar');
  if (!bar) {
    return;
  }

  const onScroll = () => {
    bar.classList.toggle('stuck', window.scrollY > 8);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}


function initBurger() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('topnav');
  if (!burger || !nav) {
    return;
  }

  const close = () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  };

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      close();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      close();
    }
  });
}


function initActiveNav() {
  const links = Array.from(document.querySelectorAll('.topnav a'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
}


function observeOnce(targets, options, onEnter) {
  if (!targets.length) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    targets.forEach(onEnter);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      }
      onEnter(entry.target);
      observer.unobserve(entry.target);
    });
  }, options);

  targets.forEach(target => observer.observe(target));
}


function initReveal() {
  const targets = Array.from(document.querySelectorAll('.reveal'));

  targets.forEach((target, index) => {
    target.style.transitionDelay = Math.min(index % 5, 4) * 70 + 'ms';
  });

  observeOnce(targets, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }, target => target.classList.add('in'));
}


function initImageReveal() {
  const figures = Array.from(document.querySelectorAll('.shot, .hero-figure, .gallery figure'));
  if (!figures.length) {
    return;
  }

  figures.forEach(figure => figure.classList.add('imgfx'));

  const show = figure => figure.classList.add('in');
  observeOnce(figures, { threshold: 0.05 }, show);

  const sweep = () => {
    let pending = 0;
    figures.forEach(figure => {
      if (figure.classList.contains('in')) {
        return;
      }
      pending++;
      const box = figure.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.95 && box.bottom > 0) {
        show(figure);
      }
    });
    if (!pending) {
      window.removeEventListener('scroll', sweep);
    }
  };

  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('load', sweep);
  setTimeout(sweep, 400);
  setTimeout(() => figures.forEach(show), 6000);
}


function initParallax() {
  if (REDUCED) {
    return;
  }

  const items = Array.from(document.querySelectorAll('.parallax'));
  if (!items.length) {
    return;
  }

  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    items.forEach(item => {
      const speed = parseFloat(item.dataset.speed || '0.12');
      item.style.translate = '0 ' + (y * speed).toFixed(1) + 'px';
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}


function initDiscover() {
  const heads = Array.from(document.querySelectorAll('main .sec-head'));
  if (!heads.length || !('IntersectionObserver' in window)) {
    return;
  }

  const banner = el('div', 'discover');
  banner.setAttribute('aria-hidden', 'true');
  const nameEl = el('p', 'discover-name');
  const runeEl = el('b');
  const orn = el('div', 'discover-orn');
  orn.append(el('i'), runeEl, el('i'));
  banner.append(el('p', 'discover-kicker', 'Discovered'), nameEl, orn);
  document.body.appendChild(banner);

  let busy = false;
  let ready = false;

  setTimeout(() => {
    ready = true;
  }, 2600);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || busy || !ready) {
        return;
      }

      observer.unobserve(entry.target);
      busy = true;

      nameEl.textContent = entry.target.querySelector('.sec-title')?.textContent?.trim() || '';
      runeEl.textContent = entry.target.querySelector('.sec-runes')?.textContent?.trim() || 'ᛉ';

      banner.classList.remove('show');
      void banner.offsetWidth;
      banner.classList.add('show');

      setTimeout(() => {
        busy = false;
      }, 3300);
    });
  }, { threshold: 1, rootMargin: '0px 0px -35% 0px' });

  heads.forEach(head => observer.observe(head));
}


function initConstellations() {
  document.querySelectorAll('.con').forEach(con => {
    const lines = Array.from(con.querySelectorAll('.con-line'));

    lines.forEach(line => {
      const len = Math.hypot(
        line.x2.baseVal.value - line.x1.baseVal.value,
        line.y2.baseVal.value - line.y1.baseVal.value
      ).toFixed(1);
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = REDUCED ? '0' : len;
    });

    observeOnce([con], { threshold: 0.25 }, () => {
      lines.forEach(line => {
        line.style.strokeDashoffset = '0';
      });
    });

    const light = (skill, on) => {
      con.querySelectorAll('[data-skill="' + skill + '"]').forEach(node => node.classList.toggle('lit', on));
    };

    con.querySelectorAll('[data-skill]').forEach(node => {
      const skill = node.dataset.skill;
      node.addEventListener('mouseenter', () => light(skill, true));
      node.addEventListener('mouseleave', () => light(skill, false));
      node.addEventListener('focus', () => light(skill, true));
      node.addEventListener('blur', () => light(skill, false));
    });
  });
}


function initLightbox() {
  const dialog = document.getElementById('lightbox');
  if (!dialog) {
    return;
  }

  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('.lightbox-cap');
  const closeBtn = dialog.querySelector('.lightbox-x');

  document.body.addEventListener('click', event => {
    const trigger = event.target.closest('.zoomable');
    if (!trigger) {
      return;
    }

    event.preventDefault();
    image.src = trigger.currentSrc || trigger.src;
    image.alt = trigger.alt || '';
    caption.textContent = trigger.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || '';
    dialog.showModal();
  });

  closeBtn.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    image.src = '';
  });
}


function chipGroup(container, options, current, onPick) {
  container.textContent = '';
  options.forEach(opt => {
    const chip = el('button', 'bt-chip' + (opt.value === current ? ' on' : ''), opt.label);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(opt.value === current));
    chip.addEventListener('click', () => onPick(opt.value));
    container.appendChild(chip);
  });
}


function initLinks() {
  if (typeof LINKS !== 'object' || !LINKS) {
    return;
  }

  const safe = url => /^https:\/\/([a-z0-9-]+\.)*(spotify\.com|letterboxd\.com|boxd\.it)\//i.test(url || '');

  document.querySelectorAll('[data-link]').forEach(link => {
    const url = LINKS[link.dataset.link];
    if (safe(url)) {
      link.href = url;
      link.hidden = false;
    }
  });

  const holder = document.getElementById('spotify-embed');
  const match = (LINKS.spotifyPlaylist || '').match(/open\.spotify\.com\/(playlist|album|artist|track)\/([A-Za-z0-9]+)/);
  if (holder && match) {
    const frame = document.createElement('iframe');
    frame.src = 'https://open.spotify.com/embed/' + match[1] + '/' + match[2] + '?theme=0';
    frame.width = '100%';
    frame.height = '352';
    frame.loading = 'lazy';
    frame.title = 'Spotify playlist';
    frame.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
    holder.appendChild(frame);
    const soon = document.getElementById('spotify-soon');
    if (soon) {
      soon.hidden = true;
    }
  }
}


function initShows() {
  const rated = document.getElementById('shows-rated');
  if (!rated || typeof SHOWS === 'undefined') {
    return;
  }

  const upNext = document.getElementById('shows-want');
  const current = SHOWS.find(s => s.status === 'watching');
  const nowBox = document.getElementById('now-watching');
  if (current && nowBox) {
    document.getElementById('now-watching-title').textContent = current.title;
    nowBox.hidden = false;
  }
  const tabs = document.getElementById('shows-tabs');
  const kinds = ['all', ...new Set(SHOWS.map(s => s.kind).filter(Boolean))];
  let kind = 'all';

  const row = (show, withRating) => {
    const r = el('div', 'show-row');
    const title = el('span', 'show-title', show.title);
    if (show.kind) {
      title.appendChild(el('span', 'show-kind', show.kind));
    }
    r.appendChild(title);

    if (withRating) {
      const dots = el('span', 'show-rating');
      dots.setAttribute('aria-label', (show.rating || 0) + ' out of 5');
      for (let n = 1; n <= 5; n++) {
        dots.appendChild(el('i', n <= (show.rating || 0) ? 'on' : ''));
      }
      r.appendChild(dots);
    } else if (show.status === 'watching') {
      r.appendChild(el('span', 'show-status', 'Watching'));
    }
    return r;
  };

  const render = () => {
    if (kinds.length > 2) {
      chipGroup(tabs, kinds.map(k => ({ value: k, label: k === 'all' ? 'All' : k })), kind, value => {
        kind = value;
        render();
      });
    } else {
      tabs.textContent = '';
    }

    const pool = SHOWS.filter(s => kind === 'all' || s.kind === kind);
    const watched = pool.filter(s => s.status === 'watched').sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const queued = pool
      .filter(s => s.status === 'watching' || s.status === 'want')
      .sort((a, b) => (a.status === 'watching' ? 0 : 1) - (b.status === 'watching' ? 0 : 1));

    rated.textContent = '';
    upNext.textContent = '';
    watched.forEach(s => rated.appendChild(row(s, true)));
    queued.forEach(s => upNext.appendChild(row(s, false)));

    if (!watched.length) {
      rated.appendChild(el('p', 'soon', 'Coming soon.'));
    }
    if (!queued.length) {
      upNext.appendChild(el('p', 'soon', 'Coming soon.'));
    }
  };

  render();
}


document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initSnow();
  initCompass();
  initTopbar();
  initBurger();
  initActiveNav();
  initReveal();
  initImageReveal();
  initParallax();
  initDiscover();
  initConstellations();
  initLightbox();
  initShows();
  initLinks();
});
