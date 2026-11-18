import { Battle } from '@pkmn/sim';
import { RNG, hashStr } from './rng.js';
import { dex } from './randomizer.js';

const PLAYER = 'You';

// Thin wrapper around the Showdown simulator: player is p1, gym leader (AI) is p2.
export class GymBattle {
  constructor(day, playerSets, leaderSets, leaderName) {
    const h = hashStr('battle-' + day);
    this.ai = new RNG('ai-' + day);
    this.battle = new Battle({ formatid: 'gen5customgame', seed: [h & 0xffff, h >>> 16, day & 0xffff, 0x5eed] });
    this.leaderName = leaderName;
    this.cursor = 0;
    this.choices = [];
    this.battle.setPlayer('p1', { name: PLAYER, team: playerSets });
    this.battle.setPlayer('p2', { name: leaderName, team: leaderSets });
    // Skip team preview: both sides lead in the order given (player: draft order; leader: in-game order).
    if (this.battle.p1.activeRequest?.teamPreview) { this.battle.choose('p2', 'default'); this.battle.choose('p1', 'default'); }
    this.aiMove();
  }
  get request() { return this.battle.p1.activeRequest; }
  get ended() { return this.battle.ended; }
  get won() { return this.battle.winner === PLAYER; }
  get turn() { return this.battle.turn; }
  // New log lines since last call.
  drain() { const l = this.battle.log.slice(this.cursor); this.cursor = this.battle.log.length; return l; }
  choose(choice) {
    if (this.ended) return false;
    const ok = this.battle.choose('p1', choice);
    if (!ok) return false;
    this.choices.push(choice);
    this.aiMove();
    return true;
  }
  aiMove() {
    // The leader may need to act several times (e.g. forced switch after the player's switch resolves).
    for (let i = 0; i < 4 && !this.ended; i++) {
      const req = this.battle.p2.activeRequest;
      if (!req || req.wait || this.battle.p2.isChoiceDone()) return;
      this.battle.choose('p2', decide(this.battle, req, this.ai));
    }
  }
}

// ---------- leader AI ----------
const IMMUNE_ABILITY = { Ground: ['Levitate'], Electric: ['Volt Absorb', 'Motor Drive', 'Lightning Rod'], Water: ['Water Absorb', 'Storm Drain', 'Dry Skin'],
  Fire: ['Flash Fire'], Grass: ['Sap Sipper'] };
const SETUP = new Set(['swordsdance', 'dragondance', 'nastyplot', 'calmmind', 'bulkup', 'quiverdance', 'shellsmash', 'shiftgear', 'coil', 'honeclaws',
  'curse', 'agility', 'rockpolish', 'amnesia', 'growth', 'workup', 'irondefense', 'acidarmor', 'cosmicpower', 'barrier', 'defensecurl', 'harden',
  'withdraw', 'tailglow', 'cottonguard', 'bellydrum', 'meditate', 'sharpen', 'howl', 'focusenergy', 'minimize', 'doubleteam', 'charge']);
const RECOVER = new Set(['recover', 'roost', 'softboiled', 'slackoff', 'milkdrink', 'synthesis', 'moonlight', 'morningsun', 'rest', 'healorder', 'wish']);
const HAZARD = { stealthrock: 'stealthrock', spikes: 'spikes', toxicspikes: 'toxicspikes' };
const SCREEN = { reflect: 'reflect', lightscreen: 'lightscreen', safeguard: 'safeguard', tailwind: 'tailwind' };

export function estimateDamage(attacker, defender, move) {
  if (move.category === 'Status') return 0;
  if (!dex.getImmunity(move.type, defender) && !(move.ignoreImmunity)) return 0;
  const ab = defender.getAbility?.()?.name || defender.ability;
  if (IMMUNE_ABILITY[move.type]?.includes(ab)) return 0;
  if (move.damage === 'level') return attacker.level;
  if (move.id === 'superfang') return Math.floor(defender.hp / 2);
  if (typeof move.damage === 'number') return move.damage;
  let bp = move.basePower || 0;
  if (move.multihit) bp *= Array.isArray(move.multihit) ? 3 : move.multihit;
  if (!bp) return 0;
  const phys = move.category === 'Physical';
  const a = attacker.getStat(phys ? 'atk' : 'spa', true, true) * boostMul(attacker.boosts[phys ? 'atk' : 'spa']);
  const d = defender.getStat(phys ? 'def' : 'spd', true, true) * boostMul(defender.boosts[phys ? 'def' : 'spd']);
  let dmg = Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * bp * a / d) / 50) + 2;
  if (attacker.hasType(move.type)) dmg *= 1.5;
  dmg *= Math.pow(2, dex.getEffectiveness(move.type, defender));
  if (attacker.status === 'brn' && phys && attacker.ability !== 'guts') dmg *= 0.5;
  const acc = move.accuracy === true ? 100 : move.accuracy;
  return dmg * 0.925 * (acc / 100);
}
const boostMul = b => b >= 0 ? (2 + b) / 2 : 2 / (2 - b);

