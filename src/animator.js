// Plays Pokémon Showdown's move animations (vendored in src/ps/) on our battle field.
// The tables call a small scene API (showEffect, backgroundEffect, wait, pos...) and move sprites with
// sprite.anim()/delay(). This file implements that API for our layout: Showdown's coordinate system
// (x left/right, y up/down, z = 0 at the player .. 200 at the opponent) is mapped onto the real
// on-screen centres and sizes of our two Pokémon sprites.
import jq from 'jquery';
import { BattleEffects, BattleOtherAnims, BattleStatusAnims } from './ps/anim-data.ts';
import { BattleMoveAnims } from './ps/anim-moves.ts';

const lerp = (a, b, t) => a + (b - a) * t;
const SPRITE = { w: 96, h: 96, gen: 5 }; // our Gen 5 sprites are 96×96

class Scene {
  constructor(field) {
    this.field = field;
    this.$fx = jq('<div class="psfx"></div>').appendTo(field);
    this.$bgEffect = jq('<div class="psbg"></div>').insertAfter(field.querySelector('.arena'));
    this.$delay = jq('<div></div>');
    this.timeOffset = 0; this.minDelay = 0; this.activeAnimations = jq();
    this.animating = true; this.acceleration = 1; this.gen = 5; this.activeCount = 1;
    this.battle = { gen: 5, mySide: { x: 0, y: 0, z: 0 } };
    this.sprites = { p1: new SpriteAdapter(this, 'p1', false), p2: new SpriteAdapter(this, 'p2', true) };
    // Showdown's backdrop sits at top:-100px; ground moves shake it by animating top/bottom around that.
    const arena = field.querySelector('.arena'), $arena = jq(arena);
    arena.psshake = 0;
    this.$arena = $arena;
    this.$bg = {
      animate(props, dur) {
        const y = props.top !== undefined ? props.top + 100 : 0;
        $arena.animate({ psshake: y }, { duration: dur, step: () => { arena.style.transform = `translateY(${arena.psshake}px)`; } });
        return this;
      },
      delay(t) { $arena.delay(t); return this; },
      css() { return this; },
    };
  }
  // Measure where our sprites actually are (they move between layouts / screen sizes).
  measure() {
    const f = this.field.getBoundingClientRect();
    const box = side => {
      const el = this.field.querySelector('.mon.' + side + ' img') || this.field.querySelector('.mon.' + side);
      const r = el.getBoundingClientRect();
      const w = r.width || (side === 'p1' ? 190 : 150);
      return { cx: r.left - f.left + (r.width || w) / 2, cy: r.top - f.top + (r.height || w) / 2, w };
    };
    const a = box('p1'), b = box('p2');
    // Showdown draws Gen 5 sprites at 2.0× (player) .. 1.0× (opponent); k converts that to our pixel sizes.
    // Sizes follow our sprite sizes (kA/kB); positional offsets follow Showdown's 360px-tall frame (kOff),
    // so jumps and arcs keep Showdown's proportions instead of flying off the top of the field.
    this.geo = { ax: a.cx, ay: a.cy, bx: b.cx, by: b.cy, kA: (a.w / 96) / 2.0, kB: (b.w / 96) / 1.0, kOff: f.height / 360 };
  }
  wait(time) { this.timeOffset += time; }
  waitFor(el) { this.activeAnimations = this.activeAnimations.add(el); }
  pos(loc, obj) {
    loc = { x: 0, y: 0, z: 0, scale: 1, opacity: 1, ...loc };
    if (!loc.xscale && loc.xscale !== 0) loc.xscale = loc.scale;
    if (!loc.yscale && loc.yscale !== 0) loc.yscale = loc.scale;
    const t = loc.z / 200, g = this.geo;
    let ps = obj.gen === 5 ? 2.0 - loc.z / 200 : 1.5 - 0.5 * (loc.z / 200);
    if (ps < 0.1) ps = 0.1;
    const scale = ps * lerp(g.kA, g.kB, Math.min(Math.max(t, -0.5), 1.5)), off = ps * g.kOff;
    let left = lerp(g.ax, g.bx, t) + Math.floor(loc.x * off);
    let top = lerp(g.ay, g.by, t) - Math.floor(loc.y * off);
    const width = Math.floor(obj.w * scale * loc.xscale), height = Math.floor(obj.h * scale * loc.yscale);
    const hoffset = Math.floor((obj.h - (obj.y || 0) * 2) * scale * loc.yscale);
    left -= Math.floor(width / 2); top -= Math.floor(hoffset / 2);
    const pos = { left, top, width, height, opacity: loc.opacity };
    if (loc.display) pos.display = loc.display;
    return pos;
  }
  posT(loc, obj, transition, oldLoc) { // per-property easings, as in Showdown
    const pos = this.pos(loc, obj), oldPos = oldLoc ? this.pos(oldLoc, obj) : null;
    const m = { left: 'linear', top: 'linear', width: 'linear', height: 'linear', opacity: 'linear' };
    if (transition === 'ballistic') m.top = pos.top < oldPos.top ? 'ballisticUp' : 'ballisticDown';
    if (transition === 'ballisticUnder') m.top = pos.top < oldPos.top ? 'ballisticDown' : 'ballisticUp';
    if (transition === 'ballistic2') m.top = pos.top < oldPos.top ? 'quadUp' : 'quadDown';
    if (transition === 'ballistic2Back') m.top = loc.z > 0 ? 'quadUp' : 'quadDown';
    if (transition === 'ballistic2Under') m.top = pos.top < oldPos.top ? 'quadDown' : 'quadUp';
    if (transition === 'swing') m.left = m.top = m.width = m.height = 'swing';
    if (transition === 'accel') m.left = m.top = m.width = m.height = 'quadDown';
    if (transition === 'decel') m.left = m.top = m.width = m.height = 'quadUp';
    return { left: [pos.left, m.left], top: [pos.top, m.top], width: [pos.width, m.width], height: [pos.height, m.height], opacity: [pos.opacity, m.opacity] };
  }
  showEffect(effect, start, end, transition, after, additionalCss) {
    if (typeof effect === 'string') effect = BattleEffects[effect];
    if (!effect) return jq();
    const html = effect.rawHTML || `<img src="${effect.url}" style="display:block;position:absolute" alt="" />`;
    let $e = jq(html).css({ display: 'block', position: 'absolute' });
    this.$fx.append($e); if (additionalCss) $e.css(additionalCss);
    $e = this.$fx.children().last();
    return this.animateEffect($e, effect, start, end, transition, after);
  }
  animateEffect($e, effect, start, end, transition, after) {
    if (typeof effect === 'string') effect = BattleEffects[effect];
    start = { ...start }; end = { ...end };
    if (!start.time) start.time = 0;
    if (!end.time) end.time = start.time + 500;
    start.time += this.timeOffset; end.time += this.timeOffset;
    if (!end.scale && end.scale !== 0 && start.scale) end.scale = start.scale;
    if (!end.xscale && end.xscale !== 0 && start.xscale) end.xscale = start.xscale;
    if (!end.yscale && end.yscale !== 0 && start.yscale) end.yscale = start.yscale;
    end = { ...start, ...end };
    const startpos = this.pos(start, effect), endpos = this.posT(end, effect, transition, start);
    if (start.time) { $e.css({ ...startpos, opacity: 0 }); $e.delay(start.time).animate({ opacity: startpos.opacity }, 1); }
    else if ($e.queue().length) $e.animate(startpos, 0);
    else $e.css(startpos);
    $e.animate(endpos, end.time - start.time);
    if (after === 'fade') $e.animate({ opacity: 0 }, 100);
    if (after === 'explode') {
      if (end.scale) end.scale *= 3; if (end.xscale) end.xscale *= 3; if (end.yscale) end.yscale *= 3;
      end.opacity = 0; $e.animate(this.pos(end, effect), 200);
    }
    this.waitFor($e);
    return $e;
  }
  backgroundEffect(bg, duration, opacity = 1, delay = 0) {
    const $e = jq('<div class="background"></div>').css({ background: bg, backgroundSize: 'cover', display: 'block', opacity: 0 });
    this.$bgEffect.append($e);
    $e.delay(delay + this.timeOffset).animate({ opacity }, 250).delay(Math.max(0, duration - 250)).animate({ opacity: 0 }, 250);
    this.waitFor($e);
  }
  start() {
    this.$fx.empty(); this.$bgEffect.empty(); this.activeAnimations = jq(); this.timeOffset = 0; this.minDelay = 0;
    this.measure();
    for (const s of Object.values(this.sprites)) s.reset();
  }
  finish() {
    if (this.minDelay || this.timeOffset) { this.$delay.delay(Math.max(this.minDelay, this.timeOffset)); this.activeAnimations = this.activeAnimations.add(this.$delay); }
    const all = this.activeAnimations.add(this.sprites.p1.$el).add(this.sprites.p2.$el).add(this.$arena);
    return new Promise(res => {
      const done = () => { clearTimeout(guard); this.$fx.empty(); this.$bgEffect.empty(); for (const s of Object.values(this.sprites)) s.reset();
        this.$arena.stop(true, false); this.$arena[0].psshake = 0; this.$arena[0].style.transform = ''; res(); };
      const guard = setTimeout(() => { all.stop(true, true); done(); }, 4000); // never let a broken animation stall the battle
      all.promise().then(done);
    });
  }
}

