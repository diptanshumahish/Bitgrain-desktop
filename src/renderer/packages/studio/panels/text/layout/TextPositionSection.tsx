import React from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { TextSizing } from "@bitgrain/studio-core/model/text-layout-types";
import { BtnGroup, ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { PanelGroup } from "../../../ui/panel-group";
import { AlignRow } from "../../../ui/align-row";
import { resolveTextSizing, sizingPatch } from "@bitgrain/studio-core/text/layout/text-sizing";

interface TextPositionSectionProps {
  layer: TextLayer;
  onChange: (updates: Partial<TextLayer>) => void;
  onAlign?: (alignment: string) => void;
}

const MIN_BOX_SIDE = 4;
const MAX_ROTATION = 360;

const SIZING_OPTIONS = [
  { label: "Auto width", value: "auto-width", title: "Box grows with the text on one line" },
  { label: "Auto height", value: "auto-height", title: "Fixed width, height follows the text" },
  { label: "Fixed", value: "fixed", title: "Box keeps its size" },
];

export const TextPositionSection: React.FC<TextPositionSectionProps> = ({ layer, onChange, onAlign }) => {
  const sizing = resolveTextSizing(layer);
  const onPath = Boolean(layer.textPath);
  const setHeight = (height: number): void =>
    onChange({ height, ...(sizing === "fixed" ? {} : sizingPatch("fixed")) });

  return (
    <PanelGroup title="Position & size">
      {onAlign && <AlignRow onAlign={onAlign} />}
      <div className="grid grid-cols-2 gap-2">
        <ScrubField label="X" value={layer.x} step={1} onChange={(v) => onChange({ x: v })} />
        <ScrubField label="Y" value={layer.y} step={1} onChange={(v) => onChange({ y: v })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ScrubField label="W" value={layer.width} min={MIN_BOX_SIDE} step={1} onChange={(v) => onChange({ width: v })} />
        <ScrubField label="H" value={layer.height} min={MIN_BOX_SIDE} step={1} disabled={sizing === "auto-width" && !onPath} onChange={setHeight} />
      </div>
      <ScrubField label="Rotate" value={layer.rotation ?? 0} min={-MAX_ROTATION} max={MAX_ROTATION} step={1} suffix="°" onChange={(v) => onChange({ rotation: v })} />
      {!onPath && (
        <BtnGroup options={SIZING_OPTIONS} value={sizing} onChange={(value) => onChange(sizingPatch(value as TextSizing))} />
      )}
    </PanelGroup>
  );
};
