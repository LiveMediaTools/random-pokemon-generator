import { useState, useRef } from "react";
import { Pokemon } from "@/data/pokemon";
import { Filters, filtersToSearch } from "@/lib/generator";
import { Link2, FileText, Image as ImageIcon, Check, Bookmark } from "lucide-react";
import { useTeams } from "@/lib/storage";

interface Props {
  team: Pokemon[];
  filters: Filters;
  seed: string;
  basePath: string;
  exportRef?: React.RefObject<HTMLElement | null>;
}

export function ShareBar({ team, filters, seed, basePath, exportRef }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const { save } = useTeams();
  const saveRef = useRef<HTMLInputElement>(null);
  const [showSave, setShowSave] = useState(false);

  function shareUrl() {
    const params = new URLSearchParams(filtersToSearch(filters, seed));
    const url = typeof window !== "undefined"
      ? `${window.location.origin}${basePath}?${params.toString()}`
      : `${basePath}?${params.toString()}`;
    return url;
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  async function exportImage() {
    if (!exportRef?.current) return;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#ffffff" });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `random-pokemon-${seed}.png`;
    a.click();
  }

  const textVersion = team.map((p, i) => `${i + 1}. ${p.name} (#${p.id}) — ${p.types.join("/")}`).join("\n");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => copy(shareUrl(), "link")}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied === "link" ? "Copied!" : "Share link"}
      </button>
      <button
        onClick={() => copy(textVersion, "text")}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
      >
        {copied === "text" ? <Check className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
        {copied === "text" ? "Copied!" : "Copy text"}
      </button>
      {exportRef && (
        <button
          onClick={exportImage}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Export PNG
        </button>
      )}
      <button
        onClick={() => setShowSave((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
      >
        <Bookmark className="h-3.5 w-3.5" />
        Save team
      </button>
      {showSave && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const name = saveRef.current?.value?.trim() || `Team ${new Date().toLocaleString()}`;
            save(name, team.map((p) => p.id));
            setShowSave(false);
            setCopied("saved");
            setTimeout(() => setCopied(null), 1500);
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={saveRef}
            placeholder="Team name"
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs"
          />
          <button type="submit" className="rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
            Save
          </button>
        </form>
      )}
      {copied === "saved" && <span className="text-xs text-success">Saved to Favorites</span>}
    </div>
  );
}
