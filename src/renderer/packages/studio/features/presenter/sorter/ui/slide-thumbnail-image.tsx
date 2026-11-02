import React, { useEffect } from "react";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { readThumbnail, requestThumbnail, thumbnailVersionSignal } from "../slide-thumbnails";

interface SlideThumbnailImageProps {
  page: TemplatePage;
  template: TemplateDef;
}

export const SlideThumbnailImage: React.FC<SlideThumbnailImageProps> = ({ page, template }) => {
  useSignalValue(thumbnailVersionSignal);
  useEffect(() => requestThumbnail(template, page), [template, page]);
  const thumbnail = readThumbnail(page);

  if (thumbnail.status === "ready") {
    return <img src={thumbnail.src} alt="" draggable={false} className="max-w-full max-h-full object-contain " />;
  }
  return (
    <span className="text-[11px] text-[var(--s-text-subtle)]">
      {thumbnail.status === "failed" ? "Preview unavailable" : "Rendering…"}
    </span>
  );
};
