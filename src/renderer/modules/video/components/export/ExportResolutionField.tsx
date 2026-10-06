import React from "react";
import { RESOLUTION_PRESETS } from "../../constants";
import { updateProjectSettings } from "../../utils/edit-ops";
import { scaleToShortEdge, type FrameSize } from "../../engine/exporter/support/scale-to-short-edge";
import { emitModal } from "../../../../lib/event-bus";
import { SelectMenu, type SelectOption } from "../ui/SelectMenu";

interface ExportResolutionFieldProps {
  frame: FrameSize;
  maxShortEdge: number;
}

function presetShortEdge(preset: (typeof RESOLUTION_PRESETS)[number]): number {
  return Math.min(preset.width, preset.height);
}

function buildOptions(frame: FrameSize, maxShortEdge: number): SelectOption[] {
  const presetOptions = RESOLUTION_PRESETS.map((preset) => {
    const shortEdge = presetShortEdge(preset);
    const scaled = scaleToShortEdge(frame, shortEdge);
    const locked = shortEdge > maxShortEdge;
    return {
      value: String(shortEdge),
      label: `${preset.label} (${scaled.width}x${scaled.height})${locked ? " · pro" : ""}`,
    };
  });
  const currentShortEdge = String(Math.min(frame.width, frame.height));
  if (presetOptions.some((option) => option.value === currentShortEdge)) return presetOptions;
  return [
    { value: currentShortEdge, label: `Current (${frame.width}x${frame.height})` },
    ...presetOptions,
  ];
}

export const ExportResolutionField: React.FC<ExportResolutionFieldProps> = ({
  frame,
  maxShortEdge,
}) => {
  const handleChange = (next: string): void => {
    const shortEdge = Number(next);
    if (shortEdge > maxShortEdge) {
      emitModal({ type: "studio-payment" });
      return;
    }
    updateProjectSettings(scaleToShortEdge(frame, shortEdge));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono font-bold text-[var(--s-text-muted)]">
        Resolution
      </label>
      <SelectMenu
        value={String(Math.min(frame.width, frame.height))}
        ariaLabel="Resolution"
        onChange={handleChange}
        options={buildOptions(frame, maxShortEdge)}
        className="w-full"
      />
    </div>
  );
};
