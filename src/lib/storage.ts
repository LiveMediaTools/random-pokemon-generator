// Client-side persistence: favorites, history, saved presets. localStorage-backed.
import { useEffect, useState, useCallback } from "react";
import type { Filters } from "./generator";

const FAV_KEY = "rpg.favorites.v1";
const HIST_KEY = "rpg.history.v1";
const TEAM_KEY = "rpg.teams.v1";
const PRESET_KEY = "rpg.presets.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {
    // ignore quota errors
  }
}

function useLS<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
    const onChange = (e: StorageEvent) => {
      if (e.key === key || e.key === null) setValue(read(key, fallback));
    };
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        write(key, next);
        return next;
      });
    },
    [key]
  );
  return [value, set];
}

export function useFavorites() {
  const [ids, setIds] = useLS<number[]>(FAV_KEY, []);
  const isFav = useCallback((id: number) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: number) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev])),
    [setIds]
  );
  return { ids, isFav, toggle, clear: () => setIds([]) };
}

export interface HistoryEntry {
  at: number;
  seed: string;
  filters: Filters;
  results: number[];
  label?: string;
}

export function useHistory() {
  const [entries, setEntries] = useLS<HistoryEntry[]>(HIST_KEY, []);
  const push = useCallback(
    (e: Omit<HistoryEntry, "at">) =>
      setEntries((prev) => [{ ...e, at: Date.now() }, ...prev].slice(0, 50)),
    [setEntries]
  );
  const remove = useCallback(
    (at: number) => setEntries((prev) => prev.filter((x) => x.at !== at)),
    [setEntries]
  );
  return { entries, push, remove, clear: () => setEntries([]) };
}

export interface SavedTeam { id: string; name: string; ids: number[]; at: number; }

export function useTeams() {
  const [teams, setTeams] = useLS<SavedTeam[]>(TEAM_KEY, []);
  const save = useCallback(
    (name: string, ids: number[]) =>
      setTeams((prev) => [{ id: crypto.randomUUID(), name, ids, at: Date.now() }, ...prev]),
    [setTeams]
  );
  const remove = useCallback(
    (id: string) => setTeams((prev) => prev.filter((t) => t.id !== id)),
    [setTeams]
  );
  return { teams, save, remove };
}

export interface SavedPreset { id: string; name: string; filters: Filters; at: number; }

export function usePresets() {
  const [presets, setPresets] = useLS<SavedPreset[]>(PRESET_KEY, []);
  const save = useCallback(
    (name: string, filters: Filters) =>
      setPresets((prev) => [{ id: crypto.randomUUID(), name, filters, at: Date.now() }, ...prev]),
    [setPresets]
  );
  const remove = useCallback(
    (id: string) => setPresets((prev) => prev.filter((p) => p.id !== id)),
    [setPresets]
  );
  return { presets, save, remove };
}
