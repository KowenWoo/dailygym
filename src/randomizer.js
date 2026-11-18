import { Dex, toID } from '@pkmn/sim';
import { RNG } from './rng.js';
import LEADERS from './leaders.json' with { type: 'json' };

export const dex = Dex.forGen(5);
export { LEADERS };
export const BATTLE_LEVEL = 50;
export const EPOCH = Date.UTC(2026, 10, 13); // Day #1 = Nov 13 2026

// ---------- day / leader rotation ----------
export function dayNumber(date = new Date()) {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((local - EPOCH) / 86400000) + 1;
}
// Each cycle of N days visits every leader once, in a fresh shuffled order.
export function leaderForDay(day) {
  const n = LEADERS.length, idx = ((day - 1) % n + n) % n, cycle = Math.floor((day - 1) / n);
  const order = new RNG('cycle-' + cycle).shuffle([...Array(n).keys()]);
  return LEADERS[order[idx]];
}

// ---------- rules ----------
const BANNED_ABILITIES = new Set([
  // game-breaking
  'Wonder Guard', 'Huge Power', 'Pure Power', 'Shadow Tag', 'Arena Trap', 'Moody', 'Speed Boost', 'Imposter', 'Simple', 'Contrary',
  // crippling or does nothing in a single battle
  'Truant', 'Slow Start', 'Defeatist', 'Klutz', 'Stall', 'Normalize', 'Multitype', 'Forecast', 'Flower Gift', 'Zen Mode',
  'Illusion', 'Plus', 'Minus', 'Healer', 'Friend Guard', 'Telepathy', 'Honey Gather', 'Run Away', 'Pickup', 'Illuminate', 'Ball Fetch',
]);
// legal but low-impact: drawn less often
const WEAK_ABILITIES = new Set(['Anticipation', 'Forewarn', 'Frisk', 'Damp', 'Oblivious', 'Own Tempo', 'Big Pecks', 'Keen Eye', 'Hyper Cutter',
  'Suction Cups', 'Sticky Hold', 'Leaf Guard', 'Heavy Metal', 'Light Metal', 'Unnerve', 'Rivalry', 'Early Bird', 'Insomnia', 'Vital Spirit',
  'Magma Armor', 'Water Veil', 'Limber', 'Immunity', 'Shield Dust', 'Inner Focus', 'Tangled Feet', 'Gluttony', 'Steadfast', 'Klutz',
  'Cute Charm', 'Stench', 'Pressure', 'Shell Armor', 'Battle Armor', 'White Smoke', 'Clear Body', 'Soundproof', 'Sand Veil', 'Snow Cloak', 'Lightning Rod', 'Storm Drain']);

const BANNED_MOVES = new Set(['fissure', 'guillotine', 'horndrill', 'sheercold', 'explosion', 'selfdestruct', 'memento', 'healingwish', 'lunardance',
  'finalgambit', 'perishsong', 'doubleteam', 'minimize', 'naturalgift', 'fling', 'snore', 'sleeptalk', 'dreameater', 'nightmare', 'transform',
  'sketch', 'mimic', 'metronome', 'splash', 'teleport', 'frustration', 'lastresort', 'spitup', 'swallow', 'synchronoise', 'attract', 'captivate',
  'helpinghand', 'followme', 'ragepowder', 'allyswitch', 'wideguard', 'quickguard', 'hiddenpower', 'present', 'beatup', 'feint', 'dragonrage',
  'sonicboom', 'psywave', 'counter', 'mirrorcoat', 'metalburst', 'bide', 'endeavor', 'trick', 'switcheroo', 'focuspunch', 'struggle', 'magiccoat',
  'snatch', 'grudge', 'spite', 'chatter', 'trumpcard', 'payday', 'fakeout', 'skydrop', 'futuresight', 'doomdesire', 'stockpile', 'bestow', 'entrainment',
  'skillswap', 'roleplay', 'worryseed', 'simplebeam', 'gastroacid', 'powertrick', 'powersplit', 'guardsplit', 'powerswap', 'guardswap', 'heartswap', 'afteryou', 'quash']);
