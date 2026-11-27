/* =====================================================================
   SITE DATA — edit this block to update the site. See README-planned.md.
   - Flip a project to built:   status: 'built'
   - Swap a target for a real:  replace '—' with the number, remove target: true
   - Say how it was measured:   how: 'Logic analyzer · 20 tries'
   - Add a picture:             put the file in img/ and set src: 'img/name.jpg'
                                on one of the project's photos (first one is the main picture)
   - Add the code link:         repo: 'https://github.com/kabirvirk1206/...'
   - Add a demo video link:     video: 'https://...'
   ===================================================================== */

const PROJECTS = {

  /* ---------- FPGA ---------- */

  balisong: {
    area: 'fpga',
    title: 'Balisong CV Tracker',
    status: 'progress',
    tools: 'SystemVerilog · DE10-Lite (MAX 10) · OV7670 · SCCB · cocotb · SignalTap',
    photos: [
      { src: null, label: 'VGA output with markers on the tags' },
    ],
    repo: null,
    stats: [
      { v: '— fps', l: 'Frame rate', how: 'VSYNC count', target: true },
      { v: '— MHz', l: 'Fmax', how: 'TimeQuest', target: true },
      { v: '— px', l: 'Tracking error', target: true },
    ],
    bullets: [
      { t: 'An OV7670 camera streams pixels into a DE10-Lite (MAX 10), which finds 3 matte neon tags on a trainer balisong every frame and draws a marker on each plus a live stats HUD over VGA.' },
      { t: 'Configures the camera over SCCB with a hand-written I2C master and captures RGB565 on PCLK/HREF/VSYNC.' },
      { t: 'Thresholds each pixel per tag colour (tunable from the switches) and accumulates sum x, sum y and count per frame; a sequential divider gives the centroids. No framebuffer: a VGA frame does not fit in block RAM.' },
      { t: 'Keeps processing in the camera clock domain and passes only centroids to the 25 MHz VGA domain through synchronizers.' },
      { t: 'Verified in cocotb with synthetic Python frames against the C++ fixed-point golden model; debugged in SignalTap.' },
      { t: 'Sits on a printed rig: DE10-Lite tray, mast and tilting camera head.' },
    ],
  },

  vga: {
    area: 'fpga',
    title: 'VGA Generator',
    status: 'progress',
    tools: 'SystemVerilog · DE10-Lite (MAX 10) · PLL · cocotb · TimeQuest',
    photos: [
      { src: null, label: 'Monitor with test patterns, board in frame' },
    ],
    repo: null,
    stats: [
      { v: '25.175 MHz', l: 'Pixel clock', how: 'PLL from 50 MHz' },
      { v: '— MHz', l: 'Fmax', how: 'TimeQuest', target: true },
      { v: '—', l: 'cocotb tests passing', how: 'cocotb + Icarus', target: true },
    ],
    bullets: [
      { t: "Generates a stable 640 × 480 @ 60 Hz picture from custom SystemVerilog timing logic through the DE10-Lite's VGA DAC." },
      { t: 'A PLL synthesizes the 25.175 MHz pixel clock from 50 MHz.' },
      { t: 'Nested counters (800 × 525 total) drive active-low hsync/vsync and a visible-area signal.' },
      { t: 'Shows colour bars, a grid, a gradient and a checkerboard from the switches, plus a box moved by KEY0/KEY1, updated once per frame.' },
      { t: 'Every module has a cocotb testbench; timing is closed with an .sdc in Quartus TimeQuest. Balisong reuses this timing core.' },
      { t: 'Checked the 31.8 µs line and 16.7 ms frame on the logic analyzer.', target: true },
    ],
  },

  /* ---------- Embedded ---------- */

  stm32: {
    area: 'embedded',
    title: 'STM32 Actuator Bench',
    status: 'progress',
    tools: 'C · STM32F401 (RM0368, register level) · Timers · ADC + DMA · USART',
    photos: [
      { src: null, label: 'Bench: tach module, disc, laser, Nucleo wired up' },
    ],
    repo: null,
    stats: [
      { v: '—', l: 'Stall step rate', how: 'UART log', target: true },
      { v: 'RPM · mA', l: 'vs step rate', how: 'Python plot', target: true },
      { v: '1.0–2.0 ms', l: 'Servo pulse @ 50 Hz', how: 'Logic analyzer', target: true },
    ],
    bullets: [
      { t: "A Nucleo-F401RE drives a stepper and a servo, measures the stepper's real speed with a laser tachometer and its current with a shunt, and plots both against commanded step rate up to stall." },
      { t: 'TIM3 PWM drives the SG90 at 50 Hz with 1.0–2.0 ms pulses.' },
      { t: 'A timer interrupt steps the 28BYJ-48 through an 8-step half-step coil sequence on 4 GPIOs via a ULN2003; the interrupt rate sets the speed.' },
      { t: 'A printed 4-slot disc breaks the KY-008 beam into a laser receiver; TIM4 input capture timestamps each edge for RPM.' },
      { t: "The ADC with DMA reads a 1 Ω shunt in the motor supply's ground return for live current." },
      { t: 'USART2 streams CSV telemetry; Python plots RPM and current vs step rate. Every peripheral is written at register level from RM0368.' },
    ],
  },

  tank: {
    area: 'embedded',
    title: 'Conqueror Tank',
    status: 'progress',
    tools: 'Nucleo-F401RE · Arduino Uno · UART · VS1838B IR · KY-008 · Flipper Zero',
    photos: [
      { src: null, label: 'Driving from the Flipper, laser on' },
    ],
    repo: null,
    video: null,
    stats: [
      { v: '— ms', l: 'Button → motion', how: '20 tries', target: true },
      { v: '—/50', l: 'IR decode success', how: '50 presses', target: true },
      { v: '500 ms', l: 'Failsafe stop', target: true },
    ],
    bullets: [
      { t: "An Elegoo Conqueror with an STM32 co-processor added: the kit's Arduino Uno and shield keep driving the tracks, and a Nucleo-F401RE adds Flipper Zero IR control and a laser." },
      { t: "The STM32 decodes the Flipper's IR buttons from a VS1838B with timer input capture." },
      { t: "It sends drive commands like MOVE:100,80;FIRE:1 to the Arduino over UART; the Uno's 5 V TX comes back through a resistor divider." },
      { t: "The Arduino runs the kit's sketch plus a UART command parser, and stops the motors if no command arrives for 500 ms." },
      { t: 'The STM32 fires a KY-008 laser as the fire output.' },
    ],
  },

  rccar: {
    area: 'embedded',
    title: 'Arduino Radio Controlled Car',
    older: true,
    status: 'built',
    tools: 'Arduino · C++ · RF · Soldering',
    photos: [
      { src: '../../images/Radio.jpeg', label: 'The car' },
    ],
    repo: null,
    stats: [
      { v: '20 m', l: 'Range' },
      { v: '<5%', l: 'Packet loss' },
      { v: '<100 ms', l: 'Latency' },
    ],
    bullets: [
      { t: 'Fully wireless RC car with joystick control.' },
      { t: 'Two Arduinos + RF modules; custom C++ firmware.' },
      { t: 'Stable up to 20 m, <5% packet loss, <100 ms latency.' },
    ],
  },

  /* ---------- PCB ---------- */

  shield: {
    area: 'pcb',
    title: 'DE10-Lite Shield',
    status: 'progress',
    note: 'Ordered Nov 22 · JLC-assembled',
    tools: 'EasyEDA · JLCPCB assembly · TMP75 · IRLB8721 · Quartus',
    photos: [
      { src: null, label: 'Plugged into the DE10-Lite, angled' },
    ],
    repo: null,
    stats: [
      { v: '0', l: 'DRC errors', how: 'EasyEDA DRC' },
      { v: '4/4', l: 'Blocks brought up', how: 'Bring-up checklist', target: true },
      { v: '± °C', l: 'Temp vs thermometer', how: '5 readings', target: true },
    ],
    bullets: [
      { t: "An Arduino-form-factor shield based on Robert Feranec's Arduino shield design, redesigned in EasyEDA for the DE10-Lite's 3.3 V Arduino header and assembled by JLCPCB (2 layers, 1.6 mm, black mask, HASL)." },
      { t: 'Blocks: power LED, user LED, 2 servo headers, external power input with an EXT/5V power-select jumper, a MOSFET output, and a TMP75 I2C temperature sensor.' },
      { t: 'Made 3.3 V-safe: I2C pull-ups and the TMP75 on 3.3 V, and a logic-level MOSFET (IRLB8721, Vth 1.7 V) that 3.3 V fully switches; servos run on their own 5 V.' },
      { t: 'Custom silkscreen: name, "Temporizo, ergo sum.", "UWATERLOO EE".' },
      { t: 'Bring-up: LED, then TMP75 over I2C, then servo sweep, then MOSFET load; checking the 3.3 V and 5 V rails, I2C clock and 1.0–2.0 ms servo pulses.', target: true },
    ],
  },

  nfc: {
    area: 'pcb',
    title: 'NFC Business Card',
    status: 'progress',
    note: 'Ordered Nov 22 · JLC-assembled',
    tools: 'EasyEDA · NXP NT3H2111 · PCB antenna · NFC TagWriter + TagInfo',
    photos: [
      { src: null, label: 'Phone tapping it with the portfolio open' },
    ],
    repo: null,
    stats: [
      { v: 'Clean', l: 'DRC', how: '3 explained antenna/drill flags' },
      { v: '0.69 mm', l: 'Min clearance', how: 'EasyEDA DRC' },
      { v: '— cm', l: 'Read range', how: 'NXP TagInfo · 5 taps', target: true },
    ],
    bullets: [
      { t: "A business card built on Hack Club's Hacker Card jam: an NXP NT3H2111 tag with a PCB trace antenna, so a phone tap opens the portfolio. Designed in EasyEDA and assembled by JLCPCB (88.9 × 50.8 mm, 1.0 mm, black mask, HASL silver art)." },
      { t: 'Antenna on LA/LB with the inner coil end crossing out on a via and bottom trace; an LED lights from harvested field power.' },
      { t: 'Front: name, an Elder Futhark rune line, GitHub, LinkedIn, phone and email rows, a fading pentagon tiling and the NFC symbol; back: the NFC logo in the soldermask.' },
      { t: 'Holds an NDEF URL record written with NXP TagWriter, tested on iPhone and Android.', target: true },
    ],
  },

  /* ---------- Software ---------- */

  fixedpoint: {
    area: 'software',
    title: 'C++ Fixed-Point Sim',
    status: 'built',
    tools: 'C++ · GitHub Actions CI',
    photos: [
      { src: null, label: 'Error report output' },
    ],
    repo: null,
    stats: [
      { v: '0.5 LSB', l: 'Max error', how: '100,000 samples per op' },
      { v: '0.289 LSB', l: 'RMS error', how: '100,000 samples per op' },
      { v: '6', l: 'Q formats' },
    ],
    bullets: [
      { t: 'A Fixed<W,F> model with 5 rounding modes, saturate or wrap, and add, sub, mul, div and resize, tested in CI.' },
      { t: "It is the golden model the Balisong cocotb tests check the FPGA's maths against." },
      { t: 'Error measured over 100,000 samples per op across 6 Q formats (from error_report); CI passing.' },
      { t: 'Bit-exact match with the FPGA output in cocotb.', target: true },
    ],
  },

  serialscope: {
    area: 'software',
    title: 'SerialScope',
    status: 'built',
    tools: 'Python · WebSockets · Browser UI · Arduino Uno · ESP32 · Nucleo-F401RE',
    photos: [
      { src: '../../images/SerialScope.png', label: 'Dashboard with the live scope' },
    ],
    repo: 'https://github.com/kabirvirk1206/python_projects_assister',
    stats: [
      { v: '3', l: 'Boards supported' },
      { v: '10 / 12-bit', l: 'ADC (Uno / ESP32, STM32)' },
      { v: '~20/s', l: 'Scope rate', how: 'Before speed-up', target: false },
    ],
    bullets: [
      { t: 'A web dashboard for microcontroller bring-up: a live scope over websocket, clickable pinouts for the Uno, ESP32 and STM32, an I2C scanner and board auto-detect.' },
      { t: "It also plots the STM32 bench's UART telemetry." },
      { t: 'Raising the scope rate past the ~20 samples/s cap set by a 50 ms firmware delay, and timing the I2C scan of 0x01–0x7E.', target: true },
    ],
  },
};

