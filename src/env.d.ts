/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POKEMON_ASSET_BASE_URL?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
