const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const SITE_NAME = "RandomPoké";
export const SITE_TITLE = "Random Pokemon Generator — Roll Teams, Nuzlockes & Shinies";
export const SITE_DESCRIPTION =
  "Generate a random Pokémon or a full random team instantly. Filter by type, generation, evolution, and rarity. Perfect for Nuzlockes, Monotype runs, and Shiny hunts.";
export const SITE_THEME_COLOR = "#ffcf3f";

export const SITE_URL = import.meta.env.VITE_SITE_URL ? trimTrailingSlash(import.meta.env.VITE_SITE_URL) : "";

export function getSiteAssetUrl(path: string) {
  return SITE_URL ? `${SITE_URL}${path}` : path;
}
