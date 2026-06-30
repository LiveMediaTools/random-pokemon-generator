import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { ALL_POKEMON } from "@/data/pokemon";
import { GENERATIONS } from "@/data/types";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

const generationCounts = Object.fromEntries(
  GENERATIONS.map((generation) => [
    generation.gen,
    ALL_POKEMON.filter((pokemon) => pokemon.generation === generation.gen).length,
  ]),
) as Record<number, number>;

export const Route = createFileRoute("/generations/")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Pokemon Generations Archive — Kanto to Paldea",
      description:
        "Browse Pokemon generators by generation, from Generation I Kanto to Generation IX Paldea, with dedicated archive pages for each regional dex.",
      path: "/generations",
    }),
    links: buildCanonicalLink("/generations"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Pokemon Generations Archive",
          description:
            "Browse Pokemon generators by generation, from Generation I Kanto to Generation IX Paldea, with dedicated archive pages for each regional dex.",
          url: getCanonicalUrl("/generations"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Generations", path: "/generations" },
          ]),
        ),
      },
    ],
  }),
  component: GenerationsArchivePage,
});

function GenerationsArchivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="max-w-3xl">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Generations" },
          ]}
        />
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Pokemon Generations Archive
        </h1>
        <p className="mt-3 text-muted-foreground">
          Browse regional dex generators from Kanto through Paldea and jump directly to the generation you want to randomize.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GENERATIONS.map((generation) => (
          <Link
            key={generation.gen}
            to="/generations/$gen"
            params={{ gen: String(generation.gen) }}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-pop)]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Generation {generation.gen}</div>
            <h2 className="mt-2 font-display text-xl font-bold">
              {generation.region[0].toUpperCase() + generation.region.slice(1)}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              National Dex {generation.range} · {generationCounts[generation.gen]} Pokemon available in this archive.
            </p>
            <div className="mt-4 text-xs font-semibold text-primary">Open generation →</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
