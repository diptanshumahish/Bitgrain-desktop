import React from "react";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { TemplateThumbnail } from "../../../templates/TemplateThumbnail";
import type { ComponentContainer } from "@bitgrain/studio-core/components/tree/layer-walk";

const TILE_ASPECT = 1.6;
const FULL_PERCENT = 100;
const TRANSPARENT = "transparent";

interface ComponentPreviewProps {
  main: ComponentContainer;
}

const previewTemplate = (main: ComponentContainer): TemplateDef => ({
  id: `component-preview-${main.id}`,
  name: main.name,
  category: "poster",
  width: main.width,
  height: main.height,
  background: main.type === "frame" ? main.background : TRANSPARENT,
  exportScale: 1,
  layers: main.layers,
});

const previewWidthPercent = (main: ComponentContainer): number => {
  if (main.height <= 0) return FULL_PERCENT;
  return Math.min(FULL_PERCENT, (main.width / main.height / TILE_ASPECT) * FULL_PERCENT);
};

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({ main }) => (
  <div className="w-full aspect-[1.6] rounded-md bg-[var(--s-bg-input)] flex items-center justify-center overflow-hidden p-2 pointer-events-none">
    <div style={{ width: `${previewWidthPercent(main)}%` }}>
      <TemplateThumbnail template={previewTemplate(main)} />
    </div>
  </div>
);
