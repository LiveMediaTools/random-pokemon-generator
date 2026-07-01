import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { PRESETS, PRESET_BY_SLUG } from "@/data/presets";
import { GeneratorSurface } from "@/components/generator-surface";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

export const Route = createFileRoute("/challenges/$slug")({
  loader: ({ params }) => {
    const preset = PRESET_BY_SLUG.get(params.slug);
    if (!preset) throw notFound();
    return { preset };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.preset;
    if (!p) return {};
    return {
      meta: buildSeoMeta({
        title: `${p.title} — RandomPoké`,
        description: p.description,
        path: `/challenges/${p.slug}`,
      }),
      links: buildCanonicalLink(`/challenges/${p.slug}`),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: p.title,
            description: p.description,
            url: getCanonicalUrl(`/challenges/${p.slug}`),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: p.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: p.title, path: `/challenges/${p.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: ChallengePage,
});

function ChallengePage() {
  const { preset } = Route.useLoaderData() as { preset: typeof PRESETS[number] };
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:py-14">
      <header className="mb-6 max-w-[52rem] lg:mb-8">
        <SeoBreadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Challenges", to: "/challenges" },
            { label: preset.title },
          ]}
        />
        <Link to="/" className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
          ← All challenges
        </Link>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl xl:text-5xl">{preset.h1}</h1>
        <p className="mt-2.5 text-sm text-muted-foreground md:text-base">{preset.intro}</p>
      </header>

      <GeneratorSurface basePath={`/challenges/${preset.slug}`} initialFilters={preset.filters} ctaLabel="Generate" />

      <section className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-6">
        <article className="rounded-2xl border border-border bg-card p-4 md:p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold md:text-xl">How to play</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {preset.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 md:p-5 lg:p-6">
          <h2 className="font-display text-lg font-bold md:text-xl">FAQ</h2>
          <div className="mt-3 space-y-3">
            {preset.faq.map((f) => (
              <div key={f.q}>
                <div className="font-semibold">{f.q}</div>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-10 lg:mt-12">
        <h2 className="font-display text-xl font-bold md:text-2xl">Related challenges</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {preset.related.map((slug) => {
            const rp = PRESETS.find((x) => x.slug === slug);
            if (!rp) return null;
            return (
              <Link
                key={slug}
                to="/challenges/$slug"
                params={{ slug }}
                className="rounded-2xl border border-border bg-card p-3.5 hover:border-primary md:p-4"
              >
                <div className="font-display font-bold">{rp.title}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{rp.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
