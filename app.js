'use strict';

// ---------- Constants ----------
const APP_VERSION = 'v3'; // keep in step with VERSION in sw.js
const STORAGE_KEY = 'gymbuddies.v1';
const PEOPLE = ['cassie', 'dad'];
const NAMES = { cassie: 'Cassie', dad: 'Dad' };
const BRANDS = ['Hoist', 'Old Hoist', 'Other', 'None'];
const BRAND_COLORS = {
  'Hoist': ['#EEE9FF', '#4B2FB8'],
  'Old Hoist': ['#DCE5FF', '#2A4FBF'],
  'None': ['#FFF0D9', '#7A4B00'],
  'Other': ['#EFEDF5', '#4A4560']
};

// Starting library, from the "Weightlifting Program" sheet (Reps + Last Weight tabs).
// last = { person: [warm-up weight, working weight] }
const SEED_LIBRARY = [
  { id: 'legpress', name: 'Leg Press', brand: 'Hoist', warm: 1, sets: 3, reps: 20, last: { cassie: [100, 120], dad: [100, 120] } },
  { id: 'chest', name: 'Chest Press', brand: 'Hoist', warm: 1, sets: 3, reps: 8, last: { cassie: [50, 60], dad: [60, 70] } },
  { id: 'lat', name: 'Lat Pulldown', brand: 'Hoist', warm: 2, sets: 3, reps: 8, last: { cassie: [70, 80], dad: [80, 100] } },
  { id: 'legcurl', name: 'Leg Curl', brand: 'Hoist', warm: 1, sets: 3, reps: 10, last: { cassie: [50, 60], dad: [50, 60] } },
  { id: 'shoulder', name: 'Shoulder Press', brand: 'Hoist', warm: 1, sets: 3, reps: 8, last: { cassie: [40, 50], dad: [50, 60] } },
  { id: 'pullup', name: 'Assisted Pull-Up', brand: 'Hoist', warm: 1, sets: 3, reps: 8, assisted: true, last: { cassie: [140, 120], dad: [140, 120] } },
  { id: 'tricep', name: 'Tricep Extension', brand: 'Hoist', warm: 1, sets: 3, reps: 10, last: { cassie: [40, 45], dad: [40, 50] } },
  { id: 'hip', name: 'Hip Abduction', brand: 'Hoist', warm: 1, sets: 3, reps: 15, last: { cassie: [110, 120], dad: [110, 120] } },
  { id: 'bicep', name: 'Bicep Curl', brand: 'Hoist', warm: 2, sets: 4, reps: 8, last: { cassie: [20, 30], dad: [30, 40] } },
  { id: 'calf', name: 'Calf Raises', brand: 'Hoist', warm: 2, sets: 3, reps: 15, last: { cassie: [50, 60], dad: [50, 60] } },
  { id: 'dip', name: 'Seated Dip', brand: 'Hoist', warm: 2, sets: 3, reps: 10, last: { cassie: [75, 91], dad: [91, 108] } },
  { id: 'delt', name: 'Deltoid Fly', brand: 'Hoist', warm: 1, sets: 2, reps: 12, last: { cassie: [30, 40], dad: [40, 50] } },
  { id: 'legext', name: 'Leg Extension', brand: 'Hoist', warm: 2, sets: 3, reps: 10, last: { cassie: [80, 90], dad: [80, 90] } },
  { id: 'midrow', name: 'Mid Row', brand: 'Old Hoist', warm: 2, sets: 3, reps: 10, last: { cassie: [130, 143], dad: [143, 155] } },
  { id: 'pecfly', name: 'Pec Fly', brand: 'Old Hoist', warm: 2, sets: 3, reps: 8, last: { cassie: [18, 25], dad: [32, 39] } },
  { id: 'glute', name: 'Glute Master', brand: 'Old Hoist', warm: 1, sets: 3, reps: 10, last: { cassie: [2, 3], dad: [3, 4] } },
  { id: 'crunch', name: 'Bicycle Crunches', brand: 'None', warm: 0, sets: 5, reps: 20, bw: true, last: null },
  { id: 'pushup', name: 'Push-Ups', brand: 'None', warm: 0, sets: 3, reps: 10, bw: true, last: null },
  { id: 'squat', name: 'Squats', brand: 'None', warm: 0, sets: 2, reps: 50, bw: true, last: null }
];

