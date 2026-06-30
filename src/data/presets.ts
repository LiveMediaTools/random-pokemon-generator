// Challenge presets — each maps to a long-tail SEO route /challenges/$slug
import { Filters } from "@/lib/generator";

export interface Preset {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  filters: Partial<Filters>;
  steps: string[];
  faq: { q: string; a: string }[];
  related: string[]; // slugs
}

export const PRESETS: Preset[] = [
  {
    slug: "nuzlocke",
    title: "Random Pokemon for Nuzlocke",
    h1: "Random Pokemon for a Nuzlocke Run",
    description: "Generate a fair random Nuzlocke encounter or starter. Configurable by region, type, and rarity.",
    intro: "Nuzlocke runs live and die by their random encounters. Use this generator to roll a fair starter or an unexpected route encounter without bias.",
    filters: { count: 1, excludeLegendary: true, excludeMythical: true, excludeParadox: true, excludeUltraBeast: true, evoStage: "any" },
    steps: [
      "Pick the region you're playing (Gen 1–9).",
      "Decide whether legendaries are off-limits (default: yes).",
      "Hit Generate. Take what the dice give you.",
    ],
    faq: [
      { q: "What are the standard Nuzlocke rules?", a: "Catch only the first Pokémon on each route, nickname every catch, and release a Pokémon when it faints." },
      { q: "Should legendaries be allowed?", a: "Most Nuzlockers ban them by default. Toggle 'Include Legendary' if you want a chaos run." },
    ],
    related: ["starter", "monotype", "fully-evolved"],
  },
  {
    slug: "starter",
    title: "Random Starter Pokemon",
    h1: "Random Starter Pokemon Generator",
    description: "Roll a random starter Pokémon from any generation. Perfect for replays and challenge runs.",
    intro: "Tired of always picking your favorite? Let the generator pick a starter for you across all nine generations.",
    filters: { count: 1, isStarter: true },
    steps: ["Choose a generation (or leave it on All).", "Generate.", "Start your run with whatever the RNG hands you."],
    faq: [
      { q: "Does this include all 27 starters?", a: "Yes — all three starters from each of Gen 1 through Gen 9." },
      { q: "Can I roll a full team of starters?", a: "Increase the count to 3 or 6 to build a starters-only team." },
    ],
    related: ["nuzlocke", "monotype", "gen-1-only"],
  },
  {
    slug: "legendary",
    title: "Random Legendary Pokemon",
    h1: "Random Legendary Pokemon Generator",
    description: "Generate a random Legendary or Mythical Pokémon. Filter by generation or roll the whole pantheon.",
    intro: "Pull a Legendary at random — ideal for streamers, art prompts, or dream-team challenges.",
    filters: { count: 1, onlyLegendary: true },
    steps: ["Decide if Mythicals count (toggle below).", "Generate to pull one Legendary.", "Bump the count up to roll an all-Legendary team."],
    faq: [
      { q: "What's the difference between Legendary and Mythical?", a: "Mythicals are event-only Pokémon like Mew or Celebi. Legendaries are the in-game cover/story Pokémon." },
      { q: "Can I generate a 6-mon Legendary team?", a: "Yes — set count to 6 and hit Generate." },
    ],
    related: ["mythical", "paradox", "shiny"],
  },
  {
    slug: "mythical",
    title: "Random Mythical Pokemon",
    h1: "Random Mythical Pokemon Generator",
    description: "Roll a random Mythical Pokémon — Mew, Celebi, Jirachi, Arceus and friends.",
    intro: "Mythicals are the rarest of the rare. Generate one at random for fan-art, challenges, or just for fun.",
    filters: { count: 1, onlyMythical: true },
    steps: ["Hit Generate.", "Save or share the result."],
    faq: [
      { q: "Which Pokémon count as Mythical?", a: "Event-distribution Pokémon like Mew, Celebi, Jirachi, Deoxys, Manaphy, Darkrai, Shaymin, Arceus, Victini, Keldeo, Meloetta, Genesect, Diancie, Hoopa, Volcanion, Magearna, Marshadow, Zeraora, Meltan, Melmetal, Zarude." },
    ],
    related: ["legendary", "paradox", "shiny"],
  },
  {
    slug: "paradox",
    title: "Random Paradox Pokemon",
    h1: "Random Paradox Pokemon Generator",
    description: "Roll a random Paradox Pokémon from Scarlet and Violet — Ancient and Future forms.",
    intro: "From Great Tusk to Iron Valiant — generate a random Paradox Pokémon from the Area Zero discoveries.",
    filters: { count: 1, onlyParadox: true },
    steps: ["Choose how many to roll.", "Generate."],
    faq: [
      { q: "What's a Paradox Pokémon?", a: "Pokémon from Scarlet (Ancient) and Violet (Future) that resemble existing species in alternate eras." },
    ],
    related: ["legendary", "mythical", "fully-evolved"],
  },
  {
    slug: "shiny",
    title: "Random Shiny Pokemon",
    h1: "Random Shiny Pokemon Generator",
    description: "Pick a random Pokémon to hunt as your next shiny. Filterable by type, generation, and rarity.",
    intro: "Stuck on what to shiny-hunt next? Roll the dice and let the generator decide.",
    filters: { count: 1, shinyDisplay: true },
    steps: ["Set any constraints (type, generation, etc.).", "Generate.", "Start your hunt."],
    faq: [
      { q: "Does this affect odds in-game?", a: "No — it's just a fun way to pick your next target." },
    ],
    related: ["legendary", "starter", "nuzlocke"],
  },
  {
    slug: "fully-evolved",
    title: "Random Fully Evolved Pokemon",
    h1: "Random Fully Evolved Pokemon Generator",
    description: "Generate fully-evolved Pokémon only — perfect for battle-ready random teams.",
    intro: "Skip the babies and middle-stages. Only final-stage evolutions.",
    filters: { count: 6, fullyEvolvedOnly: true, excludeLegendary: true, excludeMythical: true },
    steps: ["Decide on team size (6 is default).", "Generate a battle-ready random team."],
    faq: [
      { q: "Are single-stage Pokémon included?", a: "Yes — Pokémon with no evolutions (like Tauros) are considered fully evolved." },
    ],
    related: ["monotype", "starter", "legendary"],
  },
  {
    slug: "monotype",
    title: "Random Monotype Team",
    h1: "Random Monotype Team Generator",
    description: "Generate a random 6-Pokémon team that shares one type. Choose your type or randomize it.",
    intro: "Monotype runs force creative team-building. Pick a type or let the generator pick one.",
    filters: { count: 6, fullyEvolvedOnly: true, excludeLegendary: true },
    steps: ["Pick a type from the dropdown (or leave random).", "Generate a 6-mon mono-type team."],
    faq: [
      { q: "Will every Pokémon share both types?", a: "At least one — dual-types that include the chosen type all qualify." },
    ],
    related: ["fully-evolved", "starter", "nuzlocke"],
  },
  {
    slug: "baby",
    title: "Random Baby Pokemon",
    h1: "Random Baby Pokemon Generator",
    description: "Generate a random Baby Pokémon — Pichu, Cleffa, Magby and the rest of the nursery crew.",
    intro: "Cute, fragile, and rarely seen on competitive teams. Roll a random Baby Pokémon.",
    filters: { count: 1, onlyBaby: true },
    steps: ["Generate.", "Smile."],
    faq: [{ q: "What counts as a Baby?", a: "Pre-evolutions that can only be obtained via breeding, like Pichu, Cleffa, Igglybuff, and Magby." }],
    related: ["starter", "fully-evolved", "shiny"],
  },
  {
    slug: "gen-1-only",
    title: "Random Gen 1 Pokemon",
    h1: "Random Gen 1 Pokemon Generator",
    description: "Roll a random Pokémon from the original 151. Pure Kanto nostalgia.",
    intro: "Stick to the OG roster — Bulbasaur to Mew.",
    filters: { count: 6, generation: 1 },
    steps: ["Hit Generate.", "Relive 1996."],
    faq: [{ q: "Includes Mew?", a: "Yes — Mew is Pokémon #151. Toggle 'Exclude Mythical' to leave it out." }],
    related: ["starter", "legendary", "fully-evolved"],
  },
];

export const PRESET_BY_SLUG = new Map(PRESETS.map((p) => [p.slug, p]));
