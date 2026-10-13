import React, { useMemo } from "react";
import { TemplateThumbnail } from "../../../../templates/TemplateThumbnail";
import { AnimatedLayer } from "./AnimatedLayer";
import { LAYER_MOTIONS } from "./layer-motions";
import { buildFinalPoster, layersTemplate } from "./final-poster";
import type { PosterName } from "../editor/timeline/build-frame-template";

interface AnimatedPosterProps {
  name: PosterName;
}

export const AnimatedPoster: React.FC<AnimatedPosterProps> = ({ name }) => {
  const { firstName, lastName } = name;
  const poster = useMemo(() => buildFinalPoster({ firstName, lastName }), [firstName, lastName]);
  const backdrop = useMemo(() => ({ ...poster, layers: [] }), [poster]);

  return (
    <div className="relative aspect-[1240/1754] h-[min(500px,54vh)] shrink-0 overflow-hidden rounded-md shadow-2xl shadow-black/70 ring-1 ring-white/10">
      <div className="absolute inset-0">
        <TemplateThumbnail template={backdrop} />
      </div>
      {LAYER_MOTIONS.map((motion) => (
        <AnimatedLayer key={motion.rowId} motion={motion} template={layersTemplate(poster, motion.layerIds)} />
      ))}
    </div>
  );
};
