import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { ALL_POKEMON } from "@/data/pokemon";
import { GENERATIONS } from "@/data/types";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

const pokemonByGeneration = GENERATIONS.map((generation) => ({
  generation,
  pokemon: ALL_POKEMON.filter((pokemon) => pokemon.generation === generation.gen),
}));

export const Route = createFileRoute("/pokemon/")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Pokemon Archive — Full National Pokedex Links",
      description:
        "Browse the full Pokemon archive with direct links to every Pokemon profile page, organized by generation from Bulbasaur to Pecharunt.",
      path: "/pokemon",
    }),
    links: buildCanonicalLink("/pokemon"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Pokemon Archive",
          description:
            "Browse the full Pokemon archive with direct links to every Pokemon profile page, organized by generation from Bulbasaur to Pecharunt.",
          url: getCanonicalUrl("/pokemon"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Pokemon", path: "/pokemon" },
          ]),
        ),
      },
    ],
  }),
  component: PokemonArchivePage,
});

function PokemonArchivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="max-w-3xl">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Pokemon" },
          ]}
        />
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Pokemon Archive
        </h1>
        <p className="mt-3 text-muted-foreground">
          Explore direct links to every Pokemon profile page in the full National Pokedex, grouped by generation for faster browsing and stronger crawl paths.
        </p>
      </header>

      <section className="mt-8 flex flex-wrap gap-2">
        {pokemonByGeneration.map(({ generation }) => (
          <a
            key={generation.gen}
            href={`#gen-${generation.gen}`}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-foreground"
          >
            Gen {generation.gen}
          </a>
        ))}
      </section>

      <div className="mt-10 space-y-10">
        {pokemonByGeneration.map(({ generation, pokemon }) => (
          <section key={generation.gen} id={`gen-${generation.gen}`} className="scroll-mt-24">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">
                  Generation {generation.gen} · {generation.region[0].toUpperCase() + generation.region.slice(1)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  National Dex {generation.range} · {pokemon.length} Pokemon
                </p>
              </div>
              <Link
                to="/generations/$gen"
                params={{ gen: String(generation.gen) }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Open generation page →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pokemon.map((entry) => (
                <Link
                  key={entry.id}
                  to="/pokemon/$slug"
                  params={{ slug: entry.slug }}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {entry.name}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
