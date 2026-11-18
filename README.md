# Daily Gym

A daily Pokémon battle game. Every day you face one Gym Leader, Elite Four member or Champion from Generations 1–5, using their first-battle team from their most recent game. You draft a randomized team to fight them. Everyone gets the same leader, draft pool and sets each day, and you get one attempt.

- **91 trainers:** 59 Gym Leaders, 24 Elite Four members and 8 Champion teams from FRLG, Emerald, HGSS (Johto and Kanto), Platinum, BW and B2W2. FRLG Blue has three teams, one for each starter. They rotate in a shuffled order, and each appears once every 91 days.
- **Draft:** you draft as many Pokémon as the leader has, from a pool twice that size (at least 6). Your first pick leads.
- **Randomizer:** abilities are random, and banned abilities are skipped. Moves come from each Pokémon's own learnset, with nuzlocke-style rules. Items follow competitive logic, and the leader gets items the same way.
- **Battles:** Pokémon Showdown's simulator (`@pkmn/sim`) runs the battles with Gen 5 mechanics at Level 50. The leader is controlled by a heuristic AI.
- **Arenas:** every trainer battles in a background inspired by their gym, League room or champion hall, like Brock's rocky cave, Misty's pool or Elesa's runway. They're original SVG drawings, not game rips.
- **Move animations:** these are Pokémon Showdown's move animations (CC0/MIT, see `THIRD_PARTY_NOTICES.md`), played on our battle field. Players can switch them off with the ✨ button.
- **Fully client-side:** no server. Progress and streaks are saved in `localStorage`.

## Run it locally

You need Node 18 or newer.

```bash
npm install
npm run build        # bundles everything into dist/index.html (one self-contained file, ~7.7 MB)
```

Then open `dist/index.html` directly in your browser (double-click it), or serve the folder:

```bash
npm run serve        # http://localhost:5173
```

The pixel font loads from Google Fonts. If you're offline, the page falls back to a system font. Sprites and data are embedded in the page, so it needs nothing else from the network.

**Testing tips**
- `dist/index.html?day=5` plays an earlier day. Days later than today are clamped to today.
- To reset your progress, run `localStorage.removeItem('dailygym:v1')` in the browser console.
- `npm run sim-test` runs 200 days of leader AI against leader AI headlessly to catch engine errors.
- `npm run rand-test` prints a few days of leaders, drafts and sets.
- `npm run anim-test` builds `tools/test/anim_test.html`. Open it and run `await runAll()` in the console to play every move animation and report errors. `playOne('surf', 'p1', 'p2')` plays one at real speed.
- `tools/play.py` and `tools/shot.py` are Playwright smoke tests. They need `pip install playwright`, and you set `CHROME=/path/to/chrome`.

## Project layout

```
src/
  main.js         UI: intro, draft, battle screen, results/share, how-to-play
  engine.js       GymBattle wrapper around the Showdown sim + leader AI
  arenas.js       per-trainer battle backgrounds (SVG walls/floors/props + particle effects)
  animator.js     runs Showdown's move animations on our battle field (maps Showdown's scene coordinates onto our sprites)
  ps/             generated: vendored Showdown animation tables + effect images (npm run data:anims), plus shim.ts
  randomizer.js   species pool, move/ability rules + ban lists, item logic, daily seeding, leader rotation
  rng.js          seeded PRNG (same day → same content for everyone)
  leaders.json    generated: all 91 trainers' teams (Gym Leaders, Elite Four, Champions) + trainer sprites
  sprites.json    generated: Gen 5 front/back Pokémon sprites (base64)
tools/
  template.html   page shell + all CSS
  build.mjs       esbuild bundle → dist/index.html
  unova.mjs       hand-entered BW/B2W2 Gym Leader, Elite Four and Champion teams
  extract_pret.py, build_leaders.mjs, build_sprites.mjs, fetch_vendor.sh   data pipeline
```

### Things you'll most likely want to tweak (all in `src/randomizer.js`)

- `BATTLE_LEVEL`: the level the battle is normalized to (default 50).
- `EPOCH`: which date counts as Day #1.
- `BANNED_ABILITIES`, `WEAK_ABILITIES`, `BANNED_MOVES`, and the `SETUP_*`, `RECOVERY`, `STATUSERS` and `UTILITY` lists: the randomizer rules.
- `chooseItem()`: the item logic.
- `legendWeight()` and `EVIOLITE_NFE`: how often legendaries appear, and which not-fully-evolved Pokémon are allowed in the draft pool.
- `draftSize()`: how big the draft pool is.

Leader AI scoring is in `scoreMove()` in `src/engine.js`. Each trainer's battle background is one line in the `ARENAS` table in `src/arenas.js`. A line picks a wall style, floor style, colour palette, props with x-positions, and a particle effect. After any change, run `npm run build`.

### Regenerating leader data and sprites (optional)

`src/leaders.json` and `src/sprites.json` are already generated. You only need these steps if you change the data sources:

```bash
npm run data:fetch      # clones PokeAPI sprites, Smogon trainer sprites, pret decomps into ./vendor
npm run data:leaders    # needs python3
npm run data:sprites
npm run data:anims      # re-vendors Pokémon Showdown's move animations
npm run build
```

Sources:
- Kanto (FRLG), Hoenn (Emerald), Johto and HGSS Kanto, and Sinnoh (Platinum) Gym Leader, Elite Four and Champion teams come from the pret decompilations (`pokefirered`, `pokeemerald`, `pokeheartgold`, `pokeplatinum`).
- Unova teams are hand-entered in `tools/unova.mjs` and haven't been checked against the games. Gym Leaders came from a pokemondb answer, and the Elite Four and Champions from dittobase.com. Alder only battles you postgame in BW, so his team is that one. dittobase gave no abilities, so they use each species' first ability. Double-check them against Bulbapedia.

## Publishing

`dist/index.html` is a single static file, so any static host works.

**Option A: Netlify Drop (fastest, no account setup)**
1. Run `npm run build`.
2. Go to https://app.netlify.com/drop and drag the `dist` folder onto the page.
3. You get a public URL right away. To make it permanent, claim the site with a free account.

**Option B: GitHub Pages**
1. Push this project to a GitHub repo. Commit `dist/`, or use the workflow below.
2. Without a workflow: go to **Settings → Pages → Build and deployment**, pick *Deploy from a branch*, choose `main`, and set the folder to `/dist`. GitHub Pages only offers `/` or `/docs`, so rename `dist` to `docs` and change the output path in `tools/build.mjs`.
3. With a workflow: add `.github/workflows/pages.yml`:

```yaml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
```
   Then go to **Settings → Pages → Source** and select *GitHub Actions*.

**Option C: Vercel or Cloudflare Pages**
Import the repo. Set the build command to `npm run build` and the output directory to `dist`.

**Option D: Claude page**
Ask Claude to publish `dist/index.html` as an artifact. It starts private, and you share it from its page on claude.ai.

### Before you go public

- **Credits:** keep `THIRD_PARTY_NOTICES.md` alongside the game. If you publish the source, keep it in the repo, and link it from wherever you host the game. A few effect images are CC-BY-SA or GPLv3, and the notices file covers their credits.

- **Copyright:** sprites, names and team data belong to Nintendo, Game Freak and The Pokémon Company. Fan projects like this usually run non-commercially and get taken down when the owners ask. Keep it free, and don't use official logos.
- **Shared links don't save progress:** progress lives in each player's browser, so shared links don't sync streaks across devices.
- **Time zones:** the day changes at each player's local midnight, like Wordle.
