export const TYPES = [
  "normal","fire","water","electric","grass","ice","fighting","poison",
  "ground","flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy"
] as const;
export type PokeType = typeof TYPES[number];

export const TYPE_META: Record<PokeType, { label: string; bg: string; text: string }> = {
  normal:   { label: "Normal",   bg: "#A8A77A", text: "#fff" },
  fire:     { label: "Fire",     bg: "#EE8130", text: "#fff" },
  water:    { label: "Water",    bg: "#6390F0", text: "#fff" },
  electric: { label: "Electric", bg: "#F7D02C", text: "#1a1a1a" },
  grass:    { label: "Grass",    bg: "#7AC74C", text: "#fff" },
  ice:      { label: "Ice",      bg: "#96D9D6", text: "#1a1a1a" },
  fighting: { label: "Fighting", bg: "#C22E28", text: "#fff" },
  poison:   { label: "Poison",   bg: "#A33EA1", text: "#fff" },
  ground:   { label: "Ground",   bg: "#E2BF65", text: "#1a1a1a" },
  flying:   { label: "Flying",   bg: "#A98FF3", text: "#fff" },
  psychic:  { label: "Psychic",  bg: "#F95587", text: "#fff" },
  bug:      { label: "Bug",      bg: "#A6B91A", text: "#fff" },
  rock:     { label: "Rock",     bg: "#B6A136", text: "#fff" },
  ghost:    { label: "Ghost",    bg: "#735797", text: "#fff" },
  dragon:   { label: "Dragon",   bg: "#6F35FC", text: "#fff" },
  dark:     { label: "Dark",     bg: "#705746", text: "#fff" },
  steel:    { label: "Steel",    bg: "#B7B7CE", text: "#1a1a1a" },
  fairy:    { label: "Fairy",    bg: "#D685AD", text: "#fff" },
};

export const GENERATIONS = [
  { gen: 1, region: "kanto",   label: "Generation I (Kanto)",   range: "001–151" },
  { gen: 2, region: "johto",   label: "Generation II (Johto)",  range: "152–251" },
  { gen: 3, region: "hoenn",   label: "Generation III (Hoenn)", range: "252–386" },
  { gen: 4, region: "sinnoh",  label: "Generation IV (Sinnoh)", range: "387–493" },
  { gen: 5, region: "unova",   label: "Generation V (Unova)",   range: "494–649" },
  { gen: 6, region: "kalos",   label: "Generation VI (Kalos)",  range: "650–721" },
  { gen: 7, region: "alola",   label: "Generation VII (Alola)", range: "722–809" },
  { gen: 8, region: "galar",   label: "Generation VIII (Galar)",range: "810–905" },
  { gen: 9, region: "paldea",  label: "Generation IX (Paldea)", range: "906–1025" },
] as const;
