import * as R from './randomizer.js';
import { GymBattle } from './engine.js';
import { arenaFor, arenaSVG, arenaFX } from './arenas.js';
import { attachAnimator, moveAnim, prepareAnim, statusAnim } from './animator.js';
import SPRITES from './sprites.json' with { type: 'json' };
import { toID } from '@pkmn/sim';

const dex = R.dex;
const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style') el.style.cssText = v; else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TYPE_COLORS = { Normal: '#9a9a6c', Fire: '#ee7f30', Water: '#6890f0', Electric: '#e8c020', Grass: '#6cbc48', Ice: '#88d0d0', Fighting: '#c03028',
  Poison: '#a040a0', Ground: '#d8b860', Flying: '#a890f0', Psychic: '#f85888', Bug: '#a8b820', Rock: '#b8a038', Ghost: '#705898', Dragon: '#7038f8',
  Dark: '#705848', Steel: '#b8b8d0', Mixed: '#888' };
const typeChip = t => h('span', { class: 'type', style: `--c:${TYPE_COLORS[t]}` }, t);
const sprite = (species, back = false) => {
  const id = toID(species); const src = (back ? SPRITES.back[id] : null) || SPRITES.front[id];
  return h('img', { class: 'spr' + (back && SPRITES.back[id] ? ' back' : back ? ' flip' : ''), src, alt: species, draggable: 'false' });
};

// ---------- info panel (moves, abilities, items) — tap/click friendly, works on touch ----------
const CAT_COLORS = { Physical: '#c8462e', Special: '#3d6ad6', Status: '#777' };
let infoEl = null;
function closeInfo() { infoEl?.remove(); infoEl = null; document.removeEventListener('pointerdown', outsideInfo, true); document.removeEventListener('keydown', escInfo); }
function outsideInfo(e) { if (infoEl && !infoEl.contains(e.target)) closeInfo(); }
function escInfo(e) { if (e.key === 'Escape') closeInfo(); }
function showInfo(kind, id, ev) {
  ev?.stopPropagation(); ev?.preventDefault();
  const anchor = ev?.currentTarget; closeInfo();
  let head, body;
  if (kind === 'move') {
    const m = dex.moves.get(id);
    const acc = m.accuracy === true ? '—' : m.accuracy + '%';
    const pow = m.category === 'Status' ? '—' : m.damage === 'level' ? '= Lv' : m.damageCallback && !m.basePower ? 'Varies' : (m.basePower || '—');
    const stat = (k, v) => h('div', { class: 'istat' }, h('span', {}, k), h('b', {}, String(v)));
    head = [h('h4', {}, m.name), h('div', { class: 'itags' }, typeChip(m.type), h('span', { class: 'cat', style: `--c:${CAT_COLORS[m.category]}` }, m.category))];
    body = [h('div', { class: 'igrid' }, stat('Power', pow), stat('Accuracy', acc), stat('PP', Math.floor(m.pp * 8 / 5)),
        m.priority ? stat('Priority', (m.priority > 0 ? '+' : '') + m.priority) : stat('Contact', m.flags.contact ? 'Yes' : 'No')),
      ...descBlock(m)];
  } else {
    const x = kind === 'ability' ? dex.abilities.get(id) : dex.items.get(id);
    head = [h('h4', {}, x.name), h('div', { class: 'itags' }, h('span', { class: 'cat', style: '--c:#55607a' }, kind === 'ability' ? 'Ability' : 'Held item'))];
    body = descBlock(x);
  }
  infoEl = h('div', { class: 'info', role: 'dialog', 'aria-label': 'Details' }, h('button', { class: 'ix', onclick: closeInfo, 'aria-label': 'Close' }, '×'), ...head, ...body);
  document.body.append(infoEl);
  // desktop: float next to what was tapped; phones: CSS turns it into a bottom sheet
  if (anchor && window.innerWidth > 760) {
    const r = anchor.getBoundingClientRect(), w = infoEl.offsetWidth, hgt = infoEl.offsetHeight;
    let top = r.bottom + 8; if (top + hgt > window.innerHeight - 8) top = Math.max(8, r.top - hgt - 8);
    infoEl.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)) + 'px'; infoEl.style.top = top + 'px';
  }
  setTimeout(() => { document.addEventListener('pointerdown', outsideInfo, true); document.addEventListener('keydown', escInfo); });
}
function descBlock(x) {
  const short = x.shortDesc || x.desc || 'No description.';
  if (!x.desc || x.desc === x.shortDesc) return [h('p', {}, short)];
  const full = h('p', { class: 'full', hidden: true }, x.desc);
  const btn = h('button', { class: 'more', onclick: e => { e.stopPropagation(); full.hidden = !full.hidden; btn.textContent = full.hidden ? 'Full description' : 'Hide full description'; } }, 'Full description');
  return [h('p', {}, short), btn, full];
}
const infoBtn = (kind, id, label = 'Details') => h('button', { class: 'ibtn', 'aria-label': label, title: label, onclick: e => showInfo(kind, id, e) }, 'i');

