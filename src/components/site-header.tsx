import { Link } from "@tanstack/react-router";
import { Dices, Users, Trophy, Compass, Heart, Calendar, History } from "lucide-react";
import { useState } from "react";

import { SiteLogo } from "@/components/site-logo";

const nav = [
  { to: "/random-pokemon-generator", label: "Generate", icon: Dices },
  { to: "/random-pokemon-team-generator", label: "Team", icon: Users },
  { to: "/challenges", label: "Challenges", icon: Trophy },
  { to: "/types", label: "Types", icon: Compass },
  { to: "/daily", label: "Daily", icon: Calendar },
  { to: "/history", label: "History", icon: History },
  { to: "/favorites", label: "Favorites", icon: Heart },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="text-foreground">
          <SiteLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-full px-3 py-1.5 text-sm font-medium bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium md:hidden"
          aria-label="Toggle navigation"
        >
          Menu
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
