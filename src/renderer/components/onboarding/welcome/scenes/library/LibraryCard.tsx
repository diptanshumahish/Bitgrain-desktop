import React from "react";
import { curatedThumbnailUrl, type CuratedTemplate } from "./curated-templates";

interface LibraryCardProps {
  template: CuratedTemplate;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ template }) => (
  <img
    src={curatedThumbnailUrl(template)}
    alt={template.name}
    width={template.width}
    height={template.height}
    decoding="async"
    className="h-full w-auto shrink-0 rounded-lg object-cover shadow-2xl shadow-black/60 ring-1 ring-white/10"
  />
);
