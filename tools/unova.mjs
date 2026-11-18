// Unova leaders (BW first battles; B2W2 Normal Mode first battles).
// Format: [species, level, ability, item|null, [moves]]
const T = (name, game, sprite, team, role = 'Gym Leader') => ({ name, game, sprite, team, role });
const C = (name, game, sprite, team, note) => ({ ...T(name, game, sprite, team, 'Champion'), note });
const E = (name, game, team) => T(name, game, `gen5/black-white/${name}.png`, team, 'Elite Four');
const bw = 'Black/White', b2 = 'Black 2/White 2';
export const UNOVA = [
  T('Cilan', bw, 'gen5/black-white/Cilan.png', [
    ['Lillipup', 12, 'Pickup', null, ['Bite', 'Work Up']],
    ['Pansage', 14, 'Gluttony', null, ['Vine Whip', 'Work Up']]]),
  T('Chili', bw, 'gen5/black-white/Chili.png', [
    ['Lillipup', 12, 'Pickup', null, ['Bite', 'Work Up']],
    ['Pansear', 14, 'Gluttony', null, ['Incinerate', 'Work Up']]]),
  T('Cress', bw, 'gen5/black-white/Cress.png', [
    ['Lillipup', 12, 'Pickup', null, ['Bite', 'Work Up']],
    ['Panpour', 14, 'Gluttony', null, ['Water Gun', 'Work Up']]]),
  T('Lenora', bw, 'gen5/black-white/Lenora.png', [
    ['Herdier', 18, 'Intimidate', null, ['Take Down', 'Bite', 'Retaliate', 'Leer']],
    ['Watchog', 20, 'Illuminate', null, ['Leer', 'Crunch', 'Retaliate', 'Hypnosis']]]),
  T('Burgh', bw, 'gen5/black-white/Burgh.png', [
    ['Whirlipede', 21, 'Swarm', null, ['Screech', 'Pursuit', 'Poison Tail', 'Struggle Bug']],
    ['Dwebble', 21, 'Shell Armor', null, ['Sand Attack', 'Feint Attack', 'Smack Down', 'Struggle Bug']],
    ['Leavanny', 23, 'Swarm', null, ['Protect', 'String Shot', 'Razor Leaf', 'Struggle Bug']]]),
  T('Elesa', bw, 'gen5/black-white/Elesa.png', [
    ['Emolga', 25, 'Static', null, ['Quick Attack', 'Pursuit', 'Aerial Ace', 'Volt Switch']],
    ['Emolga', 25, 'Static', null, ['Quick Attack', 'Pursuit', 'Aerial Ace', 'Volt Switch']],
    ['Zebstrika', 27, 'Lightning Rod', null, ['Quick Attack', 'Flame Charge', 'Spark', 'Volt Switch']]]),
  T('Clay', bw, 'gen5/black-white/Clay.png', [
    ['Krokorok', 29, 'Moxie', null, ['Swagger', 'Torment', 'Crunch', 'Bulldoze']],
    ['Palpitoad', 29, 'Swift Swim', null, ['Aqua Ring', 'Bubble Beam', 'Muddy Water', 'Bulldoze']],
    ['Excadrill', 31, 'Sand Rush', null, ['Hone Claws', 'Slash', 'Rock Slide', 'Bulldoze']]]),
  T('Skyla', bw, 'gen5/black-white/Skyla.png', [
    ['Swoobat', 33, 'Unaware', null, ['Acrobatics', 'Amnesia', 'Assurance', 'Heart Stamp']],
    ['Unfezant', 33, 'Big Pecks', null, ['Leer', 'Quick Attack', 'Air Slash', 'Razor Wind']],
    ['Swanna', 35, 'Keen Eye', null, ['Aqua Ring', 'Aerial Ace', 'Bubble Beam', 'Air Slash']]]),
  T('Brycen', bw, 'gen5/black-white/Brycen.png', [
    ['Vanillish', 37, 'Ice Body', null, ['Acid Armor', 'Astonish', 'Mirror Shot', 'Frost Breath']],
    ['Cryogonal', 37, 'Levitate', null, ['Reflect', 'Rapid Spin', 'Aurora Beam', 'Frost Breath']],
    ['Beartic', 39, 'Snow Cloak', null, ['Swagger', 'Brine', 'Slash', 'Icicle Crash']]]),
  T('Drayden', 'Black', 'gen5/black-white/Drayden.png', [
    ['Fraxure', 41, 'Rivalry', null, ['Dragon Dance', 'Dragon Rage', 'Assurance', 'Dragon Tail']],
    ['Druddigon', 41, 'Rough Skin', null, ['Revenge', 'Chip Away', 'Night Slash', 'Dragon Tail']],
    ['Haxorus', 43, 'Rivalry', null, ['Dragon Dance', 'Assurance', 'Slash', 'Dragon Tail']]]),
  T('Iris', 'White', 'gen5/black-white/Iris.png', [
    ['Fraxure', 41, 'Rivalry', null, ['Dragon Dance', 'Dragon Rage', 'Assurance', 'Dragon Tail']],
    ['Druddigon', 41, 'Sheer Force', null, ['Revenge', 'Chip Away', 'Night Slash', 'Dragon Tail']],
    ['Haxorus', 43, 'Mold Breaker', null, ['Dragon Dance', 'Assurance', 'Slash', 'Dragon Tail']]]),
  T('Cheren', b2, 'gen5/black2-white2/Cheren.png', [
    ['Patrat', 11, 'Keen Eye', null, ['Work Up', 'Tackle', 'Bite']],
    ['Lillipup', 13, 'Vital Spirit', null, ['Work Up', 'Tackle', 'Bite']]]),
  T('Roxie', b2, 'gen5/black2-white2/Roxie.png', [
    ['Koffing', 16, 'Levitate', null, ['Assurance', 'Tackle', 'Smog']],
    ['Whirlipede', 18, 'Poison Point', null, ['Venoshock', 'Protect', 'Poison Sting', 'Pursuit']]]),
  T('Burgh', b2, 'gen5/black-white/Burgh.png', [
    ['Swadloon', 22, 'Leaf Guard', null, ['String Shot', 'Razor Leaf', 'Struggle Bug', 'Protect']],
    ['Dwebble', 22, 'Sturdy', null, ['Smack Down', 'Feint Attack', 'Rock Polish', 'Struggle Bug']],
    ['Leavanny', 24, 'Swarm', 'Sitrus Berry', ['Razor Leaf', 'Cut', 'String Shot', 'Struggle Bug']]]),
  T('Elesa', b2, 'gen5/black2-white2/Elesa.png', [
    ['Emolga', 28, 'Static', null, ['Quick Attack', 'Pursuit', 'Volt Switch']],
    ['Flaaffy', 28, 'Static', null, ['Thunder Wave', 'Volt Switch', 'Take Down']],
    ['Zebstrika', 30, 'Motor Drive', 'Sitrus Berry', ['Flame Charge', 'Pursuit', 'Volt Switch', 'Quick Attack']]]),
  T('Clay', b2, 'gen5/black-white/Clay.png', [
    ['Krokorok', 31, 'Intimidate', null, ['Crunch', 'Sand Tomb', 'Bulldoze', 'Torment']],
    ['Sandslash', 31, 'Sand Veil', null, ['Crush Claw', 'Bulldoze', 'Fury Cutter', 'Rollout']],
    ['Excadrill', 33, 'Sand Force', 'Sitrus Berry', ['Slash', 'Rock Slide', 'Metal Claw', 'Bulldoze']]]),
  T('Skyla', b2, 'gen5/black2-white2/Skyla.png'.replace('black2-white2', 'black-white'), [
    ['Swoobat', 37, 'Unaware', null, ['Heart Stamp', 'Attract', 'Acrobatics', 'Assurance']],
    ['Skarmory', 37, 'Sturdy', null, ['Air Cutter', 'Agility', 'Steel Wing', 'Fury Attack']],
    ['Swanna', 39, 'Big Pecks', 'Sitrus Berry', ['Feather Dance', 'Roost', 'Bubble Beam', 'Air Slash']]]),
  T('Drayden', b2, 'gen5/black-white/Drayden.png', [
    ['Druddigon', 46, 'Sheer Force', null, ['Revenge', 'Crunch', 'Slash', 'Dragon Tail']],
    ['Flygon', 46, 'Levitate', null, ['Rock Slide', 'Earth Power', 'Crunch', 'Dragon Tail']],
    ['Haxorus', 48, 'Mold Breaker', 'Sitrus Berry', ['Dragon Dance', 'Dragon Tail', 'Slash', 'Assurance']]]),
  T('Marlon', b2, 'gen5/black2-white2/Marlon.png', [
    ['Carracosta', 49, 'Sturdy', null, ['Smack Down', 'Shell Smash', 'Scald', 'Crunch']],
    ['Wailord', 49, 'Water Veil', null, ['Amnesia', 'Scald', 'Rollout', 'Bounce']],
    ['Jellicent', 51, 'Cursed Body', 'Sitrus Berry', ['Brine', 'Recover', 'Scald', 'Ominous Wind']]]),
  // Elite Four, first League battle (abilities not given by the source -> species' first ability)
  E('Shauntal', bw, [
    ['Cofagrigus', 48, null, null, ['Will-O-Wisp', 'Grass Knot', 'Psychic', 'Shadow Ball']],
    ['Jellicent', 48, null, null, ['Energy Ball', 'Brine', 'Surf', 'Shadow Ball']],
    ['Golurk', 48, null, null, ['Curse', 'Earthquake', 'Brick Break', 'Shadow Punch']],
    ['Chandelure', 50, null, null, ['Payback', 'Fire Blast', 'Psychic', 'Shadow Ball']]]),
  E('Grimsley', bw, [
    ['Scrafty', 48, null, null, ['Crunch', 'Brick Break', 'Poison Jab', 'Sand Attack']],
    ['Liepard', 48, null, null, ['Night Slash', 'Fake Out', 'Aerial Ace', 'Attract']],
    ['Krookodile', 48, null, null, ['Crunch', 'Dragon Claw', 'Earthquake', 'Foul Play']],
    ['Bisharp', 50, null, null, ['Night Slash', 'X-Scissor', 'Metal Claw', 'Aerial Ace']]]),
  E('Caitlin', bw, [
    ['Reuniclus', 48, null, null, ['Psychic', 'Energy Ball', 'Focus Blast', 'Thunder']],
    ['Musharna', 48, null, null, ['Psychic', 'Shadow Ball', 'Charge Beam', 'Reflect']],
    ['Sigilyph', 48, null, null, ['Psychic', 'Shadow Ball', 'Ice Beam', 'Air Slash']],
    ['Gothitelle', 50, null, null, ['Psychic', 'Shadow Ball', 'Thunderbolt', 'Calm Mind']]]),
  E('Marshal', bw, [
    ['Throh', 48, null, null, ['Storm Throw', 'Bulldoze', 'Stone Edge', 'Payback']],
    ['Sawk', 48, null, null, ['Karate Chop', 'Grass Knot', 'Stone Edge', 'Retaliate']],
    ['Conkeldurr', 48, null, null, ['Hammer Arm', 'Grass Knot', 'Stone Edge', 'Retaliate']],
    ['Mienshao', 50, null, null, ['Jump Kick', 'U-turn', 'Rock Slide', 'Retaliate']]]),
  E('Shauntal', b2, [
    ['Cofagrigus', 56, null, null, ['Will-O-Wisp', 'Grass Knot', 'Psychic', 'Shadow Ball']],
    ['Drifblim', 56, null, null, ['Psychic', 'Thunderbolt', 'Acrobatics', 'Shadow Ball']],
    ['Golurk', 56, null, null, ['Heavy Slam', 'Earthquake', 'Brick Break', 'Shadow Punch']],
    ['Chandelure', 58, null, null, ['Energy Ball', 'Fire Blast', 'Psychic', 'Shadow Ball']]]),
  E('Grimsley', b2, [
    ['Liepard', 56, null, null, ['Night Slash', 'Fake Out', 'Aerial Ace', 'Attract']],
    ['Scrafty', 56, null, null, ['Crunch', 'Brick Break', 'Poison Jab', 'Rock Tomb']],
    ['Krookodile', 56, null, null, ['Crunch', 'Dragon Claw', 'Earthquake', 'Rock Tomb']],
    ['Bisharp', 58, null, null, ['Night Slash', 'X-Scissor', 'Metal Claw', 'Aerial Ace']]]),
  E('Caitlin', b2, [
    ['Musharna', 56, null, null, ['Charge Beam', 'Dream Eater', 'Yawn', 'Reflect']],
    ['Reuniclus', 56, null, null, ['Psychic', 'Energy Ball', 'Focus Blast', 'Recover']],
    ['Sigilyph', 56, null, null, ['Psychic', 'Shadow Ball', 'Ice Beam', 'Air Slash']],
    ['Gothitelle', 58, null, null, ['Psychic', 'Shadow Ball', 'Thunderbolt', 'Calm Mind']]]),
  E('Marshal', b2, [
    ['Throh', 56, null, null, ['Storm Throw', 'Bulldoze', 'Rock Tomb', 'Payback']],
    ['Sawk', 56, null, null, ['Brick Break', 'Retaliate', 'Rock Slide', 'Payback']],
    ['Mienshao', 56, null, null, ['High Jump Kick', 'U-turn', 'Bounce', 'Retaliate']],
    ['Conkeldurr', 58, null, null, ['Hammer Arm', 'Bulk Up', 'Stone Edge', 'Retaliate']]]),
  // Champions
  C('Alder', bw, 'gen5/black-white/Alder.png', [
    ['Accelgor', 75, null, null, ['Focus Blast', 'Bug Buzz', 'Me First', 'Energy Ball']],
    ['Bouffalant', 75, null, null, ['Head Charge', 'Megahorn', 'Earthquake', 'Stone Edge']],
    ['Druddigon', 75, null, null, ['Outrage', 'Superpower', 'Night Slash', 'Payback']],
    ['Vanilluxe', 75, null, null, ['Blizzard', 'Flash Cannon', 'Light Screen', 'Acid Armor']],
    ['Escavalier', 75, null, null, ['X-Scissor', 'Iron Head', 'Aerial Ace', 'Giga Impact']],
    ['Volcarona', 77, null, null, ['Overheat', 'Quiver Dance', 'Bug Buzz', 'Hyper Beam']]], 'Postgame battle'),
  C('Iris', b2, 'gen5/black2-white2/Iris.png', [
    ['Hydreigon', 57, null, null, ['Flamethrower', 'Charge Beam', 'Dragon Pulse', 'Surf']],
    ['Druddigon', 57, null, null, ['Rock Slide', 'Flamethrower', 'Dragon Tail', 'Focus Blast']],
    ['Archeops', 57, null, null, ['Acrobatics', 'Rock Slide', 'Dragon Claw', 'Endeavor']],
    ['Aggron', 57, null, null, ['Earthquake', 'Double-Edge', 'Rock Slide', 'Autotomize']],
    ['Lapras', 57, null, null, ['Surf', 'Ice Beam', 'Thunderbolt', 'Sing']],
    ['Haxorus', 59, null, null, ['Earthquake', 'X-Scissor', 'Dual Chop', 'Dragon Dance']]]),
];