function scoreMove(battle, me, foe, move, rng, side, foeSide) {
  if (move.category !== 'Status') {
    const dmg = estimateDamage(me, foe, move);
    if (dmg <= 0) return 0;
    let s = Math.min(dmg / foe.hp, 1.2) * 100;
    if (dmg >= foe.hp) s = 150 + (move.priority > 0 ? 50 : 0);
    if (move.flags.charge || move.self?.volatileStatus === 'mustrecharge') s *= 0.6;
    return s;
  }
  const id = move.id, hpPct = me.hp / me.maxhp;
  if (RECOVER.has(id)) return hpPct < 0.45 ? 95 : hpPct < 0.7 ? 20 : 0;
  if (SETUP.has(id)) {
    const maxBoost = Math.max(...Object.values(me.boosts));
    return hpPct > 0.6 && maxBoost < 2 ? 45 : 4;
  }
  if (HAZARD[id]) return foeSide.sideConditions[id] ? 0 : (foeSide.pokemonLeft > 1 ? 40 : 5);
  if (SCREEN[id]) return side.sideConditions[id] ? 0 : 30;
  if (move.status) {
    if (foe.status || foeSide.sideConditions.safeguard) return 0;
    if (!dex.getImmunity(move.status, foe)) return 0;
    if (move.status === 'par' && (foe.hasType('Ground') && move.id === 'thunderwave' || foe.hasType('Electric') && false)) return 0;
    if (move.flags.powder && foe.hasType('Grass')) return 15;
    return 50;
  }
  if (move.volatileStatus === 'confusion') return foe.volatiles.confusion ? 0 : 25;
  if (id === 'substitute') return me.volatiles.substitute || hpPct < 0.5 ? 0 : 25;
  if (id === 'protect' || id === 'detect') return 8;
  if (id === 'leechseed') return foe.hasType('Grass') || foe.volatiles.leechseed ? 0 : 35;
  if (move.boosts && move.target !== 'self') { // stat drops on the foe (Leer, Screech, String Shot...)
    const [stat] = Object.keys(move.boosts);
    return foe.boosts[stat] <= -2 ? 3 : 18;
  }
  if (id === 'sandstorm' || id === 'hail' || id === 'raindance' || id === 'sunnyday') return battle.field.weather ? 0 : 22;
  return 12;
}

export function decide(battle, req, rng, sid = 'p2') {
  const side = battle[sid], foeSide = side.foe;
  const me = side.active[0], foe = foeSide.active[0];
  if (req.forceSwitch) return bestSwitch(side, foe);
  const opts = req.active[0].moves.map((m, i) => ({ i, m, mv: dex.moves.get(m.id) })).filter(o => !o.m.disabled && (o.m.pp === undefined || o.m.pp > 0));
  if (!opts.length || !foe || foe.fainted) return 'move 1';
  let best = opts[0], bestScore = -1;
  for (const o of opts) {
    const s = scoreMove(battle, me, foe, o.mv, rng, side, foeSide) * (0.8 + 0.4 * rng.next());
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return 'move ' + (best.i + 1);
}

function bestSwitch(side, foe) {
  const party = side.pokemon;
  let best = -1, bestScore = -Infinity;
  party.forEach((p, i) => {
    if (p.fainted || p.isActive) return;
    let score = 0;
    if (foe && !foe.fainted) {
      const out = Math.max(0, ...p.moveSlots.map(ms => estimateDamage(p, foe, dex.moves.get(ms.id))));
      const inc = Math.max(0, ...foe.moveSlots.map(ms => estimateDamage(foe, p, dex.moves.get(ms.id))));
      score = out / foe.hp - inc / p.hp * 0.6;
    }
    score -= i * 0.01; // ties: party order, the ace stays last when it can
    if (i === party.length - 1) score -= 0.15;
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return 'switch ' + (best + 1);
}