const FIXED_DAMAGE = { seismictoss: 75, nightshade: 75, superfang: 60 };
const CHARGE_OR_RECHARGE = m => !!(m.flags.charge || m.flags.recharge || m.self?.volatileStatus === 'mustrecharge');

const SETUP_PHYS = ['swordsdance', 'dragondance', 'bulkup', 'honeclaws', 'curse', 'shiftgear', 'coil', 'bellydrum'];
const SETUP_SPEC = ['nastyplot', 'calmmind', 'quiverdance', 'tailglow'];
const SETUP_BOTH = ['shellsmash', 'workup', 'growth', 'agility', 'rockpolish', 'amnesia', 'irondefense', 'acidarmor', 'cosmicpower', 'cottonguard', 'barrier'];
const RECOVERY = ['recover', 'roost', 'softboiled', 'slackoff', 'milkdrink', 'synthesis', 'moonlight', 'morningsun', 'wish', 'rest', 'healorder', 'leechseed', 'painsplit'];
const STATUSERS = ['thunderwave', 'willowisp', 'toxic', 'spore', 'sleeppowder', 'hypnosis', 'glare', 'stunspore', 'yawn', 'darkvoid', 'lovelykiss', 'sing', 'confuseray', 'poisonpowder'];
const UTILITY = ['stealthrock', 'spikes', 'toxicspikes', 'reflect', 'lightscreen', 'substitute', 'protect', 'taunt', 'encore', 'haze', 'roar', 'whirlwind',
  'destinybond', 'batonpass', 'healbell', 'aromatherapy', 'trickroom', 'tailwind', 'sunnyday', 'raindance', 'disable', 'detect', 'safeguard', 'defog'];
const STATUS_OK = new Set([...SETUP_PHYS, ...SETUP_SPEC, ...SETUP_BOTH, ...RECOVERY, ...STATUSERS, ...UTILITY]);
const SETUP = new Set([...SETUP_PHYS, ...SETUP_SPEC, ...SETUP_BOTH]);

const EVIOLITE_NFE = new Set(['Scyther', 'Porygon2', 'Chansey', 'Dusclops', 'Gligar', 'Murkrow', 'Misdreavus', 'Sneasel', 'Piloswine', 'Rhydon',
  'Electabuzz', 'Magmar', 'Magneton', 'Togetic', 'Gurdurr', 'Ferroseed', 'Golbat', 'Haunter', 'Kadabra', 'Machoke', 'Vigoroth', 'Lickitung', 'Tangela', 'Yanma']);
const EXCLUDED_SPECIES = new Set(['Shedinja', 'Ditto', 'Smeargle', 'Unown', 'Wobbuffet', 'Wynaut', 'Giratina-Origin', 'Keldeo-Resolute', 'Meloetta-Pirouette',
  'Darmanitan-Zen', 'Cherrim-Sunshine', 'Basculin-Blue-Striped', 'Shellos-East', 'Gastrodon-East']);
const COSMETIC_BASE = new Set(['Castform', 'Arceus', 'Genesect', 'Burmy', 'Deerling', 'Sawsbuck']);

// ---------- species pool ----------
let _pool;
export function speciesPool() {
  if (_pool) return _pool;
  _pool = dex.species.all().filter(s => {
    if (s.num < 1 || s.num > 649 || s.isNonstandard || EXCLUDED_SPECIES.has(s.name)) return false;
    if (s.forme && COSMETIC_BASE.has(s.baseSpecies)) return false;
    if (s.battleOnly) return false;
    const fe = !s.evos.length || EVIOLITE_NFE.has(s.name);
    return fe && attackingMoves(s).length >= 2;
  });
  return _pool;
}
const legendWeight = s => s.tags.includes('Restricted Legendary') ? 0.12 : s.tags.includes('Mythical') ? 0.15 : s.tags.includes('Sub-Legendary') ? 0.3 : 1;

