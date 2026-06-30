import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { TYPES, TYPE_META, PokeType } from "@/data/types";
import { GeneratorSurface } from "@/components/generator-surface";

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
      meta: [
        { title: `Random ${label}-type Pokemon Generator — RandomPoké` },
        { name: "description", content: `Generate a random ${label}-type Pokémon or a full mono-${label} team. Includes coverage and weakness analysis.` },
        { property: "og:url", content: `/types/${t}` },
      ],
      links: [{ rel: "canonical", href: `/types/${t}` }],
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
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16" style={{ color: meta.text }}>
          <Link to="/" className="text-xs font-semibold uppercase tracking-wider opacity-90 hover:underline">← All types</Link>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
            Random {meta.label}-type Pokémon
          </h1>
          <p className="mt-3 max-w-2xl opacity-90">
            Roll any random {meta.label}-type Pokémon from the full national Pokédex. Build a mono-{meta.label} team in a single click.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <GeneratorSurface basePath={`/types/${type}`} initialFilters={{ count: 6, type }} ctaLabel={`Generate ${meta.label} team`} />
        <section className="mt-12 grid gap-3 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9">
          {TYPES.filter((t) => t !== type).map((t) => (
            <Link
              key={t}
              to="/types/$type"
              params={{ type: t }}
              className="rounded-xl px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105"
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
