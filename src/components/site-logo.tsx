import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  compact?: boolean;
};

export function SiteLogo({ className, compact = false }: SiteLogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5 md:gap-3", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_top,_#fffef8,_#ffe7a2_70%,_#ffd24b)] shadow-[var(--shadow-pop)] ring-1 ring-black/5 md:h-10 md:w-10 md:rounded-2xl">
        <img src="/logo-mark.svg" alt="RandomPoke logo" className="h-8 w-8 md:h-9 md:w-9" loading="eager" decoding="async" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight text-foreground md:text-lg">RandomPoké</span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground lg:block">
            Pikachu-powered RNG
          </span>
        </span>
      )}
    </span>
  );
}
