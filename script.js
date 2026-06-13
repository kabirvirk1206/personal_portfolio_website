class BonfireAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.W = 64;
    this.H = 32;
    canvas.width  = this.W;
    canvas.height = this.H;
    this.flameFrame = 0;
    this.frameTimer = 0;
    this.FRAME_MS   = 130;
    this.smoke  = [];
    this.embers = [];
    this.lastT  = 0;
    this.raf    = null;
  }

  start() {
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(t => this._tick(t));
  }

  stop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
  }

  _tick(t) {
    const dt = Math.min(t - this.lastT, 50);
    this.lastT = t;
    this.frameTimer += dt;
    if (this.frameTimer >= this.FRAME_MS) {
      this.frameTimer = 0;
      this.flameFrame = (this.flameFrame + 1) & 3;
    }
    this._updateSmoke(dt);
    this._updateEmbers(dt);
    this._draw();
    this.raf = requestAnimationFrame(t => this._tick(t));
  }

  _spawnSmoke() {
    if (Math.random() < 0.10) {
      this.smoke.push({
        x: 19 + (Math.random() - 0.5) * 4,
        y: 9,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.3 + Math.random() * 0.25),
        alpha: 0.4 + Math.random() * 0.2,
        decay: 0.005 + Math.random() * 0.004,
      });
    }
  }

  _updateSmoke(dt) {
    this._spawnSmoke();
    const k = dt / 16;
    this.smoke = this.smoke.filter(p => {
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.vx += (Math.random() - 0.5) * 0.04 * k;
      p.alpha -= p.decay * k;
      return p.alpha > 0;
    });
  }

  _spawnEmber() {
    if (Math.random() < 0.07) {
      this.embers.push({
        x: 19 + (Math.random() - 0.5) * 8,
        y: 21 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.6 + Math.random() * 0.8),
        alpha: 1,
        hot: Math.random() < 0.5,
        decay: 0.012 + Math.random() * 0.016,
      });
    }
  }

  _updateEmbers(dt) {
    this._spawnEmber();
    const k = dt / 16;
    this.embers = this.embers.filter(p => {
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.vy += 0.018 * k;
      p.vx += (Math.random() - 0.5) * 0.08 * k;
      p.alpha -= p.decay * k;
      return p.alpha > 0;
    });
  }

  _draw() {
    const { ctx, W, H } = this;

    ctx.fillStyle = '#16121e';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#1e1a28';
    ctx.fillRect(0, 0, W, 24);

    ctx.fillStyle = '#0c0a14';
    for (let y = 6; y < 24; y += 7) {
      ctx.fillRect(0, y, W, 1);
    }

    ctx.fillStyle = '#0c0a14';
    for (let x = 0;  x < W; x += 10) { ctx.fillRect(x, 0,  1, 6); }
    for (let x = 5;  x < W; x += 10) { ctx.fillRect(x, 7,  1, 6); }
    for (let x = 2;  x < W; x += 10) { ctx.fillRect(x, 14, 1, 6); }
    for (let x = 8;  x < W; x += 10) { ctx.fillRect(x, 21, 1, 2); }

    ctx.fillStyle = '#1c1610';
    ctx.fillRect(0, 24, W, H - 24);
    ctx.fillStyle = '#0a0806';
    ctx.fillRect(0, 24, W, 1);

    ctx.fillStyle = 'rgba(160,70,0,0.22)';
    ctx.fillRect(8, 25, 24, H - 25);

    ctx.fillStyle = 'rgba(140,60,0,0.12)';
    ctx.fillRect(6, 8, 28, 16);

    this._drawKnight(40, 4);
    this._drawBonfireBase(10, 24);
    this._drawFlame(12, 24);

    this.smoke.forEach(p => {
      ctx.fillStyle = `rgba(80,65,50,${p.alpha * 0.6})`;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    });

    this.embers.forEach(p => {
      if (p.hot) {
        ctx.fillStyle = `rgba(255,220,40,${p.alpha})`;
      } else {
        ctx.fillStyle = `rgba(255,110,0,${p.alpha})`;
      }
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    });
  }

  _drawKnight(ox, oy) {
    const K = [
      [0,0,0,1,3,4,4,3,1,0,0,0,0,0],
      [0,0,1,3,4,5,5,4,3,1,0,0,0,0],
      [0,0,1,3,5,6,5,5,3,1,0,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,1,3,4,4,4,4,3,1,0,0,0,0],
      [0,1,2,3,3,3,3,3,2,1,0,0,0,0],
      [1,2,4,5,4,3,3,4,5,4,2,1,0,0],
      [1,3,5,6,4,3,3,4,6,5,3,1,0,0],
      [0,1,3,4,4,4,4,4,4,3,1,0,0,0],
      [0,1,4,5,4,4,4,4,5,3,1,0,0,0],
      [0,1,3,4,5,4,4,5,4,3,1,0,0,0],
      [0,1,3,3,4,4,4,4,3,3,1,0,0,0],
      [0,1,2,3,3,4,4,3,3,2,1,0,0,0],
      [0,0,1,3,4,4,4,4,3,1,0,0,0,0],
      [0,1,3,4,4,4,3,2,0,0,0,0,0,0],
      [1,3,4,4,3,3,2,0,0,0,0,0,0,0],
      [1,3,4,4,3,2,0,0,0,0,0,0,0,0],
      [1,3,3,3,2,1,0,0,0,0,0,0,0,0],
      [0,2,3,3,2,0,0,0,0,0,0,0,0,0],
      [0,2,3,2,1,0,0,0,0,0,0,0,0,0],
      [0,1,2,2,1,0,0,0,0,0,0,0,0,0],
      [1,2,3,2,2,1,0,0,0,0,0,0,0,0],
    ];
    const C = ['', '#0e0e14', '#1e2030', '#2e3248', '#444a62', '#5e667e', '#828a9e'];
    const ctx = this.ctx;
    K.forEach((row, dy) => {
      row.forEach((v, dx) => {
        if (v) {
          ctx.fillStyle = C[v];
          ctx.fillRect(ox + dx, oy + dy, 1, 1);
        }
      });
    });
  }

  _drawBonfireBase(ox, oy) {
    const B = [
      [0,0,0,0,0,4,5,4,0,0,0,0,0,0],
      [0,0,0,0,0,4,5,4,0,0,0,0,0,0],
      [0,0,0,0,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,0,4,5,4,0,0,0,0,0,0],
      [0,0,1,2,3,3,3,3,2,1,0,0,0,0],
      [0,1,2,3,2,2,2,2,3,2,1,0,0,0],
      [1,2,3,2,3,2,2,3,2,3,2,1,0,0],
      [1,1,2,2,2,2,2,2,2,2,1,1,0,0],
    ];
    const C = ['', '#160a02', '#2a1408', '#4a2a12', '#2c2c24', '#484840'];
    const ctx = this.ctx;
    B.forEach((row, dy) => {
      row.forEach((v, dx) => {
        if (v) {
          ctx.fillStyle = C[v];
          ctx.fillRect(ox + dx, oy + dy, 1, 1);
        }
      });
    });
  }

  _drawFlame(ox, oy) {
    const FRAMES = [
      [
        [0,0,0,0,7,0,0,0,0,0],
        [0,0,0,6,7,6,0,0,0,0],
        [0,0,0,6,7,5,6,0,0,0],
        [0,0,5,6,6,5,5,4,0,0],
        [0,0,5,6,6,5,5,4,0,0],
        [0,3,4,5,6,6,5,4,3,0],
        [0,3,4,5,6,5,5,4,3,0],
        [2,3,4,5,5,6,5,4,3,2],
        [2,3,4,4,5,5,4,4,3,2],
        [1,2,3,4,4,5,4,3,2,1],
        [1,2,3,4,4,4,4,3,2,1],
        [1,2,2,3,4,4,3,2,2,1],
        [0,1,2,2,3,3,2,2,1,0],
        [0,0,1,2,2,2,2,1,0,0],
      ],
      [
        [0,0,0,7,0,0,0,0,0,0],
        [0,0,6,7,6,0,0,0,0,0],
        [0,0,6,7,5,0,0,0,0,0],
        [0,5,6,6,5,4,0,0,0,0],
        [0,5,6,6,5,4,0,0,0,0],
        [3,4,5,6,5,4,3,0,0,0],
        [3,4,5,6,5,4,3,0,0,0],
        [2,3,5,5,5,4,3,2,0,0],
        [2,3,4,5,5,4,3,2,0,0],
        [1,2,3,4,5,4,3,2,1,0],
        [1,2,3,4,4,4,3,2,1,0],
        [1,2,2,3,4,3,2,2,1,0],
        [0,1,2,2,3,2,2,1,0,0],
        [0,0,1,2,2,2,1,0,0,0],
      ],
      [
        [0,0,7,0,0,7,0,0,0,0],
        [0,6,7,6,6,7,6,0,0,0],
        [0,6,7,5,5,6,5,6,0,0],
        [0,5,6,6,5,6,5,4,0,0],
        [0,5,6,6,5,6,5,4,0,0],
        [3,4,5,6,6,5,5,4,3,0],
        [3,4,5,5,6,5,5,4,3,0],
        [2,3,4,5,5,6,5,4,3,2],
        [2,3,4,4,5,5,4,4,3,2],
        [1,2,3,4,4,5,4,3,2,1],
        [1,2,3,4,4,4,4,3,2,1],
        [1,2,2,3,4,4,3,2,2,1],
        [0,1,2,2,3,3,2,2,1,0],
        [0,0,1,2,2,2,2,1,0,0],
      ],
      [
        [0,0,0,0,0,7,0,0,0,0],
        [0,0,0,0,6,7,6,0,0,0],
        [0,0,0,0,5,7,6,0,0,0],
        [0,0,0,4,5,6,6,5,0,0],
        [0,0,0,4,5,6,6,5,0,0],
        [0,0,3,4,5,6,5,4,3,0],
        [0,0,3,4,5,5,5,4,3,0],
        [2,3,3,4,5,5,5,3,3,2],
        [2,3,4,4,5,5,4,4,3,2],
        [1,2,3,4,4,5,4,3,2,1],
        [1,2,3,4,4,4,4,3,2,1],
        [1,2,2,3,4,4,3,2,2,1],
        [0,1,2,2,3,3,2,2,1,0],
        [0,0,1,2,2,2,2,1,0,0],
      ],
    ];
    const C = ['', '#6a0800', '#b82000', '#e64400', '#ff7700', '#ffaa00', '#ffcc44', '#fff480'];
    const frame = FRAMES[this.flameFrame];
    const rows  = frame.length;
    const ctx   = this.ctx;
    frame.forEach((row, dy) => {
      row.forEach((v, dx) => {
        if (v) {
          ctx.fillStyle = C[v];
          ctx.fillRect(ox + dx, oy - rows + dy, 1, 1);
        }
      });
    });
  }
}


