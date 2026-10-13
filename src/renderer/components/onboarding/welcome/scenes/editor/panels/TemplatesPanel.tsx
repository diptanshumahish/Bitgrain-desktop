import React from "react";
import { useSignalValue } from "../../../../../../lib/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { POSTER_THUMBNAIL } from "../timeline/poster-template";
import { CURATED_TEMPLATES, curatedThumbnailUrl } from "../../library/curated-templates";

const OTHER_TEMPLATE_INDEXES = [0, 21, 10, 23, 13];

export const TemplatesPanel: React.FC = () => {
  const { loaded } = useSignalValue(editorFrameSignal);
  const others = OTHER_TEMPLATE_INDEXES.map((index) => CURATED_TEMPLATES[index]);

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[11px] text-white/40">Templates</p>
      <div className="grid grid-cols-3 gap-1">
        <span data-target="template" className={`relative overflow-hidden rounded-md ring-2 transition-all duration-300 ${loaded ? "ring-violet-500" : "ring-transparent"}`}>
          <img src={POSTER_THUMBNAIL} alt="Night Songs tour poster" className="aspect-[3/4] w-full object-cover" />
        </span>
        {others.map((template) => (
          <img key={template.id} src={curatedThumbnailUrl(template)} alt={template.name} className="aspect-[3/4] w-full rounded-md object-cover opacity-70" />
        ))}
      </div>
    </div>
  );
};
