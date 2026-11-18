#!/usr/bin/env bash
# Downloads the raw data used to regenerate src/leaders.json and src/sprites.json.
# Only needed if you want to change leader data or sprites — the generated JSON is already committed.
set -euo pipefail
V=${VENDOR:-vendor}; mkdir -p "$V/pret" && cd "$V"
# Pokémon sprites (Gen 5 Black/White, front + back)
git clone --depth 1 --filter=blob:none --sparse https://github.com/PokeAPI/sprites pokeapi
(cd pokeapi && git sparse-checkout set --no-cone '/sprites/pokemon/versions/generation-v/black-white/*.png' '/sprites/pokemon/versions/generation-v/black-white/back/*.png')
# Trainer sprites
git clone --depth 1 --filter=blob:none --sparse https://github.com/smogon/sprites sprites
(cd sprites && git sparse-checkout set --no-cone '/src/_uncategorized/canonical/trainers/gen3/*' '/src/_uncategorized/canonical/trainers/gen4/*' '/src/_uncategorized/canonical/trainers/gen5/*')
# Gym leader teams from the pret decompilations
cd pret
for r in pokefirered pokeemerald; do
  curl -sL -o $r-parties.h https://raw.githubusercontent.com/pret/$r/master/src/data/trainer_parties.h
done
git clone -q --depth 1 --filter=blob:none --no-checkout https://github.com/pret/pokeheartgold
(cd pokeheartgold && git checkout HEAD -- files/poketool/trainer/trainers.json)
git clone -q --depth 1 --filter=blob:none --no-checkout https://github.com/pret/pokeplatinum
(cd pokeplatinum && git checkout HEAD -- $(for n in roark gardenia maylene wake fantina byron candice volkner; do echo res/trainers/data/leader_$n.json; done) $(for n in aaron bertha flint lucian; do echo res/trainers/data/elite_four_$n.json; done) res/trainers/data/champion_cynthia.json)
# Pokémon Showdown client: move animations + effect images (only needed for `npm run data:anims`)
cd ..
git clone -q --depth 1 --filter=blob:none --no-checkout https://github.com/smogon/pokemon-showdown-client psclient
(cd psclient && git checkout HEAD -- play.pokemonshowdown.com/src/battle-animations.ts play.pokemonshowdown.com/src/battle-animations-moves.ts play.pokemonshowdown.com/fx)
echo "Vendor data ready in $V"
