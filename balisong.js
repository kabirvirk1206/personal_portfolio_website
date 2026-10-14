const MASTERY = ['Not Started', 'Practising', 'Understood', 'Learned', 'Mastered'];
const DIFFICULTY = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const BT_LEVEL_KEYS = ['not_started', 'practising', 'understood', 'learned', 'mastered'];
const BT_PAGE = 24;


function btNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}


function btToday() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}


function btDayKey(date) {
  const pad = n => String(n).padStart(2, '0');
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}


function btEmpty() {
  return { mastery: {}, notes: {}, favorites: {}, history: [], days: [], streakDays: [], levelInfo: null, maxStreak: 0, custom: [] };
}


function btFromBackup(backup) {
  const out = btEmpty();
  if (!backup || typeof backup !== 'object') {
    return out;
  }

  const levelIndex = key => Math.max(0, BT_LEVEL_KEYS.indexOf(key));
  const day = iso => (typeof iso === 'string' ? iso.slice(0, 10) : '');

  (Array.isArray(backup.userTricks) ? backup.userTricks : []).forEach(ut => {
    const id = ut && ut.trickId;
    if (!id) {
      return;
    }
    const level = levelIndex(ut.masteryLevel);
    if (level) {
      out.mastery[id] = level;
    }
    if (ut.notes && String(ut.notes).trim()) {
      out.notes[id] = String(ut.notes).trim();
    }
    if (ut.isFavorite) {
      out.favorites[id] = true;
    }
    if (ut.lastPracticed) {
      out.days.push(day(ut.lastPracticed));
      out.streakDays.push(day(ut.lastPracticed));
    }
    (Array.isArray(ut.masteryHistory) ? ut.masteryHistory : []).forEach(h => {
      if (!h || h.isCreation || !h.date) {
        return;
      }
      out.history.push([day(h.date), id, levelIndex(h.to)]);
      out.days.push(day(h.date));
    });
  });

  (Array.isArray(backup.routines) ? backup.routines : []).forEach(r => {
    if (r && r.lastCompletedAt) {
      out.days.push(day(r.lastCompletedAt));
      out.streakDays.push(day(r.lastCompletedAt));
    }
  });

  out.history.sort((a, b) => a[0].localeCompare(b[0]));
  out.days = out.days.filter(Boolean);
  out.streakDays = out.streakDays.filter(Boolean);

  if (backup.levelInfo && typeof backup.levelInfo === 'object') {
    out.levelInfo = backup.levelInfo;
  }
  out.maxStreak = parseInt(backup.maxStreak, 10) || 0;

  out.custom = (Array.isArray(backup.tricks) ? backup.tricks : [])
    .filter(t => t && t.id && t.name && (t.type === 'trick' || t.type === 'combo'))
    .map(t => {
      const item = { id: t.id, n: t.name, d: t.description || '', diff: parseInt(t.difficulty, 10) || 1,
                     t: t.type, c: t.category || (t.type === 'combo' ? 'Combo' : 'Custom') };
      const video = (Array.isArray(t.resources) ? t.resources : []).find(r => r && r.url);
      if (video) {
        item.v = video.url;
      }
      if (Array.isArray(t.sequence)) {
        item.seq = t.sequence.filter(x => typeof x === 'string');
      }
      if (Array.isArray(t.sequenceNotes) && t.sequenceNotes.length) {
        item.sn = {};
        t.sequenceNotes.forEach(n => {
          if (n && typeof n.sequenceIndex === 'number') {
            item.sn[n.sequenceIndex] = n.note;
          }
        });
      }
      return item;
    });

  return out;
}


function btLoadBackup() {
  if (typeof BALISONG_BACKUP === 'object' && BALISONG_BACKUP) {
    return Promise.resolve(BALISONG_BACKUP);
  }
  if (!window.fetch) {
    return Promise.resolve(null);
  }
  return fetch('balisong-backup.json', { cache: 'no-store' })
    .then(res => (res.ok ? res.json() : null))
    .catch(() => null);
}


