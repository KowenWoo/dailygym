// Battle backgrounds inspired by each opponent's gym, League room or champion hall.
// Everything is drawn here as SVG (original artwork, not game rips) from a small kit of
// wall styles, floor styles, props and particle effects, combined per trainer.
import { RNG } from './rng.js';

const W = 1000, H = 360, HZ = 168; // viewBox and horizon (wall/floor seam)
const VPX = 500, VPY = 60;          // vanishing point for floor perspective

// ---------- helpers ----------
const g = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const rg = (id, inner, outer, op = 1) => `<radialGradient id="${id}"><stop offset="0" stop-color="${inner}" stop-opacity="${op}"/><stop offset="1" stop-color="${outer}" stop-opacity="0"/></radialGradient>`;
const lerp = (a, b, t) => a + (b - a) * t;
const floorX = (x, y) => VPX + (x - VPX) * (y - VPY) / (H - VPY); // project a bottom-edge x up to row y

// ---------- walls ----------
const WALLS = {
  plain: () => '',
  bricks: (p, r) => {
    let s = ''; const bh = 22;
    for (let y = 0, row = 0; y < HZ; y += bh, row++) for (let x = (row % 2) * -30; x < W; x += 60)
      s += `<rect x="${x + 1}" y="${y + 1}" width="58" height="${bh - 2}" rx="2" fill="${p.wallLine}" opacity="${0.18 + r.next() * 0.14}"/>`;
    return s;
  },
  panels: p => { // riveted metal
    let s = '';
    for (let x = 0; x < W; x += 125) { s += `<rect x="${x + 3}" y="6" width="119" height="${HZ - 12}" rx="4" fill="${p.wallLine}" opacity=".16"/>`;
      for (const [dx, dy] of [[10, 14], [113, 14], [10, HZ - 18], [113, HZ - 18]]) s += `<circle cx="${x + dx}" cy="${dy}" r="3" fill="${p.wallLine}" opacity=".5"/>`; }
    return s;
  },
  hazard: p => WALLS.panels(p) + `<g opacity=".85">${Array.from({ length: 34 }, (_, i) => `<path d="M${i * 32 - 20} ${HZ} l20 -22 h16 l-20 22z" fill="#1d1d1d"/>`).join('')}<rect y="${HZ - 22}" width="${W}" height="22" fill="${p.accent}" opacity=".9" style="mix-blend-mode:multiply"/></g>`,
  shoji: p => {
    let s = `<rect y="0" width="${W}" height="16" fill="${p.wallLine}" opacity=".55"/><rect y="${HZ - 14}" width="${W}" height="14" fill="${p.wallLine}" opacity=".55"/>`;
    for (let x = 0; x < W; x += 100) { s += `<rect x="${x}" y="16" width="6" height="${HZ - 30}" fill="${p.wallLine}" opacity=".6"/>`;
      for (let y = 40; y < HZ - 14; y += 30) s += `<rect x="${x}" y="${y}" width="100" height="2" fill="${p.wallLine}" opacity=".35"/>`;
      s += `<rect x="${x + 50}" y="16" width="2" height="${HZ - 30}" fill="${p.wallLine}" opacity=".35"/>`; }
    return s;
  },
  glass: p => { // greenhouse arches
    let s = '';
    for (let x = 0; x < W; x += 110) s += `<path d="M${x + 8} ${HZ} V60 Q${x + 55} 0 ${x + 102} 60 V${HZ}" fill="#ffffff" opacity=".14" stroke="${p.wallLine}" stroke-width="4"/><path d="M${x + 55} 18 V${HZ} M${x + 8} 105 H${x + 102}" stroke="${p.wallLine}" stroke-width="3" opacity=".7"/>`;
    return s;
  },
  rock: (p, r) => {
    let s = '';
    for (let i = 0; i < 46; i++) { const cx = r.next() * W, cy = r.next() * HZ, rad = 25 + r.next() * 55; let d = '';
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, rr = rad * (0.65 + r.next() * 0.45); d += (k ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(0) + ' ' + (cy + Math.sin(a) * rr * 0.7).toFixed(0); }
      s += `<path d="${d}z" fill="${i % 3 ? p.wallLine : p.accent}" opacity="${0.12 + r.next() * 0.18}"/>`; }
    return s;
  },
  tiles: p => { let s = ''; for (let y = 0; y < HZ; y += 34) for (let x = 0; x < W; x += 34) s += `<rect x="${x + 1.5}" y="${y + 1.5}" width="31" height="31" fill="${p.wallLine}" opacity="${(x / 34 + y / 34) % 2 ? .18 : .08}"/>`; return s; },
  curtain: p => { let s = ''; for (let x = 0; x < W; x += 40) s += `<rect x="${x}" width="20" height="${HZ}" fill="${p.wallLine}" opacity=".22"/>`;
    return s + `<path d="M0 0 H${W} V26 ${Array.from({ length: 21 }, (_, i) => `Q${W - i * 50 - 25} 52 ${W - (i + 1) * 50} 26`).join(' ')} Z" fill="${p.accent}" opacity=".9"/>`; },
  planks: p => { let s = ''; for (let x = 0; x < W; x += 46) s += `<rect x="${x}" width="2" height="${HZ}" fill="${p.wallLine}" opacity=".35"/>`; return s + `<rect y="${HZ - 18}" width="${W}" height="18" fill="${p.wallLine}" opacity=".45"/>`; },
  shelves: p => { // museum / library
    let s = '';
    for (let x = 30; x < W; x += 190) { s += `<rect x="${x}" y="22" width="150" height="${HZ - 30}" fill="${p.wallLine}" opacity=".55"/>`;
      for (let y = 30; y < HZ - 20; y += 34) { s += `<rect x="${x + 6}" y="${y + 28}" width="138" height="4" fill="${p.wallLine}"/>`;
        for (let bx = x + 8; bx < x + 140; bx += 9) s += `<rect x="${bx}" y="${y + 6 + (bx * 7 % 9)}" width="7" height="${22 - (bx * 7 % 9)}" fill="${['#b5523b', '#3b6ab5', '#c9a74a', '#4c8a4c', '#7d4c9e'][bx % 5]}" opacity=".85"/>`; } }
    return s;
  },
  sky: (p, r) => { let s = ''; for (let i = 0; i < 6; i++) s += cloud(r.next() * W, 20 + r.next() * 90, 0.6 + r.next() * 0.8, '#fff', 0.85); return s; },
  stars: (p, r) => { let s = ''; for (let i = 0; i < 90; i++) s += `<circle cx="${(r.next() * W).toFixed(0)}" cy="${(r.next() * HZ).toFixed(0)}" r="${(r.next() * 1.8 + .4).toFixed(1)}" fill="#fff" opacity="${(.4 + r.next() * .6).toFixed(2)}"/>`; return s; },
  ice: (p, r) => { let s = ''; for (let i = 0; i < 26; i++) { const x = r.next() * W, w = 20 + r.next() * 40, h = 40 + r.next() * 110;
    s += `<path d="M${x} ${HZ} L${x + w / 2} ${HZ - h} L${x + w} ${HZ}z" fill="#ffffff" opacity="${.12 + r.next() * .2}"/>`; } return s; },
  honeycomb: p => { let s = ''; const R = 22, hw = R * Math.sqrt(3);
    for (let row = 0; row * R * 1.5 < HZ + R; row++) for (let col = -1; col * hw < W + hw; col++) { const cx = col * hw + (row % 2) * hw / 2, cy = row * R * 1.5;
      s += `<path d="${Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 3 * k + Math.PI / 6; return (k ? 'L' : 'M') + (cx + Math.cos(a) * (R - 2)).toFixed(1) + ' ' + (cy + Math.sin(a) * (R - 2)).toFixed(1); }).join('')}z" fill="${p.accent}" opacity="${(col + row) % 3 ? .18 : .32}"/>`; }
    return s; },
  waterfall: (p, r) => { let s = ''; for (let i = 0; i < 40; i++) { const x = 300 + r.next() * 400; s += `<rect x="${x}" y="0" width="${2 + r.next() * 5}" height="${HZ}" fill="#fff" opacity="${.15 + r.next() * .3}"/>`; }
    return `<rect x="290" width="420" height="${HZ}" fill="#7fc6ef" opacity=".7"/>` + s + WALLS.rock(p, r); },
  city: (p, r) => { let s = ''; for (let x = -10; x < W; x += 30 + r.next() * 40) { const w = 40 + r.next() * 50, h = 50 + r.next() * 100;
    s += `<rect x="${x}" y="${HZ - h}" width="${w}" height="${h}" fill="${p.wallLine}" opacity=".85"/>`;
    for (let wy = HZ - h + 8; wy < HZ - 8; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12) if (r.next() > .55) s += `<rect x="${wx}" y="${wy}" width="5" height="7" fill="${p.accent}" opacity=".8"/>`; }
    return `<circle cx="820" cy="48" r="26" fill="#fdf3c9" opacity=".9"/>` + s; },
  marble: p => { let s = ''; for (let x = 40; x < W; x += 160) s += `<rect x="${x}" y="10" width="34" height="${HZ - 10}" fill="${p.wallLine}" opacity=".5"/><rect x="${x - 6}" y="10" width="46" height="10" fill="${p.wallLine}" opacity=".7"/><rect x="${x - 6}" y="${HZ - 12}" width="46" height="12" fill="${p.wallLine}" opacity=".7"/>`;
    return s + `<rect y="0" width="${W}" height="10" fill="${p.accent}" opacity=".8"/>`; },
};
function cloud(x, y, s, c, o) { return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})" fill="${c}" opacity="${o}"><ellipse cx="0" cy="10" rx="46" ry="16"/><ellipse cx="-20" cy="2" rx="22" ry="16"/><ellipse cx="12" cy="-4" rx="26" ry="20"/></g>`; }

