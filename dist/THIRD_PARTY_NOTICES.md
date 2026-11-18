# Third-party notices

Daily Gym bundles the following third-party material into `dist/index.html`.

## Pokémon Showdown: move animations and effect images

Source: https://github.com/smogon/pokemon-showdown-client, by Guangcong Luo and contributors.

| What | Upstream file | License |
|---|---|---|
| Move animations (`src/ps/anim-moves.ts`) | `play.pokemonshowdown.com/src/battle-animations-moves.ts` | CC0-1.0 (public domain) |
| Effect and status animation tables (`src/ps/anim-data.ts`) | `play.pokemonshowdown.com/src/battle-animations.ts` | MIT. Most of that file is also CC0-1.0. |
| Effect images (`src/ps/fx.json`) | `play.pokemonshowdown.com/fx/*` | CC0-1.0, except as listed below |

Pokémon Showdown's client as a whole is AGPLv3. The upstream files above carry their own, more permissive licenses (stated in their headers), and only those files are used here. No other client code is included.

Effect images that are **not** CC0:

- `icicle.png` and `lightning.png` are by Clint Bellanger, triple-licensed GPLv2 / GPLv3 / CC-BY-SA-3.0. This project uses them under **CC-BY-SA-3.0**: https://creativecommons.org/licenses/by-sa/3.0/
  - Sources: http://opengameart.org/content/icicle-spell and http://opengameart.org/content/lightning-shock-spell
- `rocks.png`, `rock1.png` and `rock2.png` are by PO user "Gilad", licensed GPLv3: https://www.gnu.org/licenses/gpl-3.0.html
  - The unmodified image files can be extracted from `src/ps/fx.json` (base64 PNG), or found upstream in `play.pokemonshowdown.com/fx/`.
- `bone.png` is **not included** because upstream states no license for it. `src/ps/shim.ts` replaces it with an original drawing.

The MIT license for `battle-animations.ts`:

> Copyright (c) Guangcong Luo and other contributors (per the `@author` / `@license MIT` header of battle-animations.ts)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Pokémon Showdown battle engine (`@pkmn/sim`)

https://github.com/pkmn/ps, MIT license. It's an npm dependency, and its license ships in `node_modules/@pkmn/sim/LICENSE`.

## jQuery

https://jquery.com, MIT license, © OpenJS Foundation and other contributors. It's an npm dependency used by the animation engine.

## Sprites

- Pokémon sprites (Gen 5 Black/White) come from https://github.com/PokeAPI/sprites.
- Trainer sprites come from https://github.com/smogon/sprites.

Pokémon character art and names are © Nintendo, Game Freak and The Pokémon Company. This is a free, non-commercial fan project that isn't affiliated with or endorsed by them.
