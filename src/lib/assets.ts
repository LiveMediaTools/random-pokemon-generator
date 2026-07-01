const DEFAULT_ASSET_BASE_URL = "https://img.random-pokemon-generator.com";
const DEFAULT_ARTWORK_BASE = `${DEFAULT_ASSET_BASE_URL}/pokemon/artwork`;

function trimTrailingSlash(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\/+$/, "");
}

export function configuredAssetBaseUrl(): string | undefined {
  return trimTrailingSlash(import.meta.env.VITE_POKEMON_ASSET_BASE_URL) ?? DEFAULT_ASSET_BASE_URL;
}

export function normalizePokemonAssetUrl(input: string, base?: string): string {
  const assetBaseUrl = configuredAssetBaseUrl();
  const resolvedUrl = new URL(input, base ?? assetBaseUrl ?? DEFAULT_ASSET_BASE_URL);

  if (assetBaseUrl && resolvedUrl.pathname.startsWith("/pokemon/")) {
    return `${assetBaseUrl}${resolvedUrl.pathname}${resolvedUrl.search}`;
  }

  return resolvedUrl.toString();
}

export function pokemonArtworkUrl(id: number, shiny = false): string {
  const assetBaseUrl = configuredAssetBaseUrl();
  if (assetBaseUrl) {
    return shiny
      ? `${assetBaseUrl}/pokemon/artwork/shiny/${id}.png`
      : `${assetBaseUrl}/pokemon/artwork/${id}.png`;
  }

  return shiny ? `${DEFAULT_ARTWORK_BASE}/shiny/${id}.png` : `${DEFAULT_ARTWORK_BASE}/${id}.png`;
}

export function resolvePokemonSpriteUrl(id: number, sprite: string, shiny = false): string {
  if (shiny) return pokemonArtworkUrl(id, true);
  return configuredAssetBaseUrl() ? pokemonArtworkUrl(id) : sprite;
}

export function pokemonDataUrl(): string | undefined {
  const assetBaseUrl = configuredAssetBaseUrl();
  return assetBaseUrl ? `${assetBaseUrl}/pokemon/data/pokemon.json` : undefined;
}
