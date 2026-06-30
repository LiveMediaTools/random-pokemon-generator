import { createFileRoute, Link } from "@tanstack/react-router";
import { useFavorites, useTeams } from "@/lib/storage";
import { POKEMON_BY_ID } from "@/data/pokemon";
import { PokemonCard } from "@/components/pokemon-card";
import { spriteUrl } from "@/lib/generator";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Your Favorites — RandomPoké" },
      { name: "description", content: "Pokémon and teams you've saved on this device." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { ids, clear } = useFavorites();
  const { teams, remove } = useTeams();
  const favs = ids.map((id) => POKEMON_BY_ID.get(id)).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">Your Favorites</h1>
          <p className="mt-2 text-muted-foreground">Saved locally in your browser.</p>
        </div>
        {favs.length > 0 && (
          <button onClick={clear} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </header>

      <section>
        <h2 className="font-display text-xl font-bold">Pokémon ({favs.length})</h2>
        {favs.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            Tap the heart on any Pokémon card to save it here. <Link to="/" className="font-semibold text-primary hover:underline">Start generating →</Link>
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((p, i) => p && <PokemonCard key={p.id} p={p} index={i} />)}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl font-bold">Saved teams ({teams.length})</h2>
        {teams.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            Save a team from the generator's Share bar to find it here.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {teams.map((t) => {
              const members = t.ids.map((id) => POKEMON_BY_ID.get(id)).filter(Boolean);
              return (
                <div key={t.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(t.at).toLocaleString()}</div>
                    </div>
                    <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete team">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {members.map((p, i) => p && (
                      <Link key={i} to="/pokemon/$slug" params={{ slug: p.slug }} className="flex flex-col items-center text-center">
                        <img src={spriteUrl(p)} alt={p.name} loading="lazy" className="h-16 w-16 object-contain" />
                        <span className="mt-1 text-xs font-semibold">{p.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
