const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const ensureLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`);

export const SITE_NAME = "RandomPoké";
export const SITE_TITLE = "Random Pokemon Generator — Roll Teams, Nuzlockes & Shinies";
export const SITE_DESCRIPTION =
  "Generate a random Pokémon or a full random team instantly. Filter by type, generation, evolution, and rarity. Perfect for Nuzlockes, Monotype runs, and Shiny hunts.";
export const SITE_THEME_COLOR = "#ffcf3f";
export const SITE_TWITTER_HANDLE = "@randompoke";
export const DEFAULT_OG_IMAGE_PATH = "/icon-512.png";
export const DEFAULT_SITE_URL = "https://random-pokemon-generator.com";

export const SITE_URL = trimTrailingSlash(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL);
export const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID?.trim() || undefined;

export function getSiteAssetUrl(path: string) {
  return `${SITE_URL}${ensureLeadingSlash(path)}`;
}

export function getCanonicalUrl(path = "/") {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${ensureLeadingSlash(path)}`;
}

type SeoMetaOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
};

export function buildSeoMeta({
  title,
  description,
  path,
  image = getSiteAssetUrl(DEFAULT_OG_IMAGE_PATH),
  type = "website",
}: SeoMetaOptions) {
  const url = getCanonicalUrl(path);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: SITE_TWITTER_HANDLE },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

export function buildCanonicalLink(path: string) {
  return [{ rel: "canonical", href: getCanonicalUrl(path) }];
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  };
}
