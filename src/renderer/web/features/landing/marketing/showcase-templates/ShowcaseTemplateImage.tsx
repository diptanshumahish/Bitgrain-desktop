import React from "react";
import { showcaseTemplateSrc, type ShowcaseTemplate } from "./showcase-templates";

interface ShowcaseTemplateImageProps {
  template: ShowcaseTemplate;
  alt: string;
}

export const ShowcaseTemplateImage: React.FC<ShowcaseTemplateImageProps> = ({ template, alt }) => (
  <img
    src={showcaseTemplateSrc(template)}
    width={template.width}
    height={template.height}
    alt={alt}
    loading="lazy"
    decoding="async"
    className="absolute inset-0 h-full w-full object-cover"
  />
);