function btStreak(dates) {
  const days = new Set(dates);
  if (!days.size) {
    return { current: 0, best: 0 };
  }

  const cursor = new Date();
  if (!days.has(btDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let current = 0;
  while (days.has(btDayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = Array.from(days).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  sorted.forEach(day => {
    const t = new Date(day + 'T00:00:00');
    run = prev && (t - prev) / 86400000 === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  });

  return { current, best };
}


function btWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return d.getUTCFullYear() * 100 + Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}


function initPersonalBalisongCard() {
  const list = document.getElementById('p-balisong');
  if (!list) {
    return;
  }

  btLoadBackup().then(backup => {
    const progress = btFromBackup(backup);
    const levels = Object.values(progress.mastery);

    if (!levels.length) {
      list.appendChild(btNode('li', '', 'Coming soon.'));
      return;
    }

    const rows = [
      ['Level', progress.levelInfo ? String(progress.levelInfo.currentLevel) : '—'],
      ['Learned', String(levels.filter(l => l >= 3).length)],
      ['Mastered', String(levels.filter(l => l >= 4).length)],
    ];
    rows.forEach(([label, value]) => {
      const row = btNode('li');
      row.append(btNode('span', '', label), btNode('span', '', value));
      list.appendChild(row);
    });
  });
}


function initBalisongTracker() {
  const root = document.getElementById('bt-root');
  if (!root || typeof BALISONG_LIBRARY === 'undefined') {
    return;
  }

  btLoadBackup().then(backup => startTracker(root, btFromBackup(backup)));
}


function startTracker(root, initial) {
  const previewing = new URLSearchParams(window.location.search).has('edit');
  let progress = initial;
  let byId = {};
  let tricks = [];
  let combos = [];

  const indexLibrary = () => {
    const merged = BALISONG_LIBRARY.slice();
    const known = new Set(merged.map(i => i.id));
    progress.custom.forEach(item => {
      if (!known.has(item.id)) {
        merged.push(item);
      }
    });
    byId = {};
    merged.forEach(item => {
      byId[item.id] = item;
    });
    tricks = merged.filter(i => i.t === 'trick');
    combos = merged.filter(i => i.t === 'combo');
  };

  indexLibrary();

  const levelOf = id => progress.mastery[id] || 0;

  const state = { tab: 'trick', q: '', diff: 0, mastery: -1, learnable: false, favorites: false, sort: 'difficulty', shown: BT_PAGE };

  const el = {
    level: document.getElementById('bt-level'),
    xpText: document.getElementById('bt-xp-text'),
    xpFill: document.getElementById('bt-xp-fill'),
    streak: document.getElementById('bt-streak'),
    best: document.getElementById('bt-best'),
    learned: document.getElementById('bt-learned'),
    mastered: document.getElementById('bt-mastered'),
    masteryBar: document.getElementById('bt-mastery-bar'),
    masteryKey: document.getElementById('bt-mastery-key'),
    diffDist: document.getElementById('bt-diff-dist'),
    achievements: document.getElementById('bt-achievements'),
    challenge: document.getElementById('bt-challenge'),
    heatmap: document.getElementById('bt-heatmap'),
    tabs: document.getElementById('bt-tabs'),
    search: document.getElementById('bt-search'),
    diffChips: document.getElementById('bt-diff'),
    masteryChips: document.getElementById('bt-mastery'),
    learnable: document.getElementById('bt-learnable'),
    favorites: document.getElementById('bt-favorites'),
    source: document.getElementById('bt-source'),
    sort: document.getElementById('bt-sort'),
    grid: document.getElementById('bt-grid'),
    count: document.getElementById('bt-result-count'),
    more: document.getElementById('bt-more'),
    empty: document.getElementById('bt-empty'),
    dialog: document.getElementById('bt-dialog'),
    editBar: document.getElementById('bt-editbar'),
  };

  const isLearnable = combo => (combo.seq || []).every(id => levelOf(id) >= 3);

  function chips(container, options, current, onPick) {
    container.textContent = '';
    options.forEach(opt => {
      const chip = btNode('button', 'bt-chip' + (opt.value === current ? ' on' : ''), opt.label);
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(opt.value === current));
      chip.addEventListener('click', () => onPick(opt.value));
      container.appendChild(chip);
    });
  }

  function pips(n, max) {
    const wrap = btNode('span', 'bt-pips');
    wrap.setAttribute('aria-label', DIFFICULTY[n] + ' difficulty');
    for (let i = 1; i <= max; i++) {
      wrap.appendChild(btNode('i', i <= n ? 'on' : ''));
    }
    return wrap;
  }

  function renderDashboard() {
    const info = progress.levelInfo;
    if (info && info.xpForNextLevel) {
      el.level.textContent = info.currentLevel;
      el.xpText.textContent = info.currentXP + ' / ' + info.xpForNextLevel + ' XP · ' + (info.totalXP || 0) + ' total';
      el.xpFill.style.width = Math.min(100, (info.currentXP / info.xpForNextLevel) * 100).toFixed(1) + '%';
    } else {
      el.level.textContent = '1';
      el.xpText.textContent = '0 XP';
      el.xpFill.style.width = '0%';
    }

    const streak = btStreak(progress.streakDays);
    streak.best = Math.max(progress.maxStreak, streak.current);
    el.streak.textContent = streak.current;
    el.best.textContent = streak.best;

    const trickLevels = tricks.map(t => levelOf(t.id));
    el.learned.textContent = trickLevels.filter(l => l >= 3).length;
    el.mastered.textContent = trickLevels.filter(l => l >= 4).length;

    el.masteryBar.textContent = '';
    el.masteryKey.textContent = '';
    MASTERY.forEach((name, level) => {
      const count = trickLevels.filter(l => l === level).length;
      const seg = btNode('span', 'bt-seg bt-seg-' + level);
      seg.style.flexGrow = String(count);
      seg.title = name + ': ' + count;
      el.masteryBar.appendChild(seg);

      const key = btNode('span', 'bt-key');
      key.append(btNode('i', 'bt-seg-' + level), btNode('span', '', name + ' ' + count));
      el.masteryKey.appendChild(key);
    });

    el.diffDist.textContent = '';
    const acquired = tricks.filter(t => levelOf(t.id) >= 3);
    const maxCount = Math.max(1, ...[1, 2, 3, 4, 5].map(d => acquired.filter(t => t.diff === d).length));
    [1, 2, 3, 4, 5].forEach(d => {
      const total = tricks.filter(t => t.diff === d).length;
      const got = acquired.filter(t => t.diff === d).length;
      const col = btNode('div', 'bt-dcol');
      const bar = btNode('div', 'bt-dbar');
      const fill = btNode('span');
      fill.style.height = ((got / maxCount) * 100).toFixed(1) + '%';
      bar.appendChild(fill);
      col.append(btNode('span', 'bt-dnum', got + '/' + total), bar, btNode('span', 'bt-dlabel', DIFFICULTY[d]));
      el.diffDist.appendChild(col);
    });

    el.achievements.textContent = '';
    const learnedCount = trickLevels.filter(l => l >= 3).length;
    [
      { rune: 'ᛗ', name: 'First Trick Mastered', desc: 'Master your first balisong trick', got: trickLevels.some(l => l >= 4) },
      { rune: 'ᛊ', name: '7-Day Streak', desc: 'Practice for 7 consecutive days', got: streak.best >= 7 },
      { rune: 'ᛏ', name: '10 Tricks Learned', desc: 'Reach 10 tricks at Learned level', got: learnedCount >= 10 },
    ].forEach(a => {
      const card = btNode('div', 'bt-ach' + (a.got ? ' got' : ''));
      card.append(btNode('span', 'bt-ach-rune', a.rune), btNode('p', 'bt-ach-name', a.name), btNode('p', 'bt-ach-desc', a.desc));
      el.achievements.appendChild(card);
    });

    el.challenge.textContent = '';
    const pool = tricks.filter(t => levelOf(t.id) < 3).sort((a, b) => a.diff - b.diff || a.n.localeCompare(b.n));
    const week = btWeekNumber(new Date());
    el.challenge.appendChild(btNode('p', 'bt-label', 'Weekly Challenge'));
    if (pool.length) {
      const pick = pool[week % Math.min(pool.length, 20)];
      const line = btNode('p', 'bt-challenge-text');
      line.append(document.createTextNode('Learn '));
      const link = btNode('button', 'bt-inline', pick.n);
      link.type = 'button';
      link.addEventListener('click', () => openItem(pick.id));
      line.append(link, document.createTextNode(" to the 'Learned' level."));
      el.challenge.append(line, btNode('p', 'bt-challenge-meta', DIFFICULTY[pick.diff] + ' · currently ' + MASTERY[levelOf(pick.id)]));
    } else {
      el.challenge.appendChild(btNode('p', 'bt-challenge-text', 'Every trick learned.'));
    }

    el.heatmap.textContent = '';
    const perDay = {};
    progress.days.forEach(d => {
      perDay[d] = (perDay[d] || 0) + 1;
    });
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7 * 26 + 1);
    start.setDate(start.getDate() - start.getDay());
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = btDayKey(d);
      const n = perDay[key] || 0;
      const cell = btNode('i', 'bt-heat-' + (n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : n < 7 ? 3 : 4));
      cell.title = key + (n ? ' · ' + n + ' activit' + (n > 1 ? 'ies' : 'y') : ' · no activity');
      el.heatmap.appendChild(cell);
    }
  }

  function currentList() {
    const q = state.q.trim().toLowerCase();
    const order = { name: (a, b) => a.n.localeCompare(b.n),
                    difficulty: (a, b) => a.diff - b.diff || a.n.localeCompare(b.n),
                    mastery: (a, b) => levelOf(b.id) - levelOf(a.id) || a.diff - b.diff };

    return (state.tab === 'trick' ? tricks : combos)
      .filter(i => !state.diff || i.diff === state.diff)
      .filter(i => state.mastery < 0 || levelOf(i.id) === state.mastery)
      .filter(i => !(state.tab === 'combo' && state.learnable) || isLearnable(i))
      .filter(i => !state.favorites || progress.favorites[i.id])
      .filter(i => !q || i.n.toLowerCase().includes(q) || (i.d || '').toLowerCase().includes(q))
      .sort(order[state.sort]);
  }

  function renderControls() {
    chips(el.tabs, [
      { value: 'trick', label: 'Tricks · ' + tricks.length },
      { value: 'combo', label: 'Combos · ' + combos.length },
    ], state.tab, value => {
      state.tab = value;
      state.learnable = false;
      state.shown = BT_PAGE;
      renderAll();
    });

    chips(el.diffChips, [{ value: 0, label: 'Any level' }].concat([1, 2, 3, 4, 5].map(d => ({ value: d, label: DIFFICULTY[d] }))), state.diff, value => {
      state.diff = value;
      state.shown = BT_PAGE;
      renderList();
      renderControls();
    });

    chips(el.masteryChips, [{ value: -1, label: 'Any mastery' }].concat(MASTERY.map((m, i) => ({ value: i, label: m }))), state.mastery, value => {
      state.mastery = value;
      state.shown = BT_PAGE;
      renderList();
      renderControls();
    });

    el.favorites.classList.toggle('on', state.favorites);
    el.favorites.setAttribute('aria-pressed', String(state.favorites));
    el.favorites.hidden = !Object.keys(progress.favorites).length;
    el.learnable.hidden = state.tab !== 'combo';
    el.learnable.classList.toggle('on', state.learnable);
    el.learnable.setAttribute('aria-pressed', String(state.learnable));
  }

  function card(item, index) {
    const level = levelOf(item.id);
    const c = btNode('button', 'bt-card');
    c.type = 'button';
    c.dataset.level = level;
    c.style.animationDelay = Math.min(index % BT_PAGE, 12) * 30 + 'ms';

    const top = btNode('div', 'bt-card-top');
    top.append(btNode('span', 'bt-cat', item.t === 'combo' ? 'Combo · ' + (item.seq || []).length + ' moves' : item.c), pips(item.diff, 5));

    c.append(top, btNode('h3', 'bt-name', item.n), btNode('p', 'bt-desc', item.d || ''));

    const foot = btNode('div', 'bt-card-foot');
    foot.appendChild(btNode('span', 'bt-stamp', MASTERY[level]));
    if (item.t === 'combo' && isLearnable(item)) {
      foot.appendChild(btNode('span', 'bt-ready', 'Learnable'));
    }
    if (progress.notes[item.id]) {
      foot.appendChild(btNode('span', 'bt-has-note', 'Note'));
    }
    if (progress.favorites[item.id]) {
      foot.appendChild(btNode('span', 'bt-fav', '★'));
    }
    c.appendChild(foot);

    c.addEventListener('click', () => openItem(item.id));
    return c;
  }

  function renderList() {
    const list = currentList();
    el.grid.textContent = '';
    list.slice(0, state.shown).forEach((item, i) => el.grid.appendChild(card(item, i)));
    el.count.textContent = list.length + (list.length === 1 ? ' result' : ' results');
    el.more.hidden = list.length <= state.shown;
    el.empty.hidden = list.length > 0;
  }

  function renderAll() {
    renderDashboard();
    renderControls();
    renderList();
  }

  function openItem(id) {
    const item = byId[id];
    if (!item) {
      return;
    }
    const d = el.dialog;
    const body = d.querySelector('.bt-dialog-body');
    body.textContent = '';

    const head = btNode('div', 'bt-d-head');
    head.append(btNode('span', 'bt-cat', item.t === 'combo' ? 'Combo' : item.c), pips(item.diff, 5));
    body.append(head, btNode('h3', 'bt-d-title', item.n), btNode('p', 'bt-d-desc', item.d || ''));

    body.appendChild(btNode('p', 'bt-label', 'Mastery Level'));
    const ladder = btNode('div', 'bt-ladder');
    MASTERY.forEach((name, level) => {
      ladder.appendChild(btNode('span', 'bt-step' + (level === levelOf(id) ? ' on' : '') + (level < levelOf(id) ? ' past' : ''), name));
    });
    body.appendChild(ladder);

    if (item.seq && item.seq.length) {
      body.appendChild(btNode('p', 'bt-label', 'Sequence'));
      const seq = btNode('ol', 'bt-seq');
      item.seq.forEach((sid, i) => {
        const li = btNode('li');
        const move = byId[sid];
        const btn = btNode('button', 'bt-seq-move' + (levelOf(sid) >= 3 ? ' known' : ''), move ? move.n : sid);
        btn.type = 'button';
        btn.addEventListener('click', () => openItem(sid));
        li.appendChild(btn);
        if (item.sn && item.sn[i]) {
          li.appendChild(btNode('span', 'bt-seq-note', item.sn[i]));
        }
        seq.appendChild(li);
      });
      body.appendChild(seq);

      const known = item.seq.filter(sid => levelOf(sid) >= 3).length;
      body.appendChild(btNode('p', 'bt-d-meta', known + ' of ' + item.seq.length + ' moves at Learned or above'));
    }

    if (item.t === 'trick') {
      const usedIn = combos.filter(c => (c.seq || []).includes(id));
      if (usedIn.length) {
        body.appendChild(btNode('p', 'bt-label', 'Used in ' + usedIn.length + ' combo' + (usedIn.length > 1 ? 's' : '')));
        const wrap = btNode('div', 'bt-used');
        usedIn.slice(0, 12).forEach(c => {
          const b = btNode('button', 'bt-chip', c.n);
          b.type = 'button';
          b.addEventListener('click', () => openItem(c.id));
          wrap.appendChild(b);
        });
        if (usedIn.length > 12) {
          wrap.appendChild(btNode('span', 'bt-d-meta', '+' + (usedIn.length - 12) + ' more'));
        }
        body.appendChild(wrap);
      }
    }

    if (item.v) {
      body.appendChild(btNode('p', 'bt-label', 'Learning Resources'));
      const a = btNode('a', 'btn btn-line btn-sm bt-video', item.t === 'combo' ? 'Watch combo' : 'Watch tutorial');
      a.href = item.v;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      body.appendChild(a);
    }

    if (progress.notes[id]) {
      body.appendChild(btNode('p', 'bt-label', 'Personal Notes'));
      body.appendChild(btNode('p', 'bt-d-desc', progress.notes[id]));
    }

    const log = progress.history.filter(row => row[1] === id);
    if (log.length) {
      body.appendChild(btNode('p', 'bt-label', 'Mastery Level History'));
      const ul = btNode('ul', 'bt-log');
      log.slice().reverse().forEach(row => {
        const li = btNode('li');
        li.append(btNode('span', '', row[0]), btNode('span', '', MASTERY[row[2]] || ''));
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }

    if (!d.open) {
      d.showModal();
    }
  }

  el.dialog.querySelector('.bt-dialog-x').addEventListener('click', () => el.dialog.close());
  el.dialog.addEventListener('click', event => {
    if (event.target === el.dialog) {
      el.dialog.close();
    }
  });

  el.search.addEventListener('input', event => {
    state.q = event.target.value;
    state.shown = BT_PAGE;
    renderList();
  });

  el.sort.addEventListener('change', event => {
    state.sort = event.target.value;
    renderList();
  });

  el.learnable.addEventListener('click', () => {
    state.learnable = !state.learnable;
    state.shown = BT_PAGE;
    renderControls();
    renderList();
  });

  el.favorites.addEventListener('click', () => {
    state.favorites = !state.favorites;
    state.shown = BT_PAGE;
    renderControls();
    renderList();
  });

  el.more.addEventListener('click', () => {
    state.shown += BT_PAGE;
    renderList();
  });

  const hasData = Object.keys(progress.mastery).length > 0;
  el.source.textContent = hasData ? 'Synced from my balisongtricks.dev backup' : 'No progress loaded yet';

  if (previewing) {
    el.editBar.hidden = false;
    const picker = document.getElementById('bt-file');
    const status = document.getElementById('bt-file-status');

    picker.addEventListener('change', () => {
      const file = picker.files && picker.files[0];
      if (!file) {
        return;
      }
      file.text().then(text => {
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.userTricks)) {
          throw new Error('not a backup');
        }
        progress = btFromBackup(parsed);
        indexLibrary();
        status.textContent = 'Previewing ' + file.name + ' — ' + Object.keys(progress.mastery).length + ' tricks with progress. Not saved; add it to the repo as balisong-backup.json to publish.';
        el.source.textContent = 'Previewing ' + file.name;
        state.shown = BT_PAGE;
        renderAll();
      }).catch(() => {
        status.textContent = 'That file is not a balisongtricks.dev backup.';
      });
    });
  }

  renderAll();
}


document.addEventListener('DOMContentLoaded', () => {
  initPersonalBalisongCard();
  initBalisongTracker();
});
