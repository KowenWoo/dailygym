import fs from 'fs';
import { toID } from '@pkmn/sim';
import * as R from '../src/randomizer.js';
const DIR = (process.env.VENDOR || 'vendor') + '/pokeapi/sprites/pokemon/versions/generation-v/black-white/';
const FORMS = { 'Deoxys-Attack': 10001, 'Deoxys-Defense': 10002, 'Deoxys-Speed': 10003, 'Wormadam-Sandy': 10004, 'Wormadam-Trash': 10005,
  'Shaymin-Sky': 10006, 'Rotom-Heat': 10008, 'Rotom-Wash': 10009, 'Rotom-Frost': 10010, 'Rotom-Fan': 10011, 'Rotom-Mow': 10012,
  'Tornadus-Therian': 10019, 'Thundurus-Therian': 10020, 'Landorus-Therian': 10021, 'Kyurem-Black': 10022, 'Kyurem-White': 10023 };
const file = s => FORMS[s.name] ?? (s.forme ? null : s.num);
const front = {}, back = {}; const missing = [];
const enc = p => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
const add = (s, withBack) => {
  const f = file(s); if (f == null) { missing.push(s.name); return; }
  const id = toID(s.name);
  if (!front[id]) { if (fs.existsSync(DIR + f + '.png')) front[id] = enc(DIR + f + '.png'); else missing.push(s.name + ' front'); }
  if (withBack && !back[id]) { if (fs.existsSync(DIR + 'back/' + f + '.png')) back[id] = enc(DIR + 'back/' + f + '.png'); else missing.push(s.name + ' back'); }
};
for (const s of R.speciesPool()) add(s, true);
for (const l of R.LEADERS) for (const m of l.team) add(R.dex.species.get(m.species), false);
if (missing.length) console.log('missing', missing);
fs.writeFileSync('src/sprites.json', JSON.stringify({ front, back }));
console.log(Object.keys(front).length, Object.keys(back).length, (fs.statSync('src/sprites.json').size / 1e6).toFixed(2) + 'MB');
