import { useRef, useState } from "react";
import { Pokemon } from "@/data/pokemon";
import { Filters, filtersToSearch } from "@/lib/generator";
import { normalizePokemonAssetUrl } from "@/lib/assets";
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
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

  function setTemporaryExportMessage(message: string) {
    setExportMessage(message);
    setTimeout(() => setExportMessage(null), 2500);
  }

  function resolveExportImageUrl(src: string) {
    const normalizedSrc = normalizePokemonAssetUrl(src, window.location.href);
    const assetUrl = new URL(normalizedSrc, window.location.href);
    if (assetUrl.origin === window.location.origin) {
      return assetUrl.toString();
    }

    return `/api/asset?url=${encodeURIComponent(assetUrl.toString())}`;
  }

  function blobToDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Failed to convert blob to data URL"));
      };
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });
  }

  function waitForImageReady(image: HTMLImageElement, timeoutMs = 1500) {
    if (image.complete && image.naturalWidth > 0) {
      return Promise.resolve("complete");
    }

    return new Promise<"load">((resolve, reject) => {
      const cleanup = () => {
        image.removeEventListener("load", handleLoad);
        image.removeEventListener("error", handleError);
        window.clearTimeout(timer);
      };

      const handleLoad = () => {
        cleanup();
        resolve("load");
      };

      const handleError = (event: Event) => {
        cleanup();
        reject(event);
      };

      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("image load timeout"));
      }, timeoutMs);

      image.addEventListener("load", handleLoad, { once: true });
      image.addEventListener("error", handleError, { once: true });
    });
  }

  async function createExportClone(source: HTMLElement) {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-10000px";
    wrapper.style.top = "0";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "-1";

    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.position = "relative";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.width = `${source.offsetWidth}px`;
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    return { clone, wrapper };
  }

  async function inlineCloneImages(container: HTMLElement) {
    const images = Array.from(container.querySelectorAll("img"));

    await Promise.all(
      images.map(async (image) => {
        const src = image.currentSrc || image.getAttribute("src");
        if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
        const requestUrl = resolveExportImageUrl(src);

        const response = await fetch(requestUrl, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${src}`);
        }

        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        image.src = dataUrl;
        image.removeAttribute("srcset");

        try {
          await waitForImageReady(image);
        } catch {}
      }),
    );

    return [];
  }

  async function exportImage() {
    if (!exportRef?.current || isExporting) return;

    let clone: HTMLElement | null = null;
    let cloneWrapper: HTMLElement | null = null;

    try {
      setIsExporting(true);
      setExportMessage(null);

      const exportClone = await createExportClone(exportRef.current);
      clone = exportClone.clone;
      cloneWrapper = exportClone.wrapper;
      await inlineCloneImages(clone);

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `random-pokemon-${seed}.png`;
      a.click();
      setTemporaryExportMessage("PNG exported");
    } catch (error) {
      console.error("Failed to export PNG", error);
      setTemporaryExportMessage("PNG export failed");
    } finally {
      cloneWrapper?.remove();
      setIsExporting(false);
    }
  }

  const textVersion = team.map((p, i) => `${i + 1}. ${p.name} (#${p.id}) — ${p.types.join("/")}`).join("\n");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => copy(shareUrl(), "link")}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90 md:text-xs"
      >
        {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied === "link" ? "Copied!" : "Share link"}
      </button>
      <button
        onClick={() => copy(textVersion, "text")}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold hover:bg-secondary md:text-xs"
      >
        {copied === "text" ? <Check className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
        {copied === "text" ? "Copied!" : "Copy text"}
      </button>
      {exportRef && (
        <button
          onClick={exportImage}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold hover:bg-secondary md:text-xs"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          {isExporting ? "Exporting..." : "Export PNG"}
        </button>
      )}
      <button
        onClick={() => setShowSave((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold hover:bg-secondary md:text-xs"
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
          className="flex flex-wrap items-center gap-2"
        >
          <input
            ref={saveRef}
            placeholder="Team name"
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] md:text-xs"
          />
          <button type="submit" className="rounded-full bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background md:text-xs">
            Save
          </button>
        </form>
      )}
      {copied === "saved" && <span className="text-xs text-success">Saved to Favorites</span>}
      {exportMessage && <span className="text-xs text-muted-foreground">{exportMessage}</span>}
    </div>
  );
}
