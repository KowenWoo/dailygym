import * as R from '../src/randomizer.js';
import { GymBattle, decide } from '../src/engine.js';
import { RNG } from '../src/rng.js';
let wins=0, n=0, turns=0, errors=0; const t0=Date.now();
for (let day=1; day<=Number(process.argv[2]||59); day++) {
  const L = R.leaderForDay(day); const draft = R.dailyDraft(day, L);
  const prng = new RNG('p'+day);
  const team = prng.shuffle(draft).slice(0, L.team.length);
  try {
    const g = new GymBattle(day, team, R.leaderTeam(day, L), L.name);
    let guard=0;
    while (!g.ended && guard++ < 500) {
      const req = g.request; if (!req || req.wait) { console.log('stuck wait', day); break; }
      const c = decide(g.battle, req, prng, 'p1');
      if (!g.choose(c)) { console.log('bad choice', day, c, JSON.stringify(req).slice(0,200)); errors++; break; }
    }
    const log = g.drain(); n++; turns+=g.turn; if (g.won) wins++;
    if (day===Number(process.argv[3])) console.log(log.join('\n'));
  } catch(e) { errors++; console.log('ERR day', day, L.name, e.stack.split('\n').slice(0,4).join(' | ')); }
}
console.log({n, wins, avgTurns: turns/n, errors, ms: Date.now()-t0});
