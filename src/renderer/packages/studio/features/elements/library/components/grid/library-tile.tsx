import React from "react";
import { Plus } from "lucide-react";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { fetchElementDetail } from "../../../elements-api";
import { isWideElement } from "../../../element-shape";
import { kindLabel } from "../../../element-kinds";
import type { ElementCard } from "../../../element-types";
import { addLibraryElement } from "../../add-library-element";

interface LibraryTileProps {
  element: ElementCard;
  collectionName: string;
}

export const LibraryTile: React.FC<LibraryTileProps> = ({ element, collectionName }) => {
  const thumbnail = resolveAssetUrl(element.thumbnail);
  const subtitle = collectionName ? `${kindLabel(element.kind)}, ${collectionName}` : kindLabel(element.kind);
  return (
    <button
      type="button"
      title={element.description || element.name}
      aria-label={`Add ${element.name} to the page`}
      onMouseEnter={() => void fetchElementDetail(element.id)}
      onFocus={() => void fetchElementDetail(element.id)}
      onClick={() => addLibraryElement(element)}
      className={`group flex flex-col gap-2 text-left outline-none ${isWideElement(element) ? "col-span-2" : ""}`}
    >
      <span className="relative h-36 w-full flex items-center justify-center p-4 rounded-lg bg-[var(--s-bg-input)] ring-1 ring-transparent group-hover:ring-[var(--s-border-hover)] group-focus-visible:ring-2 group-focus-visible:ring-[var(--s-accent)] transition-shadow">
        {thumbnail && (
          <img src={thumbnail} alt="" loading="lazy" draggable={false} className="max-w-full max-h-full object-contain pointer-events-none" />
        )}
        <span className="absolute right-2 bottom-2 h-6 flex items-center gap-1 px-2 rounded-md bg-[var(--s-accent)] text-[10.5px] font-semibold text-[var(--s-accent-text)] opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all">
          <Plus size={11} strokeWidth={2.5} />
          Add
        </span>
      </span>
      <span className="flex flex-col min-w-0 px-0.5">
        <span className="truncate text-[12px] font-medium text-[var(--s-text)]">{element.name}</span>
        <span className="truncate text-[11px] text-[var(--s-text-subtle)]">{subtitle}</span>
      </span>
    </button>
  );
};
