import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "src/data/pokemon.json");
const CACHE_ROOT = path.join(ROOT, ".asset-cache", "pokemon");
const ARTWORK_DIR = path.join(CACHE_ROOT, "artwork");
const SHINY_DIR = path.join(ARTWORK_DIR, "shiny");
const DATA_DIR = path.join(CACHE_ROOT, "data");
const DEFAULT_LIMIT = 1025;

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((arg) => arg.startsWith("--")));

const limit = numberArg("--limit", DEFAULT_LIMIT);
const downloadConcurrency = numberArg("--download-concurrency", 4);
const uploadConcurrency = numberArg("--upload-concurrency", 4);
const downloadTimeoutMs = numberArg("--download-timeout-ms", 20000);
const uploadRetries = numberArg("--upload-retries", 3);
const workerCount = numberArg("--worker-count", 1);
const workerIndex = numberArg("--worker-index", 0);
const dryRun = flags.has("--dry-run");
const uploadOnly = flags.has("--upload-only");
const downloadOnly = flags.has("--download-only");
const skipShiny = flags.has("--skip-shiny");
const forceUpload = flags.has("--force-upload");

const publicBaseUrl = trimTrailingSlash(process.env.R2_PUBLIC_BASE_URL);
const bucket = process.env.R2_BUCKET;

if (uploadOnly && downloadOnly) {
  throw new Error("Cannot use --upload-only and --download-only together.");
}

if (workerCount < 1) {
  throw new Error("--worker-count must be at least 1.");
}

if (workerIndex < 0 || workerIndex >= workerCount) {
  throw new Error("--worker-index must be between 0 and worker-count - 1.");
}

const pokemon = JSON.parse(await readFile(DATA_FILE, "utf8"));
const selectedPokemon = pokemon.slice(0, limit);
const now = new Date().toISOString();

await mkdir(ARTWORK_DIR, { recursive: true });
await mkdir(SHINY_DIR, { recursive: true });
await mkdir(DATA_DIR, { recursive: true });

const uploadStateFile = getUploadStateFile(workerCount, workerIndex);
const uploadState = await loadUploadState();
const bucketState = bucket ? (uploadState.buckets[bucket] ??= {}) : {};

const publishedPokemon = pokemon.map((entry) => ({
  ...entry,
  sprite: publicBaseUrl
    ? `${publicBaseUrl}/pokemon/artwork/${entry.id}.png`
    : entry.sprite,
}));

const manifest = {
  generatedAt: now,
  pokemonCount: pokemon.length,
  syncedArtworkCount: selectedPokemon.length,
  syncedShinyCount: skipShiny ? 0 : selectedPokemon.length,
  publicBaseUrl: publicBaseUrl ?? null,
  paths: {
    pokemonData: "pokemon/data/pokemon.json",
    manifest: "pokemon/data/manifest.json",
    artwork: "pokemon/artwork/{id}.png",
    shinyArtwork: "pokemon/artwork/shiny/{id}.png",
  },
};

const publishedDataPath = path.join(DATA_DIR, "pokemon.json");
const manifestPath = path.join(DATA_DIR, "manifest.json");
await writeFile(publishedDataPath, JSON.stringify(publishedPokemon));
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

const assets = selectedPokemon.flatMap((entry) => {
  const out = [
    {
      key: `pokemon/artwork/${entry.id}.png`,
      sourceUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`,
      filePath: path.join(ARTWORK_DIR, `${entry.id}.png`),
      contentType: "image/png",
    },
  ];

  if (!skipShiny) {
    out.push({
      key: `pokemon/artwork/shiny/${entry.id}.png`,
      sourceUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${entry.id}.png`,
      filePath: path.join(SHINY_DIR, `${entry.id}.png`),
      contentType: "image/png",
    });
  }

  return out;
});

const uploads = [
  ...assets,
  {
    key: "pokemon/data/pokemon.json",
    filePath: publishedDataPath,
    contentType: "application/json; charset=utf-8",
  },
  {
    key: "pokemon/data/manifest.json",
    filePath: manifestPath,
    contentType: "application/json; charset=utf-8",
  },
];

const workerAssets = shardItems(assets, workerCount, workerIndex);
const workerUploads = shardItems(uploads, workerCount, workerIndex);

const failedDownloads = [];
const failedUploads = [];
const skippedUploads = [];

if (!uploadOnly) {
  console.log(
    `[worker ${workerIndex + 1}/${workerCount}] Preparing ${workerAssets.length} image assets in ${CACHE_ROOT}`,
  );
  await runWithConcurrency(
    workerAssets,
    downloadConcurrency,
    async (asset, index) => {
      if (await fileExists(asset.filePath)) {
        console.log(`[cache] ${index + 1}/${workerAssets.length} ${asset.key}`);
        return;
      }

      if (dryRun) {
        console.log(
          `[dry-run:download] ${asset.sourceUrl} -> ${asset.filePath}`,
        );
        return;
      }

      try {
        const buffer = await fetchBuffer(asset.sourceUrl, 5, downloadTimeoutMs);
        await mkdir(path.dirname(asset.filePath), { recursive: true });
        await writeFile(asset.filePath, buffer);
        console.log(
          `[downloaded] ${index + 1}/${workerAssets.length} ${asset.key}`,
        );
      } catch (error) {
        failedDownloads.push(asset.key);
        console.error(
          `[download-failed] ${index + 1}/${workerAssets.length} ${asset.key}: ${formatError(error)}`,
        );
      }
    },
  );
}

