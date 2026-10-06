import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Plugin, PluginAsset } from "./types";
import { resolveAssetUrl, searchPluginAssets } from "./api";
import { PLUGIN_DRAG_MIME, emitInsertImage } from "./plugin-bus";

const SEARCH_DEBOUNCE_MS = 200;
const PAGE_SIZE = 60;

interface AssetBrowserProps {
  plugin: Plugin;
}

export const AssetBrowser: React.FC<AssetBrowserProps> = ({ plugin }) => {
  const facets = plugin.manifest.search?.facets ?? [];
  const primaryFacet = facets[0];

  const [query, setQuery] = useState("");
  const [activeFacetValue, setActiveFacetValue] = useState<string>(
    primaryFacet?.values[0] ?? "",
  );
  const [items, setItems] = useState<PluginAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      searchPluginAssets(
        plugin.slug,
        {
          q: query.trim(),
          kind: primaryFacet ? activeFacetValue : undefined,
          limit: PAGE_SIZE,
          offset: 0,
        },
        ctrl.signal,
      )
        .then((res) => {
          setItems(res.items);
          setTotal(res.total);
        })
        .finally(() => setLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [plugin.slug, query, activeFacetValue, primaryFacet]);

  const columns = plugin.manifest.ui?.columns ?? 3;
  const gridStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }),
    [columns],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-[var(--s-border)] space-y-2 shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[var(--s-bg-input)] border border-[var(--s-border)]">
          <Search className="w-3.5 h-3.5 text-[var(--s-text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${plugin.name.toLowerCase()}...`}
            className="flex-1 bg-transparent outline-none text-[12px] text-[var(--s-text)] placeholder:text-[var(--s-text-muted)]"
          />
        </div>
        {primaryFacet && (
          <div className="flex flex-wrap gap-1.5">
            {primaryFacet.values.map((value) => (
              <button
                key={value}
                onClick={() => setActiveFacetValue(value)}
                className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                  activeFacetValue === value
                    ? "bg-[var(--s-bg-active)] border-[var(--s-border-strong)] text-[var(--s-text)]"
                    : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        )}
        <div className="text-[10px] text-[var(--s-text-muted)]">
          {loading ? "Searching..." : `${total} result${total === 1 ? "" : "s"}`}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2">
        {items.length === 0 && !loading ? (
          <div className="text-[11px] text-[var(--s-text-muted)] text-center py-8">
            No matches.
          </div>
        ) : (
          <div className="grid gap-2" style={gridStyle}>
            {items.map((asset) => (
              <AssetTile key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface AssetTileProps {
  asset: PluginAsset;
}

const AssetTile: React.FC<AssetTileProps> = ({ asset }) => {
  const src = resolveAssetUrl(asset.url);

  const handleClick = () => {
    emitInsertImage({
      src,
      name: asset.name,
      width: asset.width ?? undefined,
      height: asset.height ?? undefined,
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    const payload = {
      src,
      name: asset.name,
      width: asset.width,
      height: asset.height,
    };
    e.dataTransfer.setData(PLUGIN_DRAG_MIME, JSON.stringify(payload));
    e.dataTransfer.setData("text/uri-list", src);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <button
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      title={asset.name}
      className="aspect-square rounded border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:border-[var(--s-border-strong)] transition-colors flex items-center justify-center p-2 group"
    >
      <img
        src={src}
        alt={asset.name}
        loading="lazy"
        draggable={false}
        className="max-w-full max-h-full object-contain pointer-events-none"
      />
    </button>
  );
};
