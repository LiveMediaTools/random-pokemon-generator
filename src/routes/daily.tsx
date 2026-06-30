import { createFileRoute } from "@tanstack/react-router";
import { GeneratorSurface } from "@/components/generator-surface";
import { dailySeed } from "@/lib/generator";

export const Route = createFileRoute("/daily")({
  head: () => ({
    meta: [
      { title: "Daily Random Pokemon Challenge — RandomPoké" },
      { name: "description", content: "A new fixed random Pokémon team every UTC day. Everyone gets the same roll — compare your best 6 with friends." },
      { property: "og:url", content: "/daily" },
    ],
    links: [{ rel: "canonical", href: "/daily" }],
  }),
  component: DailyPage,
});

function DailyPage() {
  const seed = dailySeed();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8 max-w-3xl">
        <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
          Daily · {today} UTC
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Daily Pokémon Challenge</h1>
        <p className="mt-3 text-muted-foreground">
          A new random team every UTC day. The seed is fixed, so every visitor today gets the same six Pokémon. Build a strategy, share your hot take.
        </p>
      </header>
      <GeneratorSurface basePath="/daily" initialFilters={{ count: 6, excludeLegendary: true, excludeMythical: true, fullyEvolvedOnly: true }} initialSeed={seed} ctaLabel="Reroll (preview only)" />
    </div>
  );
}