const PREVIEWS = {
  about: {
    rune: 'ᚨ',
    title: 'LORE',
    highlights: [
      { label: 'EE @ Waterloo',       desc: 'Electrical Engineering co-op, graduating Dec 2030' },
      { label: 'PCB Design',          desc: 'Laying out boards in Altium Designer with WARG' },
      { label: 'Embedded Firmware',   desc: 'C/C++ and MicroPython on Arduino and ESP32' },
      { label: 'RF & Wireless',       desc: 'Sub-GHz experiments with Flipper Zero and custom modules' },
    ],
  },
  education: {
    rune: 'ᛟ',
    title: 'COVENANT',
    highlights: [
      { label: 'University of Waterloo', desc: 'BASc Electrical Engineering (co-op), 2024-2030' },
      { label: 'ECE Coursework',         desc: 'Programming, digital circuits, linear circuits, project studio' },
      { label: 'H.M. Braithwaite SS',    desc: 'OSSD, 2020-2024' },
      { label: 'Extracurriculars',       desc: 'Robotics Club, Royal Canadian Air Cadets, Flight Sergeant' },
    ],
  },
  experience: {
    rune: 'ᛞ',
    title: 'EMBER',
    highlights: [
      { label: 'WARG Electrical',     desc: 'LDO PCB in Altium, schematic review, UAV competition design' },
      { label: 'TalkToMedi Intern',   desc: 'Scraped 1,000+ clinic records, built n8n automations, Azure certs' },
      { label: 'Tutorax Tutor',       desc: '20+ students, 83% return rate, Math and Science' },
    ],
  },
  projects: {
    rune: 'ᛉ',
    title: 'ESTUS',
    highlights: [
      { label: 'LDO Voltage Regulator', desc: 'Full Altium PCB design flow, zero DRC violations, DC bias verified' },
      { label: 'SerialScope',           desc: 'Python and HTML/CSS/JS hardware diagnostic tool, live waveform visualization' },
      { label: 'Arduino RC Car',        desc: 'Two-Arduino RF system, stable 20m, under 100ms latency, custom PCB' },
    ],
  },
  skills: {
    rune: 'ᛇ',
    title: 'ARSENAL',
    highlights: [
      { label: 'Hardware and EDA',  desc: 'Altium Designer, Quartus, circuit design, soldering, oscilloscope, multimeter' },
      { label: 'Languages',         desc: 'C/C++, Verilog, Python, JavaScript, HTML/CSS, MicroPython, Bash' },
      { label: 'Platforms',         desc: 'Arduino, ESP32, Flipper Zero' },
      { label: 'Tools',             desc: 'Git, Linux, VS Code, JetBrains, n8n, Cursor' },
    ],
  },
  personal: {
    rune: 'ᚱ',
    title: 'HOLLOW',
    highlights: [
      { label: 'Coming Soon', desc: 'Life outside the bench, page under construction' },
    ],
  },
  contact: {
    rune: 'ᛜ',
    title: 'SUMMON',
    highlights: [
      { label: 'Personal Email', desc: 'kabirvirk1206@gmail.com' },
      { label: 'Waterloo Email', desc: 'kabir.virk@uwaterloo.ca' },
      { label: 'LinkedIn',       desc: 'linkedin.com/in/kabir-virk' },
      { label: 'GitHub',         desc: 'github.com/kabirvirk1206' },
    ],
  },
  resume: {
    rune: 'ᛏ',
    title: 'SCROLL',
    highlights: [
      { label: 'Full Resume',      desc: 'Complete work history, projects, and skills as a PDF' },
      { label: 'Opens in new tab', desc: 'Google Drive link, always the latest version' },
    ],
  },
};


