import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import pokemon from "../src/data/pokemon.json" with { type: "json" };

const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const GENERATIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const CHALLENGES = [
  "nuzlocke",
  "starter",
  "legendary",
  "mythical",
  "paradox",
  "shiny",
  "fully-evolved",
  "monotype",
  "baby",
  "gen-1-only",
];

const DEFAULT_SITE_URL = "https://random-pokemon-generator.com";
const SITE_URL = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
const LASTMOD = new Date().toISOString().slice(0, 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputFile = resolve(__dirname, "../public/sitemap.xml");

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createUrl(path, changefreq, priority) {
  const normalizedPath = path === "/" ? "" : path;
  const loc = `${SITE_URL}${normalizedPath}`;
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${LASTMOD}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

const urls = [
  createUrl("/", "daily", "1.0"),
  createUrl("/pokemon", "weekly", "0.9"),
  createUrl("/types", "weekly", "0.8"),
  createUrl("/generations", "weekly", "0.8"),
  createUrl("/challenges", "weekly", "0.8"),
  createUrl("/random-pokemon-generator", "daily", "0.9"),
  createUrl("/random-pokemon-team-generator", "daily", "0.9"),
  createUrl("/daily", "daily", "0.8"),
  ...TYPES.map((type) => createUrl(`/types/${type}`, "weekly", "0.8")),
  ...GENERATIONS.map((gen) => createUrl(`/generations/${gen}`, "weekly", "0.8")),
  ...CHALLENGES.map((slug) => createUrl(`/challenges/${slug}`, "weekly", "0.8")),
  ...pokemon.map((entry) => createUrl(`/pokemon/${entry.slug}`, "weekly", "0.7")),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
  "",
].join("\n");

await mkdir(resolve(__dirname, "../public"), { recursive: true });
await writeFile(outputFile, xml, "utf8");

console.log(`Generated sitemap with ${urls.length} URLs at ${outputFile}`);
