import seedrandom from "seedrandom";
import { ALL_POKEMON, Pokemon } from "@/data/pokemon";
import { PokeType, TYPES } from "@/data/types";
import { resolvePokemonSpriteUrl } from "./assets";

export interface Filters {
  count: number; // 1..6
  generation?: number | "any";
  type?: PokeType | "any";
  secondType?: PokeType | "any";
  excludeType?: PokeType | "none";
  evoStage?: 1 | 2 | 3 | "any";
  fullyEvolvedOnly?: boolean;
  isStarter?: boolean;
  onlyLegendary?: boolean;
  onlyMythical?: boolean;
  onlyParadox?: boolean;
  onlyUltraBeast?: boolean;
  onlyBaby?: boolean;
  excludeLegendary?: boolean;
  excludeMythical?: boolean;
  excludeParadox?: boolean;
  excludeUltraBeast?: boolean;
  minBst?: number;
  maxBst?: number;
  allowDuplicates?: boolean;
  shinyDisplay?: boolean; // affects sprite query only
}

export const DEFAULT_FILTERS: Filters = {
  count: 6,
  generation: "any",
  type: "any",
  evoStage: "any",
  allowDuplicates: false,
};

export function applyFilters(pool: Pokemon[], f: Filters): Pokemon[] {
  return pool.filter((p) => {
    if (f.generation && f.generation !== "any" && p.generation !== f.generation) return false;
    if (f.type && f.type !== "any" && !p.types.includes(f.type)) return false;
    if (f.secondType && f.secondType !== "any" && !p.types.includes(f.secondType)) return false;
    if (f.excludeType && f.excludeType !== "none" && p.types.includes(f.excludeType)) return false;
    if (f.evoStage && f.evoStage !== "any" && p.evoStage !== f.evoStage) return false;
    if (f.fullyEvolvedOnly && !p.isFullyEvolved) return false;
    if (f.isStarter && !p.isStarter) return false;
    if (f.onlyLegendary && !p.isLegendary) return false;
    if (f.onlyMythical && !p.isMythical) return false;
    if (f.onlyParadox && !p.isParadox) return false;
    if (f.onlyUltraBeast && !p.isUltraBeast) return false;
    if (f.onlyBaby && !p.isBaby) return false;
    if (f.excludeLegendary && p.isLegendary) return false;
    if (f.excludeMythical && p.isMythical) return false;
    if (f.excludeParadox && p.isParadox) return false;
    if (f.excludeUltraBeast && p.isUltraBeast) return false;
    if (f.minBst != null && p.bst < f.minBst) return false;
    if (f.maxBst != null && p.bst > f.maxBst) return false;
    return true;
  });
}

export function generate(filters: Filters, seed: string): Pokemon[] {
  const merged = { ...DEFAULT_FILTERS, ...filters };
  const pool = applyFilters(ALL_POKEMON, merged);
  if (pool.length === 0) return [];
  const rng = seedrandom(seed);
  const n = Math.max(1, Math.min(6, merged.count));
  const out: Pokemon[] = [];
  const used = new Set<number>();
  let safety = 0;
  while (out.length < n && safety < 5000) {
    safety++;
    const pick = pool[Math.floor(rng() * pool.length)];
    if (!merged.allowDuplicates && used.has(pick.id)) {
      if (used.size >= pool.length) break;
      continue;
    }
    used.add(pick.id);
    out.push(pick);
  }
  return out;
}

export function makeSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function dailySeed(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `daily-${y}-${m}-${d}`;
}

// URL-param helpers
export function filtersToSearch(f: Filters, seed: string): Record<string, string> {
  const out: Record<string, string> = { seed, n: String(f.count) };
  for (const k of [
    "generation","type","secondType","excludeType","evoStage",
  ] as const) {
    const v = f[k as keyof Filters];
    if (v != null && v !== "any" && v !== "none") out[k] = String(v);
  }
  for (const k of [
    "fullyEvolvedOnly","isStarter","onlyLegendary","onlyMythical","onlyParadox",
    "onlyUltraBeast","onlyBaby","excludeLegendary","excludeMythical",
    "excludeParadox","excludeUltraBeast","allowDuplicates","shinyDisplay",
  ] as const) {
    if (f[k as keyof Filters]) out[k] = "1";
  }
  if (f.minBst != null) out.minBst = String(f.minBst);
  if (f.maxBst != null) out.maxBst = String(f.maxBst);
  return out;
}

export function spriteUrl(p: Pokemon, shiny = false): string {
  return resolvePokemonSpriteUrl(p.id, p.sprite, shiny);
}

export { TYPES };
