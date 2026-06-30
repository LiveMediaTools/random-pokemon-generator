import { createFileRoute } from "@tanstack/react-router";
import { GeneratorSurface } from "@/components/generator-surface";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta } from "@/lib/site";

export const Route = createFileRoute("/random-pokemon-team-generator")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Random Pokemon Team Generator — 6-Mon Teams with Coverage",
      description:
        "Generate a balanced random 6-Pokémon team. Instantly see offensive coverage, shared weaknesses, and key resistances.",
      path: "/random-pokemon-team-generator",
    }),
    links: buildCanonicalLink("/random-pokemon-team-generator"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Random Pokemon Team Generator", path: "/random-pokemon-team-generator" },
          ]),
        ),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8 max-w-3xl">
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Random Pokemon Team Generator</h1>
        <p className="mt-3 text-muted-foreground">
          Generate a full 6-Pokémon team in one click. Coverage and weakness analysis update with every roll so you can spot the weak link instantly.
        </p>
      </header>
      <GeneratorSurface basePath="/random-pokemon-team-generator" initialFilters={{ count: 6, allowDuplicates: false }} ctaLabel="Generate Team" />
    </div>
  );
}
