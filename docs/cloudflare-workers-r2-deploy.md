# Cloudflare Workers + R2 Deployment

This project keeps server-side rendering on Cloudflare Workers for SEO, while Pokemon data and artwork are mirrored into Cloudflare R2 so the app no longer depends on third-party image hosts at runtime.

## Architecture

- SSR app: Cloudflare Workers via `@tanstack/react-start/server-entry`
- Structured data at runtime: local `src/data/pokemon.json` bundled into the app for stable SSR and SEO
- Mirrored assets in R2:
  - `pokemon/data/pokemon.json`
  - `pokemon/data/manifest.json`
  - `pokemon/artwork/{id}.png`
  - `pokemon/artwork/shiny/{id}.png`
- Client/server asset URL switch: `VITE_POKEMON_ASSET_BASE_URL`

## Why This Setup

- Keeps all SEO-critical pages server-rendered.
- Avoids runtime dependency on `raw.githubusercontent.com` or `PokeAPI`.
- Lets the Worker render HTML immediately from bundled data without an extra fetch.
- Moves heavy image traffic onto Cloudflare's object storage and CDN path.

## Required Environment Variables

### Build-time

Set this before `vite build` or `wrangler deploy`:

```bash
export VITE_POKEMON_ASSET_BASE_URL="https://img.random-pokemon-generator.com"
```

The app will then render image URLs like:

```txt
https://img.random-pokemon-generator.com/pokemon/artwork/25.png
https://img.random-pokemon-generator.com/pokemon/artwork/shiny/25.png
```

If this variable is not set, the app falls back to the default R2 asset domain `https://img.random-pokemon-generator.com`.

### R2 Upload Script

Login once first:

```bash
npx wrangler login
```

```bash
export R2_BUCKET="random-pokemon-assets"
export R2_PUBLIC_BASE_URL="https://img.random-pokemon-generator.com"
```

The upload script now uses your Wrangler login session and `wrangler r2 object put --remote`, so no separate R2 S3 access keys are required for one-time asset sync.

## Sync Assets To R2

### Full sync

```bash
node scripts/sync-pokemon-assets-to-r2.mjs
```

The script is resumable:

- downloaded files are reused from `.asset-cache`
- successfully uploaded objects are recorded in `.asset-cache/pokemon/upload-state.json`
- rerunning the same command skips already uploaded objects with the same local fingerprint
- uploads retry automatically by default
- you can shard uploads across multiple workers with `--worker-count` and `--worker-index`

### Test with the first 10 Pokemon only

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --limit=10
```

### Dry run

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --dry-run --limit=10
```

### Download only

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --download-only
```

### Upload only from local cache

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --upload-only
```

### Force re-upload even if the object was uploaded before

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --force-upload
```

### Run multiple workers in parallel

Open multiple terminals and give each one a different `--worker-index`.

Terminal 1:

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --worker-count=4 --worker-index=0
```

Terminal 2:

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --worker-count=4 --worker-index=1
```

Terminal 3:

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --worker-count=4 --worker-index=2
```

Terminal 4:

```bash
node scripts/sync-pokemon-assets-to-r2.mjs --worker-count=4 --worker-index=3
```

Notes:

- each worker handles a stable shard of object keys
- each worker writes its own upload state file, for example `upload-state.worker-1-of-4.json`
- `--upload-concurrency` still applies inside each worker process

## Worker Deploy

Install dependencies and deploy:

```bash
npm install --legacy-peer-deps
export VITE_POKEMON_ASSET_BASE_URL="https://img.random-pokemon-generator.com"
npx wrangler deploy
```

The repo already includes a starter `wrangler.jsonc`. Update these values before production deploy:

- `name`
- `r2_buckets[0].bucket_name`
- optional custom domain and routes in Cloudflare dashboard

## Recommended R2 Public Domain

Use a dedicated asset domain such as:

```txt
img.random-pokemon-generator.com
```

Bind that domain to the R2 bucket so image URLs are short, stable, and cache-friendly.

## Cache Strategy

- Artwork PNGs: `public, max-age=31536000, immutable`
- JSON files: `public, max-age=3600, s-maxage=3600`

This is already applied by the upload script.

## Notes

- `History`, `Favorites`, `Teams`, and `Presets` remain in browser `localStorage`.
- The Worker does not need to fetch `pokemon.json` from R2 to render pages, which helps SEO and TTFB.
- The upload script rewrites the mirrored `pokemon/data/pokemon.json` sprite fields to your `R2_PUBLIC_BASE_URL`, which should be `https://img.random-pokemon-generator.com` for this project.
