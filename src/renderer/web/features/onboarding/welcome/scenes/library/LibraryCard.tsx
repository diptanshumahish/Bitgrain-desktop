import React from "react";
import { showcaseTemplateSrc, type ShowcaseTemplate } from "../../../../landing/marketing/showcase-templates/showcase-templates";

interface LibraryCardProps {
  template: ShowcaseTemplate;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ template }) => (
  <img
    src={showcaseTemplateSrc(template)}
    alt={template.name}
    width={template.width}
    height={template.height}
    decoding="async"
    className="h-full w-auto shrink-0 rounded-lg object-cover shadow-[0_24px_48px_-20px_rgba(20,18,90,0.7)] ring-4 ring-white/15"
  />
);
