import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { editorFrameSignal } from "../timeline/editor-frame-store";
import { POSTER_TEMPLATE } from "../timeline/poster-template";
import { TemplateThumbnail } from "@bitgrain/studio/templates/TemplateThumbnail";
import { showcaseTemplate, showcaseTemplateSrc } from "../../../../../landing/marketing/showcase-templates/showcase-templates";

const OTHER_TEMPLATE_SLUGS = ["open-call-zine", "sazanami-koi-pond", "grid-conference", "still-water-retreat", "paper-faces"];

export const TemplatesPanel: React.FC = () => {
  const { loaded } = useSignalValue(editorFrameSignal);
  const others = OTHER_TEMPLATE_SLUGS.map(showcaseTemplate);

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[11px] text-white/40">Templates</p>
      <div className="grid grid-cols-3 gap-1">
        <span data-target="template" className={`relative aspect-[3/4] overflow-hidden rounded-md ring-2 transition-all duration-300 ${loaded ? "ring-violet-500" : "ring-transparent"}`}>
          <TemplateThumbnail template={POSTER_TEMPLATE} />
        </span>
        {others.map((template) => (
          <img key={template.slug} src={showcaseTemplateSrc(template)} alt={template.name} className="aspect-[3/4] w-full rounded-md object-cover opacity-70" />
        ))}
      </div>
    </div>
  );
};
