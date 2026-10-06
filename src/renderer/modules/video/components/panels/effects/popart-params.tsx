import React from "react";
import type { EffectParams } from "../../../types";
import { SliderRow } from "./SliderRow";
import { ColorPicker } from "../../../../../components/studio/ui/ColorPicker";
import { JitterControls } from "./filter-shared";

const POPART_PRESETS: { id: string; label: string; ink: string; paper: string }[] = [
  { id: "comic", label: "Comic", ink: "#dc2626", paper: "#0a0a0a" },
  { id: "noir", label: "Noir", ink: "#f5f0e6", paper: "#0a0a0a" },
  { id: "sun", label: "Sun", ink: "#facc15", paper: "#1e1b4b" },
  { id: "acid", label: "Acid", ink: "#22c55e", paper: "#1a1a1a" },
];

const DEFAULT_INK = "#dc2626";
const DEFAULT_PAPER = "#0a0a0a";

interface PopartParamsProps {
  params: EffectParams;
  onChange: (patch: Partial<EffectParams>) => void;
}

export const PopartParams: React.FC<PopartParamsProps> = ({ params, onChange }) => {
  const inkColor = params.popartInkColor ?? DEFAULT_INK;
  const paperColor = params.popartPaperColor ?? DEFAULT_PAPER;

  return (
    <>
      <div className="grid grid-cols-4 gap-1">
        {POPART_PRESETS.map((preset) => {
          const active =
            params.popartInkColor === preset.ink && params.popartPaperColor === preset.paper;
          return (
            <button
              key={preset.id}
              onClick={() => onChange({ popartInkColor: preset.ink, popartPaperColor: preset.paper })}
              className={`flex flex-col items-center gap-1 px-1 py-2 rounded-md border text-[9px] transition-colors ${
                active
                  ? "border-amber-400 bg-amber-400/10 text-white"
                  : "border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex gap-0.5">
                <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ background: preset.ink }} />
                <span className="w-2.5 h-2.5 rounded-full border border-white/10" style={{ background: preset.paper }} />
              </div>
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorPicker label="Ink" color={inkColor} onChange={(c) => onChange({ popartInkColor: c })} />
        <ColorPicker label="Paper" color={paperColor} onChange={(c) => onChange({ popartPaperColor: c })} />
      </div>
      <SliderRow label="Dot size" min={2} max={28} step={1} unit="px" value={params.popartCell ?? 2} onChange={(v) => onChange({ popartCell: v })} />
      <SliderRow label="Angle" min={0} max={90} step={5} unit="°" value={params.popartAngle ?? 30} onChange={(v) => onChange({ popartAngle: v })} />
      <SliderRow label="Threshold" min={0.1} max={0.9} step={0.05} value={params.popartThreshold ?? 0.55} onChange={(v) => onChange({ popartThreshold: v })} />
      <SliderRow label="Grain" min={0} max={1} step={0.05} value={params.popartGrain ?? 0.35} onChange={(v) => onChange({ popartGrain: v })} />
      <SliderRow label="Spatter" min={0} max={1} step={0.05} value={params.popartSpatter ?? 0.45} onChange={(v) => onChange({ popartSpatter: v })} />
      <JitterControls
        hz={params.popartJitterHz ?? 30}
        auto={params.popartJitterAuto ?? false}
        onChangeHz={(v) => onChange({ popartJitterHz: v })}
        onToggleAuto={() => onChange({ popartJitterAuto: !(params.popartJitterAuto ?? false) })}
      />
    </>
  );
};