// Substitute doll (original drawing)
const SUB_SRC = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" shape-rendering="crispEdges">
<ellipse cx="48" cy="88" rx="24" ry="5" fill="#000" opacity=".18"/>
<path d="M30 86 Q22 62 34 50 L28 30 Q28 16 40 20 L44 32 Q48 30 52 32 L56 20 Q68 16 68 30 L62 50 Q74 62 66 86 Z" fill="#e9d7a8" stroke="#6b5532" stroke-width="3"/>
<path d="M33 24 L38 34 M63 24 L58 34" stroke="#c7a46a" stroke-width="4"/>
<circle cx="41" cy="50" r="3.5" fill="#2b2b2b"/><circle cx="55" cy="50" r="3.5" fill="#2b2b2b"/>
<path d="M42 60 L46 63 L50 60 L54 63" stroke="#6b5532" stroke-width="2" fill="none"/>
<path d="M48 66 V84 M44 70 H52 M44 76 H52" stroke="#6b5532" stroke-width="2" stroke-dasharray="2 2"/>
<path d="M32 66 Q24 66 22 58 M64 66 Q72 66 74 58" stroke="#6b5532" stroke-width="3" fill="#e9d7a8"/></svg>`);
const subOn = { p1: false, p2: false }, bpSub = { p1: false, p2: false };
function setSub(side, on) {
  subOn[side] = on;
  const slot = document.querySelector('.mon.' + side); if (!slot || !active[side]) return;
  slot.replaceChildren(on ? h('img', { class: 'spr sub', src: SUB_SRC, alt: 'Substitute', draggable: 'false' }) : sprite(active[side].species, side === 'p1'));
  slot.classList.remove('enter', 'hit', 'lunge'); void slot.offsetWidth; slot.classList.add('enter');
}

// ---------- settings ----------
const ANIM_KEY = 'dailygym:anims';
let ANIMS = (() => { try { const v = localStorage.getItem(ANIM_KEY); if (v) return v === 'on'; } catch {} return !matchMedia('(prefers-reduced-motion: reduce)').matches; })();
function toggleAnims(btn) { ANIMS = !ANIMS; try { localStorage.setItem(ANIM_KEY, ANIMS ? 'on' : 'off'); } catch {} btn.replaceChildren(...animLabel()); btn.setAttribute('aria-pressed', String(ANIMS)); btn.setAttribute('aria-label', `Animations ${ANIMS ? 'on' : 'off'}`); }
const animLabel = () => ['✨', h('span', { class: 'lbl' }, ` Animations ${ANIMS ? 'on' : 'off'}`)];

// ---------- state ----------
const qDay = Number(new URLSearchParams(location.search).get('day'));
const isDev = ['localhost', '127.0.0.1'].includes(location.hostname);
const DAY = qDay && (isDev || qDay <= R.dayNumber()) ? qDay : R.dayNumber();
const LEADER = R.leaderForDay(DAY);
const DRAFT = R.dailyDraft(DAY, LEADER);
const LTEAM = R.leaderTeam(DAY, LEADER);
const NPICK = LEADER.team.length;
const IS_E4 = LEADER.role === 'Elite Four';
const IS_CH = LEADER.role === 'Champion';
const ARENA = arenaFor(LEADER);
const KEY = 'dailygym:v1';
let store = load();
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { days: {} }; } catch { return { days: {} }; } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} }
const today = () => (store.days[DAY] ||= {});

// ---------- shell ----------
const app = $('#app');
function header() {
  const st = stats();
  return h('header', {},
    h('div', { class: 'brand' }, h('span', { class: 'logo' }, 'DAILY GYM'), h('span', { class: 'daynum' }, '#' + DAY)),
    h('div', { class: 'hstats' }, h('span', { title: 'Current win streak' }, '🔥 ' + st.streak),
      h('button', { class: 'ghost anims', 'aria-pressed': String(ANIMS), title: 'Move animations (Pokémon Showdown)', 'aria-label': `Animations ${ANIMS ? 'on' : 'off'}`, onclick: e => toggleAnims(e.currentTarget) }, ...animLabel()),
      h('button', { class: 'ghost', onclick: showHelp }, 'How to play')));
}
function stats() {
  const days = Object.keys(store.days).map(Number).filter(d => store.days[d].result).sort((a, b) => a - b);
  let streak = 0;
  for (let d = store.days[DAY]?.result ? DAY : DAY - 1; store.days[d]?.result?.won; d--) streak++;
  const wins = days.filter(d => store.days[d].result.won).length;
  return { played: days.length, wins, streak };
}
function render(...body) { app.replaceChildren(header(), ...body); window.scrollTo(0, 0); }

// ---------- leader intro ----------
function leaderCard(compact = false) {
  return h('section', { class: 'leader' + (compact ? ' compact' : '') },
    h('div', { class: 'trainer' }, h('img', { src: LEADER.spriteData, alt: LEADER.name, class: 'tspr' })),
    h('div', { class: 'linfo' },
      h('div', { class: 'eyebrow' }, `${LEADER.region} · ${LEADER.game}${LEADER.note ? ' · ' + LEADER.note : ''}`),
      h('h1', {}, LEADER.role + ' ', LEADER.name),
      h('div', {}, typeChip(LEADER.type), h('span', { class: 'muted' }, ` ${NPICK} vs ${NPICK}`)),
      h('div', { class: 'lteam' }, LTEAM.map(s => h('div', { class: 'lmon', title: `${s.species} · in-game Lv. ${s.origLevel}` },
        sprite(s.species), h('div', { class: 'lname' }, s.species), h('div', { class: 'lvl' }, 'Lv. ' + s.level),
        h('div', {}, dex.species.get(s.species).types.map(typeChip)))))));
}
function intro() {
  const d = today();
  if (d.result) return results();
  if (d.picks) return startBattle(true);
  render(leaderCard(), h('section', { class: 'cta' },
    h('p', {}, `Today you draft ${NPICK} of ${DRAFT.length} randomized Pokémon. Movesets, abilities and items are rolled fresh for everyone, every day. One attempt.`),
    h('button', { class: 'primary', onclick: draft }, 'Start the draft')));
}

// ---------- draft ----------
let picks = [];
function moveRow(name) {
  const m = dex.moves.get(name);
  const bp = m.category === 'Status' ? '—' : (m.basePower || (m.damage === 'level' ? 'Lv' : '—'));
  return h('li', {}, h('button', { class: 'mv', title: m.shortDesc || m.desc, style: `--c:${TYPE_COLORS[m.type]}`, onclick: e => showInfo('move', m.id, e), 'aria-label': `${m.name} details` },
    h('span', { class: 'mname' }, m.name), h('span', { class: 'mcat ' + m.category.toLowerCase() }, m.category[0]), h('span', { class: 'mbp' }, bp), h('span', { class: 'idot' }, 'i')));
}
const STAT_LABEL = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
function draftCard(set, i) {
  const s = dex.species.get(set.species); const ab = dex.abilities.get(set.ability); const it = dex.items.get(set.item);
  const order = picks.indexOf(i);
  return h('div', { class: 'card' + (order >= 0 ? ' picked' : ''), role: 'button', tabindex: '0', 'aria-pressed': String(order >= 0), onclick: () => togglePick(i),
      onkeydown: e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); togglePick(i); } } },
    order >= 0 ? h('div', { class: 'badge' }, order === 0 ? 'Lead' : '#' + (order + 1)) : null,
    h('div', { class: 'chead' }, sprite(set.species), h('div', {}, h('div', { class: 'cname' }, set.species), h('div', {}, s.types.map(typeChip)))),
    h('button', { class: 'kv', title: ab.shortDesc, onclick: e => showInfo('ability', ab.id, e) }, h('b', {}, 'Ability '), ab.name, h('span', { class: 'idot' }, 'i')),
    h('button', { class: 'kv', title: it.shortDesc, onclick: e => showInfo('item', it.id, e) }, h('b', {}, 'Item '), it.name, h('span', { class: 'idot' }, 'i')),
    h('ul', { class: 'moves' }, set.moves.map(moveRow)),
    h('div', { class: 'stats' }, Object.entries(s.baseStats).map(([k, v]) => h('div', { class: 'stat' }, h('span', {}, STAT_LABEL[k]),
      h('i', { style: `width:${Math.min(100, v / 1.6)}%;--c:${v >= 110 ? '#4caf7d' : v >= 80 ? '#c9b43b' : '#d0674a'}` }), h('em', {}, v)))));
}
function togglePick(i) {
  const k = picks.indexOf(i);
  if (k >= 0) picks.splice(k, 1); else if (picks.length < NPICK) picks.push(i);
  const y = window.scrollY;
  draft();
  window.scrollTo(0, y); // stay where the player was instead of jumping to the top
  const card = app.querySelectorAll('.grid .card')[i]; if (card) card.focus({ preventScroll: true });
}
function draft() {
  const full = picks.length === NPICK;
  render(leaderCard(true),
    h('section', { class: 'drafthead' }, h('h2', {}, `Pick ${NPICK}`), h('span', { class: 'muted' }, `${picks.length}/${NPICK} chosen · first pick leads · tap a move, ability or item for details`)),
    h('section', { class: 'grid' }, DRAFT.map(draftCard)),
    h('div', { class: 'sticky' }, h('button', { class: 'primary', disabled: !full, onclick: lockIn }, full ? 'Lock in & battle' : `Choose ${NPICK - picks.length} more`)));
}
function lockIn() {
  if (picks.length !== NPICK) return;
  confirmDialog('Lock in this team?', 'You only get one attempt per day — the battle starts right away.', () => {
    today().picks = picks.slice(); today().choices = []; save(); startBattle(false);
  });
}

// ---------- battle ----------
let G, busy = false, ui = {}, active = { p1: null, p2: null };
function startBattle(resume) {
  const d = today();
  G = new GymBattle(DAY, d.picks.map(i => DRAFT[i]), LTEAM, LEADER.name);
  subOn.p1 = subOn.p2 = bpSub.p1 = bpSub.p2 = false;
  ui = buildBattleUI();
  render(ui.root);
  if (resume && d.choices.length) { // replay deterministic choices silently
    const lines = G.drain();
    for (const c of d.choices) G.choose(c);
    playLines([...lines, ...G.drain()], true).then(afterTurn);
    log('— Resumed today\'s battle —', 'sys');
  } else playLines(G.drain()).then(afterTurn);
}
function hpBox(side) {
  return h('div', { class: 'hpbox ' + side }, h('div', { class: 'hpname' }, h('span', { class: 'n' }), h('span', { class: 'st' }), h('span', { class: 'lv' })),
    h('div', { class: 'bar' }, h('i')), h('div', { class: 'hpnum' }));
}
function buildBattleUI() {
  const root = h('section', { class: 'battle' },
    h('div', { class: 'field', style: `--plat:${ARENA.pal.plat}` },
      h('div', { class: 'arena' }), h('div', { class: 'fx fx-' + (ARENA.fx || 'none') }),
      h('div', { class: 'arenaname' }, ARENA.name),
      h('div', { class: 'weather' }),
      h('div', { class: 'foe' }, hpBox('p2'), h('div', { class: 'plat' }), h('div', { class: 'mon p2' })),
      h('div', { class: 'me' }, h('div', { class: 'plat' }), h('div', { class: 'mon p1' }), hpBox('p1')),
      h('div', { class: 'balls p2' }), h('div', { class: 'balls p1' }),
      h('img', { class: 'fieldtrainer', src: LEADER.spriteData, alt: '' })),
    h('div', { class: 'console' }, h('div', { class: 'log', role: 'log', 'aria-live': 'polite' }), h('div', { class: 'controls' })));
  $('.arena', root).innerHTML = arenaSVG(ARENA, LEADER.id);
  $('.fx', root).innerHTML = arenaFX(ARENA, LEADER.id);
  attachAnimator($('.field', root));
  return { root, log: $('.log', root), controls: $('.controls', root), field: $('.field', root) };
}
function log(text, cls = '') { const el = h('div', { class: 'ln ' + cls }, text); ui.log.append(el); ui.log.scrollTop = ui.log.scrollHeight; }
const sideOf = ident => ident.slice(0, 2);
const nameOf = ident => ident.replace(/^p\da?: /, '');
const who = ident => (sideOf(ident) === 'p2' ? `${LEADER.name}'s ` : '') + nameOf(ident);
function setHP(side, cond, instant) {
  const box = $('.hpbox.' + side, ui.root); if (!box) return;
  const [hp, rest = ''] = cond.split(' '); let [cur, max] = hp.split('/').map(Number);
  if (hp === '0') { cur = 0; max = box.dataset.max ? Number(box.dataset.max) : 1; } else box.dataset.max = max;
  const pct = max ? Math.max(0, cur / max * 100) : 0;
  const bar = $('.bar i', box); bar.style.transition = instant ? 'none' : ''; bar.style.width = pct + '%';
  bar.style.background = pct > 50 ? 'var(--hp-g)' : pct > 20 ? 'var(--hp-y)' : 'var(--hp-r)';
  $('.hpnum', box).textContent = side === 'p1' ? `${cur}/${max}` : `${Math.ceil(pct)}%`;
  const st = rest && rest !== 'fnt' ? rest : ''; const stEl = $('.st', box); stEl.textContent = st.toUpperCase(); stEl.className = 'st ' + st;
}
function setActive(side, ident, details, cond, instant) {
  const species = details.split(',')[0]; const lv = (details.match(/L(\d+)/) || [])[1] || '100';
  active[side] = { species, ident };
  const box = $('.hpbox.' + side, ui.root); $('.n', box).textContent = species; $('.lv', box).textContent = 'Lv' + lv;
  const slot = $('.mon.' + side, ui.root); slot.replaceChildren(sprite(species, side === 'p1')); slot.className = 'mon ' + side + (instant ? '' : ' enter');
  setHP(side, cond, true);
}
function anim(side, cls) {
  const el = $('.mon.' + side, ui.root); if (!el || el.classList.contains('faint')) return;
  el.classList.remove('lunge', 'hit', 'enter'); void el.offsetWidth; el.classList.add(cls);
}
const STATUS = { brn: 'was burned', par: 'is paralyzed! It may be unable to move', slp: 'fell asleep', frz: 'was frozen solid', psn: 'was poisoned', tox: 'was badly poisoned' };
const STAT = { atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed', accuracy: 'accuracy', evasion: 'evasiveness' };
const from = parts => { const f = parts.find(p => p.startsWith('[from]')); return f ? f.replace('[from] ', '').replace(/^(item|ability|move): /, '') : ''; };

async function playLines(lines, instant = false) {
  const pause = instant ? 0 : 1;
  let skip = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('|split|')) { skip = true; continue; } // next line = secret (exact HP); the one after = public duplicate
    if (skip === 'drop') { skip = false; continue; }
    if (skip === true) skip = 'drop';
    const p = line.split('|').slice(1); const [cmd] = p;
    let wait = 0;
    switch (cmd) {
      case 'switch': case 'drag': case 'replace': {
        const side = sideOf(p[1]);
        if (!instant && active[side] && side === 'p1' && cmd === 'switch') log(`Come back, ${active[side].species}!`);
        const keepSub = cmd === 'switch' && bpSub[side]; bpSub[side] = false; subOn[side] = false;
        setActive(side, p[1], p[2], p[3], instant);
        if (keepSub) setSub(side, true); // Baton Pass hands the substitute over
        log(side === 'p1' ? `Go! ${nameOf(p[1])}!` : `${LEADER.name} sent out ${nameOf(p[1])}!`, side);
        wait = 650; break;
      }
      case 'move': {
        log(`${who(p[1])} used ${p[2]}!`, 'move ' + sideOf(p[1]));
        if (p[2] === 'Baton Pass') bpSub[sideOf(p[1])] = subOn[sideOf(p[1])];
        const still = p.includes('[still]') || p.includes('[notarget]') || p.includes('[miss]');
        if (ANIMS && !instant && !still) { await moveAnim(toID(p[2]), sideOf(p[1]), p[3] ? sideOf(p[3]) : null); wait = 120; }
        else { if (!still && p[3] && p[3] !== p[1]) anim(sideOf(p[1]), 'lunge'); wait = 550; }
        break;
      }
      case '-damage': {
        const side = sideOf(p[1]);
        const f = from(p);
        const resid = { brn: 'brn', psn: 'psn', tox: 'psn', confusion: 'confusedselfhit' }[f];
        if (ANIMS && !instant && resid) await statusAnim(resid, side);
        setHP(side, p[2], instant);
        if (f) log(f === 'Stealth Rock' ? `Pointed stones dug into ${who(p[1])}!` : f === 'psn' || f === 'tox' ? `${who(p[1])} was hurt by poison!` : f === 'brn' ? `${who(p[1])} was hurt by its burn!` :
          f === 'Life Orb' ? `${who(p[1])} lost some of its HP!` : f === 'Recoil' || f === 'recoil' ? `${who(p[1])} is damaged by recoil!` : f === 'confusion' ? `It hurt itself in its confusion!` :
          f === 'Leech Seed' || f === 'leechseed' ? `${who(p[1])}'s health is sapped by Leech Seed!` : `${who(p[1])} was hurt by ${f}!`, 'dim');
        else anim(side, 'hit');
        wait = 500; break;
      }
      case '-heal': { setHP(sideOf(p[1]), p[2], instant); const f = from(p); log(f ? `${who(p[1])} restored HP using its ${f}!` : `${who(p[1])} regained health!`, 'dim'); wait = 400; break; }
      case '-sethp': setHP(sideOf(p[1]), p[2], instant); break;
      case 'faint': { subOn[sideOf(p[1])] = false; log(`${who(p[1])} fainted!`, 'faint'); anim(sideOf(p[1]), 'faint'); wait = 800; break; }
      case '-supereffective': log("It's super effective!", 'se'); break;
      case '-resisted': log("It's not very effective…", 'dim'); break;
      case '-immune': log(`It doesn't affect ${who(p[1])}…`, 'dim'); break;
      case '-crit': log('A critical hit!', 'se'); break;
      case '-miss': log(`${who(p[1])}'s attack missed!`, 'dim'); break;
      case '-fail': log('But it failed!', 'dim'); break;
      case '-status': if (ANIMS && !instant) await statusAnim(p[2] === 'tox' ? 'psn' : p[2], sideOf(p[1]));
        log(`${who(p[1])} ${STATUS[p[2]] || 'was afflicted with ' + p[2]}!`); setStatus(p[1], p[2]); wait = 400; break;
      case '-curestatus': log(`${who(p[1])} was cured of its status.`, 'dim'); setStatus(p[1], ''); break;
      case '-boost': case '-unboost': {
        const n = Number(p[3]); const up = cmd === '-boost';
        log(n === 0 ? `${who(p[1])}'s ${STAT[p[2]]} won't go any ${up ? 'higher' : 'lower'}!` : `${who(p[1])}'s ${STAT[p[2]]} ${up ? 'rose' : 'fell'}${n >= 2 ? ' sharply' : ''}!`, 'dim');
        wait = 300; break;
      }
      case '-clearallboost': log('All stat changes were eliminated!', 'dim'); break;
      case '-weather': {
        const w = p[1]; const up = p.includes('[upkeep]');
        $('.weather', ui.root).className = 'weather ' + (w === 'none' ? '' : w.toLowerCase());
        if (!up) log(w === 'none' ? 'The weather cleared up.' : ({ RainDance: 'It started to rain!', SunnyDay: 'The sunlight turned harsh!', Sandstorm: 'A sandstorm kicked up!', Hail: 'It started to hail!' }[w] || w), 'dim');
        break;
      }
      case '-sidestart': log(`${p[2].replace('move: ', '')} affects ${p[1].startsWith('p1') ? 'your' : LEADER.name + "'s"} side!`, 'dim'); break;
      case '-sideend': log(`${p[2].replace('move: ', '')} wore off on ${p[1].startsWith('p1') ? 'your' : LEADER.name + "'s"} side.`, 'dim'); break;
      case '-item': log(`${who(p[1])} ${from(p) ? 'obtained' : 'has'} ${p[2]}!`, 'dim'); break;
      case '-enditem': log(p.includes('[eat]') ? `${who(p[1])} ate its ${p[2]}!` : `${who(p[1])}'s ${p[2]} was used up.`, 'dim'); break;
      case '-ability': log(`[${who(p[1])}'s ${p[2]}]`, 'ability'); wait = 300; break;
      case '-start': {
        const eff = p[2].replace('move: ', '');
        if (eff === 'Substitute') setSub(sideOf(p[1]), true);
        log(eff === 'confusion' ? `${who(p[1])} became confused!` : eff === 'Substitute' ? `${who(p[1])} put up a substitute!` : eff.startsWith('typechange') ? `${who(p[1])} changed type!` : `${who(p[1])}: ${eff}`, 'dim'); break;
      }
      case '-end': if (p[2].includes('Substitute')) { setSub(sideOf(p[1]), false); log(`${who(p[1])}'s substitute faded!`, 'dim'); break; }
        if (p[2].includes('Future Sight')) { log(`${who(p[1])} took the Future Sight attack!`, 'dim'); break; } log(`${who(p[1])}'s ${p[2].replace('move: ', '')} ended.`, 'dim'); break;
      case '-activate': { const eff = p[2].replace(/^(move|ability|item): /, ''); if (eff === 'confusion' && ANIMS && !instant) await statusAnim('confused', sideOf(p[1])); if (eff === 'confusion') log(`${who(p[1])} is confused!`, 'dim'); else if (eff === 'Protect') log(`${who(p[1])} protected itself!`, 'dim'); else if (eff === 'Substitute') log('The substitute took damage!', 'dim'); else if (eff !== 'Leech Seed') log(`${who(p[1])}: ${eff}!`, 'dim'); break; }
      case 'cant': if (ANIMS && !instant && ['slp', 'par', 'frz', 'flinch'].includes(p[2])) await statusAnim(p[2], sideOf(p[1]));
        log(`${who(p[1])} ${({ slp: 'is fast asleep.', par: "is paralyzed! It can't move!", frz: 'is frozen solid!', recharge: 'must recharge!', flinch: 'flinched and couldn\'t move!', 'Truant': 'is loafing around!' }[p[2]] || "can't move!")}`, 'dim'); wait = 400; break;
      case '-prepare': if (ANIMS && !instant) await prepareAnim(toID(p[2]), sideOf(p[1]), p[3] ? sideOf(p[3]) : null);
        log(`${who(p[1])} is charging up!`, 'dim'); break;
      case '-hitcount': log(`Hit ${p[2]} time(s)!`, 'dim'); break;
      case '-formechange': case 'detailschange': if (p[2] && !subOn[sideOf(p[1])]) { const slot = $('.mon.' + sideOf(p[1]), ui.root); slot.replaceChildren(sprite(p[2].split(',')[0], sideOf(p[1]) === 'p1')); } break;
      case 'turn': if (!instant) log(`— Turn ${p[1]} —`, 'turn'); break;
      case 'win': log(p[1] === 'You' ? `You defeated ${LEADER.role} ${LEADER.name}!` : `You were defeated by ${LEADER.name}…`, 'win'); wait = 900; break;
      case '-message': log(p[1], 'dim'); break;
    }
    if (!instant && wait) await sleep(wait * pause);
  }
  updateBalls();
}
function setStatus(ident, st) { const side = sideOf(ident); const el = $('.hpbox.' + side + ' .st', ui.root); if (el && active[side]?.ident === ident) { el.textContent = st.toUpperCase(); el.className = 'st ' + st; } }
function updateBalls() {
  for (const side of ['p1', 'p2']) {
    const el = $('.balls.' + side, ui.root);
    el.replaceChildren(...G.battle[side].pokemon.map(p => h('span', { class: 'ball' + (p.fainted ? ' out' : p.status ? ' sts' : ''), title: side === 'p1' || p.fainted || p.isActive ? p.species.name : '?' })));
  }
}
function afterTurn() {
  updateBalls();
  if (G.ended) return finish();
  const req = G.request; ui.controls.replaceChildren();
  if (!req || req.wait) return;
  const foe = G.battle.p2.active[0];
  if (req.forceSwitch) { ui.controls.append(h('div', { class: 'prompt' }, 'Choose your next Pokémon'), switchPanel(req, true)); return; }
  const a = req.active[0];
  const me = req.side.pokemon.find(x => x.active);
  const info = me ? h('div', { class: 'meinfo' }, h('b', {}, me.details.split(',')[0]), ' · ',
    h('button', { class: 'link', onclick: e => showInfo('ability', me.baseAbility, e) }, dex.abilities.get(me.baseAbility).name), ' · ',
    me.item ? h('button', { class: 'link', onclick: e => showInfo('item', me.item, e) }, dex.items.get(me.item).name) : 'no item') : null;
  const moves = h('div', { class: 'movegrid' }, a.moves.map((m, i) => {
    const mv = dex.moves.get(m.id);
    let eff = '';
    if (foe && mv.category !== 'Status') {
      const types = foe.getTypes();
      const imm = !dex.getImmunity(mv.type, types);
      const e = dex.getEffectiveness(mv.type, types);
      eff = imm ? 'No effect' : e > 0 ? 'Super effective' : e < 0 ? 'Not very effective' : '';
    }
    return h('div', { class: 'movecell' }, h('button', { class: 'movebtn', style: `--c:${TYPE_COLORS[mv.type]}`, disabled: !!m.disabled || m.pp === 0, title: mv.shortDesc, onclick: () => act('move ' + (i + 1)) },
      h('span', { class: 'mvn' }, mv.name), h('span', { class: 'mvm' }, `${mv.type} · ${mv.category === 'Status' ? 'Status' : (mv.basePower || '—') + ' BP'} · ${m.pp ?? '–'}/${m.maxpp ?? '–'} PP`),
      eff ? h('span', { class: 'eff ' + (eff.startsWith('Super') ? 'good' : 'bad') }, eff) : null), infoBtn('move', mv.id, `${mv.name} details`));
  }));
  ui.controls.append(info, moves, a.trapped ? h('div', { class: 'prompt' }, "You can't switch out!") : switchPanel(req, false));
}
function switchPanel(req, forced) {
  return h('div', { class: 'party' }, req.side.pokemon.map((p, i) => {
    const sp = p.details.split(',')[0]; const [hp, st] = p.condition.split(' ');
    const fnt = p.condition.endsWith('fnt');
    const [c, m] = hp.split('/').map(Number);
    return h('button', { class: 'pmon', disabled: p.active || fnt, onclick: () => act('switch ' + (i + 1)), title: `${p.item ? dex.items.get(p.item).name + ' · ' : ''}${dex.abilities.get(p.baseAbility).name}\n${p.moves.map(x => dex.moves.get(x).name).join(' / ')}` },
      sprite(sp), h('span', {}, sp), h('i', { class: 'mini', style: `--w:${fnt ? 0 : (c / m * 100)}%` }), st && st !== 'fnt' ? h('em', { class: 'st ' + st }, st.toUpperCase()) : null);
  }));
}
async function act(choice) {
  if (busy) return; busy = true; closeInfo();
  ui.controls.replaceChildren(h('div', { class: 'prompt' }, 'Waiting…'));
  if (G.choose(choice)) { today().choices.push(choice); save(); await playLines(G.drain()); }
  busy = false; afterTurn();
}