class MenuController {
  constructor() {
    this.menu      = document.getElementById('ds-menu');
    this.panel     = document.getElementById('preview-panel');
    this.inner     = document.getElementById('preview-inner');
    this.overlay   = document.getElementById('fog-overlay');
    this.items     = Array.from(this.menu.querySelectorAll('.ds-item'));
    this.activeIdx = -1;
    this.hideTimer = null;
    this._bind();
  }

  _bind() {
    this.items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        clearTimeout(this.hideTimer);
        this._setActive(i);
        const key = item.dataset.page || item.dataset.key || 'resume';
        this._showPreview(key);
      });

      item.addEventListener('mouseleave', () => {
        this.hideTimer = setTimeout(() => this._clearActive(), 200);
      });

      item.addEventListener('click', e => {
        if (item.getAttribute('target') === '_blank') {
          return;
        }
        e.preventDefault();
        this._navigate(item);
      });

      item.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this._moveFocus(1);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          this._moveFocus(-1);
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._navigate(item);
        }
      });
    });

    this.panel.addEventListener('mouseenter', () => clearTimeout(this.hideTimer));
    this.panel.addEventListener('mouseleave', () => {
      this.hideTimer = setTimeout(() => this._clearActive(), 200);
    });
  }

  _setActive(i) {
    this.items.forEach((el, j) => el.classList.toggle('active', j === i));
    this.activeIdx = i;
  }

  _clearActive() {
    this.panel.classList.remove('visible');
    this.items.forEach(el => el.classList.remove('active'));
    this.activeIdx = -1;
  }

  _moveFocus(dir) {
    const next = Math.max(0, Math.min(this.items.length - 1, this.activeIdx + dir));
    this.items[next].focus();
    this._setActive(next);
    const key = this.items[next].dataset.page || this.items[next].dataset.key || 'resume';
    this._showPreview(key);
  }

  _showPreview(key) {
    const d = PREVIEWS[key];
    if (!d) return;
    const lines = (d.highlights || []).map(h => {
      return `<div class="preview-line">
        <span class="preview-line-label">${h.label}</span>
        <span class="preview-line-desc">${h.desc}</span>
      </div>`;
    }).join('');
    this.inner.innerHTML = `
      <div class="preview-header">
        <span class="preview-rune">${d.rune}</span>
        <span class="preview-title">${d.title}</span>
      </div>
      <div class="preview-lines">${lines}</div>
    `;
    void this.inner.offsetWidth;
    this.panel.classList.add('visible');
  }

  _navigate(item) {
    const page = item.dataset.page;
    if (!page) return;

    item.classList.add('selecting');
    setTimeout(() => item.classList.remove('selecting'), 450);

    this.overlay.style.transition = 'opacity 0.32s ease';
    this.overlay.style.opacity = '1';
    this.overlay.style.pointerEvents = 'auto';

    setTimeout(() => {
      document.getElementById('landing').classList.add('hidden');
      document.querySelectorAll('.page-view').forEach(v => { v.hidden = true; });
      const target = document.getElementById('page-' + page);
      if (target) {
        target.hidden = false;
        target.querySelector('.page-body')?.scrollTo({ top: 0 });
      }
      this.overlay.style.opacity = '0';
      setTimeout(() => { this.overlay.style.pointerEvents = 'none'; }, 360);
    }, 330);
  }
}


