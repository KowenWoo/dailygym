// Vendors Pokémon Showdown's move animations into src/ps/.
//   - src/ps/anim-data.ts   BattleEffects + BattleOtherAnims + BattleStatusAnims (from battle-animations.ts, MIT / CC0)
//   - src/ps/anim-moves.ts  BattleMoveAnims (battle-animations-moves.ts, CC0)
//   - src/ps/fx.json        the effect images they use, as data URIs (CC0 except where noted in THIRD_PARTY_NOTICES.md)
// Source: https://github.com/smogon/pokemon-showdown-client (play.pokemonshowdown.com/src + /fx)
// Usage: VENDOR=vendor node tools/build_ps_anims.mjs   (expects VENDOR/psclient, see tools/fetch_vendor.sh)
import fs from 'fs';
const V = process.env.VENDOR || 'vendor';
const SRC = V + '/psclient/play.pokemonshowdown.com/src/';
const FXDIR = V + '/psclient/play.pokemonshowdown.com/fx/';
const OUT = 'src/ps/';
fs.mkdirSync(OUT, { recursive: true });

const anim = fs.readFileSync(SRC + 'battle-animations.ts', 'utf8');
const moves = fs.readFileSync(SRC + 'battle-animations-moves.ts', 'utf8');
const NOT_CC0 = new Set(['bone.png']); // no license stated upstream -> replaced by our own drawing (see shim.ts)

// ---- anim-data.ts: everything from the easing table to the end of battle-animations.ts ----
const start = anim.indexOf('Object.assign($.easing');
if (start < 0) throw new Error('easing table not found — upstream layout changed');
let data = anim.slice(start);
data = data.replace(/\(\(\) => \{\n\tif \(!window\.Dex[\s\S]*?\n\}\)\(\);\n/, `for (const id in BattleEffects) {\n\tif (BattleEffects[id].url) BattleEffects[id].url = FX(BattleEffects[id].url!);\n}\n`);
if (data.includes('window.Dex')) throw new Error('could not rewrite the BattleEffects url loop');
data = data.replace('const BattleEffects:', 'export const BattleEffects:');
const header = (file, lic) => `/**
 * Vendored from Pokémon Showdown's client: play.pokemonshowdown.com/src/${file}
 * https://github.com/smogon/pokemon-showdown-client — by Guangcong Luo and contributors.
 * Upstream license: ${lic}. Modified only by tools/build_ps_anims.mjs (imports + image URLs).
 * DO NOT EDIT — regenerate with \`npm run data:anims\`.
 */
// @ts-nocheck
`;
fs.writeFileSync(OUT + 'anim-data.ts', header('battle-animations.ts', 'MIT (most of the file CC0)') +
  `import $ from 'jquery';\nimport { FX, Config } from './shim';\n\n` + data);

// ---- anim-moves.ts ----
let mv = moves
  .replace("import { type AnimTable, BattleOtherAnims } from './battle-animations';", "import { BattleOtherAnims } from './anim-data';")
  .replace("import { Config } from './client-main';", "import { FX, Config } from './shim';")
  .replace(/https:\/\/\$\{Config\.routes\.client\}\/fx\/([A-Za-z0-9_.-]+)/g, (_, f) => `\${FX('${f}')}`)
  .replace(/: AnimTable/g, '');
fs.writeFileSync(OUT + 'anim-moves.ts', header('battle-animations-moves.ts', 'CC0-1.0') + mv);

// ---- fx.json: only the images the animations reference ----
const effBlock = anim.match(/const BattleEffects: \{ \[k: string\]: SpriteData \} = \{([\s\S]*?)\n\};/)[1];
const need = new Set([...effBlock.matchAll(/url: '([^']+)'/g)].map(m => m[1]));
for (const m of (anim + moves).matchAll(/\/fx\/([A-Za-z0-9_.-]+)'/g)) need.add(m[1]);
const fx = {}; let bytes = 0;
for (const f of [...need].sort()) {
  if (NOT_CC0.has(f)) continue;
  const p = FXDIR + f; if (!fs.existsSync(p)) { console.warn('missing fx', f); continue; }
  const buf = fs.readFileSync(p); bytes += buf.length;
  fx[f] = `data:image/${f.endsWith('.jpg') ? 'jpeg' : 'png'};base64,` + buf.toString('base64');
}
fs.writeFileSync(OUT + 'fx.json', JSON.stringify(fx));
console.log(`anim-data.ts ${(data.length / 1e3).toFixed(0)}k, anim-moves.ts ${(mv.length / 1e3).toFixed(0)}k, fx ${Object.keys(fx).length} images ${(bytes / 1e6).toFixed(2)}MB`);
