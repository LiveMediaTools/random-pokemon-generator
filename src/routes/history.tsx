import { createFileRoute, Link } from "@tanstack/react-router";
import { useHistory } from "@/lib/storage";
import { POKEMON_BY_ID } from "@/data/pokemon";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Roll History — RandomPoké" },
      { name: "description", content: "Your last 50 random generations on this device. Re-open any roll instantly." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { entries, remove, clear } = useHistory();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Roll History</h1>
          <p className="mt-2 text-muted-foreground">Your last 50 generations on this device.</p>
        </div>
        {entries.length > 0 && (
          <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </header>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
          No rolls yet. <Link to="/" className="font-semibold text-primary hover:underline">Start generating →</Link>
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const members = e.results.map((id) => POKEMON_BY_ID.get(id)).filter(Boolean);
            return (
              <div key={e.at} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</div>
                    <div className="font-mono text-xs">seed: {e.seed}</div>
                  </div>
                  <button onClick={() => remove(e.at)} className="text-muted-foreground hover:text-destructive" aria-label="Delete entry">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {members.map((p, i) => p && (
                    <Link key={i} to="/pokemon/$slug" params={{ slug: p.slug }} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 hover:border-primary">
                      <img src={p.sprite} alt={p.name} loading="lazy" className="h-8 w-8 object-contain" />
                      <span className="text-sm font-semibold">{p.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