// ---------- results ----------
function finish() {
  const d = today();
  if (!d.result) {
    d.result = { won: G.won, turns: G.turn, mine: G.battle.p1.pokemon.map(p => ({ s: p.species.name, f: p.fainted })),
      theirs: G.battle.p2.pokemon.map(p => ({ s: p.species.name, f: p.fainted })) };
    save();
  }
  ui.controls.replaceChildren(h('button', { class: 'primary', onclick: results }, 'See results'));
}
function shareText(r) {
  const short = { 'FireRed/LeafGreen': 'FRLG', 'HeartGold/SoulSilver': 'HGSS', 'Black/White': 'BW', 'Black 2/White 2': 'B2W2' }[LEADER.game] || LEADER.game;
  return [`Daily Gym #${DAY} · ${IS_CH ? 'Champion ' : IS_E4 ? 'E4 ' : ''}${LEADER.name} (${short})`,
    r.won ? (IS_CH ? `👑 Champion defeated in ${r.turns} turns` : IS_E4 ? `🏆 Elite Four cleared in ${r.turns} turns` : `🏅 Badge earned in ${r.turns} turns`) : `❌ Lost on turn ${r.turns}`,
    'Me:     ' + r.mine.map(m => m.f ? '🟥' : '🟩').join(''),
    'Leader: ' + r.theirs.map(m => m.f ? '⬛' : '🟨').join('')].join('\n');
}
function results() {
  const r = today().result; const st = stats(); const text = shareText(r);
  const copyBtn = h('button', { class: 'primary', onclick: async () => {
    try { await navigator.clipboard.writeText(text); copyBtn.textContent = 'Copied!'; } catch { copyBtn.textContent = 'Select the text above to copy'; }
  } }, 'Copy result');
  const cd = h('span', { class: 'mono' });
  const tick = () => { const n = new Date(); const m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1); const s = Math.max(0, (m - n) / 1000 | 0);
    cd.textContent = `${String(s / 3600 | 0).padStart(2, '0')}:${String(s % 3600 / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  tick(); clearInterval(window.__t); window.__t = setInterval(tick, 1000);
  render(leaderCard(true), h('section', { class: 'result ' + (r.won ? 'won' : 'lost') },
    h('h2', {}, r.won ? (IS_CH ? `You're the new Champion! You beat ${LEADER.name}!` : IS_E4 ? `You defeated Elite Four ${LEADER.name}!` : `You earned ${LEADER.name}'s badge!`) : `${LEADER.name} won this time`),
    h('div', { class: 'rteams' },
      h('div', {}, h('div', { class: 'eyebrow' }, 'Your team'), h('div', { class: 'row' }, r.mine.map(m => h('div', { class: 'rm' + (m.f ? ' f' : '') }, sprite(m.s))))),
      h('div', {}, h('div', { class: 'eyebrow' }, LEADER.name), h('div', { class: 'row' }, r.theirs.map(m => h('div', { class: 'rm' + (m.f ? ' f' : '') }, sprite(m.s)))))),
    h('pre', { class: 'share' }, text), h('div', {}, copyBtn),
    h('div', { class: 'statrow' }, h('div', {}, h('b', {}, st.played), 'Played'), h('div', {}, h('b', {}, st.played ? Math.round(st.wins / st.played * 100) + '%' : '–'), 'Win rate'),
      h('div', {}, h('b', {}, st.streak), 'Streak')),
    h('p', { class: 'muted' }, 'Next challenger in ', cd)));
}

// ---------- dialogs ----------
function modal(...kids) {
  const bg = h('div', { class: 'modal', onclick: e => { if (e.target === bg) bg.remove(); } }, h('div', { class: 'dialog' }, ...kids));
  document.body.append(bg); return bg;
}
function confirmDialog(title, body, ok) {
  const m = modal(h('h3', {}, title), h('p', {}, body), h('div', { class: 'btns' }, h('button', { class: 'ghost', onclick: () => m.remove() }, 'Cancel'),
    h('button', { class: 'primary', onclick: () => { m.remove(); ok(); } }, 'Battle!')));
}
function showHelp() {
  const m = modal(h('h3', {}, 'How to play'),
    h('ul', {},
      h('li', {}, 'Every day a Gym Leader, Elite Four member or Champion from Generations 1–5 appears, with their first-battle team from FRLG, Emerald, HGSS, Platinum, BW or B2W2.'),
      h('li', {}, 'You draft as many Pokémon as the leader has, from a randomized pool. Everyone gets the same leader, pool and sets each day.'),
      h('li', {}, 'Your Pokémon have random abilities and learnset moves with nuzlocke-style rules: no OHKO or self-KO moves, no Wonder Guard, Huge Power, Shadow Tag, Moody, Speed Boost or Truant-style abilities, at least one STAB attack and two attacking moves.'),
      h('li', {}, 'Held items follow competitive logic — Choice items on all-out attackers, Leftovers on bulky or recovery sets, Eviolite on NFEs, Chesto on Rest, and so on. The leader gets items the same way.'),
      h('li', {}, 'Battles use Gen 5 mechanics on the Pokémon Showdown engine at Level 50. Your opponent’s levels keep their in-game spacing below their ace.'),
      h('li', {}, 'One attempt per day. Your progress is saved in this browser.'),
      h('li', {}, 'Move animations come from Pokémon Showdown (CC0/MIT). Turn them off with the ✨ button.')),
    h('div', { class: 'btns' }, h('button', { class: 'primary', onclick: () => m.remove() }, 'Got it')));
}

intro();
if (!store.seenHelp) { store.seenHelp = true; save(); showHelp(); }
