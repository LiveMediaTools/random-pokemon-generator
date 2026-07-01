import { Pokemon } from "@/data/pokemon";
import { TYPES, TYPE_META, PokeType } from "@/data/types";
import { takenFrom } from "@/data/typeChart";

export function TeamCoverage({ team }: { team: Pokemon[] }) {
  if (team.length < 2) return null;

  // Offensive: types the team can hit super effectively (using each Pokemon's first type as STAB)
  const offCovered = new Set<PokeType>();
  for (const p of team) {
    for (const atk of p.types as PokeType[]) {
      for (const def of TYPES) {
        if (takenFrom([def], atk) > 1) offCovered.add(def);
      }
    }
  }

  // Defensive: aggregate weaknesses count
  const weakCounts: Record<string, number> = {};
  for (const def of TYPES) {
    let n = 0;
    for (const p of team) {
      const m = takenFrom(p.types as PokeType[], def);
      if (m > 1) n++;
    }
    if (n > 0) weakCounts[def] = n;
  }

  const styles: string[] = [];
  const avgBst = Math.round(team.reduce((s, p) => s + p.bst, 0) / team.length);
  const avgSpe = Math.round(team.reduce((s, p) => s + p.spe, 0) / team.length);
  const avgAtk = Math.round(team.reduce((s, p) => s + (p.atk + p.spa) / 2, 0) / team.length);
  const avgDef = Math.round(team.reduce((s, p) => s + (p.def + p.spd + p.hp / 1.5) / 2.5, 0) / team.length);
  if (avgSpe >= 95) styles.push("Fast");
  if (avgDef >= 95) styles.push("Bulky");
  if (avgAtk >= 100) styles.push("Hard hitting");
  if (avgBst >= 550) styles.push("Heavy-hitter lineup");
  if (team.every((p) => p.isFullyEvolved)) styles.push("Battle ready");
  if (team.some((p) => p.isLegendary)) styles.push("Legendary heavy");
  if (new Set(team.flatMap((p) => p.types)).size <= 3) styles.push("Narrow coverage");

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] md:p-5">
      <div className="font-display text-base font-bold md:text-lg">Team analysis</div>
      <div className="mt-1 text-sm text-muted-foreground">
        Average BST <strong className="text-foreground">{avgBst}</strong> · Speed{" "}
        <strong className="text-foreground">{avgSpe}</strong> · {styles.join(" · ") || "Balanced"}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 md:gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Offensive coverage ({offCovered.size}/18)</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {TYPES.map((t) => {
              const ok = offCovered.has(t);
              return (
                <span
                  key={t}
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase"
                  style={{
                    background: ok ? TYPE_META[t].bg : "transparent",
                    color: ok ? TYPE_META[t].text : "var(--color-muted-foreground)",
                    border: ok ? "none" : "1px dashed var(--color-border)",
                    opacity: ok ? 1 : 0.55,
                  }}
                >
                  {TYPE_META[t].label}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Shared weaknesses</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {TYPES.filter((t) => (weakCounts[t] ?? 0) >= 2).length === 0 && (
              <span className="text-sm text-muted-foreground">No type hits more than one team member super-effectively.</span>
            )}
            {TYPES.filter((t) => (weakCounts[t] ?? 0) >= 2).map((t) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase"
                style={{ background: TYPE_META[t].bg, color: TYPE_META[t].text }}
                title={`${weakCounts[t]} team members weak`}
              >
                {TYPE_META[t].label} ×{weakCounts[t]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