const AREAS = {
  fpga: 'FPGA / ASIC',
  embedded: 'Embedded',
  pcb: 'PCB Design',
  software: 'Software',
};

// Co-ops first, then design teams.
const EXPERIENCE = {
  almag: {
    group: 'coop',
    company: 'almag',
    org: 'ALMAG Aluminum Inc.',
    full: '',
    role: 'Manufacturing Engineering Co-op',
    dates: 'Sep 2026 – Dec 2026',
    place: 'Brampton, ON',
    bullets: [
      { t: 'Maintained plant layout drawings in AutoCAD and SolidWorks and wrote standardized work instructions with start-up and shutdown procedures for plant workstations.' },
      { t: 'Learned CNC programming and applied it to streamline material flow through machining.' },
      { t: 'Learned to program a Yaskawa Motoman MH24 robot in INFORM with its PLC interface, then wrote training material and taught operators to run the automation cell.' },
    ],
  },
  talktomedi: {
    group: 'coop',
    company: 'talktomedi',
    org: 'TalkToMedi',
    full: 'WEAccelerate Azure & AI Stream',
    role: 'Systems Integration Co-op',
    dates: 'Jan 2026 – Apr 2026',
    place: 'Toronto, ON',
    bullets: [
      { t: 'Placed through the WEAccelerate Azure & AI stream after earning two Microsoft Azure certifications.' },
      { t: 'Wrote a Python web scraper pulling 1,000+ clinic records in under 2 minutes; built n8n workflows integrating GPT-5 and tested a Vapi AI voice agent.' },
    ],
  },
  uwasic: {
    group: 'team',
    company: 'uwasic',
    now: true,
    org: 'UWASIC',
    full: 'Waterloo ASIC Design Team · digital and analog',
    role: 'Digital and Analog Member',
    dates: 'Jan 2027 – Present',
    place: 'Waterloo, ON',
    status: 'progress',
    flow: ['SystemVerilog RTL', 'cocotb in CI', 'Tiny Tapeout · SKY130'],
    bullets: [
      { t: 'Digital: a SystemVerilog block (target: SPI + PWM peripheral) with a cocotb testbench, green in CI, toward Tiny Tapeout on SKY130. Analog track alongside.' },
      { t: 'Once taped out: "submitted for fabrication", test count, area (tiles), max clock.', target: true },
    ],
  },
  wargefs: {
    group: 'team',
    company: 'warg',
    org: 'WARG EFS',
    full: 'Waterloo Aerial Robotics Group · Embedded Flight Software',
    role: 'Embedded Flight Software (EFS)',
    dates: 'Sep 2026 – Dec 2026',
    place: 'Waterloo, ON',
    bullets: [
      { t: 'Embedded flight software: owning a firmware block end to end on the flight software.' },
    ],
  },
  wargelec: {
    group: 'team',
    company: 'warg',
    org: 'WARG Electrical',
    full: 'Waterloo Aerial Robotics Group',
    role: 'Electrical Team',
    dates: 'May 2026 – Aug 2026',
    place: 'Waterloo, ON',
    flow: ['ESP32-C3', '2× SX1280', 'RFX2401C PA/LNA'],
    photo: { src: '../../images/PCBldo-crop.png', label: 'LDO regulator PCB (Altium 3D view)' },
    bullets: [
      { t: 'Altium PCB design, schematic review and documentation on flight hardware.' },
      { t: 'Gemini ELRS clone work: RFX2401C PA/LNA path, 50 Ω traces, CRSF output.' },
      { t: "Designed an LDO regulator PCB in the onboarding bootcamp: TCR2EF33 in SOT-25 with custom symbols and footprints, DC bias checked with Murata's SimSurfing, 0 DRC violations, fabricated at JLCPCB and measured 3.28 V against a 3.30 V target." },
    ],
  },
};

