import { Link } from "@tanstack/react-router";
import { TYPES, TYPE_META, GENERATIONS } from "@/data/types";
import { PRESETS } from "@/data/presets";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="font-display text-lg font-bold">RandomPoké</div>
          <p className="mt-3 text-sm text-muted-foreground">
            The complete random Pokémon generator. Roll teams, hunt shinies, tackle Nuzlockes.
          </p>
        </div>
        <FooterCol title="Popular Generators">
          <FLink to="/random-pokemon-generator">Random Pokémon</FLink>
          <FLink to="/random-pokemon-team-generator">Random Team</FLink>
          <FLink to="/daily">Daily Challenge</FLink>
          <FLink to="/favorites">Favorites</FLink>
          <FLink to="/history">History</FLink>
        </FooterCol>
        <FooterCol title="By Type">
          {TYPES.slice(0, 9).map((t) => (
            <Link key={t} to="/types/$type" params={{ type: t }} className="text-sm text-muted-foreground hover:text-foreground">
              {TYPE_META[t].label}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="By Generation">
          {GENERATIONS.map((g) => (
            <Link key={g.gen} to="/generations/$gen" params={{ gen: String(g.gen) }} className="text-sm text-muted-foreground hover:text-foreground">
              Gen {g.gen} — {g.region[0].toUpperCase() + g.region.slice(1)}
            </Link>
          ))}
        </FooterCol>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:px-6">
          <p>© {new Date().getFullYear()} RandomPoké. Pokémon and all related trademarks are property of Nintendo, Game Freak, and The Pokémon Company. This is a fan-made tool.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <Link to="/challenges/$slug" params={{ slug: "nuzlocke" }} className="hover:text-foreground">Challenges</Link>
          </div>
        </div>
      </div>
      <div className="sr-only">
        {PRESETS.map((p) => (
          <Link key={p.slug} to="/challenges/$slug" params={{ slug: p.slug }}>{p.title}</Link>
        ))}
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">{title}</div>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to as any} className="text-sm text-muted-foreground hover:text-foreground">
      {children}
    </Link>
  );
}
