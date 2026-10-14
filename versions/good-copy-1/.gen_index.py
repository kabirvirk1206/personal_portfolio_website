import math, random, re
from pathlib import Path

RESUME = 'https://drive.google.com/file/d/1NVRbMFcc0rS-0azV-CsoJZhcbFdvMBlc/view?usp=sharing'
FONTS = ('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900'
         '&amp;family=Barlow+Condensed:wght@300;400;500;600'
         '&amp;family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400'
         '&amp;family=JetBrains+Mono:wght@400;500&amp;family=Noto+Sans+Runic&amp;display=swap')

def head(title, rune):
    return '''      <div class="sec-head reveal">
        <span class="sec-dot" aria-hidden="true"></span>
        <h2 class="sec-title">%s</h2>
        <span class="sec-dash" aria-hidden="true">—</span>
        <span class="sec-runes" aria-hidden="true">%s</span>
      </div>
''' % (title, rune)

def pills(items, indent='          '):
    return indent + '<ul class="pills">' + ''.join('<li>%s</li>' % i for i in items) + '</ul>\n'

def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

SPECS = {
  'proj-ldo': (['0 DRC violations', 'DC bias verified'],
               [('Context', "WARG electrical onboarding"), ('Tools', 'Altium Designer · Murata SimSurface')]),
  'proj-serialscope': (['3 MCU families', 'Live scope + I²C scan'],
               [('Platform', 'Arduino Uno · ESP32 · STM32'), ('Stack', 'Python · FastAPI · WebSockets · C++')]),
  'proj-rc': (['20 m range', '&lt;5% packet loss', '&lt;100 ms latency'],
               [('Platform', '2× Arduino + RF modules'), ('Firmware', 'Custom C++')]),
}

def specblock(anchor):
    if anchor not in SPECS:
        return ''
    nums, rows = SPECS[anchor]
    out = '          <ul class="proj-nums">' + ''.join('<li>%s</li>' % n for n in nums) + '</ul>\n'
    out += '          <dl class="proj-spec">' + ''.join('<div><dt>%s</dt><dd>%s</dd></div>' % r for r in rows) + '</dl>\n'
    return out

def proj(title, img, alt, tags, what, how, result, anchor=''):
    return ('        <article class="proj reveal" id="%s">\n' % anchor if anchor else '        <article class="proj reveal">\n') + '''
          <h3 class="proj-title">%s</h3>
          <figure class="shot">
            <img class="zoomable" src="images/%s" alt="%s" width="900" height="562" loading="lazy" />
            <figcaption>%s</figcaption>
          </figure>
%s%s          <p class="block-label">What</p>
          <p>%s</p>
          <p class="block-label">How</p>
          <p>%s</p>
          <p class="block-label">Result</p>
          <p>%s</p>
        </article>
''' % (title, img, alt, title, specblock(anchor), pills(tags), what, how, result)

GROUPS = [
    ('Smithing', 'Hardware &amp; EDA', 'ᚦ',
     ['Altium Designer', 'Quartus', 'Arduino', 'ESP32', 'Flipper Zero', 'Oscilloscope', 'DC Power Supply', 'Multimeter', 'Soldering', 'Wiring'],
     'Proficient with oscilloscopes, DC power supplies, soldering, and multimeters through ECE coursework and personal projects.'),
    ('Alteration', 'Languages', 'ᛜ',
     ['C/C++', 'Verilog', 'Python', 'JavaScript', 'HTML/CSS'],
     'MicroPython for Flipper Zero sensor logic and rapid prototyping. Bash for terminal-based projects and scripting.'),
    ('Illusion', 'Tools &amp; Dev', 'ᛟ',
     ['Git', 'GitHub', 'Linux', 'VS Code', 'JetBrains', 'Cursor', 'n8n'], ''),
    ('Restoration', 'Learning Next', 'ᛇ',
     ['Deeper Flipper Zero, Sub-GHz &amp; MCU bridging', 'AutoCAD for enclosure &amp; mechanical design', 'Raspberry Pi for computing heavy projects'], ''),
]

