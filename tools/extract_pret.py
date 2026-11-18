import re, json
import os
V = os.environ.get('VENDOR', 'vendor')
P = V + '/pret/'

def cname(s):  # SPECIES_MR_MIME -> MR_MIME
    return s.split('_', 1)[1] if s else None

def parse_c(path, party):
    txt = open(path).read()
    m = re.search(r'sParty_%s\[\] = \{(.*?)\n\};' % party, txt, re.S)
    mons = []
    for blk in re.findall(r'\{([^{}]*?(?:\{[^{}]*\}[^{}]*?)?)\}', m.group(1)):
        lvl = re.search(r'\.lvl = (\d+)', blk)
        if not lvl: continue
        sp = re.search(r'\.species = (\w+)', blk).group(1)
        it = re.search(r'\.heldItem = (\w+)', blk)
        mv = re.search(r'\.moves = \{([^}]*)\}', blk)
        moves = [cname(x.strip()) for x in mv.group(1).split(',') if x.strip() and x.strip() != 'MOVE_NONE'] if mv else []
        mons.append(dict(species=cname(sp), level=int(lvl.group(1)), moves=moves,
                         item=cname(it.group(1)) if it and it.group(1) != 'ITEM_NONE' else None))
    return mons

out = []
def add(id, name, region, game, sprite, mons, gen, role='Gym Leader', note=None):
    out.append(dict(id=id, name=name, region=region, game=game, sprite=sprite, gen=gen, team=mons, role=role, note=note))
E4 = 'Elite Four'
def hg_mons(t):
    return [dict(species=cname(p['species']), level=p['level'], moves=[cname(m) for m in p.get('moves', []) if m != 'MOVE_NONE'],
                 item=cname(p['item']) if p.get('item') not in (None, 'ITEM_NONE') else None) for p in t['party']]
def pt_mons(f):
    d = json.load(open(P + 'pokeplatinum/res/trainers/data/%s.json' % f))
    return [dict(species=cname(p['species']), level=p['level'], moves=[cname(m) for m in (p.get('moves') or []) if m and m != 'MOVE_NONE'],
                 item=cname(p['item']) if p.get('item') else None) for p in d['party']]

fr = P + 'pokefirered-parties.h'
for key, nm in [('Brock','Brock'),('Misty','Misty'),('LtSurge','Lt. Surge'),('Erika','Erika'),('Koga','Koga'),('Sabrina','Sabrina'),('Blaine','Blaine'),('Giovanni','Giovanni')]:
    add('frlg-' + key.lower(), nm, 'Kanto', 'FireRed/LeafGreen', 'gen3/firered-leafgreen/%s.png' % nm.replace(' ', '_'), parse_c(fr, 'Leader' + key), 3)

em = P + 'pokeemerald-parties.h'
for key, nm, spr in [('Roxanne','Roxanne','gen3/ruby-sapphire/Roxanne.png'),('Brawly','Brawly','gen3/ruby-sapphire/Brawly.png'),
                     ('Wattson','Wattson','gen3/ruby-sapphire/Wattson.png'),('Flannery','Flannery','gen3/ruby-sapphire/Flannery.png'),
                     ('Norman','Norman','gen3/ruby-sapphire/Norman.png'),('Winona','Winona','gen3/ruby-sapphire/Winona.png'),
                     ('TateAndLiza','Tate & Liza','gen3/ruby-sapphire/Tate_and_Liza.png'),('Juan','Juan','gen3/emerald/Juan.png')]:
    add('e-' + key.lower(), nm, 'Hoenn', 'Emerald', spr, parse_c(em, key + '1'), 3)

hg = json.load(open(P + 'pokeheartgold/files/poketool/trainer/trainers.json'))
hg = list(hg.values())[0]
seen = set()
order = ['FALKNER','BUGSY','WHITNEY','MORTY','CHUCK','JASMINE','PRYCE','CLAIR','BROCK','MISTY','LT_SURGE','ERIKA','JANINE','SABRINA','BLAINE','BLUE']
for t in hg:
    c = t['class'].replace('TRAINERCLASS_LEADER_', '')
    if not t['class'].startswith('TRAINERCLASS_LEADER_') or c in seen: continue
    seen.add(c)
    nm = t['name'].replace('{TRNAME}', '')
    region = 'Johto' if order.index(c) < 8 else 'Kanto'
    mons = [dict(species=cname(p['species']), level=p['level'], moves=[cname(m) for m in p.get('moves', []) if m != 'MOVE_NONE'],
                 item=cname(p['item']) if p.get('item') not in (None, 'ITEM_NONE') else None) for p in t['party']]
    add('hgss-' + c.lower(), nm, region, 'HeartGold/SoulSilver', 'gen4/heartgold-soulsilver/%s.png' % nm.replace(' ', '_'), mons, 4)

