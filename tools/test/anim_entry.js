import jq from 'jquery';
import { attachAnimator, moveAnim, prepareAnim, statusAnim, otherAnim } from '../../src/animator.js';
import { BattleMoveAnims } from '../../src/ps/anim-moves.ts';
import { BattleStatusAnims, BattleOtherAnims } from '../../src/ps/anim-data.ts';
window.runAll = async () => {
  jq.fx.off = true; jq.fn.delay = function () { return this; };
  const field = document.querySelector('.field'); attachAnimator(field);
  const errs = []; const orig = console.warn; console.warn = (...a) => errs.push(String(a[1]?.message || a[1] || a[0]));
  let n = 0;
  for (const id of Object.keys(BattleMoveAnims)) {
    for (const [a, d] of [['p1', 'p2'], ['p2', 'p1'], ['p1', 'p1']]) {
      const before = errs.length; await moveAnim(id, a, d); if (BattleMoveAnims[id].prepareAnim) await prepareAnim(id, a, d);
      if (errs.length > before) errs[errs.length - 1] = id + ' ' + a + '>' + d + ': ' + errs[errs.length - 1];
      n++;
    }
  }
  for (const id of Object.keys(BattleStatusAnims)) { const b = errs.length; await statusAnim(id, 'p1'); await statusAnim(id, 'p2'); if (errs.length > b) errs[errs.length - 1] = 'status ' + id + ': ' + errs[errs.length - 1]; n += 2; }
  for (const id of Object.keys(BattleOtherAnims)) { const b = errs.length; await otherAnim(id, 'p1', 'p2'); if (errs.length > b) errs[errs.length - 1] = 'other ' + id + ': ' + errs[errs.length - 1]; n++; }
  console.warn = orig;
  return { n, errs };
};
window.playOne = (id, a = 'p1', d = 'p2') => { attachAnimator(document.querySelector('.field')); return moveAnim(id, a, d); };
