import React, { useState } from "react";
import { REEL_TEMPLATES } from "../../../templates/reel-templates";
import type { VideoReelTemplate } from "../../../templates/reel-types";
import { ReelPreview } from "../previews/ReelPreview";
import { ReelAssetPicker } from "../reel-picker/ReelAssetPicker";

export const ReelsTab: React.FC = () => {
  const [active, setActive] = useState<VideoReelTemplate | null>(null);

  if (active) {
    return <ReelAssetPicker template={active} onBack={() => setActive(null)} />;
  }

  return (
    <div className="flex flex-col gap-1.5 p-1">
      {REEL_TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => setActive(template)}
          className="flex flex-col items-stretch gap-1.5 px-2 py-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] text-left transition-colors"
        >
          <ReelPreview template={template} />
          <div className="flex items-baseline justify-between w-full gap-2">
            <span className="text-[11.5px] text-[var(--s-text)] font-medium">
              {template.label}
            </span>
            <span className="text-[9px] text-[var(--s-text-subtle)] font-mono">
              {template.tagline}
            </span>
          </div>
          <span className="text-[10px] text-[var(--s-text-subtle)] leading-snug">
            {template.description}
          </span>
        </button>
      ))}
    </div>
  );
};