// ---------- Icons ----------
const I = {
  dumbbell: (s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 7v10M3.5 9.5v5M18 7v10M20.5 9.5v5M6 12h12"/></svg>`,
  play: `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>`,
  back: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
  plus: (s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  minus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>`,
  check: (s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  up: (s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11l6-6 6 6"/></svg>`,
  flag: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h12l-2.5 4 2.5 4H5"/></svg>`,
  pencil: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>`,
  trash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>`,
  search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>`,
  cal: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>`,
  save: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>`,
  sparkle: (fill) => `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 2C13 8 16 11 22 12C16 13 13 16 12 22C11 16 8 13 2 12C8 11 11 8 12 2Z" fill="${fill}"/></svg>`,
  heart: `<svg width="100%" height="100%" viewBox="0 0 24 24"><path d="M12 21C6 16.5 3 13.5 3 9.5C3 6.5 5.2 4.5 7.8 4.5C9.6 4.5 11 5.5 12 7C13 5.5 14.4 4.5 16.2 4.5C18.8 4.5 21 6.5 21 9.5C21 13.5 18 16.5 12 21Z" fill="#FF8FB1"/></svg>`
};

// ---------- Helpers ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const fmtDate = (iso, kind) => new Date(iso).toLocaleDateString('en-US',
  kind === 'long' ? { weekday: 'long', month: 'long', day: 'numeric' } : { weekday: 'short', month: 'short', day: 'numeric' });
const face = (who, px) => `<span class="av" style="width:${px}px;height:${px}px">${window.AVATARS.face[who]}</span>`;
const full = (who, px) => `<span class="av" style="width:${px}px;height:${px * 2}px">${window.AVATARS.full[who]}</span>`;
const brandPill = (brand) => {
  const [bg, fg] = BRAND_COLORS[brand] || BRAND_COLORS.Other;
  return `<span class="pill" style="background:${bg};color:${fg};padding:3px 10px 3px 8px;align-self:flex-start">${I.dumbbell(14)}${esc(brand)}</span>`;
};
const scheme = (x) => (x.warm ? x.warm + ' warm-up + ' : '') + x.sets + ' × ' + x.reps;
const num = (v) => (v === '' || v == null ? NaN : Number(v));

// ---------- Data (saved on the phone) ----------
function defaultData() {
  return {
    v: 1,
    lib: clone(SEED_LIBRARY),
    lifters: { cassie: true, dad: true },
    current: null,
    history: [],
    last: { label: 'Aug 5', names: ['Assisted Pull-Up', 'Chest Press', 'Hip Abduction', 'Leg Curl', 'Leg Press', 'Tricep Extension'] }
  };
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.lib)) return Object.assign(defaultData(), d);
    }
  } catch (e) { /* fall through to defaults */ }
  return defaultData();
}
let data = load();
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    toast('Couldn’t save on this phone. Export a backup from the home screen.');
  }
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

// ---------- UI state (not saved) ----------
const blankNew = () => ({ name: '', brand: 'Hoist', warm: 1, sets: 3, reps: 10, w: { cassie: { warm: 20, full: 30 }, dad: { warm: 20, full: 30 } } });
const ui = { screen: data.current ? 'workout' : 'home', q: '', draft: null, editIdx: null, nw: blankNew(), summary: null, toast: null };

function findEx(id) { return data.lib.find((e) => e.id === id); }
function activeLifters() {
  const src = data.current ? data.current.lifters : data.lifters;
  return PEOPLE.filter((k) => src[k]);
}
function draftFor(ex) {
  const w = {};
  PEOPLE.forEach((k) => {
    const l = ex.last && ex.last[k] ? ex.last[k] : [0, 0];
    w[k] = { warm: String(l[0]), full: String(l[1]) };
  });
  return { id: ex.id, warm: ex.warm, sets: ex.sets, reps: ex.reps, w };
}
function draftFromEntry(e) {
  const d = draftFor(findEx(e.id) || e);
  d.warm = e.warm; d.sets = e.sets; d.reps = e.reps;
  Object.keys(e.w).forEach((k) => { d.w[k] = { warm: String(e.w[k].warm), full: String(e.w[k].full) }; });
  return d;
}
function entryFor(ex, d) {
  const w = {};
  activeLifters().forEach((k) => { w[k] = { warm: d.w[k].warm, full: d.w[k].full }; });
  return {
    id: ex.id, name: ex.name, brand: ex.brand, bw: !!ex.bw, assisted: !!ex.assisted,
    warm: d.warm, sets: d.sets, reps: d.reps, w,
    prev: ex.isNew ? null : (ex.last ? clone(ex.last) : null)
  };
}
function delta(e, who) {
  if (e.bw || !e.prev || !e.prev[who]) return 0;
  const now = num(e.w[who].full), before = num(e.prev[who][1]);
  if (isNaN(now) || isNaN(before)) return 0;
  return Math.round((now - before) * 10) / 10;
}
function isUp(e, who) { const d = delta(e, who); return e.assisted ? d < 0 : d > 0; }
function badge(e, who) { const d = delta(e, who); return e.assisted ? `${-d} lb less help` : `+${d} lb`; }
function levelUps(log) {
  const out = [];
  log.forEach((e) => Object.keys(e.w).forEach((k) => {
    if (isUp(e, k)) out.push({ who: k, name: e.name, change: `${e.prev[k][1]} → ${e.w[k].full} lb`, badge: badge(e, k) });
  }));
  return out;
}

// ---------- Screens ----------
function header(title, backAct) {
  return `<div class="row pad" style="gap:12px;padding-top:20px;padding-bottom:12px">
    <button class="icon-btn" data-act="${backAct}" aria-label="Back">${I.back}</button>
    <h1 class="display h1" style="font-size:26px">${title}</h1></div>`;
}