def layout(n, seed):
    rnd = random.Random(seed)
    pts = []
    for i in range(n):
        a = -math.pi / 2 + 2 * math.pi * i / n + rnd.uniform(-0.25, 0.25)
        r = rnd.uniform(68, 102)
        pts.append((150 + r * math.cos(a) * 1.25, 125 + r * math.sin(a)))
    links = [(i, i + 1) for i in range(n - 1)]
    if n > 3:
        links.append((0, n // 2))
    if n > 5:
        links.append((1, n - 2))
    return pts, links

cons = ''
for gi, (name, sub, rune, items, note) in enumerate(GROUPS):
    pts, links = layout(len(items), gi * 7 + 3)
    lines = ''.join('<line class="con-line" x1="%.0f" y1="%.0f" x2="%.0f" y2="%.0f"/>' % (pts[a][0], pts[a][1], pts[b][0], pts[b][1]) for a, b in links)
    stars = ''.join('<g class="con-star" data-skill="%s"><circle class="con-halo" cx="%.0f" cy="%.0f" r="11"/><circle class="con-dot" cx="%.0f" cy="%.0f" r="3.2"/></g>'
                    % (slug(it), x, y, x, y) for it, (x, y) in zip(items, pts))
    rows = ''.join('<li data-skill="%s" tabindex="0"><span class="cl-name">%s</span></li>' % (slug(it), it) for it in items)
    note_html = '          <p class="con-note">%s</p>\n' % note if note else ''
    cons += '''        <article class="con reveal">
          <p class="con-rune" aria-hidden="true">%s</p>
          <h3 class="con-name">%s</h3>
          <p class="con-sub">%s</p>
          <svg class="con-svg" viewBox="0 0 300 250" aria-hidden="true">%s%s</svg>
          <ul class="con-list">%s</ul>
%s        </article>
''' % (rune, name, sub, lines, stars, rows, note_html)

MOUNTAINS = '''    <svg class="mountains" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="mtn-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a4250" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#15171c" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="mtn-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#262b34"/>
          <stop offset="1" stop-color="#15171c"/>
        </linearGradient>
        <linearGradient id="mtn-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e9eef5" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#e9eef5" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path fill="url(#mtn-far)" d="M0 230 L120 150 L200 190 L330 70 L430 170 L520 120 L640 200 L760 60 L880 160 L990 110 L1110 190 L1230 90 L1340 170 L1440 130 L1440 320 L0 320 Z"/>
      <path fill="url(#mtn-snow)" d="M330 70 L362 102 L345 98 L330 112 L312 100 L300 104 Z M760 60 L796 96 L778 92 L760 108 L742 94 L728 98 Z M1230 90 L1262 120 L1246 116 L1230 130 L1214 118 L1202 122 Z"/>
      <path fill="url(#mtn-near)" d="M0 290 L90 230 L180 260 L300 180 L410 250 L540 200 L660 270 L790 190 L920 250 L1040 210 L1170 270 L1300 220 L1440 260 L1440 320 L0 320 Z"/>
    </svg>
'''

html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kabir Virk</title>
  <meta name="description" content="I'm an Electrical Engineering student at Waterloo focused on PCB design and embedded systems." />

  <meta property="og:title" content="Kabir Virk" />
  <meta property="og:description" content="Electrical Engineering (Co-op) at the University of Waterloo — PCB design and embedded systems." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.kabirvirk.me/" />

  <link rel="icon" type="image/png" href="images/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="images/favicon.svg" />
  <link rel="shortcut icon" href="images/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png" />
  <link rel="manifest" href="images/site.webmanifest" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="''' + FONTS + '''" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body class="home">

<a class="skip-link" href="#main">Skip to content</a>

<header class="topbar" id="topbar">
  <div class="shell topbar-inner">
    <a class="wordmark" href="#top">Kabir Virk</a>

    <nav class="topnav" id="topnav" aria-label="Sections">
      <a href="#projects">Projects</a>
      <a href="#experience">Experience</a>
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#education">Education</a>
      <a href="#personal">Personal</a>
      <a href="#contact">Contact</a>
    </nav>

    <span class="topbar-glyphs" aria-hidden="true">ᛉ</span>

    <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <g stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></g>
      </svg>
    </button>
  </div>
  <div class="compass" aria-hidden="true">
    <div class="compass-track" id="compass-track"></div>
    <span class="compass-needle"></span>
  </div>
</header>

<canvas class="snow" id="snow" aria-hidden="true"></canvas>
<div class="fog fog-a" aria-hidden="true"></div>
<div class="fog fog-b" aria-hidden="true"></div>

<main id="main">

  <section class="hero" id="top">
''' + MOUNTAINS + '''    <div class="shell hero-grid">
      <div>
        <p class="hero-eyebrow">University of Waterloo — Electrical Engineering (Co-op)</p>
        <h1 class="hero-name">Kabir Virk</h1>
        <div class="hero-runes" aria-hidden="true">ᛉ</div>
        <div class="hero-rule" aria-hidden="true"></div>
        <p class="hero-focus">PCB Design · Embedded C/C++ · Verilog · Python</p>
        <p class="hero-tagline">I'm an Electrical Engineering student at Waterloo focused on PCB design and embedded systems.</p>
        <div class="hero-btns">
          <a class="btn btn-solid" href="''' + RESUME + '''" target="_blank" rel="noopener">Résumé</a>
          <a class="btn btn-line" href="https://github.com/kabirvirk1206" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a class="btn btn-line" href="https://linkedin.com/in/kabir-virk" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a class="btn btn-line" href="mailto:kabir.virk@uwaterloo.ca">Email</a>
        </div>
      </div>

      <aside class="glance" aria-label="At a glance">
        <p class="glance-label">Now</p>
        <a class="glance-row" href="#experience">
          <span class="glance-role">Electrical Team — Waterloo Aerial Robotics Group</span>
          <span class="glance-meta">Apr 2026 — Present</span>
        </a>

        <p class="glance-label">Previously</p>
        <a class="glance-row" href="#experience">
          <span class="glance-role">Systems Integration Intern — TalkToMedi</span>
          <span class="glance-meta">Jan — Apr 2026</span>
        </a>
        <a class="glance-row" href="#experience">
          <span class="glance-role">Academic Tutor — Tutorax Inc.</span>
          <span class="glance-meta">Sep 2024 — Jan 2026</span>
        </a>

        <p class="glance-label">Education</p>
        <a class="glance-row" href="#education">
          <span class="glance-role">BASc Electrical Engineering (Co-op) — University of Waterloo</span>
          <span class="glance-meta">2024 — 2030</span>
        </a>

        <p class="glance-label">Featured Projects</p>
        <div class="glance-projects">
          <a href="#proj-ldo">LDO Voltage Regulator PCB</a>
          <a href="#proj-serialscope">SerialScope</a>
          <a href="#proj-rc">Arduino RC Car</a>
        </div>
      </aside>
    </div>
  </section>

  <section class="section" id="about">
    <div class="shell about-wrap">
''' + head('About', 'ᛗ') + '''
      <div class="prose reveal">
        <p>
          Right now that looks like laying out boards in Altium with WARG, writing firmware in
          C/C++ for Arduino and ESP32 projects, and building the habits around schematic review
          and documentation that make hardware actually ship.
        </p>
        <p>
          Outside of engineering, I've worked in tutoring and a health-tech startup, which mostly
          taught me how to communicate clearly and move fast in environments with a lot of
          ambiguity. Still working on the rest.
        </p>
      </div>

      <div class="about-tags reveal">
        <p class="block-label">Focus</p>
''' + pills(['PCB Design', 'Embedded Systems', 'Firmware', 'RF'], '        ') + '''        <p class="block-label">Tools</p>
''' + pills(['Altium Designer', 'C / C++', 'Python', 'Arduino · ESP32'], '        ') + '''      </div>
    </div>
  </section>

  <section class="section" id="education">
    <div class="shell">
''' + head('Education', 'ᚨ') + '''
      <div class="edu-grid">
        <article class="edu-card reveal">
          <div>
            <h3 class="edu-school">University of Waterloo</h3>
            <p class="edu-place">Waterloo, ON</p>
            <p class="edu-degree">BASc, Electrical Engineering (Co-op)</p>
            <p class="edu-dates">2024 — 2030</p>
            <p class="edu-note">Expected Graduation December 2030.</p>
            <p class="block-label">Relevant Courses</p>
            <ul class="dotlist">
              <li>ECE 150 — Programming</li>
              <li>ECE 124 — Digital Circuits</li>
              <li>ECE 140 — Linear Circuits</li>
              <li>ECE 198 — Project Studio</li>
            </ul>
          </div>
          <span class="edu-crest runes" aria-hidden="true">ᚹ</span>
        </article>

        <article class="edu-card reveal">
          <div>
            <h3 class="edu-school">Harold M. Braithwaite Secondary School</h3>
            <p class="edu-place">Brampton, ON</p>
            <p class="edu-degree">Ontario Secondary School Diploma</p>
            <p class="edu-dates">2020 — 2024</p>
            <ul class="dotlist">
              <li>Coding Club · Robotics Club</li>
              <li>Royal Canadian Air Cadets</li>
              <li>Model UN</li>
            </ul>
          </div>
          <span class="edu-crest runes" aria-hidden="true">ᛒ</span>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="experience">
    <div class="shell">
''' + head('Experience', 'ᚱ') + '''
      <ol class="xp-list">
        <li class="xp-item reveal">
          <h3 class="xp-role">Waterloo Aerial Robotics Group — Electrical</h3>
          <p class="xp-place">Waterloo, ON</p>
          <p class="xp-dates">Apr 2026 — Present</p>
          <p class="xp-summary">Contributing to electrical design on competition UAVs for the AEAC Student Competition.</p>
          <ul class="dotlist">
            <li>Designed and laid out an LDO voltage regulator PCB in Altium Designer for an onboarding project</li>
            <li>Applied industry-standard component selection and layout practices</li>
            <li>Reviewed schematics and maintained electrical design documentation</li>
          </ul>
''' + pills(['Altium Designer', 'Schematic Design', 'Routing', 'Documentation']) + '''        </li>

        <li class="xp-item reveal">
          <h3 class="xp-role">TalkToMedi — Systems Integration Intern</h3>
          <p class="xp-place">Waterloo, ON · WEAccelerate</p>
          <p class="xp-dates">Jan — Apr 2026</p>
          <p class="xp-summary">Selected after earning two Microsoft Azure certifications in the WEAccelerate program. Focused on data tooling and workflow automation for clinic outreach.</p>
          <ul class="dotlist">
            <li>Built a web scraper retrieving 1,000+ clinic records in under two minutes</li>
            <li>Automated social media scheduling workflow in n8n</li>
            <li>Tested and refined a conversational AI voice agent using Vapi</li>
          </ul>
''' + pills(['Azure', 'n8n', 'Vapi', 'Cursor']) + '''        </li>

        <li class="xp-item reveal">
          <h3 class="xp-role">Tutorax Inc. — Academic Tutor</h3>
          <p class="xp-place">Toronto, ON</p>
          <p class="xp-dates">Sep 2024 — Jan 2026</p>
          <p class="xp-summary">One-on-one and small group tutoring across Math and Science subjects.</p>
          <ul class="dotlist">
            <li>Tutored 20+ students with tailored lesson plans and practice tests</li>
            <li>83% client return rate after the first session</li>
          </ul>
        </li>
      </ol>
    </div>
  </section>

  <section class="section" id="projects">
    <div class="shell">
''' + head('Projects', 'ᚲ') + '''
      <div class="proj-grid">
''' + proj('LDO Voltage Regulator PCB', 'PCBldo.png', 'LDO voltage regulator PCB in Altium Designer',
           ['Altium Designer', 'PCB Design', 'Schematic Design', 'Documentation'],
           "Custom LDO regulator PCB for WARG's electrical onboarding bootcamp.",
           'Full design flow in Altium: schematic, custom symbols, footprints, placement, routing, and DRC.',
           'Manufacturable board with zero DRC violations; DC bias verified with Murata SimSurface.', 'proj-ldo') + \
     proj('SerialScope', 'SerialScope.png', 'SerialScope web dashboard',
           ['Python', 'FastAPI', 'HTML/CSS/JavaScript', 'Arduino', 'ESP32', 'STM32'],
           'Web dashboard for breadboard hardware projects.',
           'FastAPI backend over WebSockets; plain HTML/CSS/JS frontend; Arduino C++ firmware.',
           'Live oscilloscope, I²C scanner, and interactive pinout for Uno, ESP32, and STM32.', 'proj-serialscope') + \
     proj('Arduino Radio Controlled Car', 'Radio.jpeg', 'Arduino radio controlled car',
           ['Arduino', 'C++', 'RF', 'Soldering'],
           'Fully wireless RC car with joystick control.',
           'Two Arduinos + RF modules; custom C++ firmware.',
           'Stable up to 20 m, &lt;5% packet loss, &lt;100 ms latency.', 'proj-rc') + '''      </div>
    </div>
  </section>

  <section class="section" id="skills">
    <div class="shell">
''' + head('Skills', 'ᛋ') + '''
      <div class="con-grid">
''' + cons + '''      </div>
    </div>
  </section>

  <section class="section" id="personal">
    <div class="shell">
''' + head('Personal', 'ᛟ') + '''
      <p class="personal-lead reveal">Coming soon — blog posts, hobbies, and more.</p>

      <div class="personal-grid">
        <a class="p-card reveal" href="about-me.html#blog">
          <span class="p-watermark" aria-hidden="true">ᛒ</span>
          <span class="p-kicker">Blog</span>
          <h3 class="p-title">Looking Back on Year 1</h3>
          <p class="p-text">Coming soon.</p>
          <span class="p-go">Blog →</span>
        </a>

        <a class="p-card reveal" href="about-me.html#balisong">
          <span class="p-watermark" aria-hidden="true">ᛏ</span>
          <span class="p-kicker">Balisong</span>
          <h3 class="p-title">Balisong Tracker</h3>
          <ul class="p-list" id="p-balisong"></ul>
          <span class="p-go">Tracker →</span>
        </a>

        <a class="p-card reveal" href="about-me.html#setup">
          <span class="p-watermark" aria-hidden="true">ᛜ</span>
          <span class="p-kicker">PC &amp; Games</span>
          <h3 class="p-title">PC &amp; Games</h3>
          <p class="p-text">Coming soon.</p>
          <span class="p-go">Setup →</span>
        </a>
      </div>

      <a class="more-link" href="about-me.html">More about me <span aria-hidden="true">→</span></a>
    </div>
  </section>

  <section class="section" id="contact">
    <div class="shell">
''' + head('Contact', 'ᛖ') + '''
      <p class="say-hello reveal">Say hello <span class="runes" aria-hidden="true">ᛉ</span></p>

      <div class="contact-grid">
        <a class="contact-item reveal" href="mailto:kabir.virk@uwaterloo.ca">
          <p class="contact-key">Waterloo Email</p>
          <p class="contact-val">kabir.virk@uwaterloo.ca</p>
        </a>
        <a class="contact-item reveal" href="mailto:kabirvirk1206@gmail.com">
          <p class="contact-key">Personal Email</p>
          <p class="contact-val">kabirvirk1206@gmail.com</p>
        </a>
        <a class="contact-item reveal" href="https://linkedin.com/in/kabir-virk" target="_blank" rel="noopener noreferrer">
          <p class="contact-key">LinkedIn</p>
          <p class="contact-val">linkedin.com/in/kabir-virk</p>
        </a>
        <a class="contact-item reveal" href="https://github.com/kabirvirk1206" target="_blank" rel="noopener noreferrer">
          <p class="contact-key">GitHub</p>
          <p class="contact-val">github.com/kabirvirk1206</p>
        </a>
      </div>
    </div>
  </section>

</main>

<div class="end-mark" aria-hidden="true">
  <div class="shell"><span>Kabir Virk</span></div>
</div>

<footer class="site-foot">
  <div class="shell foot-inner">
    <p class="foot-copy">© Kabir Virk 2026</p>
    <span class="foot-runes" aria-hidden="true">ᛉ</span>
  </div>
</footer>

<dialog class="lightbox" id="lightbox" aria-label="Enlarged image">
  <button class="lightbox-x" type="button" aria-label="Close">&times;</button>
  <img src="" alt="" />
  <p class="lightbox-cap"></p>
</dialog>

<script src="personal-data.js"></script>
<script src="script.js"></script>
<script src="balisong.js"></script>
</body>
</html>
'''

ORDER = ['projects', 'experience', 'about', 'skills', 'education', 'personal', 'contact']
blocks = {}
for sid in ORDER:
    m = re.search(r'\n  <section class="section" id="%s">.*?\n  </section>\n' % sid, html, re.S)
    blocks[sid] = m.group(0)
first = min(html.index(b) for b in blocks.values())
rest = html
for b in blocks.values():
    rest = rest.replace(b, '')
html = rest[:first] + ''.join(blocks[sid] for sid in ORDER) + rest[first:]

Path('/home/user/personal_portfolio_website/index.html').write_text(html, encoding='utf-8')
print("index.html written")
