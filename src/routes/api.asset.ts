import { createFileRoute } from "@tanstack/react-router";
import { configuredAssetBaseUrl, normalizePokemonAssetUrl } from "@/lib/assets";

function isAllowedAssetUrl(url: URL) {
  const assetBaseUrl = configuredAssetBaseUrl();
  if (!assetBaseUrl) return false;

  const allowedOrigin = new URL(assetBaseUrl).origin;
  return url.origin === allowedOrigin && url.pathname.startsWith("/pokemon/");
}

export const Route = createFileRoute("/api/asset")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const source = requestUrl.searchParams.get("url");

        if (!source) {
          return new Response("Missing asset url", { status: 400 });
        }

        let sourceUrl: URL;
        try {
          sourceUrl = new URL(normalizePokemonAssetUrl(source));
        } catch {
          return new Response("Invalid asset url", { status: 400 });
        }

        if (!isAllowedAssetUrl(sourceUrl)) {
          return new Response("Asset url not allowed", { status: 403 });
        }

        const upstream = await fetch(sourceUrl.toString(), {
          headers: { Accept: "image/*" },
        });

        if (!upstream.ok || !upstream.body) {
          return new Response("Failed to fetch asset", { status: upstream.status || 502 });
        }

        const headers = new Headers();
        headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
        headers.set("Cache-Control", upstream.headers.get("cache-control") ?? "public, max-age=86400");

        const etag = upstream.headers.get("etag");
        if (etag) headers.set("ETag", etag);

        const lastModified = upstream.headers.get("last-modified");
        if (lastModified) headers.set("Last-Modified", lastModified);

        return new Response(upstream.body, {
          status: 200,
          headers,
        });
      },
    },
  },
});
