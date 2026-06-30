import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SeoBreadcrumbs } from "@/components/seo-breadcrumbs";
import { POKEMON_BY_SLUG } from "@/data/pokemon";
import { TYPES, TYPE_META, PokeType } from "@/data/types";
import { takenFrom } from "@/data/typeChart";
import { spriteUrl } from "@/lib/generator";
import { buildBreadcrumbSchema, buildCanonicalLink, buildSeoMeta, getCanonicalUrl } from "@/lib/site";

export const Route = createFileRoute("/pokemon/$slug")({
  loader: ({ params }) => {
    const p = POKEMON_BY_SLUG.get(params.slug);
    if (!p) throw notFound();
    return { p };
  },
  head: ({ params }) => {
    const p = POKEMON_BY_SLUG.get(params.slug);
    if (!p) return {};
    return {
      meta: buildSeoMeta({
        title: `${p.name} — Random Pokemon Profile`,
        description: `${p.name} (#${p.id}) — ${p.types.join("/")}, Gen ${p.generation}. BST ${p.bst}. View stats, type matchups, and roll random teams featuring ${p.name}.`,
        path: `/pokemon/${p.slug}`,
        image: spriteUrl(p),
      }),
      links: buildCanonicalLink(`/pokemon/${p.slug}`),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Thing",
            name: p.name,
            description: `${p.name} is a ${p.types.join("/")} Pokémon from Generation ${p.generation}.`,
            url: getCanonicalUrl(`/pokemon/${p.slug}`),
            image: spriteUrl(p),
            identifier: `National Dex #${p.id}`,
            additionalProperty: [
              { "@type": "PropertyValue", name: "Generation", value: String(p.generation) },
              { "@type": "PropertyValue", name: "Types", value: p.types.join(", ") },
              { "@type": "PropertyValue", name: "Base stat total", value: String(p.bst) },
              { "@type": "PropertyValue", name: "Height", value: `${(p.height / 10).toFixed(1)} m` },
              { "@type": "PropertyValue", name: "Weight", value: `${(p.weight / 10).toFixed(1)} kg` },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: p.name, path: `/pokemon/${p.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: PokemonPage,
});

const STAT_KEYS = [
  ["hp", "HP"], ["atk", "Atk"], ["def", "Def"],
  ["spa", "SpA"], ["spd", "SpD"], ["spe", "Spe"],
] as const;

function PokemonPage() {
  const { p } = Route.useLoaderData() as { p: import("@/data/pokemon").Pokemon };
  const matchups = Object.fromEntries(
    TYPES.map((t) => [t, takenFrom(p.types as PokeType[], t)])
  ) as Record<PokeType, number>;
  const weak: string[] = [], resist: string[] = [], immune: string[] = [];
  (Object.entries(matchups) as [PokeType, number][]).forEach(([t, m]) => {
    if (m === 0) immune.push(t);
    else if (m > 1) weak.push(`${t} (×${m})`);
    else if (m < 1) resist.push(`${t} (×${m})`);
  });

  const primary = p.types[0] as PokeType;
  const bg = TYPE_META[primary].bg;

  return (
    <div>
      <header className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${bg}, ${bg}aa)` }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 md:flex-row md:px-6 md:py-16">
          <img src={spriteUrl(p)} alt={p.name} className="h-56 w-56 object-contain drop-shadow-xl" />
          <div className="flex-1 text-center md:text-left" style={{ color: TYPE_META[primary].text }}>
            <SeoBreadcrumbs
              items={[
                { label: "Home", to: "/" },
                { label: "Pokedex", to: "/" },
                { label: p.name },
              ]}
              className="justify-center text-white/80 md:justify-start"
              linkClassName="text-white/80 hover:text-white"
              currentClassName="text-white"
              separatorClassName="text-white/60"
            />
            <div className="text-sm font-semibold opacity-90">#{String(p.id).padStart(4, "0")} · Generation {p.generation}</div>
            <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight md:text-6xl">{p.name}</h1>
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              {p.types.map((t) => (
                <span key={t} className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.2)" }}>
                  {TYPE_META[t as PokeType].label}
                </span>
              ))}
              {p.isLegendary && <span className="rounded-full bg-warning/30 px-3 py-1 text-xs font-bold uppercase">Legendary</span>}
              {p.isMythical && <span className="rounded-full bg-accent/30 px-3 py-1 text-xs font-bold uppercase">Mythical</span>}
              {p.isParadox && <span className="rounded-full bg-primary/30 px-3 py-1 text-xs font-bold uppercase">Paradox</span>}
              {p.isStarter && <span className="rounded-full bg-success/30 px-3 py-1 text-xs font-bold uppercase">Starter</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-2 md:px-6 md:py-14">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">Base stats</h2>
          <div className="mt-4 space-y-2">
            {STAT_KEYS.map(([k, label]) => {
              const v = p[k];
              const pct = Math.min(100, Math.round((v / 255) * 100));
              return (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <div className="w-10 font-mono text-xs uppercase text-muted-foreground">{label}</div>
                  <div className="w-10 text-right font-mono font-semibold">{v}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-[var(--gradient-primary)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-muted-foreground">Base stat total</span>
              <span className="font-mono text-lg font-bold">{p.bst}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">Type matchups</h2>
          <Matchup label="Weak to" items={weak} color="destructive" />
          <Matchup label="Resists" items={resist} color="success" />
          <Matchup label="Immune to" items={immune} color="muted-foreground" />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">Details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Info k="Height" v={`${(p.height / 10).toFixed(1)} m`} />
            <Info k="Weight" v={`${(p.weight / 10).toFixed(1)} kg`} />
            <Info k="Region" v={p.region[0].toUpperCase() + p.region.slice(1)} />
            <Info k="Evo stage" v={String(p.evoStage)} />
            <Info k="Abilities" v={p.abilities.join(", ") || "—"} />
            <Info k="Egg groups" v={p.eggGroups.join(", ") || "—"} />
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">Roll teams with {p.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Generate a fresh random team built around this Pokémon's typing.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.types.map((t) => (
              <Link
                key={t}
                to="/types/$type"
                params={{ type: t }}
                className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{ background: TYPE_META[t as PokeType].bg, color: TYPE_META[t as PokeType].text }}
              >
                Mono-{TYPE_META[t as PokeType].label} team →
              </Link>
            ))}
            <Link to="/generations/$gen" params={{ gen: String(p.generation) }} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-primary">
              Gen {p.generation} team →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}

function Matchup({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <div className={`text-xs font-bold uppercase tracking-wider text-${color}`}>{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">{i}</span>
        ))}
      </div>
    </div>
  );
}