// ---------- floors ----------
function floorBase(p) { return `<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#$$floor)"/>`; }
const rows = (n, f) => Array.from({ length: n }, (_, i) => f(i, n));
const rowY = t => HZ + (H - HZ) * Math.pow(t, 1.6); // perspective-spaced rows
const FLOORS = {
  plain: () => '',
  grid: p => rows(9, i => `<path d="M0 ${rowY(i / 8).toFixed(1)} H${W}" stroke="${p.floorLine}" stroke-width="${1 + i * .25}" opacity=".5"/>`).join('') +
    rows(25, i => { const x = -1400 + i * 158; return `<path d="M${floorX(x, HZ).toFixed(0)} ${HZ} L${x} ${H}" stroke="${p.floorLine}" stroke-width="1.5" opacity=".45"/>`; }).join(''),
  checker: p => { let s = ''; for (let i = 0; i < 8; i++) for (let j = 0; j < 22; j++) { if ((i + j) % 2) continue;
    const y0 = rowY(i / 8), y1 = rowY((i + 1) / 8), x0 = -1000 + j * 140, x1 = x0 + 140;
    s += `<path d="M${floorX(x0, y0).toFixed(0)} ${y0.toFixed(1)} L${floorX(x1, y0).toFixed(0)} ${y0.toFixed(1)} L${floorX(x1, y1).toFixed(0)} ${y1.toFixed(1)} L${floorX(x0, y1).toFixed(0)} ${y1.toFixed(1)}z" fill="${p.floorLine}" opacity=".35"/>`; } return s; },
  planks: p => rows(30, i => { const x = -1500 + i * 135; return `<path d="M${floorX(x, HZ).toFixed(0)} ${HZ} L${x} ${H}" stroke="${p.floorLine}" stroke-width="2" opacity=".5"/>`; }).join('') +
    rows(6, i => `<path d="M0 ${rowY((i + .5) / 6).toFixed(1)} H${W}" stroke="${p.floorLine}" stroke-width="1" opacity=".25" stroke-dasharray="${60 + i * 20} ${90 + i * 30}"/>`).join(''),
  tatami: p => FLOORS.grid({ ...p, floorLine: p.floorLine }) + rows(4, i => `<path d="M0 ${rowY((i * 2 + 1) / 8).toFixed(1)} H${W}" stroke="${p.accent}" stroke-width="3" opacity=".35"/>`).join(''),
  water: (p, r) => { let s = ''; for (let i = 0; i < 40; i++) { const t = r.next(), y = rowY(t), x = r.next() * W, w = 20 + t * 70;
    s += `<path d="M${(x - w).toFixed(0)} ${y.toFixed(0)} q${(w / 2).toFixed(0)} -6 ${w.toFixed(0)} 0 t${w.toFixed(0)} 0" stroke="#fff" stroke-width="${1 + t * 2}" fill="none" opacity="${.25 + r.next() * .35}"/>`; } return s; },
  pool: (p, r) => `<rect y="${HZ}" width="${W}" height="16" fill="${p.accent}" opacity=".9"/>` + FLOORS.water(p, r) +
    [0.35, 0.7].map(t => { const y = rowY(t); return `<path d="M0 ${y.toFixed(0)} H${W}" stroke="#ff5a4e" stroke-width="${3 + t * 3}" stroke-dasharray="14 10" opacity=".85"/>`; }).join(''),
  grass: (p, r) => { let s = ''; for (let i = 0; i < 260; i++) { const t = r.next(), y = rowY(t), x = r.next() * W, hgt = 4 + t * 12;
    s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l${(r.next() * 6 - 3).toFixed(1)} ${(-hgt).toFixed(1)}" stroke="${p.floorLine}" stroke-width="${1 + t * 1.5}" opacity=".55"/>`; } return s; },
  sand: (p, r) => { let s = ''; for (let i = 0; i < 300; i++) { const t = r.next(); s += `<circle cx="${(r.next() * W).toFixed(0)}" cy="${rowY(t).toFixed(0)}" r="${(0.6 + t * 1.6).toFixed(1)}" fill="${p.floorLine}" opacity=".45"/>`; }
    return s + `<ellipse cx="${VPX}" cy="${rowY(.55)}" rx="380" ry="62" fill="none" stroke="#fff" stroke-width="4" opacity=".55"/>`; },
  ice: (p, r) => FLOORS.grid({ ...p, floorLine: '#ffffff' }) + rows(12, () => { const t = r.next(), y = rowY(t), x = r.next() * W;
    return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l${(80 + t * 120).toFixed(0)} -${(4 + t * 6).toFixed(0)}" stroke="#fff" stroke-width="${2 + t * 4}" opacity=".5" stroke-linecap="round"/>`; }).join(''),
  stone: (p, r) => { let s = ''; for (let i = 0; i < 7; i++) { const y0 = rowY(i / 7), y1 = rowY((i + 1) / 7); let x = -1200 + r.next() * 100;
    while (x < 2200) { const w = 140 + r.next() * 120; s += `<path d="M${floorX(x, y0).toFixed(0)} ${y0.toFixed(1)} L${floorX(x + w - 8, y0).toFixed(0)} ${y0.toFixed(1)} L${floorX(x + w - 8, y1 - 3).toFixed(0)} ${(y1 - 3).toFixed(1)} L${floorX(x, y1 - 3).toFixed(0)} ${(y1 - 3).toFixed(1)}z" fill="${p.floorLine}" opacity="${.12 + r.next() * .2}"/>`; x += w; } } return s; },
  carpet: p => { const a = floorX(380, HZ), b = floorX(620, HZ);
    return FLOORS.checker({ ...p }) + `<path d="M${a} ${HZ} L${b} ${HZ} L780 ${H} L220 ${H}z" fill="${p.accent}" opacity=".95"/><path d="M${a + 6} ${HZ} L240 ${H} M${b - 6} ${HZ} L760 ${H}" stroke="#f3c64b" stroke-width="5"/>`; },
  metal: p => FLOORS.grid(p) + rows(26, (i) => { const x = -1250 + i * 158; return `<circle cx="${floorX(x, rowY(.5)).toFixed(0)}" cy="${rowY(.5).toFixed(0)}" r="3" fill="${p.floorLine}" opacity=".6"/>`; }).join(''),
  lava: (p, r) => FLOORS.stone(p, r) + rows(5, () => { const t = .12 + r.next() * .45, y = rowY(t), x = 340 + r.next() * 320, rx = 40 + t * 110;
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * .18).toFixed(0)}" fill="#ff7a1a"/><ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(rx * .7).toFixed(0)}" ry="${(rx * .1).toFixed(0)}" fill="#ffd25a" opacity=".85"/>`; }).join(''),
  runway: p => FLOORS.grid(p) + (() => { const a = floorX(440, HZ), b = floorX(560, HZ);
    return `<path d="M${a} ${HZ} L${b} ${HZ} L700 ${H} L300 ${H}z" fill="#1b1b24" opacity=".9"/>` + rows(9, i => { const t = (i + .5) / 9, y = rowY(t);
      return `<circle cx="${floorX(300, y).toFixed(0)}" cy="${y.toFixed(0)}" r="${2 + t * 4}" fill="${p.accent}"/><circle cx="${floorX(700, y).toFixed(0)}" cy="${y.toFixed(0)}" r="${2 + t * 4}" fill="${p.accent}"/>`; }).join(''); })(),
  clouds: (p, r) => rows(10, () => { const t = r.next(); return cloud(r.next() * W, rowY(t) + 6, .6 + t * 1.4, '#fff', .75); }).join(''),
  space: (p, r) => FLOORS.grid({ ...p, floorLine: p.accent }),
  rails: p => FLOORS.stone(p, new RNG(3)) + [380, 620].map(x => `<path d="M${floorX(x, HZ).toFixed(0)} ${HZ} L${x - (x < 500 ? 120 : -120)} ${H}" stroke="#8b8f99" stroke-width="5"/>`).join('') +
    rows(8, i => { const y = rowY((i + .5) / 8); return `<path d="M${floorX(260, y).toFixed(0)} ${y.toFixed(0)} H${floorX(740, y).toFixed(0)}" stroke="#6b4a2b" stroke-width="${3 + i}" opacity=".9"/>`; }).join(''),
};

// ---------- props (drawn along the horizon; x is the prop's center) ----------
const B = HZ + 2; // props stand on the seam
const PROPS = {
  boulder: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><path d="M-60 0 Q-66 -40 -30 -58 Q8 -76 40 -50 Q66 -30 58 0z" fill="${p.prop}"/><path d="M-30 -50 Q0 -64 26 -46" stroke="#fff" stroke-width="5" opacity=".2" fill="none"/></g>`,
  pillar: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-22" y="-150" width="44" height="150" fill="${p.prop}"/><rect x="-30" y="-160" width="60" height="14" fill="${p.prop}"/><rect x="-30" y="-12" width="60" height="12" fill="${p.prop}"/><rect x="-14" y="-146" width="8" height="134" fill="#fff" opacity=".18"/></g>`,
  tree: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-10" y="-70" width="20" height="70" fill="#6b4a2b"/><circle cx="0" cy="-95" r="45" fill="${p.prop}"/><circle cx="-30" cy="-70" r="30" fill="${p.prop}"/><circle cx="30" cy="-72" r="30" fill="${p.prop}"/><circle cx="-12" cy="-110" r="16" fill="#fff" opacity=".14"/></g>`,
  flowers: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><ellipse cx="0" cy="-16" rx="70" ry="22" fill="#3f8a3a"/>${[-50, -26, 0, 24, 48].map((dx, i) => `<circle cx="${dx}" cy="${-26 - (i % 2) * 8}" r="9" fill="${['#ff7eb6', '#ffd23f', '#ff5a5f', '#c792ff', '#fff'][i]}"/><circle cx="${dx}" cy="${-26 - (i % 2) * 8}" r="3" fill="#ffe08a"/>`).join('')}</g>`,
  bush: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><ellipse cx="0" cy="-22" rx="56" ry="26" fill="${p.prop}"/><ellipse cx="-22" cy="-34" rx="26" ry="20" fill="${p.prop}"/><ellipse cx="18" cy="-38" rx="28" ry="22" fill="${p.prop}"/></g>`,
  crystal: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><path d="M-30 0 L-20 -70 L-6 0z M-10 0 L4 -110 L20 0z M14 0 L30 -60 L40 0z" fill="${p.prop}" opacity=".85"/><path d="M4 -110 L10 0" stroke="#fff" stroke-width="3" opacity=".5"/></g>`,
  candle: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-4" y="-80" width="8" height="80" fill="#3a2f45"/><rect x="-26" y="-84" width="52" height="6" fill="#3a2f45"/>${[-22, 0, 22].map(dx => `<rect x="${dx - 4}" y="-104" width="8" height="20" fill="#efe6d2"/><ellipse class="flame" cx="${dx}" cy="-112" rx="5" ry="9" fill="${p.accent}"/><circle cx="${dx}" cy="-112" r="22" fill="url(#$$glow)"/>`).join('')}</g>`,
  torch: (x, p, s = 1) => `<g transform="translate(${x} ${B - 60}) scale(${s})"><rect x="-5" y="-30" width="10" height="40" fill="#5a4636"/><ellipse class="flame" cx="0" cy="-42" rx="10" ry="16" fill="#ffb02e"/><ellipse cx="0" cy="-38" rx="5" ry="8" fill="#fff3b0"/><circle cx="0" cy="-40" r="44" fill="url(#$$glow)"/></g>`,
  lamp: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-3" y="-120" width="6" height="120" fill="${p.prop}"/><path d="M-18 -120 h36 l-8 -20 h-20z" fill="${p.prop}"/><circle cx="0" cy="-114" r="40" fill="url(#$$glow)"/></g>`,
  banner: (x, p, s = 1) => `<g transform="translate(${x} 8) scale(${s})"><rect x="-26" y="0" width="52" height="96" fill="${p.accent}"/><path d="M-26 96 L0 80 L26 96" fill="${p.accent}"/><circle cx="0" cy="38" r="15" fill="#fff" opacity=".85"/><rect x="-32" y="-4" width="64" height="6" fill="${p.prop}"/></g>`,
  bolt: (x, p, s = 1) => `<g transform="translate(${x} 70) scale(${s})"><path d="M8 -50 L-18 4 H0 L-10 50 L22 -8 H4 L14 -50z" fill="${p.accent}" stroke="#2a2a2a" stroke-width="3"/></g>`,
  trashcan: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><path d="M-20 0 L-24 -50 H24 L20 0z" fill="#8a9099"/><rect x="-27" y="-58" width="54" height="9" rx="3" fill="#6f757e"/><path d="M-10 -46 V-6 M0 -46 V-6 M10 -46 V-6" stroke="#6f757e" stroke-width="2"/></g>`,
  statue: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-26" y="-30" width="52" height="30" fill="${p.prop}"/><path d="M-18 -30 Q-22 -80 0 -96 Q22 -80 18 -30z" fill="${p.prop}"/><circle cx="0" cy="-104" r="14" fill="${p.prop}"/><path d="M-14 -110 L-24 -128 L-6 -116 M14 -110 L24 -128 L6 -116" fill="${p.prop}" stroke="${p.prop}" stroke-width="4"/></g>`,
  scroll: (x, p, s = 1) => `<g transform="translate(${x} 18) scale(${s})"><rect x="-22" y="0" width="44" height="110" fill="#f1e6c8"/><rect x="-26" y="-4" width="52" height="6" fill="#5a3e22"/><rect x="-26" y="108" width="52" height="6" fill="#5a3e22"/><path d="M0 18 v20 M-8 28 h16 M-6 52 q6 10 12 0 M0 64 v26" stroke="#2c2c2c" stroke-width="5" stroke-linecap="round"/></g>`,
  window: (x, p, s = 1) => `<g transform="translate(${x} 26) scale(${s})"><rect x="-50" y="0" width="100" height="90" fill="#bfe6ff"/><path d="M0 0 V90 M-50 45 H50" stroke="${p.prop}" stroke-width="6"/><rect x="-50" y="0" width="100" height="90" fill="none" stroke="${p.prop}" stroke-width="8"/><path d="M-40 70 L-10 10" stroke="#fff" stroke-width="6" opacity=".5"/></g>`,
  gear: (x, p, s = 1) => `<g transform="translate(${x} 70) scale(${s})" class="spin"><circle r="34" fill="${p.prop}"/>${rows(8, i => `<rect x="-7" y="-46" width="14" height="16" fill="${p.prop}" transform="rotate(${i * 45})"/>`).join('')}<circle r="12" fill="${p.wallTop}"/></g>`,
  girder: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-28" y="-${HZ}" width="10" height="${HZ}" fill="${p.prop}"/><rect x="18" y="-${HZ}" width="10" height="${HZ}" fill="${p.prop}"/>${rows(6, i => `<path d="M-18 ${-i * 28} L18 ${-i * 28 - 28}" stroke="${p.prop}" stroke-width="5"/>`).join('')}</g>`,
  palm: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><path d="M0 0 Q-6 -60 6 -120" stroke="#8a6a3b" stroke-width="12" fill="none"/>${[-60, -25, 15, 50, 85].map(a => `<path d="M6 -120 q${Math.cos(a * Math.PI / 180) * 40} ${-20 + Math.sin(a * Math.PI / 180) * 30} ${Math.cos(a * Math.PI / 180) * 70} ${Math.sin(a * Math.PI / 180) * 40 + 10}" stroke="#3f9a4a" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('')}</g>`,
  snowpile: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><ellipse cx="0" cy="-8" rx="70" ry="22" fill="#f4fbff"/><ellipse cx="-18" cy="-22" rx="30" ry="18" fill="#ffffff"/></g>`,
  lantern: (x, p, s = 1) => `<g transform="translate(${x} 20) scale(${s})"><path d="M0 -20 V0" stroke="#333" stroke-width="2"/><ellipse cx="0" cy="22" rx="20" ry="24" fill="${p.accent}"/><rect x="-10" y="-2" width="20" height="5" fill="#333"/><rect x="-10" y="44" width="20" height="5" fill="#333"/><circle cx="0" cy="22" r="40" fill="url(#$$glow)"/></g>`,
  ropes: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-6" y="-80" width="12" height="80" fill="#c03028"/>${[-66, -46, -26].map(y => `<path d="M0 ${y} H${x < 500 ? 160 : -160}" stroke="#f1f1f1" stroke-width="4"/>`).join('')}</g>`,
  stands: (x, p, s = 1) => { const r = new RNG(x); return `<g transform="translate(${x} ${B}) scale(${s})"><path d="M-170 0 L-150 -90 H150 L170 0z" fill="${p.prop}"/>${rows(60, i => `<circle cx="${-140 + (i % 15) * 20 + (Math.floor(i / 15) % 2) * 10}" cy="${-78 + Math.floor(i / 15) * 20}" r="7" fill="${['#e86a5c', '#5c8de8', '#f2c94c', '#6fcf97', '#bb6bd9'][Math.floor(r.next() * 5)]}" opacity=".9"/>`).join('')}</g>`; },
  spotlight: (x, p, s = 1) => `<g transform="translate(${x} 0) scale(${s})"><path d="M-12 0 L12 0 L110 ${HZ + 60} L-110 ${HZ + 60}z" fill="${p.accent}" opacity=".18"/><rect x="-16" y="-4" width="32" height="18" rx="4" fill="#333"/></g>`,
  table: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-55" y="-46" width="110" height="10" fill="#fff"/><path d="M-55 -36 L-60 -10 H60 L55 -36z" fill="#fff" opacity=".9"/><rect x="-40" y="-10" width="6" height="10" fill="#6b4a2b"/><rect x="34" y="-10" width="6" height="10" fill="#6b4a2b"/><circle cx="-18" cy="-52" r="9" fill="${p.accent}"/><rect x="12" y="-66" width="6" height="20" fill="#9ad"/></g>`,
  fossil: (x, p, s = 1) => `<g transform="translate(${x} ${B}) scale(${s})"><rect x="-60" y="-14" width="120" height="14" fill="${p.prop}"/><path d="M-50 -14 Q-40 -70 0 -76 Q40 -80 54 -40 L62 -50 M-30 -20 V-46 M-12 -20 V-58 M6 -20 V-62 M24 -20 V-56" stroke="#efe6d2" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="56" cy="-44" r="10" fill="#efe6d2"/></g>`,
  planet: (x, p, s = 1) => `<g transform="translate(${x} 60) scale(${s})"><circle r="34" fill="${p.accent}"/><ellipse rx="58" ry="12" fill="none" stroke="#fff" stroke-width="4" opacity=".7" transform="rotate(-18)"/><circle cx="-10" cy="-10" r="10" fill="#fff" opacity=".2"/></g>`,
  pokeball: (x, p, s = 1) => `<g transform="translate(${x} 70) scale(${s})" opacity=".85"><circle r="40" fill="#fff"/><path d="M-40 0 A40 40 0 0 1 40 0z" fill="${p.accent}"/><rect x="-40" y="-4" width="80" height="8" fill="#222"/><circle r="12" fill="#fff" stroke="#222" stroke-width="6"/></g>`,
  hoop: (x, p, s = 1) => `<g transform="translate(${x} 60) scale(${s})"><circle r="36" fill="none" stroke="${p.accent}" stroke-width="10"/><circle r="36" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/></g>`,
};

// ---------- particles (DOM, animated with CSS) ----------
export const FX = ['embers', 'snow', 'leaves', 'petals', 'sparks', 'bubbles', 'wisps', 'dust', 'twinkle', 'rain', 'feathers'];

// ---------- the scene kit, per trainer ----------
// pal: wallTop, wallBot, wallLine, floorTop, floorBot, floorLine, prop, accent, plat (platform base), glow
const P = (o) => ({ wallTop: '#556', wallBot: '#334', wallLine: '#223', floorTop: '#887', floorBot: '#665', floorLine: '#443', prop: '#445', accent: '#e33', plat: '#5e6a4a', glow: '#ffd27a', ...o });
const A = (name, wall, floor, pal, props = [], fx = null) => ({ name, wall, floor, pal: P(pal), props, fx });

const ROCK = { wallTop: '#6b5b4b', wallBot: '#4a3d31', wallLine: '#2e241c', accent: '#8a7660', floorTop: '#8f7d66', floorBot: '#6e5d49', floorLine: '#4b3e30', prop: '#7d6a55', plat: '#7b6a54' };
const POOL = { wallTop: '#e8f6ff', wallBot: '#bfe2f5', wallLine: '#6aaed6', floorTop: '#4fb0e8', floorBot: '#2d7fc4', floorLine: '#ffffff', accent: '#dfeff9', prop: '#ffffff', plat: '#7cc6ee' };
const ELEC = { wallTop: '#4d5563', wallBot: '#2f3540', wallLine: '#9aa5b5', floorTop: '#5f6a79', floorBot: '#3b4350', floorLine: '#a7b2c2', prop: '#7b8696', accent: '#f8d030', plat: '#6d7889', glow: '#fff07a' };
const GARDEN = { wallTop: '#cfeedd', wallBot: '#9ed3b3', wallLine: '#5d8a5a', floorTop: '#78c25b', floorBot: '#4f9a3c', floorLine: '#2f6b22', prop: '#3f8a3a', accent: '#ff86b6', plat: '#5fa846' };
const PSY = { wallTop: '#3a1f4f', wallBot: '#24123a', wallLine: '#c45aa4', floorTop: '#5a2f72', floorBot: '#371a4d', floorLine: '#f08bd0', prop: '#6c3d8a', accent: '#f85888', plat: '#7b4b96', glow: '#ff9be0' };
const LAVA = { wallTop: '#5a1f12', wallBot: '#2e0f08', wallLine: '#1a0805', accent: '#c4441e', floorTop: '#4a2a20', floorBot: '#2a1712', floorLine: '#120806', prop: '#3a1d14', plat: '#5b3a2c', glow: '#ff9a3c' };
const SAND = { wallTop: '#c9a46a', wallBot: '#a9844f', wallLine: '#7a5c34', floorTop: '#e2c48e', floorBot: '#c7a46a', floorLine: '#9b7a46', prop: '#7a5c34', accent: '#b84a3a', plat: '#cfae76' };
const SKY = { wallTop: '#7ec4f5', wallBot: '#cbe9fb', wallLine: '#fff', floorTop: '#d7ecf8', floorBot: '#a9d3ee', floorLine: '#ffffff', prop: '#c7a46a', accent: '#a890f0', plat: '#c9b48a' };
const FOREST = { wallTop: '#2f5a2c', wallBot: '#1f3d1d', wallLine: '#123010', accent: '#a8b820', floorTop: '#5e8a3a', floorBot: '#3d6426', floorLine: '#244a16', prop: '#2c6a2a', plat: '#6d8f3e' };
const GHOST = { wallTop: '#2a2140', wallBot: '#140f22', wallLine: '#4d3d70', accent: '#b07cff', floorTop: '#3a2d55', floorBot: '#1c1530', floorLine: '#6b56a0', prop: '#2e2347', plat: '#4a3c6a', glow: '#c9a2ff' };
const ICE = { wallTop: '#cfeaf5', wallBot: '#9fd0e6', wallLine: '#6fb3d1', accent: '#88d0d0', floorTop: '#e6f6fc', floorBot: '#b8e0ef', floorLine: '#86c1d8', prop: '#b8e6f5', plat: '#c9eaf5' };
const STEEL = { wallTop: '#8c95a3', wallBot: '#636b78', wallLine: '#3f4550', floorTop: '#a8b0bd', floorBot: '#7d8592', floorLine: '#4f5663', prop: '#59606c', accent: '#d8dbe2', plat: '#9aa2ae' };
const DRAGON = { wallTop: '#3a2f5a', wallBot: '#211a38', wallLine: '#5d4c8f', accent: '#7038f8', floorTop: '#6a5f7f', floorBot: '#433a56', floorLine: '#2b2440', prop: '#4d4270', plat: '#6a5d88', glow: '#b394ff' };
const DOJO = { wallTop: '#e9d9b4', wallBot: '#d4bf92', wallLine: '#7a5a34', floorTop: '#cdb57a', floorBot: '#a98f55', floorLine: '#6f5730', prop: '#7a5a34', accent: '#3f7a3a', plat: '#b99f63' };
const DARK = { wallTop: '#1d2140', wallBot: '#2f2a4a', wallLine: '#0d0f22', accent: '#ffd36a', floorTop: '#3a3550', floorBot: '#1f1b30', floorLine: '#59507a', prop: '#2a2540', plat: '#4b4466' };
const HALL = { wallTop: '#3a2a1a', wallBot: '#20160d', wallLine: '#c9a24a', accent: '#b8202a', floorTop: '#e8dcc0', floorBot: '#c9b996', floorLine: '#9c8a64', prop: '#d9c08a', plat: '#d8c79a', glow: '#ffe7a3' };

const ARENAS = {
  // ----- Kanto -----
  'Gym Leader:Brock': A('Pewter Gym', 'rock', 'stone', ROCK, [['boulder', 120, 1.2], ['boulder', 880, 1], ['boulder', 300, .7]], 'dust'),
  'Gym Leader:Misty': A('Cerulean Gym', 'tiles', 'pool', POOL, [['window', 200], ['window', 800]], 'bubbles'),
  'Gym Leader:Lt. Surge': A('Vermilion Gym', 'hazard', 'metal', ELEC, [['trashcan', 90], ['trashcan', 160], ['trashcan', 870], ['bolt', 330, 1], ['bolt', 680, .8]], 'sparks'),
  'Gym Leader:Erika': A('Celadon Gym', 'glass', 'grass', GARDEN, [['flowers', 110], ['tree', 250, .9], ['flowers', 860], ['bush', 700, .8]], 'petals'),
  'Gym Leader:Koga': A('Fuchsia Gym', 'shoji', 'tatami', { ...DOJO, wallTop: '#d9c6e3', wallBot: '#bfa3cf', wallLine: '#5b3a6e', accent: '#a040a0' }, [['scroll', 160], ['scroll', 840]], 'wisps'),
  'Gym Leader:Janine': A('Fuchsia Gym', 'shoji', 'tatami', { ...DOJO, wallTop: '#d9c6e3', wallBot: '#bfa3cf', wallLine: '#5b3a6e', accent: '#a040a0' }, [['scroll', 160], ['scroll', 840]], 'wisps'),
  'Gym Leader:Sabrina': A('Saffron Gym', 'tiles', 'checker', PSY, [['hoop', 180, 1], ['hoop', 820, .8], ['pokeball', 500, .6]], 'twinkle'),
  'Gym Leader:Blaine': A('Cinnabar Gym', 'rock', 'lava', LAVA, [['torch', 140], ['torch', 860], ['boulder', 300, .8]], 'embers'),
  'Gym Leader:Giovanni': A('Viridian Gym', 'panels', 'sand', { ...SAND, wallTop: '#5a4a3a', wallBot: '#3a2f25', wallLine: '#c9a46a' }, [['statue', 150], ['statue', 850]], 'dust'),
  'Gym Leader:Blue': A('Viridian Gym', 'panels', 'sand', { ...SAND, wallTop: '#4a5a6a', wallBot: '#2f3a45', wallLine: '#9fb4c9' }, [['statue', 150], ['statue', 850], ['banner', 500]], 'dust'),
  // ----- Johto -----
  'Gym Leader:Falkner': A('Violet Gym', 'sky', 'planks', { ...SKY, floorTop: '#c49a62', floorBot: '#9a7444', floorLine: '#6b4c2a' }, [['girder', 60], ['girder', 940]], 'feathers'),
  'Gym Leader:Bugsy': A('Azalea Gym', 'glass', 'grass', FOREST, [['tree', 120], ['tree', 880, 1.1], ['bush', 300, .8]], 'leaves'),
  'Gym Leader:Whitney': A('Goldenrod Gym', 'tiles', 'checker', { wallTop: '#ffd6e6', wallBot: '#f5b3cd', wallLine: '#e57aa7', floorTop: '#fff0f6', floorBot: '#f7cfe0', floorLine: '#e98bb5', prop: '#fff', accent: '#ff6fa5', plat: '#f7c3d8' }, [['flowers', 140], ['flowers', 860], ['pokeball', 500, .6]], 'petals'),
  'Gym Leader:Morty': A('Ecruteak Gym', 'plain', 'planks', { ...GHOST, floorTop: '#2b2233', floorBot: '#120d18' }, [['candle', 140], ['candle', 860], ['lantern', 330], ['lantern', 680]], 'wisps'),
  'Gym Leader:Chuck': A('Cianwood Gym', 'waterfall', 'stone', { ...ROCK, accent: '#6aa5c9' }, [['boulder', 120], ['boulder', 880, 1.1]], 'bubbles'),
  'Gym Leader:Jasmine': A('Olivine Gym', 'panels', 'metal', STEEL, [['pillar', 140], ['pillar', 860], ['lamp', 320], ['lamp', 680]], null),
  'Gym Leader:Pryce': A('Mahogany Gym', 'ice', 'ice', ICE, [['crystal', 130, 1.2], ['snowpile', 860], ['crystal', 760, .8]], 'snow'),
  'Gym Leader:Clair': A('Blackthorn Gym', 'rock', 'lava', { ...LAVA, wallTop: '#3a2244', wallBot: '#1d0f26' }, [['statue', 150, 1.2], ['statue', 850, 1.2]], 'embers'),
  // ----- Hoenn -----
  'Gym Leader:Roxanne': A('Rustboro Gym', 'rock', 'stone', { ...ROCK, wallTop: '#7a6a5c', wallBot: '#57493c' }, [['fossil', 160], ['fossil', 840], ['boulder', 330, .6]], 'dust'),
  'Gym Leader:Brawly': A('Dewford Gym', 'rock', 'stone', { ...ROCK, wallTop: '#2a2a30', wallBot: '#141418', floorTop: '#3d3d44', floorBot: '#24242a', floorLine: '#0e0e12' }, [['lamp', 140], ['lamp', 860], ['ropes', 60], ['ropes', 940]], null),
  'Gym Leader:Wattson': A('Mauville Gym', 'panels', 'metal', { ...ELEC, wallTop: '#3d4a3a', wallBot: '#263024' }, [['gear', 160, 1], ['gear', 840, .8], ['bolt', 500, .8]], 'sparks'),
  'Gym Leader:Flannery': A('Lavaridge Gym', 'rock', 'lava', { ...LAVA, wallTop: '#7a3a22', wallBot: '#4a2214' }, [['boulder', 130, .9], ['torch', 870]], 'embers'),
  'Gym Leader:Norman': A('Petalburg Gym', 'planks', 'planks', DOJO, [['window', 180], ['window', 820], ['banner', 500]], null),
  'Gym Leader:Winona': A('Fortree Gym', 'sky', 'clouds', SKY, [['tree', 70, 1.1], ['tree', 930, 1.1]], 'feathers'),
  'Gym Leader:Tate & Liza': A('Mossdeep Gym', 'stars', 'space', { wallTop: '#0d1033', wallBot: '#1f1650', wallLine: '#fff', floorTop: '#271d5a', floorBot: '#120c33', floorLine: '#8f7dff', prop: '#3a2f80', accent: '#f8b5ff', plat: '#4b3d8f', glow: '#d9b8ff' }, [['planet', 200], ['planet', 780, .7]], 'twinkle'),
  'Gym Leader:Juan': A('Sootopolis Gym', 'ice', 'water', { ...POOL, wallTop: '#9bd3ee', wallBot: '#5aa9d6', floorTop: '#3e95d0', floorBot: '#1f5f9c' }, [['crystal', 140], ['crystal', 860]], 'bubbles'),
  // ----- Sinnoh -----
  'Gym Leader:Roark': A('Oreburgh Gym', 'rock', 'rails', ROCK, [['lamp', 120], ['lamp', 880], ['girder', 300], ['girder', 700]], 'dust'),
  'Gym Leader:Gardenia': A('Eterna Gym', 'glass', 'grass', GARDEN, [['tree', 110], ['flowers', 300], ['bush', 860], ['flowers', 700]], 'leaves'),
  'Gym Leader:Maylene': A('Veilstone Gym', 'planks', 'tatami', { ...DOJO, accent: '#c03028' }, [['ropes', 60], ['ropes', 940], ['scroll', 500]], null),
  'Gym Leader:Crasher Wake': A('Pastoria Gym', 'tiles', 'water', { ...POOL, wallTop: '#cdeeff', floorTop: '#58b4e6' }, [['palm', 100], ['palm', 900]], 'bubbles'),
  'Gym Leader:Fantina': A('Hearthome Gym', 'curtain', 'checker', { ...GHOST, accent: '#7a2a5a' }, [['candle', 150], ['candle', 850]], 'wisps'),
  'Gym Leader:Byron': A('Canalave Gym', 'panels', 'metal', STEEL, [['girder', 80], ['girder', 920], ['gear', 500, .7]], null),
  'Gym Leader:Candice': A('Snowpoint Gym', 'ice', 'ice', ICE, [['snowpile', 120], ['crystal', 860, 1.1], ['snowpile', 700, .8]], 'snow'),
  'Gym Leader:Volkner': A('Sunyshore Gym', 'panels', 'metal', { ...ELEC, wallTop: '#2a3d55', wallBot: '#172536' }, [['gear', 150, 1.2], ['gear', 850, 1], ['bolt', 500, .9]], 'sparks'),
  // ----- Unova -----
  'Gym Leader:Cilan': A('Striaton Gym', 'bricks', 'planks', { ...DOJO, wallTop: '#e8d6c0', wallBot: '#cdb497', wallLine: '#8a5a3a', accent: '#6cbc48' }, [['table', 150], ['table', 850], ['lantern', 500]], null),
  'Gym Leader:Chili': A('Striaton Gym', 'bricks', 'planks', { ...DOJO, wallTop: '#e8d6c0', wallBot: '#cdb497', wallLine: '#8a5a3a', accent: '#ee7f30' }, [['table', 150], ['table', 850], ['lantern', 500]], null),
  'Gym Leader:Cress': A('Striaton Gym', 'bricks', 'planks', { ...DOJO, wallTop: '#e8d6c0', wallBot: '#cdb497', wallLine: '#8a5a3a', accent: '#6890f0' }, [['table', 150], ['table', 850], ['lantern', 500]], null),
  'Gym Leader:Lenora': A('Nacrene Gym', 'shelves', 'planks', { ...DOJO, wallTop: '#7a5a3a', wallBot: '#5a4028', wallLine: '#3a2816' }, [['fossil', 500, .8]], 'dust'),
  'Gym Leader:Burgh': A('Castelia Gym', 'honeycomb', 'grass', { ...FOREST, wallTop: '#f2c14e', wallBot: '#d99a2b', wallLine: '#8a5a12', accent: '#b07a10', floorTop: '#8fb24a' }, [['bush', 120], ['bush', 880]], 'leaves'),
  'Gym Leader:Elesa': A('Nimbasa Gym', 'stars', 'runway', { wallTop: '#141428', wallBot: '#24203f', wallLine: '#fff', floorTop: '#2c2a44', floorBot: '#15142a', floorLine: '#5a5680', prop: '#333', accent: '#f8d030', plat: '#3d3a5c', glow: '#fff07a' }, [['spotlight', 220], ['spotlight', 780]], 'sparks'),
  'Gym Leader:Clay': A('Driftveil Gym', 'rock', 'rails', { ...ROCK, wallTop: '#5a4632', wallBot: '#3a2c1f' }, [['girder', 90], ['girder', 910], ['lamp', 300]], 'dust'),
  'Gym Leader:Skyla': A('Mistralton Gym', 'sky', 'metal', { ...SKY, floorTop: '#c9d3dc', floorBot: '#9aa6b2', floorLine: '#6b7682' }, [['hoop', 220, .9], ['hoop', 780, 1.1]], 'feathers'),
  'Gym Leader:Brycen': A('Icirrus Gym', 'ice', 'ice', { ...ICE, wallTop: '#9fc9e0', wallBot: '#6fa6c6' }, [['crystal', 120, 1.3], ['crystal', 880, 1.1]], 'snow'),
  'Gym Leader:Drayden': A('Opelucid Gym', 'marble', 'stone', DRAGON, [['statue', 160, 1.3], ['statue', 840, 1.3]], null),
  'Gym Leader:Iris': A('Opelucid Gym', 'marble', 'stone', DRAGON, [['statue', 160, 1.3], ['statue', 840, 1.3]], null),
  'Gym Leader:Cheren': A('Aspertia Gym', 'tiles', 'planks', { ...DOJO, wallTop: '#dfe8f0', wallBot: '#c3d0dc', wallLine: '#5a6a7a', accent: '#3a4a5a' }, [['window', 200], ['window', 800], ['pokeball', 500, .55]], null),
  'Gym Leader:Roxie': A('Virbank Gym', 'stars', 'runway', { wallTop: '#1a0f24', wallBot: '#2a1438', wallLine: '#fff', floorTop: '#2a1a35', floorBot: '#150a1c', floorLine: '#6a3a8a', prop: '#222', accent: '#c04ad0', plat: '#3d2850', glow: '#e08aff' }, [['spotlight', 200], ['spotlight', 800], ['lamp', 500]], 'sparks'),
  'Gym Leader:Marlon': A('Humilau Gym', 'sky', 'water', { ...POOL, wallTop: '#8fd3f5', wallBot: '#d3f0fb', floorTop: '#2fa3d6', floorBot: '#1b6fa8' }, [['palm', 80], ['palm', 920, 1.1]], 'bubbles'),

  // ----- Elite Four rooms -----
  'Elite Four:Lorelei': A("Indigo Plateau · Lorelei's room", 'ice', 'ice', ICE, [['crystal', 140, 1.2], ['crystal', 860, 1.2]], 'snow'),
  'Elite Four:Bruno': A("Indigo Plateau · Bruno's room", 'rock', 'stone', ROCK, [['ropes', 60], ['ropes', 940], ['boulder', 220, .8]], 'dust'),
  'Elite Four:Agatha': A("Indigo Plateau · Agatha's room", 'curtain', 'checker', GHOST, [['candle', 150], ['candle', 850]], 'wisps'),
  'Elite Four:Lance': A("Indigo Plateau · Lance's room", 'marble', 'stone', DRAGON, [['statue', 150, 1.3], ['statue', 850, 1.3]], 'embers'),
  'Elite Four:Sidney': A("Ever Grande · Sidney's room", 'city', 'grid', DARK, [], null),
  'Elite Four:Phoebe': A("Ever Grande · Phoebe's room", 'plain', 'stone', GHOST, [['candle', 120], ['statue', 860], ['candle', 700]], 'wisps'),
  'Elite Four:Glacia': A("Ever Grande · Glacia's room", 'ice', 'ice', ICE, [['crystal', 120, 1.3], ['crystal', 880, 1.3], ['snowpile', 500, .7]], 'snow'),
  'Elite Four:Drake': A("Ever Grande · Drake's room", 'rock', 'stone', DRAGON, [['statue', 150, 1.2], ['statue', 850, 1.2]], 'embers'),
  'Elite Four:Will': A("Indigo Plateau · Will's room", 'tiles', 'checker', PSY, [['hoop', 190], ['hoop', 810]], 'twinkle'),
  'Elite Four:Koga': A("Indigo Plateau · Koga's room", 'shoji', 'tatami', { ...DOJO, wallTop: '#3a2a45', wallBot: '#24182e', wallLine: '#a040a0', floorTop: '#5a4a35', floorBot: '#3a2f22' }, [['scroll', 160], ['scroll', 840]], 'wisps'),
  'Elite Four:Karen': A("Indigo Plateau · Karen's room", 'city', 'grid', DARK, [], null),
  'Elite Four:Aaron': A("Sinnoh League · Aaron's room", 'glass', 'grass', FOREST, [['tree', 120, 1.1], ['tree', 880, 1.1]], 'leaves'),
  'Elite Four:Bertha': A("Sinnoh League · Bertha's room", 'rock', 'sand', SAND, [['boulder', 130], ['boulder', 870, 1.1]], 'dust'),
  'Elite Four:Flint': A("Sinnoh League · Flint's room", 'rock', 'lava', LAVA, [['torch', 150], ['torch', 850]], 'embers'),
  'Elite Four:Lucian': A("Sinnoh League · Lucian's room", 'shelves', 'carpet', { ...PSY, wallTop: '#4a2a3a', wallBot: '#2a1620', wallLine: '#2a1620', floorTop: '#5a3a4a', floorBot: '#3a2230', accent: '#7a2a5a' }, [], 'twinkle'),
  'Elite Four:Shauntal': A("Unova League · Shauntal's room", 'shelves', 'carpet', { ...GHOST, wallLine: '#1c1430', accent: '#5a2a7a' }, [['candle', 500, .9]], 'wisps'),
  'Elite Four:Grimsley': A("Unova League · Grimsley's room", 'curtain', 'checker', { ...DARK, accent: '#7a1a2a' }, [['lamp', 150], ['lamp', 850]], null),
  'Elite Four:Caitlin': A("Unova League · Caitlin's room", 'marble', 'carpet', { ...PSY, accent: '#a03a7a' }, [['lamp', 150], ['lamp', 850]], 'twinkle'),
  'Elite Four:Marshal': A("Unova League · Marshal's room", 'rock', 'stone', { ...ROCK, wallTop: '#5a3a2a', wallBot: '#3a2418' }, [['torch', 150], ['torch', 850]], 'embers'),

  // ----- Champions -----
  'Champion:Blue': A("Indigo Plateau · Champion's room", 'marble', 'carpet', HALL, [['banner', 260], ['banner', 740]], 'twinkle'),
  'Champion:Wallace': A("Ever Grande · Champion's room", 'marble', 'water', { ...HALL, floorTop: '#4fb0e8', floorBot: '#2d7fc4', accent: '#6890f0' }, [['banner', 260], ['banner', 740]], 'bubbles'),
  'Champion:Lance': A("Indigo Plateau · Champion's room", 'marble', 'carpet', HALL, [['statue', 150, 1.2], ['statue', 850, 1.2]], 'twinkle'),
  'Champion:Cynthia': A("Sinnoh League · Champion's room", 'marble', 'carpet', { ...HALL, wallTop: '#1f2440', wallBot: '#121628', wallLine: '#b9c4e8', prop: '#c9d3f0', accent: '#2a2a3a' }, [['banner', 260], ['banner', 740]], 'twinkle'),
  'Champion:Alder': A("Unova League · Champion's room", 'marble', 'carpet', { ...HALL, accent: '#c04a1a' }, [['torch', 150], ['torch', 850]], 'embers'),
  'Champion:Iris': A("Unova League · Champion's room", 'marble', 'carpet', { ...HALL, wallTop: '#2a1f4a', wallBot: '#151028', accent: '#7038f8' }, [['statue', 150, 1.2], ['statue', 850, 1.2]], 'twinkle'),
};
const FALLBACK = A('Battle Arena', 'plain', 'grid', {}, [], null);
export function arenaFor(leader) { return ARENAS[`${leader.role}:${leader.name}`] || FALLBACK; }
export const ARENA_KEYS = Object.keys(ARENAS);

// ---------- render ----------
export function arenaSVG(arena, seed = 'arena') {
  const p = arena.pal, r = new RNG(seed);
  const props = arena.props.map(([kind, x, s]) => PROPS[kind](x, p, s ?? 1)).join('');
  return `<svg class="arena-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>${g('$$wall', [p.wallTop, p.wallBot])}${g('$$floor', [p.floorTop, p.floorBot])}${rg('$$glow', p.glow, p.glow, .55)}
<linearGradient id="$$fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".25" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
<rect width="${W}" height="${HZ}" fill="url(#$$wall)"/>${WALLS[arena.wall](p, r)}
${floorBase(p)}${FLOORS[arena.floor](p, r)}
<rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#$$fade)"/><rect y="${HZ - 2}" width="${W}" height="4" fill="#000" opacity=".22"/>
${props}
</svg>`.replaceAll('$$', 'a' + (++_uid) + '-');
}
let _uid = 0;
export function arenaFX(arena, seed = 'fx') {
  if (!arena.fx) return '';
  const r = new RNG(seed); const n = { rain: 60, snow: 40, twinkle: 30 }[arena.fx] || 22;
  return Array.from({ length: n }, () => `<i style="left:${(r.next() * 100).toFixed(1)}%;top:${(r.next() * 100).toFixed(1)}%;animation-delay:-${(r.next() * 8).toFixed(2)}s;animation-duration:${(4 + r.next() * 6).toFixed(2)}s;--s:${(0.6 + r.next() * 0.9).toFixed(2)}"></i>`).join('');
}
