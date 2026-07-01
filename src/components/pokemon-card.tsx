import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Pokemon } from "@/data/pokemon";
import { TYPE_META, PokeType } from "@/data/types";
import { useFavorites } from "@/lib/storage";
import { spriteUrl } from "@/lib/generator";

export function PokemonCard({ p, index = 0, shiny = false }: { p: Pokemon; index?: number; shiny?: boolean }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(p.id);
  const primary = p.types[0] as PokeType;
  const bg = TYPE_META[primary]?.bg ?? "#888";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 220, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]"
    >
      <div
        className="relative h-36 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${bg}33, ${bg}10)` }}
      >
        <div className="absolute right-3 top-3 rounded-full bg-surface/80 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground backdrop-blur">
          #{String(p.id).padStart(4, "0")}
        </div>
        <button
          onClick={() => toggle(p.id)}
          aria-label={fav ? "Unfavorite" : "Favorite"}
          className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-surface/80 backdrop-blur transition-colors hover:bg-surface"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
        <img
          src={spriteUrl(p, shiny)}
          alt={p.name}
          width={180}
          height={180}
          loading="lazy"
          decoding="async"
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md transition-transform group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <Link to="/pokemon/$slug" params={{ slug: p.slug }} className="font-display text-lg font-bold leading-tight hover:text-primary">
          {p.name}
        </Link>
        <div className="mt-1 flex flex-wrap gap-1">
          {p.types.map((t) => (
            <span
              key={t}
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
              style={{ background: TYPE_META[t as PokeType].bg, color: TYPE_META[t as PokeType].text }}
            >
              {TYPE_META[t as PokeType].label}
            </span>
          ))}
          {p.isLegendary && <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-semibold text-warning">Legendary</span>}
          {p.isMythical && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">Mythical</span>}
          {p.isParadox && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">Paradox</span>}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Gen {p.generation} · {p.region[0].toUpperCase() + p.region.slice(1)}</span>
          <span className="font-mono font-semibold text-foreground">BST {p.bst}</span>
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1 text-[10px]">
          {(["hp","atk","def","spa","spd","spe"] as const).map((k) => (
            <div key={k} className="rounded bg-secondary px-1 py-0.5 text-center">
              <div className="font-mono font-semibold text-foreground">{p[k]}</div>
              <div className="uppercase text-muted-foreground">{k}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