// ---------- learnsets ----------
const _ls = new Map();
export function learnable(species) {
  if (_ls.has(species.id)) return _ls.get(species.id);
  const out = new Set();
  const visit = sp => {
    for (let s = sp; s && s.exists; s = s.prevo ? dex.species.get(s.prevo) : null) {
      const ls = dex.data.Learnsets[s.id]?.learnset;
      if (ls) for (const [mid, src] of Object.entries(ls)) if (src.some(x => /^[345][LMTERDS]/.test(x))) out.add(mid);
    }
  };
  visit(species);
  if (species.changesFrom || species.baseSpecies !== species.name) visit(dex.species.get(species.changesFrom || species.baseSpecies));
  const moves = [...out].map(id => dex.moves.get(id)).filter(m => m.exists && m.gen <= 5 && !m.isNonstandard && !BANNED_MOVES.has(m.id));
  _ls.set(species.id, moves);
  return moves;
}
const isAttack = m => m.category !== 'Status' && (m.basePower > 1 || FIXED_DAMAGE[m.id]);
function attackingMoves(s) { return learnable(s).filter(m => isAttack(m) && !['dragonrage', 'sonicboom'].includes(m.id)); }
export function effPower(m) {
  let bp = FIXED_DAMAGE[m.id] || m.basePower;
  if (m.multihit) bp *= Array.isArray(m.multihit) ? 3 : m.multihit;
  const acc = m.accuracy === true ? 100 : m.accuracy;
  bp *= acc / 100;
  if (CHARGE_OR_RECHARGE(m)) bp *= 0.45;
  if (m.recoil || m.selfdestruct) bp *= 0.9;
  if (m.priority > 0) bp *= 1.25;
  if (['uturn', 'voltswitch', 'rapidspin', 'knockoff', 'scald', 'drainpunch', 'gigadrain'].includes(m.id)) bp *= 1.3;
  return bp;
}

// ---------- moveset generation ----------
export function randomMoves(species, rng) {
  const all = learnable(species);
  const st = species.baseStats;
  const atkBias = st.atk / Math.max(1, st.spa);
  const catMul = m => m.category === 'Physical' ? (atkBias > 1.15 ? 1.5 : atkBias < 0.87 ? 0.35 : 1) :
    m.category === 'Special' ? (atkBias < 0.87 ? 1.5 : atkBias > 1.15 ? 0.35 : 1) : 1;
  const attacks = all.filter(isAttack);
  const status = all.filter(m => m.category === 'Status' && STATUS_OK.has(m.id));
  const chosen = [];
  const has = id => chosen.some(m => m.id === id);
  const types = () => new Set(chosen.filter(isAttack).map(m => m.type));
  const attackWeight = m => {
    if (has(m.id) || types().has(m.type)) return 0;
    let w = effPower(m) * catMul(m);
    if (species.types.includes(m.type)) w *= 1.5;
    if (effPower(m) < 45) w *= 0.15;
    if (m.type === 'Normal' && !species.types.includes('Normal')) w *= 0.6;
    return Math.pow(Math.max(w, 1), 2.5);
  };
  // 1) STAB attack
  const stab = attacks.filter(m => species.types.includes(m.type));
  if (stab.length) chosen.push(rng.weighted(stab, attackWeight));
  // 2) coverage / second attack
  const pickAttack = () => { const c = attacks.filter(m => attackWeight(m) > 0); if (c.length) chosen.push(rng.weighted(c, attackWeight)); return c.length > 0; };
  while (chosen.filter(isAttack).length < 2 && pickAttack());
  // 3) remaining slots: attack or useful status
  let nStatus = 0; let tries = 0;
  while (chosen.length < 4 && tries++ < 40) {
    const wantStatus = nStatus < 2 && status.length && rng.chance(0.45);
    if (wantStatus) {
      const ok = status.filter(m => {
        if (has(m.id)) return false;
        const ids = chosen.map(x => x.id);
        if (SETUP.has(m.id) && ids.some(i => SETUP.has(i))) return false;
        if (RECOVERY.includes(m.id) && ids.some(i => RECOVERY.includes(i))) return false;
        if (STATUSERS.includes(m.id) && ids.some(i => STATUSERS.includes(i))) return false;
        if (m.id === 'batonpass' && !ids.some(i => SETUP.has(i))) return false;
        if (SETUP_PHYS.includes(m.id) && !chosen.some(x => x.category === 'Physical')) return false;
        if (SETUP_SPEC.includes(m.id) && !chosen.some(x => x.category === 'Special')) return false;
        if (['sunnyday', 'raindance'].includes(m.id) && !chosen.some(x => x.type === (m.id === 'sunnyday' ? 'Fire' : 'Water'))) return false;
        return true;
      });
      if (ok.length) { chosen.push(rng.weighted(ok, m => SETUP.has(m.id) ? 3 : RECOVERY.includes(m.id) ? 2.5 : 1.5)); nStatus++; continue; }
    }
    if (!pickAttack()) {
      // out of new-type attacks: allow a same-type attack, then any status
      const c = attacks.filter(m => !has(m.id));
      if (c.length) chosen.push(rng.weighted(c, m => effPower(m) * catMul(m)));
      else { const s = status.filter(m => !has(m.id)); if (!s.length) break; chosen.push(rng.pick(s)); }
    }
  }
  return chosen;
}

