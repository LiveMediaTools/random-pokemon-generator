import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Dices, Users, Trophy, Calendar, Sparkles } from "lucide-react";
import { GeneratorSurface } from "@/components/generator-surface";
import { ALL_POKEMON } from "@/data/pokemon";
import { PRESETS } from "@/data/presets";
import { TYPES, TYPE_META, GENERATIONS } from "@/data/types";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: buildSeoMeta({
      title: "Random Pokemon Generator — Roll Teams, Nuzlockes & Shinies",
      description:
        "Generate a random Pokémon or full 6-mon team instantly. Filter by type, generation, evolution, rarity. Built for Nuzlockes, Monotype runs, and Shiny hunts.",
      path: "/",
    }),
    links: buildCanonicalLink("/"),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Random Pokemon Generator",
          description:
            "Generate a random Pokémon or full 6-mon team instantly. Filter by type, generation, evolution, rarity. Built for Nuzlockes, Monotype runs, and Shiny hunts.",
          url: getCanonicalUrl("/"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(buildBreadcrumbSchema([{ name: "Home", path: "/" }])),
      },
    ],
  }),
  component: HomePage,
});

const faqs = [
  { q: "How does the random Pokémon generator work?", a: "We pick from the full national Pokédex (1,025 species). Your filters narrow the pool, then a seeded RNG picks distinct results — share the seed to give a friend the exact same roll." },
  { q: "Can I generate a full random team?", a: "Yes. Set count to 6 — the default — and the generator returns a six-Pokémon team with type-coverage and shared-weakness analysis." },
  { q: "Does this work for Nuzlocke runs?", a: "Yes. The Nuzlocke preset bans legendaries and mythicals by default, so encounters stay fair. You can also lock the generator to a single region for route-by-route fairness." },
  { q: "Can I save my favorite results?", a: "Tap the heart on any card to save it to Favorites (stored locally in your browser). Save full teams from the Share bar." },
  { q: "How are the daily challenges generated?", a: "Every UTC day uses a fixed seed, so every visitor sees the same daily team. Come back tomorrow for a new one." },
];

const featuredPokemon = [
  ALL_POKEMON.find((pokemon) => pokemon.isStarter && pokemon.generation === 1),
  ALL_POKEMON.find((pokemon) => pokemon.isLegendary),
  ALL_POKEMON.find((pokemon) => pokemon.isMythical),
  ALL_POKEMON.find((pokemon) => pokemon.isParadox),
].filter((pokemon): pokemon is (typeof ALL_POKEMON)[number] => Boolean(pokemon));

const quickRoutes = [
  {
    title: "Full Pokedex Archive",
    description: "Browse direct links to every Pokemon profile page.",
    to: "/pokemon" as const,
  },
  {
    title: "Type Archives",
    description: "Jump into all 18 type-based generator hubs.",
    to: "/types" as const,
  },
  {
    title: "Generation Archives",
    description: "Explore Kanto through Paldea by regional dex.",
    to: "/generations" as const,
  },
  {
    title: "Challenge Archives",
    description: "Open Nuzlocke, shiny, starter, and mono-type generators.",
    to: "/challenges" as const,
  },
];