if (!downloadOnly) {
  assertUploadEnv();

  if (failedDownloads.length > 0) {
    console.warn(
      `Skipping upload for ${failedDownloads.length} assets that failed to download in this run.`,
    );
  }

  const uploadTargets = workerUploads.filter(
    (asset) => !failedDownloads.includes(asset.key),
  );

  console.log(
    `[worker ${workerIndex + 1}/${workerCount}] Uploading ${uploadTargets.length} files to R2 bucket "${bucket}"`,
  );
  await runWithConcurrency(
    uploadTargets,
    uploadConcurrency,
    async (asset, index) => {
      const fingerprint = await fileFingerprint(asset.filePath);
      if (!forceUpload && bucketState[asset.key]?.fingerprint === fingerprint) {
        skippedUploads.push(asset.key);
        console.log(
          `[upload-skip] ${index + 1}/${uploadTargets.length} ${asset.key}`,
        );
        return;
      }

      if (dryRun) {
        console.log(
          `[dry-run:upload] wrangler r2 object put ${bucket}/${asset.key}`,
        );
        return;
      }

      try {
        await retry(
          () => uploadWithWrangler(asset),
          uploadRetries,
          `upload ${asset.key}`,
        );
        bucketState[asset.key] = {
          fingerprint,
          uploadedAt: new Date().toISOString(),
        };
        await saveUploadState(uploadState, uploadStateFile);
        console.log(
          `[uploaded] ${index + 1}/${uploadTargets.length} ${asset.key}`,
        );
      } catch (error) {
        failedUploads.push(asset.key);
        console.error(
          `[upload-failed] ${index + 1}/${uploadTargets.length} ${asset.key}: ${formatError(error)}`,
        );
      }
    },
  );
}

console.log("");
console.log("Sync complete.");
console.log(`- Cache directory: ${CACHE_ROOT}`);
console.log(`- Published data: ${publishedDataPath}`);
console.log(`- Worker shard: ${workerIndex + 1}/${workerCount}`);
console.log(`- Upload state file: ${uploadStateFile}`);
if (publicBaseUrl) {
  console.log(`- Public asset base: ${publicBaseUrl}`);
}
if (dryRun) {
  console.log("- Dry run only: no files were downloaded or uploaded.");
}
if (failedDownloads.length > 0) {
  console.log(
    `- Failed downloads (${failedDownloads.length}): ${failedDownloads.join(", ")}`,
  );
}
if (failedUploads.length > 0) {
  console.log(
    `- Failed uploads (${failedUploads.length}): ${failedUploads.join(", ")}`,
  );
}
if (skippedUploads.length > 0) {
  console.log(
    `- Skipped uploads (${skippedUploads.length}): ${skippedUploads.join(", ")}`,
  );
}

function numberArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  if (!raw) return fallback;
  const value = Number(raw.split("=")[1]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function trimTrailingSlash(value) {
  return value?.replace(/\/+$/, "");
}

async function fileExists(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

async function fileFingerprint(filePath) {
  const body = await readFile(filePath);
  return createHash("sha256").update(body).digest("hex");
}

async function fetchBuffer(url, retries = 3, timeoutMs = 20000) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

async function runWithConcurrency(items, concurrency, worker) {
  let index = 0;

  async function next() {
    const currentIndex = index;
    index += 1;
    if (currentIndex >= items.length) return;
    await worker(items[currentIndex], currentIndex);
    await next();
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => next(),
  );
  await Promise.all(workers);
}

function assertUploadEnv() {
  const missing = [["R2_BUCKET", bucket]]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(
      `Missing required R2 environment variables: ${missing.join(", ")}`,
    );
  }
}

async function uploadWithWrangler(asset) {
  const args = [
    "wrangler",
    "r2",
    "object",
    "put",
    `${bucket}/${asset.key}`,
    "--file",
    asset.filePath,
    "--content-type",
    asset.contentType,
    "--cache-control",
    asset.key.endsWith(".png")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600, s-maxage=3600",
    "--remote",
    "--force",
  ];

  try {
    await execFileAsync("npx", args, {
      cwd: ROOT,
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const output = [error.stdout, error.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();
    const hint =
      output ||
      "Upload failed. Make sure you have run `npx wrangler login` and that the bucket exists.";
    throw new Error(`Failed to upload ${asset.key}: ${hint}`);
  }
}

function formatError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function retry(task, retries, label) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        console.warn(
          `[retry] ${label} (${attempt}/${retries}) failed: ${formatError(error)}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

async function loadUploadState() {
  try {
    const raw = await readFile(uploadStateFile, "utf8");
    const parsed = JSON.parse(raw);
    return {
      version: 1,
      buckets: parsed?.buckets ?? {},
    };
  } catch {
    return {
      version: 1,
      buckets: {},
    };
  }
}

async function saveUploadState(state, filePath) {
  await writeFile(filePath, JSON.stringify(state, null, 2));
}

function shardItems(items, count, index) {
  if (count === 1) return items;
  return items.filter((item) => shardIndexForKey(item.key, count) === index);
}

function shardIndexForKey(key, count) {
  const hash = createHash("sha1").update(key).digest();
  return hash.readUInt32BE(0) % count;
}

function getUploadStateFile(count, index) {
  if (count === 1) return path.join(CACHE_ROOT, "upload-state.json");
  return path.join(CACHE_ROOT, `upload-state.worker-${index + 1}-of-${count}.json`);
}
