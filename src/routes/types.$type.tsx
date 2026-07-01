import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { TYPES, TYPE_META, PokeType } from "@/data/types";
import { GeneratorSurface } from "@/components/generator-surface";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

export const Route = createFileRoute("/types/$type")({
  loader: ({ params }) => {
    const t = params.type as PokeType;
    if (!TYPES.includes(t)) throw notFound();
    return { type: t };
  },
  head: ({ params }) => {
    const t = params.type;
    const label = TYPE_META[t as PokeType]?.label ?? t;
    return {
      meta: buildSeoMeta({
        title: `Random ${label}-type Pokemon Generator — RandomPoké`,
        description: `Generate a random ${label}-type Pokémon or a full mono-${label} team. Includes coverage and weakness analysis.`,
        path: `/types/${t}`,
      }),
      links: buildCanonicalLink(`/types/${t}`),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Random ${label}-type Pokémon`,
            description: `Generate a random ${label}-type Pokémon or a full mono-${label} team. Includes coverage and weakness analysis.`,
            url: getCanonicalUrl(`/types/${t}`),
            about: {
              "@type": "Thing",
              name: `${label}-type Pokémon`,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: `${label}-type Pokémon`, path: `/types/${t}` },
            ]),
          ),
        },
      ],
    };
  },
  component: TypePage,
});

function TypePage() {
  const { type } = Route.useLoaderData() as { type: PokeType };
  const meta = TYPE_META[type];
  return (
    <div>
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${meta.bg}, ${meta.bg}aa)` }}>
        <div className="mx-auto max-w-7xl px-4 py-9 md:px-6 md:py-11 xl:py-16" style={{ color: meta.text }}>
          <SeoBreadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Types", to: "/types" },
              { label: `${meta.label} Type` },
            ]}
            className="text-white/80"
            linkClassName="text-white/80 hover:text-white"
            currentClassName="text-white"
            separatorClassName="text-white/60"
          />
          <Link to="/" className="text-xs font-semibold uppercase tracking-wider opacity-90 hover:underline">← All types</Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-5xl xl:text-6xl">
            Random {meta.label}-type Pokémon
          </h1>
          <p className="mt-2.5 max-w-[44rem] text-sm opacity-90 md:text-base">
            Roll any random {meta.label}-type Pokémon from the full national Pokédex. Build a mono-{meta.label} team in a single click.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:py-14">
        <GeneratorSurface basePath={`/types/${type}`} initialFilters={{ count: 6, type }} ctaLabel={`Generate ${meta.label} team`} />
        <section className="mt-10 grid gap-2.5 sm:grid-cols-3 md:grid-cols-6 lg:mt-12 lg:grid-cols-9">
          {TYPES.filter((t) => t !== type).map((t) => (
            <Link
              key={t}
              to="/types/$type"
              params={{ type: t }}
              className="rounded-xl px-2.5 py-2 text-center text-[11px] font-bold uppercase tracking-wider transition-transform hover:scale-105 md:px-3 md:py-2.5 md:text-xs"
              style={{ background: TYPE_META[t].bg, color: TYPE_META[t].text }}
            >
              {TYPE_META[t].label}
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
