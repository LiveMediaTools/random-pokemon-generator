import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { PRESETS } from "@/data/presets";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

export const Route = createFileRoute("/challenges/")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Random Pokemon Challenges — Nuzlocke, Starter, Shiny & More",
      description:
        "Browse random Pokemon challenge generators for Nuzlockes, starters, shinies, legendaries, monotype teams, and more long-tail challenge formats.",
      path: "/challenges",
    }),
    links: buildCanonicalLink("/challenges"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Random Pokemon Challenges",
          description:
            "Browse random Pokemon challenge generators for Nuzlockes, starters, shinies, legendaries, monotype teams, and more long-tail challenge formats.",
          url: getCanonicalUrl("/challenges"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Challenges", path: "/challenges" },
          ]),
        ),
      },
    ],
  }),
  component: ChallengesArchivePage,
});

function ChallengesArchivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="max-w-3xl">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Challenges" },
          ]}
        />
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Random Pokemon Challenge Archive
        </h1>
        <p className="mt-3 text-muted-foreground">
          Explore curated generators for Nuzlockes, starter picks, shiny hunts, mono-type teams, and other challenge-run formats.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PRESETS.map((preset) => (
          <Link
            key={preset.slug}
            to="/challenges/$slug"
            params={{ slug: preset.slug }}
            className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-pop)]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Challenge</div>
            <h2 className="mt-2 font-display text-lg font-bold leading-tight">{preset.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{preset.description}</p>
            <div className="mt-4 text-xs font-semibold text-primary">Open challenge →</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
