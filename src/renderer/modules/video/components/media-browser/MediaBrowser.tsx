import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useSignalValue } from "../../../../lib/signal";
import { currentProjectSignal, updateProject } from "../../store/project-store";
import { importMediaFiles } from "../../utils/import-media";
import { MediaImporter } from "./MediaImporter";
import { MediaTile } from "./MediaTile";
import { trackEvent } from "../../../../lib/tracker";

interface MediaBrowserProps {
  width: number;
}

export const MediaBrowser: React.FC<MediaBrowserProps> = ({ width }) => {
  const project = useSignalValue(currentProjectSignal);
  const assets = useMemo(() => project?.mediaPool ?? [], [project?.mediaPool]);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((asset) => asset.name.toLowerCase().includes(q));
  }, [assets, query]);

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    setImporting(true);
    try {
      const newAssets = await importMediaFiles(files);
      if (newAssets.length === 0) return;
      updateProject((p) => ({ ...p, mediaPool: [...p.mediaPool, ...newAssets] }));
      trackEvent("video", "media_imported", { details: { count: newAssets.length } });
    } finally {
      setImporting(false);
    }
  };

  const hasAssets = assets.length > 0;
  const isEmptyResult = hasAssets && filtered.length === 0;

  return (
    <aside
      style={{ width }}
      className={`shrink-0 flex flex-col bg-[var(--s-bg-panel)] border-r border-[var(--s-border)] transition-colors ${
        dragOver ? "bg-[var(--s-accent-soft)]" : ""
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="h-11 shrink-0 flex items-center justify-between gap-2 px-3 border-b border-[var(--s-border)]">
        <div className="flex items-center gap-2 min-w-0">
          <MediaImporter iconOnly />
          <span className="text-[12px] font-semibold text-[var(--s-text)]  ">Media</span>
          <span className="text-[10.5px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums]">
            {assets.length}
          </span>
        </div>
      </div>

      {hasAssets && (
        <div className="px-3 py-2 border-b border-[var(--s-border)]">
          <div className="relative">
            <Search
              size={11}
              strokeWidth={1.75}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--s-text-subtle)] pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search media"
              className="h-7 w-full pl-7 pr-7 rounded-md bg-[var(--s-bg-input)] text-[11.5px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)] focus:outline-none focus:bg-[var(--s-bg-input-hover)] transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
              >
                <X size={10} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {importing && assets.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[11px] text-[var(--s-text-muted)]">
            Importing…
          </div>
        ) : !hasAssets ? (
          <MediaImporter />
        ) : isEmptyResult ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-2">
            <p className="text-[11.5px] font-medium text-[var(--s-text)]">No matches</p>
            <p className="text-[10.5px] text-[var(--s-text-subtle)]">
              Nothing in this project matches "{query}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((asset) => (
              <MediaTile key={asset.id} asset={asset} />
            ))}
            {importing && (
              <div className="aspect-square rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] animate-pulse" />
            )}
          </div>
        )}
      </div>

      <div className="h-7 shrink-0 flex items-center justify-between px-3 border-t border-[var(--s-border)]">
        <p className="text-[10.5px] text-[var(--s-text-subtle)]">
          {dragOver ? "Drop to import" : "Drag files in to import"}
        </p>
        {hasAssets && (
          <p className="text-[10.5px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums]">
            {filtered.length} of {assets.length}
          </p>
        )}
      </div>
    </aside>
  );
};
