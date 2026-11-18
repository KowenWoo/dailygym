import fs from 'fs';
import { Dex, toID } from '@pkmn/sim';
import { UNOVA } from './unova.mjs';
const d = Dex.forGen(5);
const V = process.env.VENDOR || 'vendor';
const SPR = V + '/sprites/src/_uncategorized/canonical/trainers/';
const FIX = { feintattack: 'feintattack', faintattack: 'feintattack', vicegrip: 'visegrip', hijumpkick: 'highjumpkick',
  smellingsalt: 'smellingsalts', sandattack: 'sandattack', selfdestruct: 'selfdestruct', softboiled: 'softboiled',
  ancientpower: 'ancientpower', dynamicpunch: 'dynamicpunch', thunderpunch: 'thunderpunch', solarbeam: 'solarbeam',
  bubblebeam: 'bubblebeam', doubleslap: 'doubleslap', poisonpowder: 'poisonpowder', sonicboom: 'sonicboom',
  extremespeed: 'extremespeed', dragonbreath: 'dragonbreath', featherdance: 'featherdance', grasswhistle: 'grasswhistle' };
const errs = [];
const mv = m => { let id = toID(m); id = FIX[id] || id; const x = d.moves.get(id); if (!x.exists) errs.push('move ' + m); return x.id; };
const sp = s => { const x = d.species.get(toID(s.replace(/_/g, ' '))); if (!x.exists) errs.push('species ' + s); return x; };
const it = i => { if (!i || i === 'NONE') return null; const x = d.items.get(toID(i)); if (!x.exists) errs.push('item ' + i); return x.name; };

const ext = JSON.parse(fs.readFileSync(V + '/leaders_extracted.json'));
const leaders = [];
for (const l of ext) {
  leaders.push({ name: l.name, role: l.role || 'Gym Leader', note: l.note || undefined, region: l.region, game: l.game, sprite: l.sprite,
    team: l.team.map(m => { const s = sp(m.species); return { species: s.name, level: m.level, ability: s.abilities[0], item: it(m.item), moves: m.moves.map(mv) }; }) });
}
for (const l of UNOVA) {
  leaders.push({ name: l.name, role: l.role, note: l.note || undefined, region: 'Unova', game: l.game, sprite: l.sprite,
    team: l.team.map(([s, lv, ab, item, moves]) => { const S = sp(s); ab ||= S.abilities[0]; if (!d.abilities.get(ab).exists) errs.push('ab ' + ab);
      return { species: S.name, level: lv, ability: d.abilities.get(ab).name, item: it(item), moves: moves.map(mv) }; }) });
}
// fill empty movesets (none expected) and compute specialty type
for (const l of leaders) {
  const cnt = {};
  for (const m of l.team) { if (!m.moves.length) errs.push('nomoves ' + l.name + m.species); for (const t of d.species.get(m.species).types) cnt[t] = (cnt[t] || 0) + 1; }
  l.type = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];
  l.id = toID(l.role + l.name + l.game + (l.note || ''));
  const p = SPR + l.sprite; if (!fs.existsSync(p)) errs.push('sprite ' + p);
  l.spriteData = 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  delete l.sprite;
}
// type overrides where the majority-type heuristic is wrong
const TYPE = { 'Giovanni': 'Ground', 'Blue': 'Mixed', 'Sabrina': 'Psychic', 'Tate & Liza': 'Psychic', 'Norman': 'Normal', 'Winona': 'Flying', 'Clair': 'Dragon', 'Drayden': 'Dragon', 'Iris': 'Dragon', 'Roark': 'Rock', 'Byron': 'Steel', 'Jasmine': 'Steel', 'Juan': 'Water', 'Koga': 'Poison', 'Janine': 'Poison', 'Erika': 'Grass', 'Gardenia': 'Grass', 'Morty': 'Ghost', 'Fantina': 'Ghost', 'Pryce': 'Ice', 'Candice': 'Ice', 'Brycen': 'Ice', 'Skyla': 'Flying', 'Falkner': 'Flying', 'Bugsy': 'Bug', 'Burgh': 'Bug', 'Whitney': 'Normal', 'Lenora': 'Normal', 'Cheren': 'Normal', 'Chuck': 'Fighting', 'Brawly': 'Fighting', 'Maylene': 'Fighting', 'Roxie': 'Poison', 'Cilan': 'Grass', 'Chili': 'Fire', 'Cress': 'Water', 'Clay': 'Ground', 'Marlon': 'Water', 'Misty': 'Water', 'Crasher Wake': 'Water', 'Brock': 'Rock', 'Roxanne': 'Rock', 'Lt. Surge': 'Electric', 'Wattson': 'Electric', 'Volkner': 'Electric', 'Elesa': 'Electric', 'Blaine': 'Fire', 'Flannery': 'Fire',
  'Lorelei': 'Ice', 'Bruno': 'Fighting', 'Agatha': 'Ghost', 'Lance': 'Dragon', 'Sidney': 'Dark', 'Phoebe': 'Ghost', 'Glacia': 'Ice', 'Drake': 'Dragon',
  'Will': 'Psychic', 'Karen': 'Dark', 'Aaron': 'Bug', 'Bertha': 'Ground', 'Flint': 'Fire', 'Lucian': 'Psychic',
  'Shauntal': 'Ghost', 'Grimsley': 'Dark', 'Caitlin': 'Psychic', 'Marshal': 'Fighting' };
for (const l of leaders) if (TYPE[l.name]) l.type = TYPE[l.name];
const CH_TYPE = { Blue: 'Mixed', Wallace: 'Water', Lance: 'Dragon', Cynthia: 'Mixed', Alder: 'Mixed', Iris: 'Dragon' }; // champions win over gym/E4 entries of the same name
for (const l of leaders) if (l.role === 'Champion') l.type = CH_TYPE[l.name];
if (errs.length) { console.error(errs); process.exit(1); }
const MIN_TEAM = 3; // 2-Pokémon leaders make for too short a draft and battle
const kept = leaders.filter(l => l.team.length >= MIN_TEAM); leaders.length = 0; leaders.push(...kept);
fs.writeFileSync('src/leaders.json', JSON.stringify(leaders));
console.log(leaders.length, 'leaders');
for (const l of leaders) console.log(l.role.padEnd(11), l.name.padEnd(12), l.game.padEnd(22), l.type.padEnd(9), l.team.map(m => `${m.species}${m.level}[${m.ability}]`).join(' '));
