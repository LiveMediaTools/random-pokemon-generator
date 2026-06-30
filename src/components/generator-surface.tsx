import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Dices, RefreshCw } from "lucide-react";
import { Filters, generate, makeDeterministicSeed, makeSeed, DEFAULT_FILTERS } from "@/lib/generator";
import { PokemonCard } from "./pokemon-card";
import { FilterPanel } from "./filter-panel";
import { TeamCoverage } from "./team-coverage";
import { ShareBar } from "./share-bar";
import { useHistory } from "@/lib/storage";

interface Props {
  initialFilters?: Partial<Filters>;
  initialSeed?: string;
  basePath: string;
  compact?: boolean;
  lockFilters?: boolean;
  ctaLabel?: string;
}

export function GeneratorSurface({
  initialFilters,
  initialSeed,
  basePath,
  compact = false,
  lockFilters = false,
  ctaLabel = "Generate",
}: Props) {
  const mergedInitialFilters = useMemo(() => ({ ...DEFAULT_FILTERS, ...initialFilters }), [initialFilters]);
  const [filters, setFilters] = useState<Filters>(mergedInitialFilters);
  const [seed, setSeed] = useState<string>(() => {
    if (initialSeed) return initialSeed;
    return makeDeterministicSeed(`${basePath}:${JSON.stringify(mergedInitialFilters)}`);
  });
  const exportRef = useRef<HTMLDivElement>(null);
  const { push } = useHistory();
  const team = useMemo(() => generate(filters, seed), [filters, seed]);

  // Record to history when results change (skip empty)
  useEffect(() => {
    if (team.length === 0) return;
    push({ seed, filters, results: team.map((p) => p.id) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const reroll = () => setSeed(makeSeed());
  const shiny = !!filters.shinyDisplay;

  return (
    <div className="space-y-6">
      {!lockFilters && (
        <div className="rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-6">
          <FilterPanel value={filters} onChange={setFilters} compact={compact} />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Seed: <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground">{seed}</code>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95, rotate: -10 }}
            onClick={reroll}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-primary)] px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-pop)] transition-transform hover:scale-[1.03]"
          >
            <Dices className="h-4 w-4" />
            {ctaLabel}
          </motion.button>
          <button
            onClick={reroll}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold hover:bg-secondary"
            aria-label="Reroll"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reroll
          </button>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
          No Pokémon match these filters. Try loosening them.
        </div>
      ) : (
        <>
          <div ref={exportRef} className="rounded-2xl bg-background p-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((p, i) => (
                <PokemonCard key={`${seed}-${p.id}-${i}`} p={p} index={i} shiny={shiny} />
              ))}
            </div>
          </div>
          <ShareBar team={team} filters={filters} seed={seed} basePath={basePath} exportRef={exportRef} />
          <TeamCoverage team={team} />
        </>
      )}
    </div>
  );
}
