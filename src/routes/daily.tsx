import { createFileRoute } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { GeneratorSurface } from "@/components/generator-surface";
import { dailySeed } from "@/lib/generator";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Daily Random Pokemon Challenge — RandomPoké",
      description: "A new fixed random Pokémon team every UTC day. Everyone gets the same roll — compare your best 6 with friends.",
      path: "/daily",
    }),
    links: buildCanonicalLink("/daily"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Daily Pokémon Challenge",
          description: "A new fixed random Pokémon team every UTC day. Everyone gets the same roll — compare your best 6 with friends.",
          url: getCanonicalUrl("/daily"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Daily Pokémon Challenge", path: "/daily" },
          ]),
        ),
      },
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const seed = dailySeed();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:py-14">
      <header className="mb-6 max-w-[52rem] lg:mb-8">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Daily Challenge" },
          ]}
        />
        <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
          Daily · {today} UTC
        </span>
        <h1 className="mt-2.5 font-display text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl">Daily Pokémon Challenge</h1>
        <p className="mt-2.5 text-sm text-muted-foreground md:text-base">
          A new random team every UTC day. The seed is fixed, so every visitor today gets the same six Pokémon. Build a strategy, share your hot take.
        </p>
      </header>
      <GeneratorSurface basePath="/daily" initialFilters={{ count: 6, excludeLegendary: true, excludeMythical: true, fullyEvolvedOnly: true }} initialSeed={seed} ctaLabel="Reroll (preview only)" />
    </div>
  );
}