// Order of the project areas for each résumé focus. FPGA first is the default.
const FOCUS = {
  fpga: {
    label: 'FPGA / ASIC',
    resume: 'resumes/fpgal_V3.pdf',
    areas: ['fpga', 'embedded', 'pcb', 'software'],
  },
  embedded: {
    label: 'Embedded Firmware',
    resume: 'resumes/embeddedl_V3.pdf',
    areas: ['embedded', 'fpga', 'software', 'pcb'],
  },
  pcb: {
    label: 'Hardware / PCB',
    resume: 'resumes/pcb_designl_V3.pdf',
    areas: ['pcb', 'embedded', 'fpga', 'software'],
  },
};
const DEFAULT_FOCUS = 'fpga';
const EXPERIENCE_ORDER = ['almag', 'talktomedi', 'uwasic', 'wargefs', 'wargelec'];

// One block per company; roles inside it show newest first, like LinkedIn.
const COMPANIES = {
  almag:      { name: 'ALMAG Aluminum Inc.', sub: 'Brampton, ON', span: 'Sep 2026 – Dec 2026', mark: 'A' },
  talktomedi: { name: 'TalkToMedi', sub: 'Toronto, ON · WEAccelerate Azure & AI Stream', span: 'Jan 2026 – Apr 2026', mark: 'T' },
  uwasic:     { name: 'UWASIC', sub: 'Waterloo ASIC Design Team · Waterloo, ON', span: 'Jan 2027 – Present', mark: 'U' },
  warg:       { name: 'WARG', sub: 'Waterloo Aerial Robotics Group · Waterloo, ON', span: 'May 2026 – Dec 2026', mark: 'W', move: 'Moved from electrical to embedded' },
};

