import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { ALL_POKEMON } from "@/data/pokemon";
import { TYPES, TYPE_META } from "@/data/types";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

const typeCounts = Object.fromEntries(
  TYPES.map((type) => [type, ALL_POKEMON.filter((pokemon) => pokemon.types.includes(type)).length]),
) as Record<(typeof TYPES)[number], number>;

export const Route = createFileRoute("/types/")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Pokemon Types Archive — Fire, Water, Electric and More",
      description:
        "Browse every Pokemon type generator in one place, including Fire, Water, Dragon, Fairy, and all 18 type archives.",
      path: "/types",
    }),
    links: buildCanonicalLink("/types"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Pokemon Types Archive",
          description:
            "Browse every Pokemon type generator in one place, including Fire, Water, Dragon, Fairy, and all 18 type archives.",
          url: getCanonicalUrl("/types"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Types", path: "/types" },
          ]),
        ),
      },
    ],
  }),
  component: TypesArchivePage,
});

function TypesArchivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="max-w-3xl">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Types" },
          ]}
        />
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Pokemon Types Archive
        </h1>
        <p className="mt-3 text-muted-foreground">
          Jump into mono-type generators, compare coverage themes, and browse all 18 Pokemon types from one archive page.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TYPES.map((type) => (
          <Link
            key={type}
            to="/types/$type"
            params={{ type }}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
          >
            <div
              className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
              style={{ background: TYPE_META[type].bg, color: TYPE_META[type].text }}
            >
              {TYPE_META[type].label}
            </div>
            <h2 className="mt-3 font-display text-lg font-bold">{TYPE_META[type].label}-type Pokemon</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore random {TYPE_META[type].label.toLowerCase()}-type Pokemon and mono-type teams.
            </p>
            <div className="mt-4 text-xs font-semibold text-primary">{typeCounts[type]} Pokemon in archive →</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
