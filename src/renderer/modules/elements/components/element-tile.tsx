import React from "react";
import { resolveAssetUrl } from "../../../lib/api-client";
import { fetchElementDetail } from "../elements-api";
import type { ElementCard } from "../element-types";
import { ELEMENT_DRAG_MIME, emitInsertElement } from "../insert/element-insert-events";

interface ElementTileProps {
  element: ElementCard;
  fullRow?: boolean;
}

const prefetch = (element: ElementCard): void => {
  void fetchElementDetail(element.id);
};

const startDrag = (event: React.DragEvent<HTMLButtonElement>, element: ElementCard): void => {
  event.dataTransfer.setData(ELEMENT_DRAG_MIME, element.id);
  event.dataTransfer.effectAllowed = "copy";
  const image = event.currentTarget.querySelector("img");
  if (image) event.dataTransfer.setDragImage(image, image.width / 2, image.height / 2);
};

export const ElementTile: React.FC<ElementTileProps> = ({ element, fullRow = false }) => {
  const thumbnail = resolveAssetUrl(element.thumbnail);
  return (
    <button
      type="button"
      draggable
      title={`${element.name}, click to add or drag onto the page`}
      aria-label={`Add ${element.name}`}
      onMouseEnter={() => prefetch(element)}
      onFocus={() => prefetch(element)}
      onDragStart={(event) => startDrag(event, element)}
      onClick={() => emitInsertElement({ elementId: element.id, drop: null })}
      className={`h-[76px] rounded-md bg-[var(--s-bg-input)] flex items-center justify-center p-2 cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-[var(--s-text)] focus-visible:ring-2 focus-visible:ring-[var(--s-accent)] outline-none transition-shadow ${
        fullRow ? "col-span-3" : ""
      }`}
    >
      {thumbnail && (
        <img src={thumbnail} alt="" loading="lazy" draggable={false} className="max-w-full max-h-full object-contain pointer-events-none" />
      )}
    </button>
  );
};