// ---------- abilities ----------
let _abilities;
export function randomAbility(rng) {
  _abilities ||= dex.abilities.all().filter(a => a.num > 0 && a.num <= 164 && !a.isNonstandard && !BANNED_ABILITIES.has(a.name));
  return rng.weighted(_abilities, a => WEAK_ABILITIES.has(a.name) ? 0.35 : 1).name;
}

// ---------- items (competitive logic) ----------
export function chooseItem(species, moves, ability, rng) {
  const ids = moves.map(m => m.id);
  const st = species.baseStats;
  const attacks = moves.filter(isAttack);
  const phys = attacks.filter(m => m.category === 'Physical').length, spec = attacks.length - phys;
  const nStatus = moves.length - attacks.length;
  const setup = ids.some(i => SETUP.has(i)), recovery = ids.some(i => RECOVERY.includes(i));
  const bulk = st.hp * (st.def + st.spd) / 1000; // ~ 10 frail .. 40+ tanky
  const poison = species.types.includes('Poison');
  const c = new Map(); const add = (item, w) => c.set(item, (c.get(item) || 0) + w);
  // hard combos first
  if (ability === 'Poison Heal') return 'Toxic Orb';
  if (ids.includes('rest') && !recovery_other(ids)) return 'Chesto Berry';
  if (ability === 'Guts' && !species.types.includes('Fire') && phys) add('Flame Orb', 8);
  if (['Magic Guard', 'Sheer Force'].includes(ability) && attacks.length) add('Life Orb', 8);
  if (ids.includes('shellsmash')) add('White Herb', 6);
  if (ids.includes('bellydrum')) add('Sitrus Berry', 8);
  if (ids.includes('reflect') && ids.includes('lightscreen')) add('Light Clay', 8);
  if (species.nfe) add('Eviolite', 12);
  if (ability === 'Unburden') add('Sitrus Berry', 3);
  if (ability === 'Drizzle' && ids.some(i => ['thunder', 'hurricane'].includes(i))) add('Damp Rock', 2);
  // all-out attackers
  if (nStatus === 0 && attacks.length >= 3) {
    if (phys >= 2 && st.atk >= 85) add('Choice Band', 3.5);
    if (spec >= 2 && st.spa >= 85) add('Choice Specs', 3.5);
    if (st.spe >= 60 && st.spe <= 110 && Math.max(st.atk, st.spa) >= 80) add('Choice Scarf', 3);
    add('Life Orb', 2.5);
    if (new Set(attacks.map(m => m.type)).size >= 3) add('Expert Belt', 2);
  }
  if (setup) { add('Life Orb', 3); add('Leftovers', 2); add('Lum Berry', 2.5); if (bulk < 22 && st.spe >= 90) add('Focus Sash', 1.5); }
  if (recovery || nStatus >= 2 || bulk >= 30) { add(poison ? 'Black Sludge' : 'Leftovers', 4); if (st.def >= 100) add('Rocky Helmet', 2); }
  if (ids.some(i => ['stealthrock', 'spikes', 'toxicspikes'].includes(i)) && bulk < 22) add('Focus Sash', 3);
  const groundWeak = dex.getEffectiveness('Ground', species) > 0 && dex.getImmunity('Ground', species);
  if (groundWeak && ability !== 'Levitate' && !species.types.includes('Flying')) add('Air Balloon', 1.5);
  // general fallbacks
  add(poison ? 'Black Sludge' : 'Leftovers', 1.2); add('Life Orb', attacks.length >= 2 ? 1.2 : 0.2); add('Lum Berry', 1); add('Sitrus Berry', 0.8);
  if (st.spe >= 70 && st.spe <= 100) add('Choice Scarf', nStatus === 0 ? 0.8 : 0);
  const entries = [...c.entries()].filter(([, w]) => w > 0);
  return rng.weighted(entries, e => e[1])[0];
}
function recovery_other(ids) { return ids.some(i => RECOVERY.includes(i) && i !== 'rest'); }