function homeScreen() {
  const inProgress = !!data.current;
  return `<div class="screen"><div class="scroll pad stack" style="gap:18px;padding-top:24px;padding-bottom:12px">
    <div class="row" style="gap:10px">
      <div style="width:44px;height:44px;border-radius:15px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 0 var(--primary-dark)">${I.dumbbell(24)}</div>
      <div class="stack" style="flex:1;gap:1px">
        <div class="display" style="font-size:26px;font-weight:700;line-height:1.1">Gym Buddies</div>
        <div style="font-size:14px;font-weight:800;color:var(--primary);letter-spacing:.02em">Alter your limits.</div>
      </div>
      <button class="icon-btn" data-act="more" aria-label="Backup and data">${I.save}</button>
    </div>
    <div class="card stack" style="position:relative;border-radius:32px;padding:22px 20px;align-items:center;gap:10px;box-shadow:0 6px 0 var(--line)">
      <span class="spark" style="top:22px;left:24px;width:24px;height:24px">${I.sparkle('#FFC94D')}</span>
      <span class="spark" style="top:70px;right:26px;width:16px;height:16px">${I.sparkle('#8FA9FF')}</span>
      <span class="spark" style="top:26px;right:58px;width:16px;height:16px">${I.heart}</span>
      <div class="row" style="gap:18px;align-items:flex-end">
        <div class="stack" style="align-items:center;gap:8px">${full('cassie', 120)}<span class="pill" style="background:var(--lilac);color:var(--primary-dark);font-size:15px;padding:4px 14px">Cassie</span></div>
        <div class="stack" style="align-items:center;gap:8px">${full('dad', 120)}<span class="pill" style="background:var(--blue-soft);color:var(--blue-ink);font-size:15px;padding:4px 14px">Dad</span></div>
      </div>
      <div class="display" style="font-size:30px;font-weight:700;margin-top:6px">${inProgress ? 'Workout in progress' : 'Ready to lift?'}</div>
      <div class="muted" style="font-size:16px;text-align:center">${data.lib.length} exercises saved.</div>
    </div>
    <div class="card stack" style="padding:18px;gap:12px">
      <div class="row" style="justify-content:space-between;align-items:baseline">
        <div class="display" style="font-size:18px;font-weight:600">Last workout</div>
        <div class="muted" style="font-size:14px;font-weight:800">${esc(data.last.label)}</div>
      </div>
      <div class="row" style="flex-wrap:wrap;gap:8px">${data.last.names.map((n) => `<span class="pill" style="background:var(--lilac);color:var(--primary-dark);font-size:14px;padding:6px 12px">${esc(n)}</span>`).join('')}</div>
    </div>
  </div>
  <div class="bottom"><button class="btn btn-primary" style="width:100%;min-height:66px;font-size:22px" data-act="${inProgress ? 'resume' : 'who'}">${I.play}${inProgress ? 'Resume workout' : 'Start a workout'}</button></div></div>`;
}

function whoScreen() {
  const today = new Date().toISOString();
  const any = PEOPLE.some((k) => data.lifters[k]);
  return `<div class="screen"><div class="scroll pad stack" style="gap:18px;padding-top:20px">
    <button class="icon-btn" data-act="home" aria-label="Back">${I.back}</button>
    <h1 class="display h1" style="font-size:32px;line-height:1.15">Who's lifting today?</h1>
    <div class="row pill" style="align-self:flex-start;background:#fff;color:var(--primary-dark);font-size:15px;padding:8px 14px;gap:8px">${I.cal}${fmtDate(today, 'long')}</div>
    <div class="stack" style="gap:14px;margin-top:6px">${PEOPLE.map((k) => {
      const on = !!data.lifters[k];
      return `<button data-act="toggle" data-who="${k}" aria-pressed="${on}" class="row" style="gap:16px;padding:16px;border-radius:28px;cursor:pointer;text-align:left;background:${on ? '#fff' : '#FAF8FF'};border:3px solid ${on ? 'var(--primary)' : 'var(--line)'};box-shadow:0 5px 0 ${on ? '#C9BBFF' : 'var(--line)'}">
        <span style="opacity:${on ? 1 : 0.45}">${face(k, 84)}</span>
        <span class="stack" style="flex:1;gap:2px"><span class="display" style="font-size:24px;font-weight:600">${NAMES[k]}</span><span class="muted" style="font-size:15px">${k === 'cassie' ? 'That’s me!' : 'Lifting buddy'}</span></span>
        ${on ? `<span style="width:36px;height:36px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center">${I.check()}</span>` : `<span style="width:30px;height:30px;border-radius:50%;border:3px solid var(--line2)"></span>`}
      </button>`;
    }).join('')}</div>
  </div>
  <div class="bottom"><button class="btn btn-primary" style="width:100%;min-height:64px;font-size:21px" data-act="start" ${any ? '' : 'disabled'}>Let's go!</button></div></div>`;
}

