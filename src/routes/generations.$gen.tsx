import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { GENERATIONS } from "@/data/types";
import { GeneratorSurface } from "@/components/generator-surface";

export const Route = createFileRoute("/generations/$gen")({
  loader: ({ params }) => {
    const g = Number(params.gen);
    const meta = GENERATIONS.find((x) => x.gen === g);
    if (!meta) throw notFound();
    return { meta };
  },
  head: ({ params }) => {
    const g = Number(params.gen);
    const meta = GENERATIONS.find((x) => x.gen === g);
    const label = meta ? `${meta.region[0].toUpperCase() + meta.region.slice(1)} (Gen ${meta.gen})` : `Gen ${params.gen}`;
    return {
      meta: [
        { title: `Random ${label} Pokemon Generator — RandomPoké` },
        { name: "description", content: `Generate a random Pokémon from ${label}. Roll a single mon or a full 6-mon ${label} team instantly.` },
        { property: "og:url", content: `/generations/${params.gen}` },
      ],
      links: [{ rel: "canonical", href: `/generations/${params.gen}` }],
    };
  },
  component: GenPage,
});

function GenPage() {
  const { meta } = Route.useLoaderData() as { meta: typeof GENERATIONS[number] };
  const region = meta.region[0].toUpperCase() + meta.region.slice(1);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8 max-w-3xl">
        <Link to="/" className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">← All generations</Link>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Random {region} Pokémon
        </h1>
        <p className="mt-3 text-muted-foreground">
          Generation {meta.gen} · Pokédex #{meta.range} · the {region} regional dex.
        </p>
      </header>
      <GeneratorSurface basePath={`/generations/${meta.gen}`} initialFilters={{ count: 6, generation: meta.gen }} ctaLabel={`Generate ${region} team`} />
      <section className="mt-12 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {GENERATIONS.filter((g) => g.gen !== meta.gen).map((g) => (
          <Link
            key={g.gen}
            to="/generations/$gen"
            params={{ gen: String(g.gen) }}
            className="rounded-2xl border border-border bg-card px-4 py-3 hover:border-primary"
          >
            <div className="font-display text-sm font-bold">Gen {g.gen}</div>
            <div className="text-xs text-muted-foreground">{g.region[0].toUpperCase() + g.region.slice(1)} · {g.range}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