for f, nm, spr in [('roark','Roark','Roark'),('gardenia','Gardenia','Gardenia'),('maylene','Maylene','Maylene'),('wake','Crasher Wake','Crasher_Wake'),
                   ('fantina','Fantina','Fantina'),('byron','Byron','Byron'),('candice','Candice','Candice'),('volkner','Volkner','Volkner')]:
    d = json.load(open(P + 'pokeplatinum/res/trainers/data/leader_%s.json' % f))
    mons = [dict(species=cname(p['species']), level=p['level'], moves=[cname(m) for m in (p.get('moves') or []) if m and m != 'MOVE_NONE'],
                 item=cname(p['item']) if p.get('item') else None) for p in d['party']]
    add('pt-' + f, nm, 'Sinnoh', 'Platinum', 'gen4/diamond-pearl/%s.png' % spr, mons, 4)

# ---- Elite Four (first battles, not rematches) ----
for nm in ['Lorelei', 'Bruno', 'Agatha', 'Lance']:
    add('frlg-e4-' + nm.lower(), nm, 'Kanto', 'FireRed/LeafGreen', 'gen3/firered-leafgreen/%s.png' % nm, parse_c(fr, 'EliteFour' + nm), 3, E4)
for nm in ['Sidney', 'Phoebe', 'Glacia', 'Drake']:
    add('e-e4-' + nm.lower(), nm, 'Hoenn', 'Emerald', 'gen3/ruby-sapphire/%s.png' % nm, parse_c(em, nm), 3, E4)
seen = set()
for t in hg:  # first entry per class is the initial League battle
    c = t['class']
    if not c.startswith('TRAINERCLASS_ELITE_FOUR_') or c in seen: continue
    seen.add(c)
    nm = c.replace('TRAINERCLASS_ELITE_FOUR_', '').title()
    add('hgss-e4-' + nm.lower(), nm, 'Johto', 'HeartGold/SoulSilver', 'gen4/heartgold-soulsilver/%s.png' % nm, hg_mons(t), 4, E4)
for nm in ['Aaron', 'Bertha', 'Flint', 'Lucian']:
    add('pt-e4-' + nm.lower(), nm, 'Sinnoh', 'Platinum', 'gen4/diamond-pearl/%s.png' % nm, pt_mons('elite_four_' + nm.lower()), 4, E4)

# ---- Champions (first battle) ----
CH = 'Champion'
for starter in ['Bulbasaur', 'Charmander', 'Squirtle']:  # rival's team depends on the player's starter
    add('frlg-ch-' + starter.lower(), 'Blue', 'Kanto', 'FireRed/LeafGreen', 'gen3/firered-leafgreen/Blue-Champion.png',
        parse_c(fr, 'ChampionFirst' + starter), 3, CH, 'If you picked ' + starter)
add('e-ch-wallace', 'Wallace', 'Hoenn', 'Emerald', 'gen3/emerald/Wallace.png', parse_c(em, 'Wallace'), 3, CH)
lance = next(t for t in hg if t['class'] == 'TRAINERCLASS_CHAMPION')
add('hgss-ch-lance', 'Lance', 'Johto', 'HeartGold/SoulSilver', 'gen4/heartgold-soulsilver/Lance.png', hg_mons(lance), 4, CH)
add('pt-ch-cynthia', 'Cynthia', 'Sinnoh', 'Platinum', 'gen4/diamond-pearl/Cynthia.png', pt_mons('champion_cynthia'), 4, CH)

json.dump(out, open(V + '/leaders_extracted.json', 'w'), indent=1)
for l in out:
    print(l['id'], [(m['species'], m['level'], m['item'], len(m['moves'])) for m in l['team']])