function natureFor(species, moves) {
  const a = moves.filter(isAttack); const p = a.filter(m => m.category === 'Physical').length, s = a.length - p;
  const fast = species.baseStats.spe >= 80;
  if (p && !s) return fast ? 'Jolly' : 'Adamant';
  if (s && !p) return fast ? 'Timid' : 'Modest';
  return fast ? 'Hasty' : 'Hardy';
}
const EVS = { hp: 84, atk: 84, def: 84, spa: 84, spd: 84, spe: 84 };
const IVS = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

export function randomSet(species, rng) {
  const moves = randomMoves(species, rng);
  const ability = randomAbility(rng);
  const item = chooseItem(species, moves, ability, rng);
  return { name: species.baseSpecies, species: species.name, item, ability, moves: moves.map(m => m.name), nature: natureFor(species, moves),
    evs: { ...EVS }, ivs: { ...IVS }, level: BATTLE_LEVEL, gender: '', happiness: 255 };
}

// ---------- daily content ----------
export function draftSize(leader) { return Math.max(6, leader.team.length * 2); }

export function dailyDraft(day, leader) {
  const rng = new RNG('draft-' + day);
  const pool = speciesPool();
  const out = []; const bases = new Set(); const primaries = {};
  let guard = 0;
  while (out.length < draftSize(leader) && guard++ < 5000) {
    const s = rng.weighted(pool, legendWeight);
    if (bases.has(s.baseSpecies)) continue;
    if ((primaries[s.types[0]] || 0) >= 2) continue;
    if (out.filter(x => legendWeight(x) < 1).length >= 2 && legendWeight(s) < 1) continue; // at most 2 legends a day
    bases.add(s.baseSpecies); primaries[s.types[0]] = (primaries[s.types[0]] || 0) + 1;
    out.push(s);
  }
  return out.map(s => randomSet(s, rng));
}

export function leaderTeam(day, leader) {
  const rng = new RNG('leader-' + day);
  const top = Math.max(...leader.team.map(m => m.level));
  return leader.team.map(m => {
    const s = dex.species.get(m.species);
    const moves = m.moves.map(id => dex.moves.get(id));
    const item = chooseItem(s, moves, m.ability, rng);
    return { name: s.baseSpecies, species: s.name, item, ability: m.ability, moves: moves.map(x => x.name), nature: 'Hardy',
      evs: { ...EVS }, ivs: { ...IVS }, level: Math.max(5, BATTLE_LEVEL + (m.level - top)), gender: '', happiness: 255, origLevel: m.level, origItem: m.item };
  });
}
