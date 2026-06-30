import rawPokemon from "./pokemon.json";
import { PokeType } from "./types";

export interface Pokemon {
  id: number;
  slug: string;
  name: string;
  types: PokeType[];
  generation: number;
  region: string;
  hp: number; atk: number; def: number; spa: number; spd: number; spe: number; bst: number;
  height: number; weight: number;
  evoStage: number;
  isLegendary: boolean;
  isMythical: boolean;
  isBaby: boolean;
  isParadox: boolean;
  isUltraBeast: boolean;
  isStarter: boolean;
  isPseudoLegendary: boolean;
  isFossil: boolean;
  isFullyEvolved: boolean;
  eggGroups: string[];
  color: string;
  abilities: string[];
  sprite: string;
}

export const ALL_POKEMON: Pokemon[] = rawPokemon as Pokemon[];

export const POKEMON_BY_ID = new Map<number, Pokemon>(ALL_POKEMON.map((p) => [p.id, p]));
export const POKEMON_BY_SLUG = new Map<string, Pokemon>(ALL_POKEMON.map((p) => [p.slug, p]));

export function getPokemon(idOrSlug: number | string): Pokemon | undefined {
  return typeof idOrSlug === "number"
    ? POKEMON_BY_ID.get(idOrSlug)
    : POKEMON_BY_SLUG.get(idOrSlug);
}
