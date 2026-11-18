// Stand-ins for the parts of Pokémon Showdown's client that the vendored animation tables import.
import FXDATA from './fx.json' with { type: 'json' };

// Our own bone drawing (upstream bone.png has no stated license, so it isn't vendored).
const BONE = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<g fill="#f3ead7" stroke="#8a7a5c" stroke-width="3"><circle cx="14" cy="18" r="8"/><circle cx="18" cy="12" r="8"/>
<circle cx="50" cy="46" r="8"/><circle cx="46" cy="52" r="8"/><path d="M17 15 L49 49" stroke-width="10" stroke="#8a7a5c"/></g>
<path d="M17 15 L49 49" stroke="#f3ead7" stroke-width="6"/></svg>`);

export function FX(name: string): string {
  if (name === 'bone.png') return BONE;
  return (FXDATA as Record<string, string>)[name] || '';
}
export const Config = { routes: { client: 'play.pokemonshowdown.com' } };
