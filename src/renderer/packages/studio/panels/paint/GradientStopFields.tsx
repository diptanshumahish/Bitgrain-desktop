import React from "react";
import { Circle, Trash2 } from "lucide-react";
import type { PaintGradient } from "@bitgrain/studio-core/model/paint-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { ColorPicker } from "../../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { canRemoveStop, removeStop, updateStop } from "./gradient-stop-ops";
import { selectStop, selectedStopSignal } from "./gradient-stop-store";

const PERCENT = 100;

interface GradientStopFieldsProps {
  gradient: PaintGradient;
  onChange: (gradient: PaintGradient) => void;
}

export const GradientStopFields: React.FC<GradientStopFieldsProps> = ({ gradient, onChange }) => {
  const selected = useSignalValue(selectedStopSignal);
  const index = Math.min(selected, gradient.stops.length - 1);
  const stop = gradient.stops[index];
  if (!stop) return null;

  const remove = (): void => {
    onChange(removeStop(gradient, index));
    selectStop(Math.max(0, index - 1));
  };

  return (
    <div className="flex flex-col gap-2">
      <ColorPicker color={stop.color} onChange={(color) => onChange(updateStop(gradient, index, { color }))} />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_24px] gap-2 items-center">
        <ScrubField
          label="Stop"
          title="Where this color sits along the gradient"
          value={Math.round(stop.pos * PERCENT)}
          min={0}
          max={PERCENT}
          suffix="%"
          onChange={(value) => onChange(updateStop(gradient, index, { pos: value / PERCENT }))}
        />
        <ScrubField
          label={<Circle size={12} strokeWidth={1.75} />}
          title="Opacity of this color"
          value={Math.round(stop.opacity * PERCENT)}
          min={0}
          max={PERCENT}
          suffix="%"
          onChange={(value) => onChange(updateStop(gradient, index, { opacity: value / PERCENT }))}
        />
        {canRemoveStop(gradient) && (
          <HeaderIconButton title="Remove stop" onClick={remove}>
            <Trash2 size={12} strokeWidth={1.75} />
          </HeaderIconButton>
        )}
      </div>
    </div>
  );
};