function logCardsHtml(log, editable) {
  return log.map((e, i) => {
    const rows = Object.keys(e.w).map((k) => `<div class="row" style="width:100%;gap:10px;background:#F7F5FF;border-radius:16px;padding:8px 10px">
        ${face(k, 34)}<span style="font-weight:800;width:52px">${NAMES[k]}</span>
        <span class="muted" style="flex:1">${e.bw ? 'No weights' : `${esc(e.w[k].warm)} → ${esc(e.w[k].full)} lb`}</span>
        ${isUp(e, k) ? `<span class="pill" style="background:var(--blue-soft);color:var(--blue-ink)">${I.up()}${badge(e, k)}</span>` : ''}
      </div>`).join('');
    const inner = `<div class="row" style="width:100%;justify-content:space-between;align-items:flex-start;gap:10px">
        <span class="stack" style="gap:4px"><span class="display" style="font-size:20px;font-weight:600">${esc(e.name)}</span>${brandPill(e.brand)}</span>
        <span class="row" style="gap:8px"><span class="pill" style="background:var(--blue-soft);color:var(--blue-ink)">${scheme(e)}</span>
        ${editable ? `<span style="width:30px;height:30px;border-radius:10px;background:var(--bg);color:var(--primary);display:flex;align-items:center;justify-content:center">${I.pencil}</span>` : ''}</span>
      </div>${rows}`;
    return editable
      ? `<button class="card stack" data-act="edit" data-idx="${i}" aria-label="Edit ${esc(e.name)}" style="width:100%;border:none;text-align:left;cursor:pointer;padding:16px;gap:10px">${inner}</button>`
      : `<div class="card stack" style="padding:16px;gap:10px">${inner}</div>`;
  }).join('');
}

function workoutScreen() {
  const cur = data.current;
  const sets = cur.log.reduce((n, e) => n + e.warm + e.sets, 0);
  return `<div class="screen">
    <div class="row pad" style="justify-content:space-between;padding-top:22px;padding-bottom:10px">
      <div class="stack" style="gap:2px"><span class="label" style="color:var(--primary)">Today's workout</span><span class="display" style="font-size:28px;font-weight:700">${fmtDate(cur.date, 'short')}</span></div>
      <div class="row" style="gap:6px">${activeLifters().map((k) => face(k, 48)).join('')}</div>
    </div>
    <div class="row pad" style="gap:8px;padding-bottom:12px">
      <span class="pill" style="background:#fff;color:var(--primary-dark);font-size:14px;padding:6px 12px">${cur.log.length} exercise${cur.log.length === 1 ? '' : 's'}</span>
      <span class="pill" style="background:#fff;color:var(--primary-dark);font-size:14px;padding:6px 12px">${sets} sets</span>
    </div>
    <div class="scroll pad stack" style="gap:14px;padding-top:4px;padding-bottom:20px">
      ${cur.log.length ? logCardsHtml(cur.log, true) : `<div class="stack" style="background:#fff;border-radius:28px;padding:36px 24px;align-items:center;gap:10px;text-align:center;border:3px dashed var(--line2)">
        <div style="width:72px;height:72px;border-radius:24px;background:var(--lilac);color:var(--primary);display:flex;align-items:center;justify-content:center">${I.dumbbell(40)}</div>
        <div class="display" style="font-size:22px;font-weight:600">Nothing yet!</div>
        <div class="muted" style="font-size:16px">Tap Add exercise to log your first machine.</div></div>`}
    </div>
    <div class="bottom row" style="gap:12px">
      <button class="btn btn-soft" style="flex:1" data-act="end">${I.flag}End</button>
      <button class="btn btn-primary" style="flex:2" data-act="pick">${I.plus()}Add exercise</button>
    </div>
    ${ui.draft && ui.screen === 'workout' ? sheetHtml() : ''}
  </div>`;
}

function pickScreen() {
  const done = new Set(data.current ? data.current.log.map((e) => e.id) : []);
  const sorted = data.lib.slice().sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  return `<div class="screen">${header('Add an exercise', 'back-workout')}
    <div class="pad" style="padding-bottom:10px">
      <div class="row search-box">${I.search}<input id="ex-search" type="search" placeholder="Search exercises" autocomplete="off" aria-label="Search exercises" value="${esc(ui.q)}" data-bind="search"></div>
    </div>
    <div class="scroll pad stack" style="gap:10px;padding-top:4px;padding-bottom:24px">
      <button class="list-btn" data-act="new" style="border:3px dashed #B9A8FF;color:var(--primary-dark);gap:12px;padding:14px 16px">
        <span style="width:40px;height:40px;flex-shrink:0;border-radius:14px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center">${I.plus()}</span>
        <span class="stack" style="gap:2px"><span style="font-weight:800;font-size:16px">New exercise or machine</span><span class="muted" style="font-size:14px">Set it up once, it pre-fills after</span></span>
      </button>
      ${sorted.map((ex) => {
        const sel = ui.draft && ui.draft.id === ex.id;
        return `<button class="list-btn" data-act="choose" data-id="${esc(ex.id)}" data-name="${esc(ex.name.toLowerCase())}" style="${sel ? 'background:var(--lilac);border-color:var(--primary)' : ''}">
          <span class="stack" style="flex:1;gap:5px"><span class="display" style="font-size:18px;font-weight:600">${esc(ex.name)}</span>
            <span class="row" style="gap:8px;flex-wrap:wrap">${brandPill(ex.brand)}<span class="muted" style="font-size:14px">${scheme(ex)}</span></span></span>
          ${ex.isNew ? `<span class="pill" style="background:var(--pink-soft);color:var(--pink-ink)">New</span>` : ''}
          ${done.has(ex.id) ? `<span class="pill" style="background:var(--blue-soft);color:var(--blue-ink)">${I.check(14)}Done</span>` : ''}
        </button>`;
      }).join('')}
      <div id="no-match" class="muted" style="display:none;text-align:center;padding:24px 12px;line-height:1.4">No exercise called “<span id="no-match-q"></span>” yet.<br>Tap <b>New exercise or machine</b> to add it.</div>
    </div>
    ${ui.draft ? sheetHtml() : ''}
  </div>`;
}

