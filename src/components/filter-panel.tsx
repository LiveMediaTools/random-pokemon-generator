import { Filters, DEFAULT_FILTERS } from "@/lib/generator";
import { TYPES, TYPE_META, GENERATIONS, PokeType } from "@/data/types";
import { Settings2, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Props {
  value: Filters;
  onChange: (f: Filters) => void;
  compact?: boolean;
}

export function FilterPanel({ value, onChange, compact = false }: Props) {
  const [advanced, setAdvanced] = useState(false);
  const v = { ...DEFAULT_FILTERS, ...value };
  const set = (patch: Partial<Filters>) => onChange({ ...v, ...patch });

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
        <Field label="Count">
          <select
            value={v.count}
            onChange={(e) => set({ count: Number(e.target.value) })}
            className="select"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Generation">
          <select
            value={String(v.generation ?? "any")}
            onChange={(e) => set({ generation: e.target.value === "any" ? "any" : Number(e.target.value) })}
            className="select"
          >
            <option value="any">All Generations</option>
            {GENERATIONS.map((g) => (
              <option key={g.gen} value={g.gen}>Gen {g.gen} — {g.region[0].toUpperCase() + g.region.slice(1)}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select
            value={v.type ?? "any"}
            onChange={(e) => set({ type: e.target.value as PokeType | "any" })}
            className="select"
          >
            <option value="any">Any Type</option>
            {TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
          </select>
        </Field>
        <Field label="Evolution">
          <select
            value={String(v.evoStage ?? "any")}
            onChange={(e) => {
              const x = e.target.value;
              set({ evoStage: x === "any" ? "any" : (Number(x) as 1 | 2 | 3) });
            }}
            className="select"
          >
            <option value="any">Any Stage</option>
            <option value="1">Stage 1</option>
            <option value="2">Stage 2</option>
            <option value="3">Stage 3</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Toggle checked={!!v.fullyEvolvedOnly} onChange={(b) => set({ fullyEvolvedOnly: b })}>Fully evolved only</Toggle>
        <Toggle checked={!!v.excludeLegendary} onChange={(b) => set({ excludeLegendary: b })}>Exclude Legendary</Toggle>
        <Toggle checked={!!v.excludeMythical} onChange={(b) => set({ excludeMythical: b })}>Exclude Mythical</Toggle>
        <Toggle checked={!!v.allowDuplicates} onChange={(b) => set({ allowDuplicates: b })}>Allow duplicates</Toggle>
        <Toggle checked={!!v.shinyDisplay} onChange={(b) => set({ shinyDisplay: b })}>Show shiny</Toggle>
        <button
          type="button"
          onClick={() => setAdvanced((x) => !x)}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Advanced
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advanced ? "rotate-180" : ""}`} />
        </button>
      </div>

      {advanced && (
        <div className="space-y-3 rounded-2xl border border-border bg-secondary/40 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Second type">
              <select
                value={v.secondType ?? "any"}
                onChange={(e) => set({ secondType: e.target.value as PokeType | "any" })}
                className="select"
              >
                <option value="any">Any</option>
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
              </select>
            </Field>
            <Field label="Exclude type">
              <select
                value={v.excludeType ?? "none"}
                onChange={(e) => set({ excludeType: e.target.value as PokeType | "none" })}
                className="select"
              >
                <option value="none">None</option>
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
              </select>
            </Field>
            <Field label="Min BST">
              <input
                type="number"
                min={0}
                max={800}
                value={v.minBst ?? ""}
                onChange={(e) => set({ minBst: e.target.value ? Number(e.target.value) : undefined })}
                className="select"
                placeholder="e.g. 400"
              />
            </Field>
            <Field label="Max BST">
              <input
                type="number"
                min={0}
                max={800}
                value={v.maxBst ?? ""}
                onChange={(e) => set({ maxBst: e.target.value ? Number(e.target.value) : undefined })}
                className="select"
                placeholder="e.g. 600"
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <Toggle checked={!!v.onlyLegendary} onChange={(b) => set({ onlyLegendary: b })}>Only Legendary</Toggle>
              <Toggle checked={!!v.onlyMythical} onChange={(b) => set({ onlyMythical: b })}>Only Mythical</Toggle>
              <Toggle checked={!!v.onlyParadox} onChange={(b) => set({ onlyParadox: b })}>Only Paradox</Toggle>
              <Toggle checked={!!v.onlyUltraBeast} onChange={(b) => set({ onlyUltraBeast: b })}>Only Ultra Beast</Toggle>
              <Toggle checked={!!v.onlyBaby} onChange={(b) => set({ onlyBaby: b })}>Only Baby</Toggle>
              <Toggle checked={!!v.isStarter} onChange={(b) => set({ isStarter: b })}>Only Starters</Toggle>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .select {
          width: 100%;
          appearance: none;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-foreground);
          outline: none;
        }
        .select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px oklch(0.62 0.18 256 / 0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (b: boolean) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        checked ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
