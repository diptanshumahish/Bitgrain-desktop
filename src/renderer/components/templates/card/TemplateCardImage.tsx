import React from "react";
import { resolveAssetUrl } from "../../../lib/api-client";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";

type ImageTemplate = Pick<TemplateSummary, "name" | "width" | "height" | "thumbnail">;

interface TemplateCardImageProps {
  template: ImageTemplate;
  eager?: boolean;
  fill?: boolean;
}

const MissingThumbnail: React.FC<{ name: string }> = ({ name }) => (
  <div className="flex h-full w-full items-center justify-center bg-zinc-100 p-4 text-center dark:bg-zinc-900">
    <span className="line-clamp-3 text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">{name}</span>
  </div>
);

export const TemplateCardImage: React.FC<TemplateCardImageProps> = ({ template, eager = false, fill = false }) => {
  const source = resolveAssetUrl(template.thumbnail);
  const sizing = fill ? "h-full w-full" : "w-full";
  return (
    <div
      className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 ${sizing}`}
      style={fill ? undefined : { aspectRatio: `${template.width} / ${template.height}` }}
    >
      {source ? (
        <img
          src={source}
          alt={template.name}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <MissingThumbnail name={template.name} />
      )}
    </div>
  );
};
