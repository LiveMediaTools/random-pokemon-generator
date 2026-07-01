import { createFileRoute } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { GeneratorSurface } from "@/components/generator-surface";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

export const Route = createFileRoute("/random-pokemon-generator")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Random Pokemon Generator — Full Filter Control",
      description:
        "Roll any random Pokémon from the full national Pokédex. Filter by type, generation, evolution stage, BST, and rarity — perfect for any challenge run.",
      path: "/random-pokemon-generator",
    }),
    links: buildCanonicalLink("/random-pokemon-generator"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Random Pokemon Generator",
          applicationCategory: "GameApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: getCanonicalUrl("/random-pokemon-generator"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Random Pokemon Generator", path: "/random-pokemon-generator" },
          ]),
        ),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:py-14">
      <header className="mb-6 max-w-[52rem] lg:mb-8">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Random Generator" },
          ]}
        />
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl">Random Pokemon Generator</h1>
        <p className="mt-2.5 text-sm text-muted-foreground md:text-base">
          Roll any random Pokémon from the full national Pokédex (1,025 species). Use the basic filters for quick rolls or expand the advanced panel for BST ranges, type exclusions, and rarity gates.
        </p>
      </header>
      <GeneratorSurface basePath="/random-pokemon-generator" initialFilters={{ count: 1 }} />

      <section className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-6">
        <article className="rounded-2xl border border-border bg-card p-4 md:p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold md:text-xl">How to use the generator</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Pick how many Pokémon to roll (1–6).</li>
            <li>Narrow by generation, type, or evolution stage.</li>
            <li>Open Advanced to lock dual types, set BST ranges, or restrict to legendaries/paradoxes.</li>
            <li>Hit Generate. Reroll until you love the result.</li>
            <li>Share the link — the seed reproduces the exact roll.</li>
          </ol>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 md:p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold md:text-xl">Why seeded RNG matters</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every roll uses a seeded random number generator. That means the same seed + filters always produces the same result. Share a seed and your friend gets the exact same team — useful for streamed runs and group challenges.
          </p>
        </article>
      </section>
    </div>
  );
}