// Wraps one of our .mon slots so Showdown's tables can move it around.
class SpriteAdapter {
  constructor(scene, side, isFrontSprite) {
    this.scene = scene; this.side = side; this.isFrontSprite = isFrontSprite;
    this.x = 0; this.y = 0; this.z = isFrontSprite ? 200 : 0; this.sp = SPRITE;
  }
  get el() { return this.scene.field.querySelector('.mon.' + this.side); }
  get $el() { return jq(this.el); }
  reset() {
    const el = this.el; if (!el) return;
    jq(el).stop(true, false);
    Object.assign(el, { psdx: 0, psdy: 0, pssx: 1, pssy: 1, psop: 1 });
    el.style.transform = ''; el.style.opacity = '';
  }
  behindx(o) { return this.x + (this.isFrontSprite ? 1 : -1) * o; }
  behindy(o) { return this.y + (this.isFrontSprite ? -1 : 1) * o; }
  leftof(o) { return this.x + (this.isFrontSprite ? 1 : -1) * o; }
  behind(o) { return this.z + (this.isFrontSprite ? 1 : -1) * o; }
  delay(time) { this.$el.delay(time); return this; }
  anim(end, transition) {
    const el = this.el; if (!el) return this;
    end = { x: this.x, y: this.y, z: this.z, scale: 1, opacity: 1, time: 500, ...end };
    const home = this.scene.pos({ x: this.x, y: this.y, z: this.z }, this.sp);
    const T = this.scene.posT(end, this.sp, transition, this);
    const [l, el_] = T.left, [t, et] = T.top, [w, ew] = T.width, [h] = T.height, [o] = T.opacity;
    const dx = (l + w / 2) - (home.left + home.width / 2), dy = (t + h / 2) - (home.top + home.height / 2);
    jq(el).animate({ psdx: dx, psdy: dy, pssx: w / home.width, pssy: h / home.height, psop: o }, {
      duration: end.time, specialEasing: { psdx: el_, psdy: et, pssx: ew, pssy: ew, psop: 'linear' },
      step: () => { el.style.transform = `translate(${el.psdx}px,${el.psdy}px) scale(${el.pssx},${el.pssy})`; el.style.opacity = el.psop; },
    });
    return this;
  }
}