function countCells(target, o) {
  return [['warm', 'Warm-up'], ['sets', 'Sets'], ['reps', 'Reps']].map(([f, label]) => `<div class="cell"${target === 'nw' ? ' style="background:#fff"' : ''}>
    <span class="label">${label}</span><span class="num">${o[f]}</span>
    <div class="row" style="gap:6px">
      <button class="icon-btn${target === 'nw' ? ' flat' : ''}" data-act="count" data-target="${target}" data-field="${f}" data-dir="-1" aria-label="Fewer ${label}">${I.minus}</button>
      <button class="icon-btn${target === 'nw' ? ' flat' : ''}" data-act="count" data-target="${target}" data-field="${f}" data-dir="1" aria-label="More ${label}">${I.plus(18)}</button>
    </div></div>`).join('');
}
function weightCards(target, o, lastLabel) {
  const bgOuter = target === 'nw' ? '#fff' : 'var(--bg)';
  const bgInner = target === 'nw' ? 'var(--bg)' : '#fff';
  return activeLifters().map((k) => `<div class="stack" style="background:${bgOuter};border-radius:22px;padding:12px;gap:10px">
    <div class="row" style="gap:10px">${face(k, 40)}<span class="display" style="font-size:18px;font-weight:600">${NAMES[k]}</span>
      <span class="muted" style="margin-left:auto;font-size:13px">${lastLabel(k)}</span></div>
    <div class="grid2">${[['warm', 'Warm-up'], ['full', 'Working']].map(([f, label]) => {
      const id = `${target}-${k}-${f}`;
      return `<div class="stack" style="background:${bgInner};border-radius:18px;padding:8px 10px 10px;gap:4px">
        <label class="label" for="${id}" style="padding-left:2px">${label}</label>
        <div class="row" style="gap:6px"><input id="${id}" class="wt" type="text" inputmode="decimal" autocomplete="off" value="${esc(o.w[k][f])}" data-w="${target}" data-who="${k}" data-kind="${f}"><span class="muted" style="font-size:15px">lb</span></div>
      </div>`;
    }).join('')}</div></div>`).join('');
}

function sheetHtml() {
  const d = ui.draft;
  const ex = findEx(d.id);
  const editing = ui.editIdx != null;
  const last = (k) => {
    if (ex.isNew) return 'First time!';
    const l = ex.last && ex.last[k];
    return l ? `Last: ${l[0]} → ${l[1]}` : '';
  };
  return `<div class="overlay" data-act="close"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(ex.name)}">
    <div style="align-self:center;width:48px;height:5px;border-radius:3px;background:var(--line2);flex-shrink:0"></div>
    <div class="row" style="align-items:flex-start;justify-content:space-between;gap:12px">
      <div class="stack" style="gap:4px">
        ${editing ? `<span class="pill" style="align-self:flex-start;background:var(--pink-soft);color:var(--pink-ink);font-size:12px;text-transform:uppercase;letter-spacing:.05em">Editing</span>` : ''}
        <span class="display" style="font-size:26px;font-weight:700">${esc(ex.name)}</span>
        ${brandPill(ex.brand)}
      </div>
      <button class="icon-btn flat" data-act="close" aria-label="Close">${I.close}</button>
    </div>
    <div class="grid3">${countCells('draft', d)}</div>
    ${ex.bw ? `<div class="muted" style="background:var(--bg);border-radius:18px;padding:14px">No machine, so just sets and reps.</div>`
            : `<div class="stack" style="gap:10px">${weightCards('draft', d, last)}</div>`}
    ${editing
      ? `<div class="row" style="gap:10px;flex-shrink:0"><button class="btn btn-soft" style="flex:1;color:var(--pink-ink)" data-act="remove">${I.trash}Remove</button><button class="btn btn-primary" style="flex:2" data-act="save-draft">${I.check(22)}Save changes</button></div>`
      : `<button class="btn btn-primary" style="width:100%;flex-shrink:0" data-act="save-draft">${I.plus()}Add to workout</button>`}
  </div>`;
}

