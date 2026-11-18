import * as R from '../src/randomizer.js';
console.log('pool', R.speciesPool().length);
for (const day of [1,2,3]) {
  const L = R.leaderForDay(day); console.log(`\nDay ${day}: ${L.name} (${L.game})`);
  for (const s of R.leaderTeam(day, L)) console.log('  L', s.species, s.level, s.item, s.ability, s.moves.join('/'));
  for (const s of R.dailyDraft(day, L)) console.log('  P', s.species.padEnd(14), (s.item||'').padEnd(13), s.ability.padEnd(14), s.nature.padEnd(8), s.moves.join(' / '));
}
