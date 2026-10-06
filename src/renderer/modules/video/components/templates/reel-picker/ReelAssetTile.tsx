import React from "react";
import { Film, Image as ImageIcon } from "lucide-react";
import type { MediaAsset } from "../../../types";

interface ReelAssetTileProps {
  asset: MediaAsset;
  selectionIndex: number | null;
  onToggle: () => void;
}

export const ReelAssetTile: React.FC<ReelAssetTileProps> = ({
  asset,
  selectionIndex,
  onToggle,
}) => {
  const selected = selectionIndex !== null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${selected ? "Remove" : "Add"} ${asset.name}`}
      className={`relative aspect-square rounded-md overflow-hidden border ${
        selected
          ? "border-[var(--s-accent)] outline outline-2 outline-[var(--s-accent)] -outline-offset-2"
          : "border-[var(--s-border)] hover:border-[var(--s-text-muted)]"
      } transition-colors`}
    >
      {asset.thumbnailDataUrl ? (
        <img
          src={asset.thumbnailDataUrl}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-subtle)]">
          {asset.kind === "video" ? <Film size={14} /> : <ImageIcon size={14} />}
        </div>
      )}
      {selected && (
        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[var(--s-accent)] flex items-center justify-center text-[10px] font-bold text-[var(--s-accent-text)]">
          {selectionIndex! + 1}
        </div>
      )}
      <div className="absolute bottom-1 right-1 px-1 py-px rounded bg-black/70 text-[8.5px] text-white/85 font-mono">
        {asset.kind === "video" ? "VID" : "IMG"}
      </div>
    </button>
  );
};
