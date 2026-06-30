import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  compact?: boolean;
};

export function SiteLogo({ className, compact = false }: SiteLogoProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_#fffef8,_#ffe7a2_70%,_#ffd24b)] shadow-[var(--shadow-pop)] ring-1 ring-black/5">
        <img src="/logo-mark.svg" alt="RandomPoke logo" className="h-10 w-10" loading="eager" decoding="async" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">RandomPoké</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Pikachu-powered RNG
          </span>
        </span>
      )}
    </span>
  );
}
