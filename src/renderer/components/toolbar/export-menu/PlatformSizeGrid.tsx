import React from "react";
import { triggerPlatformDownload } from "../../../pages/home-page/download-handlers";
import { PLATFORM_PRESETS } from "../platform-presets";
import { resolveExportPlan } from "../../../lib/plan-gate/resolve-export-plan";

interface PlatformSizeGridProps {
  transparent: boolean;
  onClose: () => void;
}

type PlatformPreset = (typeof PLATFORM_PRESETS)[number];

const downloadForPlatform = async (preset: PlatformPreset, transparent: boolean): Promise<void> => {
  const plan = await resolveExportPlan();
  if (!plan) return;
  await triggerPlatformDownload({
    presetId: preset.id,
    format: preset.format,
    targetWidth: preset.width,
    targetHeight: preset.height,
    transparent,
    plan,
  });
};

export const PlatformSizeGrid: React.FC<PlatformSizeGridProps> = ({ transparent, onClose }) => (
  <div className="px-2 pt-1 pb-1.5">
    <p className="text-[11px] text-[var(--s-text-subtle)] mb-1.5">sized for social and music platforms</p>
    <div className="grid grid-cols-2 gap-1">
      {PLATFORM_PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => {
            onClose();
            void downloadForPlatform(preset, transparent);
          }}
          className="flex flex-col items-start px-2 py-1.5 rounded-md text-left hover:bg-[var(--s-bg-input-hover)] transition-colors"
        >
          <span className="text-[11px] text-[var(--s-text)]">{preset.label}</span>
          <span className="text-[9px] text-[var(--s-text-subtle)]">{preset.sub}</span>
        </button>
      ))}
    </div>
  </div>
);