function newScreen() {
  const n = ui.nw;
  return `<div class="screen">${header('New exercise', 'pick')}
    <div class="scroll pad stack" style="gap:18px;padding-top:4px;padding-bottom:20px">
      <div class="muted" style="font-size:16px;line-height:1.4">New machine at the gym? Set it up once and it'll pre-fill every time after.</div>
      <div class="stack" style="gap:8px"><label class="label" for="ex-name" style="color:var(--primary-dark)">Name</label>
        <input id="ex-name" class="text-in" type="text" autocomplete="off" placeholder="e.g. Cable Row" value="${esc(n.name)}" data-bind="nwname"></div>
      <div class="stack" style="gap:8px"><span class="label" style="color:var(--primary-dark)">Machine</span>
        <div class="row" style="flex-wrap:wrap;gap:8px">${BRANDS.map((b) => {
          const on = n.brand === b;
          return `<button data-act="brand" data-brand="${b}" aria-pressed="${on}" style="height:44px;padding:0 16px;border-radius:999px;cursor:pointer;font-weight:800;font-size:15px;border:3px solid ${on ? 'var(--primary)' : 'var(--line2)'};background:${on ? 'var(--primary)' : '#fff'};color:${on ? '#fff' : 'var(--primary-dark)'}">${b}</button>`;
        }).join('')}</div></div>
      <div class="stack" style="gap:8px"><span class="label" style="color:var(--primary-dark)">Sets &amp; reps</span><div class="grid3">${countCells('nw', n)}</div></div>
      ${n.brand === 'None' ? '' : `<div class="stack" style="gap:8px"><span class="label" style="color:var(--primary-dark)">Starting weights (lb)</span>${weightCards('nw', n, () => '')}</div>`}
    </div>
    <div class="bottom"><button class="btn btn-primary" style="width:100%" data-act="save-new" id="save-new" ${n.name.trim() ? '' : 'disabled'}>${I.check(22)}Save exercise</button></div>
  </div>`;
}

function summaryScreen() {
  const w = ui.summary;
  const ups = levelUps(w.log);
  const sets = w.log.reduce((n, e) => n + e.warm + e.sets, 0);
  const people = PEOPLE.filter((k) => w.lifters[k]);
  return `<div class="screen" style="padding-top:0"><div class="scroll stack" style="gap:18px;padding-bottom:20px">
    <div class="hero-top">
      <span class="spark" style="top:calc(28px + env(safe-area-inset-top));left:26px;width:28px;height:28px">${I.sparkle('#FFC94D')}</span>
      <span class="spark" style="top:calc(120px + env(safe-area-inset-top));left:40px;width:18px;height:18px">${I.sparkle('#B7C8FF')}</span>
      <span class="spark" style="top:calc(40px + env(safe-area-inset-top));right:32px;width:22px;height:22px">${I.sparkle('#FFFFFF')}</span>
      <span class="spark" style="top:calc(140px + env(safe-area-inset-top));right:40px;width:18px;height:18px">${I.heart}</span>
      <div class="row" style="gap:14px;align-items:flex-end">${people.map((k) => full(k, 84)).join('')}</div>
      <div class="display" style="font-size:34px;font-weight:700;margin-top:6px">Workout complete!</div>
      <div style="font-size:16px;color:#E6DEFF">${fmtDate(w.date, 'long')}</div>
    </div>
    <div class="pad grid3" style="gap:10px">${[[w.log.length, 'exercises'], [sets, 'sets'], [ups.length, 'level ups']].map(([v, l]) =>
      `<div class="card stack" style="border-radius:20px;padding:14px 6px;align-items:center;gap:2px"><span class="display" style="font-size:30px;font-weight:700;color:var(--primary)">${v}</span><span class="muted" style="font-size:13px;font-weight:800">${l}</span></div>`).join('')}</div>
    <div class="pad stack" style="gap:10px">
      <div class="row" style="gap:8px"><span style="width:30px;height:30px;border-radius:50%;background:#3F6FEA;color:#fff;display:flex;align-items:center;justify-content:center">${I.up(18)}</span><span class="display" style="font-size:22px;font-weight:600">Level ups</span></div>
      ${ups.length ? ups.map((u) => `<div class="card row" style="border-radius:20px;padding:12px;gap:12px">${face(u.who, 44)}
          <div class="stack" style="flex:1;gap:2px"><span style="font-weight:800;font-size:16px">${NAMES[u.who]} · ${esc(u.name)}</span><span class="muted" style="font-size:14px">${u.change}</span></div>
          <span class="pill" style="background:var(--blue-soft);color:var(--blue-ink)">${I.up()}${u.badge}</span></div>`).join('')
        : `<div class="card muted" style="border-radius:20px;padding:16px;line-height:1.4">Same weights as last time. Showing up is the win!</div>`}
    </div>
    <div class="pad stack" style="gap:10px">
      <span class="display" style="font-size:22px;font-weight:600">Everything you did</span>
      ${w.log.map((e) => `<div class="stack" style="background:#fff;border-radius:18px;padding:12px 14px;gap:4px">
        <div class="row" style="justify-content:space-between;gap:8px"><span style="font-weight:800">${esc(e.name)}</span><span class="muted" style="font-size:13px;white-space:nowrap">${scheme(e)}</span></div>
        <span class="muted" style="font-size:14px">${e.bw ? Object.keys(e.w).map((k) => NAMES[k]).join(' & ') + ' · no weights' : Object.keys(e.w).map((k) => `${NAMES[k]} ${esc(e.w[k].full)} lb`).join(' · ')}</span></div>`).join('')}
    </div>
  </div>
  <div class="bottom"><button class="btn btn-primary" style="width:100%" data-act="home">Back home</button></div></div>`;
}

