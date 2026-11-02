import React, { useEffect, useRef } from "react";
import type { GradientKind, PaintGradient } from "@bitgrain/studio-core/model/paint-types";
import { BtnGroup } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { startGradientEdit, stopGradientEdit } from "../../gradient-handles/gradient-edit-store";
import { changeGradientKind, type PanelBox } from "./gradient-defaults";
import { GradientStopBar } from "./GradientStopBar";
import { GradientStopFields } from "./GradientStopFields";

const KIND_OPTIONS: { value: GradientKind; label: string; title: string }[] = [
  { value: "linear", label: "Linear", title: "Linear gradient" },
  { value: "radial", label: "Radial", title: "Radial gradient" },
  { value: "angular", label: "Angular", title: "Angular gradient" },
  { value: "diamond", label: "Diamond", title: "Diamond gradient" },
];

interface GradientEditorProps {
  layerId: string;
  gradient: PaintGradient;
  box: PanelBox;
  onChange: (gradient: PaintGradient) => void;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({ layerId, gradient, box, onChange }) => {
  const applyRef = useRef(onChange);

  useEffect(() => {
    applyRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    startGradientEdit({ layerId, apply: (next) => applyRef.current(next) });
    return () => stopGradientEdit(layerId);
  }, [layerId]);

  return (
    <div className="flex flex-col gap-2.5">
      <BtnGroup
        options={KIND_OPTIONS}
        value={gradient.kind}
        onChange={(value) => onChange(changeGradientKind(gradient, value as GradientKind, box))}
      />
      <GradientStopBar gradient={gradient} onChange={onChange} />
      <GradientStopFields gradient={gradient} onChange={onChange} />
      <span className="text-[12px] text-[var(--s-text-subtle)]">Drag the handles on the canvas to move the gradient</span>
    </div>
  );
};