/* ===================================================================== */

(function () {
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  function badge(status, note) {
    var b = status === 'built' ? '<p class="badge built">Built</p>' : '<p class="badge wip">In progress</p>';
    return note ? '<div class="badges">' + b + '<p class="badge-note">' + esc(note) + '</p></div>' : b;
  }

  function stats(list) {
    if (!list || !list.length) return '';
    return '<div class="stats n' + Math.min(list.length, 3) + '">' + list.map(function (s) {
      return '<div' + (s.target ? ' class="tgt"' : '') + '><b>' + esc(s.v) + '</b><span>' + esc(s.l) + (s.target ? ' <i>Target</i>' : '') + '</span>' + (s.how ? '<small class="how">' + esc(s.how) + '</small>' : '') + '</div>';
    }).join('') + '</div>';
  }

  function bullets(list) {
    return '<ul class="dots">' + list.map(function (b) {
      return '<li>' + esc(b.t) + (b.target ? ' <i class="tg">Target</i>' : '') + '</li>';
    }).join('') + '</ul>';
  }

  function slot(ph, title, i) {
    if (ph.src) {
      return '<img class="zoom" src="' + ph.src + '" alt="' + esc(title + ': ' + ph.label) + '" loading="eager" />';
    }
    return '<div class="ph-in" role="img" aria-label="' + esc(title + ': ' + ph.label + ' (photo coming soon)') + '"><span>Photo coming soon</span><p>' + esc(ph.label) + '</p></div>';
  }

  function media(id, p) {
    var photos = p.photos && p.photos.length ? p.photos : [{ src: null, label: p.title }];
    var main = photos[0];
    var thumbs = photos.length > 1 ? '<div class="thumbs" role="tablist" aria-label="' + esc(p.title) + ' pictures">' + photos.map(function (ph, i) {
      return '<button type="button" class="thumb' + (i === 0 ? ' on' : '') + (ph.src ? '' : ' empty') + '" data-proj="' + id + '" data-i="' + i + '" aria-label="' + esc(ph.label) + '">' +
        (ph.src ? '<img src="' + ph.src + '" alt="" />' : '<span>' + esc(ph.label) + '</span>') + '</button>';
    }).join('') + '</div>' : '';
    return '<div class="gallery"><div class="pmedia' + (main.src ? '' : ' ph') + (main.light ? ' light' : '') + '" data-main="' + id + '">' + slot(main, p.title, 0) +
      '<p class="cap">' + esc(main.label) + '</p></div>' + thumbs + '</div>';
  }

  function links(p) {
    var out = [];
    out.push(p.repo ? '<a class="more" href="' + p.repo + '" target="_blank" rel="noopener noreferrer">Code <em>→</em></a>' : '<span class="more off">Code: repo coming</span>');
    if (p.video) out.push('<a class="more" href="' + p.video + '" target="_blank" rel="noopener noreferrer">Demo video <em>→</em></a>');
    return '<div class="plinks">' + out.join('') + '</div>';
  }

  function projectCard(id, p, featured) {
    var hasTarget = p.bullets.some(function (b) { return b.target; }) || (p.stats || []).some(function (s) { return s.target; });
    return '<article class="' + (featured ? 'feat' : 'card') + ' rv" id="proj-' + id + '">' +
      media(id, p) +
      '<div class="' + (featured ? 'feat-body' : 'card-body') + '">' +
        badge(p.status, p.older ? 'Older build' : p.note) +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="ptools">' + esc(p.tools) + '</p>' +
        stats(p.stats) +
        (featured ? bullets(p.bullets) : '<details><summary>Details</summary>' + bullets(p.bullets) + '</details>') +
        (hasTarget ? '<p class="tgt-note">Numbers marked Target are not measured yet.</p>' : '') +
        links(p) +
      '</div></article>';
  }

  function roleItem(id, x) {
    return '<li class="role' + (x.now ? ' is-now' : '') + '" id="xp-' + id + '">' +
      '<p class="role-date">' + (x.now ? '<b class="now-tag">Now</b>' : '') + esc(x.dates) + (x.status === 'progress' ? ' <span class="badge wip">In progress</span>' : '') + '</p>' +
      '<h4>' + esc(x.role) + '</h4>' +
      (x.photo ? '<figure class="xp-photo"><img class="zoom" src="' + x.photo.src + '" alt="' + esc(x.photo.label) + '" /><figcaption>' + esc(x.photo.label) + '</figcaption></figure>' : '') +
      (x.flow ? '<div class="flow">' + x.flow.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('<i></i>') + '</div>' : '') +
      bullets(x.bullets) +
      '</li>';
  }

  function companyBlock(key, roleIds) {
    var c = COMPANIES[key];
    var items = roleIds.map(function (id) { return roleItem(id, EXPERIENCE[id]); });
    if (c.move && items.length > 1) items.splice(1, 0, '<li class="role-move" aria-hidden="true"><span>' + esc(c.move) + '</span></li>');
    return '<article class="co rv">' +
      '<header class="co-head"><span class="co-mark" aria-hidden="true">' + esc(c.mark) + '</span>' +
      '<div><h3>' + esc(c.name) + '</h3><p class="co-sub">' + esc(c.sub) + '</p></div>' +
      '<p class="co-span">' + esc(c.span) + '<span>' + roleIds.length + (roleIds.length === 1 ? ' role' : ' roles') + '</span></p></header>' +
      '<ol class="roles">' + items.join('') + '</ol></article>';
  }

  var projRoot = document.getElementById('project-list');
  var xpRoot = document.getElementById('xp-list');
  var tabs = document.querySelectorAll('[data-focus]');
  var resumeLinks = document.querySelectorAll('[data-resume]');

  function render(key, animate) {
    var f = FOCUS[key] || FOCUS[DEFAULT_FOCUS];
    var first = true;
    projRoot.innerHTML = f.areas.map(function (area) {
      var ids = Object.keys(PROJECTS).filter(function (id) { return PROJECTS[id].area === area; });
      if (!ids.length) return '';
      var html = '<div class="area" id="area-' + area + '"><p class="area-head rv"><span>' + esc(AREAS[area]) + '</span><b>' + ids.length + (ids.length === 1 ? ' project' : ' projects') + '</b></p>';
      if (first) {
        html += projectCard(ids[0], PROJECTS[ids[0]], true);
        ids = ids.slice(1);
        first = false;
      }
      if (ids.length) html += '<div class="grid">' + ids.map(function (id) { return projectCard(id, PROJECTS[id], false); }).join('') + '</div>';
      return html + '</div>';
    }).join('');
    var groups = [['coop', 'Co-op experience'], ['team', 'Design teams']];
    xpRoot.innerHTML = groups.map(function (g) {
      var ids = EXPERIENCE_ORDER.filter(function (id) { return EXPERIENCE[id].group === g[0]; });
      var order = [], byCo = {};
      ids.forEach(function (id) { var k = EXPERIENCE[id].company; if (!byCo[k]) { byCo[k] = []; order.push(k); } byCo[k].push(id); });
      return '<p class="area-head xp-head rv"><span>' + g[1] + '</span><b>' + order.length + '</b></p>' +
        '<div class="co-list">' + order.map(function (k) { return companyBlock(k, byCo[k]); }).join('') + '</div>';
    }).join('');
    tabs.forEach(function (t) {
      var on = t.dataset.focus === key;
      t.classList.toggle('on', on);
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    resumeLinks.forEach(function (a) { a.href = f.resume; });
    document.querySelectorAll('[data-focus-label]').forEach(function (el) { el.textContent = f.label; });
    if (window.kvMotion) window.kvMotion(document);
    observe(animate);
    hookZoom();
    statsCount();
  }

  // picture thumbnails swap the main picture
  projRoot.addEventListener('click', function (e) {
    var b = e.target.closest('.thumb');
    if (!b) return;
    var p = PROJECTS[b.dataset.proj], ph = p.photos[+b.dataset.i];
    var main = projRoot.querySelector('[data-main="' + b.dataset.proj + '"]');
    main.className = 'pmedia' + (ph.src ? '' : ' ph') + (ph.light ? ' light' : '');
    main.innerHTML = slot(ph, p.title, +b.dataset.i) + '<p class="cap">' + esc(ph.label) + '</p>';
    b.parentNode.querySelectorAll('.thumb').forEach(function (t) { t.classList.toggle('on', t === b); });
    hookZoom();
  });

  // reveal on scroll
  var io = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observe(animate) {
    var items = document.querySelectorAll('.rv:not(.in)');
    if (!io || animate === false) { items.forEach(function (el) { el.classList.add('in'); }); return; }
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { items.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  }

  // count-up stats
  var so = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); so.unobserve(e.target); } });
  }, { threshold: 0.6 }) : null;
  function countUp(el) {
    var txt = el.textContent, m = txt.match(/^[<~]?([\d,.]+)/);
    if (!m) return;
    var raw = m[1], target = parseFloat(raw.replace(/,/g, '')), dec = (raw.split('.')[1] || '').length, comma = raw.indexOf(',') > -1, t0 = null;
    function fmt(v) { var s = v.toFixed(dec); return comma ? Number(s).toLocaleString('en-US') : s; }
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / 900, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = txt.replace(raw, fmt(target * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
    }
    requestAnimationFrame(step);
  }
  function statsCount() { if (so) document.querySelectorAll('.stats b').forEach(function (b) { so.observe(b); }); }

  // lightbox
  var lb = document.getElementById('lightbox');
  function hookZoom() {
    if (!lb || !lb.showModal) return;
    document.querySelectorAll('img.zoom').forEach(function (img) {
      if (img.dataset.z) return; img.dataset.z = 1;
      img.addEventListener('click', function () {
        lb.querySelector('img').src = img.src; lb.querySelector('img').alt = img.alt;
        lb.querySelector('.lb-cap').textContent = img.alt; lb.showModal();
      });
    });
  }
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-x')) lb.close(); });

  // focus switch + ?focus= URL parameter
  var params = new URLSearchParams(location.search);
  var start = FOCUS[params.get('focus')] ? params.get('focus') : DEFAULT_FOCUS;
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var key = t.dataset.focus;
      var url = new URL(location.href); url.searchParams.set('focus', key);
      try { history.replaceState(null, '', url); } catch (e) {}
      projRoot.classList.add('swap'); xpRoot.classList.add('swap');
      setTimeout(function () { render(key, false); projRoot.classList.remove('swap'); xpRoot.classList.remove('swap'); }, reduce ? 0 : 180);
    });
  });
  render(start, true);

  // skill row hover → highlight project
  document.querySelectorAll('.srow a[href^="#"]').forEach(function (a) {
    var row = a.closest('.srow');
    row.addEventListener('mouseenter', function () { var t = document.querySelector(a.getAttribute('href')); if (t) t.classList.add('lit'); });
    row.addEventListener('mouseleave', function () { var t = document.querySelector(a.getAttribute('href')); if (t) t.classList.remove('lit'); });
  });

  // nav section indicator + mobile menu
  var spy = document.getElementById('spy'), sections = document.querySelectorAll('[data-spy]'), links2 = document.querySelectorAll('.nav-links a[href^="#"]');
  function upd() {
    var y = window.scrollY + window.innerHeight * 0.35, cur = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) cur = s; });
    if (spy) spy.innerHTML = '<b>' + cur.dataset.spy + '</b> · <span>' + cur.dataset.label + '</span>';
    links2.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id); });
  }
  window.addEventListener('scroll', upd, { passive: true }); upd();
  var burger = document.getElementById('burger'), nav = document.getElementById('navlinks');
  if (burger) {
    burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') nav.classList.remove('open'); });
  }
})();