function moreScreen() {
  return `<div class="screen">${header('Backup & data', 'home')}
    <div class="scroll pad stack" style="gap:14px;padding-top:4px;padding-bottom:24px">
      <div class="card muted" style="padding:16px;line-height:1.45;font-size:15px">Everything is saved on this phone only, and works without internet. Save a backup file now and then, so you don't lose your history if you get a new phone or clear your browser data.</div>
      <div class="card row" style="padding:14px 16px;gap:12px"><span class="display num" style="color:var(--primary)">${data.history.length}</span><span class="muted">workout${data.history.length === 1 ? '' : 's'} logged in this app</span></div>
      <button class="btn btn-primary" data-act="export-json">${I.save}Save backup file</button>
      <button class="btn btn-soft" data-act="export-csv">Export history for Google Sheets</button>
      <button class="btn btn-soft" data-act="import">Restore from a backup file</button>
      <div class="muted" style="text-align:center;font-size:13px;margin-top:6px">Gym Buddies ${APP_VERSION}</div>
    </div></div>`;
}

function applySearch() {
  if (!document.getElementById('ex-search')) return;
  const q = ui.q.trim().toLowerCase();
  let shown = 0;
  app.querySelectorAll('[data-act="choose"]').forEach((b) => {
    const hit = !q || b.dataset.name.includes(q);
    b.style.display = hit ? '' : 'none';
    if (hit) shown++;
  });
  document.getElementById('no-match').style.display = shown ? 'none' : '';
  document.getElementById('no-match-q').textContent = ui.q.trim();
}

// ---------- Render ----------
const app = document.getElementById('app');
function render() {
  const s = ui.screen;
  let html =
    s === 'who' ? whoScreen() :
    s === 'workout' && data.current ? workoutScreen() :
    s === 'pick' && data.current ? pickScreen() :
    s === 'new' ? newScreen() :
    s === 'summary' && ui.summary ? summaryScreen() :
    s === 'more' ? moreScreen() :
    homeScreen();
  if (ui.toast) html += `<div class="toast" role="status">${esc(ui.toast)}</div>`;
  app.innerHTML = html;
  applySearch();
}
let toastTimer;
function toast(msg) {
  ui.toast = msg; render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast = null; render(); }, 3200);
}
function go(screen) {
  ui.screen = screen;
  render();
  const sc = app.querySelector('.scroll');
  if (sc) sc.scrollTop = 0;
}

// ---------- Actions ----------
function finishWorkout() {
  const cur = data.current;
  data.lib = data.lib.map((ex) => {
    const hits = cur.log.filter((e) => e.id === ex.id);
    if (!hits.length) return ex;
    const e = hits[hits.length - 1];
    const last = Object.assign({}, ex.last || {});
    Object.keys(e.w).forEach((k) => {
      const wu = num(e.w[k].warm), fu = num(e.w[k].full);
      if (!isNaN(wu) && !isNaN(fu)) last[k] = [wu, fu];
    });
    return Object.assign({}, ex, { warm: e.warm, sets: e.sets, reps: e.reps, last: e.bw ? null : last, isNew: false });
  });
  data.history.push(clone(cur));
  data.last = { label: new Date(cur.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), names: cur.log.map((e) => e.name) };
  ui.summary = clone(cur);
  data.current = null;
  save();
  go('summary');
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const file = typeof File === 'function' ? new File([blob], filename, { type }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: filename }).catch(() => {});
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function csvHistory() {
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [['Date', 'Exercise', 'Machine', 'Person', 'Warm-up sets', 'Working sets', 'Reps', 'Warm-up weight', 'Working weight']];
  data.history.forEach((w) => w.log.forEach((e) => Object.keys(e.w).forEach((k) => {
    rows.push([w.date.slice(0, 10), e.name, e.brand, NAMES[k], e.warm, e.sets, e.reps, e.bw ? '' : e.w[k].warm, e.bw ? '' : e.w[k].full]);
  })));
  return rows.map((r) => r.map(q).join(',')).join('\n');
}

