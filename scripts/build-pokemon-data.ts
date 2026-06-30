// Fetch all 1025 pokemon from PokeAPI and emit a compact JSON.
// Run: bun run scripts/build-pokemon-data.ts
import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const TOTAL = 1025;
const CONCURRENCY = 40;
const OUT = "src/data/pokemon.json";

const GEN_RANGES: [number, number, number, string][] = [
  [1, 1, 151, "kanto"],
  [2, 152, 251, "johto"],
  [3, 252, 386, "hoenn"],
  [4, 387, 493, "sinnoh"],
  [5, 494, 649, "unova"],
  [6, 650, 721, "kalos"],
  [7, 722, 809, "alola"],
  [8, 810, 905, "galar"],
  [9, 906, 1025, "paldea"],
];

const STARTERS = new Set([
  1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653,
  656, 722, 725, 728, 810, 813, 816, 906, 909, 912,
]);
const PSEUDO_LEGENDARY = new Set([
  149, 248, 373, 376, 445, 635, 706, 784, 887, 998,
]);
const BABY = new Set([172, 173, 174, 175, 236, 238, 239, 240, 298, 360, 406, 433, 438, 439, 440, 446, 447, 458]);
const FOSSIL = new Set([138, 139, 140, 141, 142, 345, 346, 347, 348, 408, 409, 410, 411, 564, 565, 566, 567, 696, 697, 698, 699, 880, 881, 882, 883]);
const ULTRA_BEAST = new Set([793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806]);
const PARADOX = new Set([984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1007, 1008, 1009, 1010, 1020, 1021, 1022, 1023]);

function genFor(id: number) {
  for (const [g, lo, hi, region] of GEN_RANGES) {
    if (id >= lo && id <= hi) return { generation: g, region };
  }
  return { generation: 0, region: "unknown" };
}

interface PokeOut {
  id: number;
  slug: string;
  name: string;
  types: string[];
  generation: number;
  region: string;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
  bst: number;
  height: number;
  weight: number;
  evoStage: number; // 1,2,3
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

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function fetchJson(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status}`);
      return await r.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

// Cache evolution chains by id
const chainCache = new Map<number, any>();

async function getEvoInfo(speciesUrl: string, name: string, species: any) {
  const chainUrl = species.evolution_chain.url;
  const chainId = parseInt(chainUrl.match(/\/(\d+)\/$/)![1]);
  let chain = chainCache.get(chainId);
  if (!chain) {
    chain = await fetchJson(chainUrl);
    chainCache.set(chainId, chain);
  }
  // walk chain to find this species
  function walk(node: any, stage: number): { stage: number; isFinal: boolean } | null {
    if (node.species.name === name) {
      return { stage, isFinal: node.evolves_to.length === 0 };
    }
    for (const c of node.evolves_to) {
      const r = walk(c, stage + 1);
      if (r) return r;
    }
    return null;
  }
  const r = walk(chain.chain, 1);
  return r ?? { stage: 1, isFinal: true };
}

async function fetchOne(id: number): Promise<PokeOut> {
  const [p, s] = await Promise.all([
    fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);
  const stats: Record<string, number> = {};
  for (const st of p.stats) stats[st.stat.name] = st.base_stat;
  const { generation, region } = genFor(id);
  const evo = await getEvoInfo(s.url ?? "", s.name, s);
  const sprite =
    p.sprites?.other?.["official-artwork"]?.front_default ||
    p.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  return {
    id,
    slug: s.name,
    name: cap(s.name.replace(/-/g, " ")),
    types: p.types.map((t: any) => t.type.name),
    generation,
    region,
    hp: stats["hp"] ?? 0,
    atk: stats["attack"] ?? 0,
    def: stats["defense"] ?? 0,
    spa: stats["special-attack"] ?? 0,
    spd: stats["special-defense"] ?? 0,
    spe: stats["speed"] ?? 0,
    bst:
      (stats["hp"] ?? 0) +
      (stats["attack"] ?? 0) +
      (stats["defense"] ?? 0) +
      (stats["special-attack"] ?? 0) +
      (stats["special-defense"] ?? 0) +
      (stats["speed"] ?? 0),
    height: p.height,
    weight: p.weight,
    evoStage: evo.stage,
    isLegendary: !!s.is_legendary,
    isMythical: !!s.is_mythical,
    isBaby: !!s.is_baby || BABY.has(id),
    isParadox: PARADOX.has(id),
    isUltraBeast: ULTRA_BEAST.has(id),
    isStarter: STARTERS.has(id),
    isPseudoLegendary: PSEUDO_LEGENDARY.has(id),
    isFossil: FOSSIL.has(id),
    isFullyEvolved: evo.isFinal,
    eggGroups: (s.egg_groups ?? []).map((g: any) => g.name),
    color: s.color?.name ?? "unknown",
    abilities: p.abilities.map((a: any) => a.ability.name),
    sprite,
  };
}

async function main() {
  const out: PokeOut[] = [];
  let done = 0;
  const ids = Array.from({ length: TOTAL }, (_, i) => i + 1);
  // Process in chunks
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((id) =>
        fetchOne(id).catch((e) => {
          console.error(`Failed ${id}:`, e.message);
          return null;
        })
      )
    );
    for (const r of results) if (r) out.push(r);
    done += batch.length;
    process.stdout.write(`\r${done}/${TOTAL}`);
  }
  out.sort((a, b) => a.id - b.id);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out));
  console.log(`\nWrote ${out.length} pokemon to ${OUT} (${(JSON.stringify(out).length / 1024).toFixed(1)} KB)`);
}

main();