// ---------- public API ----------
let scene = null;
export function attachAnimator(field) { scene = new Scene(field); }
const run = async (fn) => {
  if (!scene) return;
  scene.start();
  try { fn(scene); } catch (e) { console.warn('animation error', e); }
  await scene.finish();
};
export function moveAnim(moveid, attackerSide, targetSide) {
  return run(s => {
    const a = s.sprites[attackerSide], d = targetSide ? s.sprites[targetSide] : a;
    (BattleMoveAnims[moveid] || BattleMoveAnims.tackle).anim(s, [a, d]);
  });
}
export function prepareAnim(moveid, attackerSide, targetSide) {
  const e = BattleMoveAnims[moveid]; if (!e?.prepareAnim) return Promise.resolve();
  return run(s => e.prepareAnim(s, [s.sprites[attackerSide], s.sprites[targetSide || (attackerSide === 'p1' ? 'p2' : 'p1')]]));
}
export function statusAnim(id, side) {
  const e = BattleStatusAnims[id]; if (!e) return Promise.resolve();
  return run(s => e.anim(s, [s.sprites[side]]));
}
export function otherAnim(id, side, targetSide) {
  const e = BattleOtherAnims[id]; if (!e) return Promise.resolve();
  return run(s => e.anim(s, [s.sprites[side], s.sprites[targetSide || side]]));
}
