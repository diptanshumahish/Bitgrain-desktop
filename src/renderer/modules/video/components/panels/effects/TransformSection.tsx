import React from "react";
import { Plus } from "lucide-react";
import type {
  EffectApplication,
  EffectClip,
  EffectParams,
} from "../../../types";
import { interpolateKeyframes } from "../../../utils/keyframes";
import { addSpatialKeyframeAtPlayhead } from "../../../utils/edit-ops";
import { SliderRow } from "./SliderRow";

const MOTION_PRESETS = [
  { id: "none", label: "Static" },
  { id: "zoom-in", label: "Zoom In" },
  { id: "zoom-out", label: "Zoom Out" },
  { id: "pan-left", label: "Pan Left" },
  { id: "pan-right", label: "Pan Right" },
] as const;

interface TransformSectionProps {
  fx: EffectApplication;
  clip: EffectClip;
  localTime: number;
  onChange: (patch: Partial<EffectParams>) => void;
}

export const TransformSection: React.FC<TransformSectionProps> = ({
  fx,
  clip,
  localTime,
  onChange,
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px]   text-zinc-400    ">Spatial Controls</p>
        <button
          onClick={addSpatialKeyframeAtPlayhead}
          className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[9px] font-medium transition-colors"
        >
          <Plus size={10} />
          Add Keyframe
        </button>
      </div>
      <SliderRow
        label="Zoom / Scale"
        min={0.1}
        max={5}
        step={0.01}
        unit="x"
        value={interpolateKeyframes(
          clip.keyframes?.scale,
          localTime,
          fx.params.scale ?? 1,
        )}
        onChange={(v) => onChange({ scale: v })}
      />
      <SliderRow
        label="Rotation"
        min={-180}
        max={180}
        step={1}
        unit="°"
        value={interpolateKeyframes(
          clip.keyframes?.rotation,
          localTime,
          fx.params.rotation ?? 0,
        )}
        onChange={(v) => onChange({ rotation: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <SliderRow
          label="Pos X"
          min={-1}
          max={1}
          step={0.01}
          value={interpolateKeyframes(
            clip.keyframes?.x,
            localTime,
            fx.params.x ?? 0,
          )}
          onChange={(v) => onChange({ x: v })}
        />
        <SliderRow
          label="Pos Y"
          min={-1}
          max={1}
          step={0.01}
          value={interpolateKeyframes(
            clip.keyframes?.y,
            localTime,
            fx.params.y ?? 0,
          )}
          onChange={(v) => onChange({ y: v })}
        />
      </div>
      <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
        <p className="text-[10px]   text-zinc-400 mb-1">Motion Preset</p>
        <div className="grid grid-cols-2 gap-1">
          {MOTION_PRESETS.map((anim) => (
            <button
              key={anim.id}
              onClick={() => onChange({ animation: anim.id })}
              className={`px-2 py-2 rounded-md border text-[10px]   transition-colors ${
                (fx.params.animation ?? "none") === anim.id
                  ? "border-amber-400 bg-amber-400/10 text-white"
                  : "border-white/10 text-zinc-500 hover:text-white"
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
