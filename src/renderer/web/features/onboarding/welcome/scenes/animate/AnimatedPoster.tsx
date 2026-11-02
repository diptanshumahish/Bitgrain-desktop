import React, { useMemo } from "react";
import { TemplateThumbnail } from "@bitgrain/studio/templates/TemplateThumbnail";
import { AnimatedLayer } from "./AnimatedLayer";
import { WELCOME_FRAME_CLASS } from "../../chrome/welcome-classes";
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
    <div className={`shrink-0 -rotate-1 ${WELCOME_FRAME_CLASS}`}>
      <div className="relative aspect-[4/5] h-[min(480px,50vh)] overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <TemplateThumbnail template={backdrop} />
        </div>
        {LAYER_MOTIONS.map((motion) => (
          <AnimatedLayer key={motion.rowId} motion={motion} template={layersTemplate(poster, motion.layerIds)} />
        ))}
      </div>
    </div>
  );
};
