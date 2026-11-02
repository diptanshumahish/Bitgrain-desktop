import React from "react";
import { Blend, Circle } from "lucide-react";
import type { BlendMode } from "@bitgrain/studio-core/model/studio-types";
import type { LayerFill, LayerFillKind } from "@bitgrain/studio-core/model/layer-paint-types";
import { ColorPicker } from "../../ui/ColorPicker";
import { Dropdown } from "../../ui/dropdown";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { BLEND_MODE_OPTIONS, BLEND_MODE_HINT } from "../../ui/blend-modes";
import { GradientEditor } from "../paint/GradientEditor";
import type { PanelBox } from "../paint/gradient-defaults";
import { switchFillKind } from "./paint-defaults";
import { PaintRowControls } from "./PaintRowControls";
import { ImageFillFields } from "./ImageFillFields";
import { GrainFillFields } from "./GrainFillFields";

const PERCENT = 100;

const KIND_OPTIONS: { label: string; value: LayerFillKind }[] = [
  { label: "Solid", value: "solid" },
  { label: "Gradient", value: "gradient" },
  { label: "Image", value: "image" },
  { label: "Grain", value: "grain" },
];

interface FillItemProps {
  fill: LayerFill;
  index: number;
  count: number;
  box: PanelBox;
  layerId: string;
  pageImage: string | null;
  onChange: (fill: LayerFill) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}

const KindFields: React.FC<Pick<FillItemProps, "fill" | "box" | "layerId" | "pageImage" | "onChange">> = ({ fill, box, layerId, pageImage, onChange }) => {
  if (fill.kind === "gradient" && fill.gradient) {
    return <GradientEditor layerId={layerId} gradient={fill.gradient} box={box} onChange={(gradient) => onChange({ ...fill, gradient })} />;
  }
  if (fill.kind === "image") return <ImageFillFields image={fill.image} pageImage={pageImage} onChange={(image) => onChange({ ...fill, image })} />;
  if (fill.kind === "grain") return <GrainFillFields grain={fill.grain} onChange={(grain) => onChange({ ...fill, grain })} />;
  return <ColorPicker color={fill.color} onChange={(color) => onChange({ ...fill, color })} />;
};

export const FillItem: React.FC<FillItemProps> = ({ fill, index, count, box, layerId, pageImage, onChange, onMove, onRemove }) => (
  <div className={`flex flex-col gap-2 rounded-lg border border-[var(--s-border)] p-2 ${fill.visible ? "" : "opacity-50"}`}>
    <div className="flex items-center gap-1.5">
      <div className="flex-1 min-w-0">
        <Dropdown options={KIND_OPTIONS} value={fill.kind} onChange={(kind) => onChange(switchFillKind(fill, kind as LayerFillKind, box))} />
      </div>
      <PaintRowControls
        visible={fill.visible}
        canMoveUp={index < count - 1}
        canMoveDown={index > 0}
        onToggleVisible={() => onChange({ ...fill, visible: !fill.visible })}
        onMoveUp={() => onMove(1)}
        onMoveDown={() => onMove(-1)}
        onRemove={onRemove}
      />
    </div>
    <KindFields fill={fill} box={box} layerId={layerId} pageImage={pageImage} onChange={onChange} />
    <div className="grid grid-cols-2 gap-2">
      <ScrubField
        label={<Circle size={12} strokeWidth={1.75} />}
        title="Fill opacity"
        value={Math.round(fill.opacity * PERCENT)}
        min={0}
        max={PERCENT}
        suffix="%"
        onChange={(value) => onChange({ ...fill, opacity: value / PERCENT })}
      />
      <Dropdown
        icon={<Blend size={13} strokeWidth={1.75} />}
        options={BLEND_MODE_OPTIONS}
        title={BLEND_MODE_HINT}
        value={fill.blendMode ?? "normal"}
        onChange={(mode) => onChange({ ...fill, blendMode: mode === "normal" ? undefined : (mode as BlendMode) })}
      />
    </div>
  </div>
);
