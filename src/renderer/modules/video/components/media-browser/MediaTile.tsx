import React from "react";
import { Film, Music, Image as ImageIcon } from "lucide-react";
import type { MediaAsset } from "../../types";
import { formatShortTime } from "../../utils/time-format";
import { addAssetToTimeline } from "../../utils/add-clip-to-timeline";
import { MEDIA_ASSET_DRAG_TYPE } from "../../utils/drag-types";

interface MediaTileProps {
  asset: MediaAsset;
}

const KIND_ICON = {
  video: <Film size={12} />,
  audio: <Music size={12} />,
  image: <ImageIcon size={12} />,
};

export const MediaTile: React.FC<MediaTileProps> = ({ asset }) => (
  <button
    draggable
    onDragStart={(e) => {
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData(MEDIA_ASSET_DRAG_TYPE, asset.id);
      e.dataTransfer.setData("text/plain", asset.name);
    }}
    onDoubleClick={() => addAssetToTimeline(asset)}
    onClick={() => addAssetToTimeline(asset)}
    className="group text-left w-full"
    aria-label={`Add ${asset.name} to timeline`}
  >
    <div className="aspect-square rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] overflow-hidden relative">
      {asset.thumbnailDataUrl ? (
        <img
          src={asset.thumbnailDataUrl}
          alt={asset.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[var(--s-text-subtle)]">
          {KIND_ICON[asset.kind]}
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
      {asset.duration > 0 && (
        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[8px] text-white/80">
          {formatShortTime(asset.duration)}
        </div>
      )}
      <div className="absolute top-1 left-1 w-4 h-4 rounded bg-black/60 flex items-center justify-center text-white/80">
        {KIND_ICON[asset.kind]}
      </div>
    </div>
    <p className="mt-1 text-[10px] text-[var(--s-text-muted)] truncate">{asset.name}</p>
  </button>
);