function initEmberParticles() {
  const container = document.getElementById('ember-bg');
  if (!container) return;
  for (let i = 0; i < 22; i++) {
    const el     = document.createElement('div');
    el.className = 'ember-particle';
    const left   = 36 + Math.random() * 28;
    const top    = 5 + Math.random() * 30;
    const dur    = 2 + Math.random() * 3.5;
    const delay  = Math.random() * 5;
    const dx     = ((Math.random() - 0.5) * 50).toFixed(0);
    el.style.cssText = `
      left: ${left}%;
      top: ${top}%;
      --dur: ${dur}s;
      --delay: ${delay}s;
      --dx: ${dx}px;
      width: ${Math.random() < 0.5 ? 2 : 1}px;
      height: ${Math.random() < 0.5 ? 2 : 1}px;
      background: ${Math.random() < 0.6 ? '#e8a030' : '#c8813a'};
    `;
    container.appendChild(el);
  }
}


function initLightbox() {
  const dialog   = document.getElementById('photo-lightbox');
  if (!dialog) return;
  const dlgImg   = dialog.querySelector('.photo-lightbox-img');
  const dlgCap   = dialog.querySelector('.photo-lightbox-caption');
  const closeBtn = dialog.querySelector('.photo-lightbox-close');
  const panel    = dialog.querySelector('.photo-lightbox-panel');

  function captionFor(el) {
    return el.closest('.pcard')?.querySelector('.pcard-title')?.textContent?.trim() || '';
  }

  function openLightbox(el) {
    const img = el.querySelector('img');
    if (!img?.src || !dlgImg) return;
    dlgImg.src = img.currentSrc || img.src;
    dlgImg.alt = img.alt || '';
    const cap = captionFor(el);
    if (dlgCap) {
      dlgCap.textContent = cap;
      dlgCap.hidden = !cap;
    }
    dialog.showModal();
    dlgImg.focus({ preventScroll: true });
  }

  document.body.addEventListener('click', e => {
    const z = e.target.closest('.zoomable');
    if (z) { e.preventDefault(); openLightbox(z); }
  });

  document.body.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target?.classList?.contains('zoomable')) {
      e.preventDefault();
      openLightbox(e.target);
    }
  });

  closeBtn?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', e => {
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => { if (dlgImg) dlgImg.src = ''; });
}


function initReturnLink() {
  const overlay = document.getElementById('fog-overlay');
  const landing = document.getElementById('landing');
  if (!landing) return;

  document.body.addEventListener('click', e => {
    const btn = e.target.closest('[data-return]');
    if (!btn) return;
    e.preventDefault();

    overlay.style.transition = 'opacity 0.28s ease';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';

    setTimeout(() => {
      document.querySelectorAll('.page-view').forEach(v => { v.hidden = true; });
      landing.classList.remove('hidden');
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 320);
    }, 260);
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bonfire-canvas');
  if (canvas) new BonfireAnimation(canvas).start();
  initEmberParticles();
  new MenuController();
  initLightbox();
  initReturnLink();
});