function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_15%_15%,oklch(0.85_0.12_220/.4),transparent_40%),radial-gradient(circle_at_85%_30%,oklch(0.85_0.15_155/.35),transparent_45%)]" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 md:px-6 md:pb-16 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> All 1,025 Pokémon · 18 types · 9 generations
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Random Pokemon Generator
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Generate a random Pokémon or a full random team instantly. Filter by type, generation, evolution, and rarity — perfect for Nuzlockes, Monotype runs, and Shiny hunts.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {quickRoutes.map((route) => (
              <Link
                key={route.to}
                to={route.to}
                className="rounded-2xl border border-border/70 bg-background/70 p-4 text-left shadow-[var(--shadow-card)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary"
              >
                <div className="font-display text-base font-bold">{route.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{route.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <GeneratorSurface basePath="/" ctaLabel="Generate Team" />
          </div>
        </div>
      </section>

      {/* POPULAR POKEMON LINKS */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionHead
          title="Popular Pokemon Profiles"
          subtitle="Pure SSR text links that search engines can crawl immediately, without waiting for generator interaction or client-side state."
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {featuredPokemon.map((pokemon) => (
            <article key={pokemon.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                #{String(pokemon.id).padStart(4, "0")} · Generation {pokemon.generation}
              </div>
              <h3 className="mt-2 font-display text-xl font-bold">
                <Link to="/pokemon/$slug" params={{ slug: pokemon.slug }} className="hover:text-primary hover:underline">
                  {pokemon.name}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {pokemon.types.map((type) => TYPE_META[type].label).join(" / ")} · BST {pokemon.bst} ·
                {" "}
                <Link to="/pokemon/$slug" params={{ slug: pokemon.slug }} className="font-semibold text-primary hover:underline">
                  Read full profile
                </Link>
              </p>
            </article>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/pokemon" className="text-sm font-semibold text-primary hover:underline">
            Browse all Pokemon profile links →
          </Link>
        </div>
      </section>

      {/* PRESETS */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionHead title="Popular challenges" subtitle="Skip the setup — jump straight into a curated rule set." />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRESETS.slice(0, 8).map((p) => (
            <Link
              key={p.slug}
              to="/challenges/$slug"
              params={{ slug: p.slug }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
            >
              <div className="flex items-center gap-2 text-primary">
                <Trophy className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Preset</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-bold leading-tight">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-3 text-xs font-semibold text-primary group-hover:underline">Open generator →</div>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link to="/challenges" className="text-sm font-semibold text-primary hover:underline">
            Browse all challenge archives →
          </Link>
        </div>
      </section>

      {/* WHY */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-3 md:px-6">
          <Why icon={Dices} title="Real RNG, fair pools" desc="Seeded random with no repeats by default. Share the seed — your friend gets the exact same team." />
          <Why icon={Users} title="Team-aware analysis" desc="Generate 2+ and we surface offensive coverage, shared weaknesses, and a quick style read." />
          <Why icon={Calendar} title="Daily challenges & history" desc="Every UTC day rolls a fresh community team. Your last 50 rolls are saved locally for instant recall." />
        </div>
      </section>

      {/* TYPES */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionHead title="Browse by type" subtitle="Single-type pages with their own filter presets and FAQ." />
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
          {TYPES.map((t) => (
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
        </div>
        <div className="mt-4">
          <Link to="/types" className="text-sm font-semibold text-primary hover:underline">
            Browse all type archives →
          </Link>
        </div>
        <SectionHead className="mt-12" title="Browse by generation" subtitle="From Kanto to Paldea — every regional dex with its own random generator." />
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {GENERATIONS.map((g) => (
            <Link
              key={g.gen}
              to="/generations/$gen"
              params={{ gen: String(g.gen) }}
              className="rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] hover:border-primary"
            >
              <div className="font-display text-sm font-bold">Gen {g.gen}</div>
              <div className="text-xs text-muted-foreground">{g.region[0].toUpperCase() + g.region.slice(1)} · {g.range}</div>
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link to="/generations" className="text-sm font-semibold text-primary hover:underline">
            Browse all generation archives →
          </Link>
          <Link to="/pokemon" className="text-sm font-semibold text-primary hover:underline">
            Browse the full Pokemon archive →
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <SectionHead title="How it works" subtitle="Three steps from blank slate to battle-ready team." />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Set your filters", "Pick a count, region, type, and toggle legendaries/mythicals as needed."],
              ["02", "Roll the dice", "Hit Generate — a seeded RNG returns distinct picks. Reroll until you love it."],
              ["03", "Share or save", "Copy the share link (with seed), export a PNG card, or save the team to Favorites."],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="font-display text-3xl font-extrabold text-primary">{n}</div>
                <div className="mt-2 font-display text-lg font-bold">{t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <SectionHead title="Frequently asked questions" subtitle="" />
        <div className="mt-6 space-y-2">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
              <summary className="cursor-pointer list-none font-display text-base font-semibold">
                <span className="mr-2 text-primary group-open:rotate-45 inline-block transition-transform">+</span>
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* JSON-LD FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}

function SectionHead({ title, subtitle, className = "" }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p>}
    </div>
  );
}

function Why({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--gradient-primary)] text-zinc-950 shadow-[var(--shadow-pop)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