const actions = {
  who: () => go('who'),
  home: () => { ui.summary = null; go('home'); },
  resume: () => go('workout'),
  more: () => go('more'),
  toggle: (el) => { const k = el.dataset.who; data.lifters[k] = !data.lifters[k]; save(); render(); },
  start: () => {
    if (!PEOPLE.some((k) => data.lifters[k])) return;
    data.current = { date: new Date().toISOString(), lifters: Object.assign({}, data.lifters), log: [] };
    save(); go('workout');
  },
  pick: () => { ui.draft = null; ui.editIdx = null; ui.q = ''; go('pick'); },
  'back-workout': () => { ui.draft = null; ui.editIdx = null; go('workout'); },
  choose: (el) => { const ex = findEx(el.dataset.id); if (ex) { ui.draft = draftFor(ex); ui.editIdx = null; render(); } },
  edit: (el) => { const i = Number(el.dataset.idx); ui.editIdx = i; ui.draft = draftFromEntry(data.current.log[i]); render(); },
  close: () => { ui.draft = null; ui.editIdx = null; render(); },
  count: (el) => {
    const o = ui[el.dataset.target]; const f = el.dataset.field;
    o[f] = Math.max(f === 'warm' ? 0 : 1, o[f] + Number(el.dataset.dir));
    render();
  },
  'save-draft': () => {
    const ex = findEx(ui.draft.id);
    const entry = entryFor(ex, ui.draft);
    if (ui.editIdx != null) {
      entry.prev = data.current.log[ui.editIdx].prev;
      data.current.log[ui.editIdx] = entry;
    } else {
      data.current.log.push(entry);
    }
    ui.draft = null; ui.editIdx = null;
    save(); go('workout');
  },
  remove: () => {
    data.current.log.splice(ui.editIdx, 1);
    ui.draft = null; ui.editIdx = null;
    save(); render();
  },
  new: () => { ui.nw = blankNew(); ui.nw.name = ui.q.trim().replace(/\b[a-z]/g, (c) => c.toUpperCase()); ui.q = ''; ui.draft = null; go('new'); },
  brand: (el) => { ui.nw.brand = el.dataset.brand; render(); },
  'save-new': () => {
    const n = ui.nw; const name = n.name.trim();
    if (!name) return;
    const bw = n.brand === 'None';
    const ex = {
      id: 'custom-' + Date.now(), name, brand: n.brand, warm: n.warm, sets: n.sets, reps: n.reps, bw, isNew: true,
      last: bw ? null : { cassie: [num(n.w.cassie.warm) || 0, num(n.w.cassie.full) || 0], dad: [num(n.w.dad.warm) || 0, num(n.w.dad.full) || 0] }
    };
    data.lib.unshift(ex);
    save();
    ui.nw = blankNew();
    ui.draft = draftFor(ex); ui.editIdx = null;
    go(data.current ? 'pick' : 'home');
  },
  end: () => {
    if (!data.current.log.length) {
      if (confirm('End this workout without logging anything?')) { data.current = null; save(); go('home'); }
      return;
    }
    finishWorkout();
  },
  'export-json': () => download(`gym-buddies-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 1), 'application/json'),
  'export-csv': () => {
    if (!data.history.length) { toast('No finished workouts yet. Finish one first!'); return; }
    download(`gym-buddies-history-${new Date().toISOString().slice(0, 10)}.csv`, csvHistory(), 'text/csv');
  },
  import: () => document.getElementById('import-file').click()
};

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) fn(el);
});
app.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.dataset.w) {
    const clean = t.value.replace(/[^0-9.]/g, '');
    if (clean !== t.value) t.value = clean;
    ui[t.dataset.w].w[t.dataset.who][t.dataset.kind] = clean;
  } else if (t.dataset.bind === 'search') {
    ui.q = t.value;
    applySearch();
  } else if (t.dataset.bind === 'nwname') {
    ui.nw.name = t.value;
    const btn = document.getElementById('save-new');
    if (btn) btn.disabled = !t.value.trim();
  }
});
app.addEventListener('focusin', (ev) => {
  if (ev.target.classList && ev.target.classList.contains('wt')) setTimeout(() => ev.target.select(), 0);
});
document.getElementById('import-file').addEventListener('change', (ev) => {
  const file = ev.target.files && ev.target.files[0];
  ev.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const d = JSON.parse(reader.result);
      if (!d || !Array.isArray(d.lib) || !Array.isArray(d.history)) throw new Error('bad');
      if (!confirm('Replace everything on this phone with this backup?')) return;
      data = Object.assign(defaultData(), d);
      save();
      toast('Backup restored!');
      go(data.current ? 'workout' : 'home');
    } catch (e) {
      toast('That file isn’t a Gym Buddies backup.');
    }
  };
  reader.readAsText(file);
});

render();

// ---------- Offline support ----------
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  // When a new version takes over, reload once so it shows right away.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  let pendingReload = false;
  const busy = () => !!ui.draft || ui.screen === 'new';
  const reloadNow = () => { if (reloading) return; reloading = true; location.reload(); };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    if (busy()) pendingReload = true; // don't lose weights being typed; reload once they're done
    else reloadNow();
  });
  app.addEventListener('click', () => { if (pendingReload) setTimeout(() => { if (!busy()) reloadNow(); }, 0); });
  document.addEventListener('visibilitychange', () => { if (pendingReload && document.visibilityState === 'hidden') reloadNow(); });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      // Phones often resume the app instead of reopening it, so check for updates on every return.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      });
    }).catch(() => {});
  });
}
