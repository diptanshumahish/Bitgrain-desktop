import React from "react";
import type { ImageLayer } from "../../../data/studioTypes";
import { resolveAssetUrl } from "../../../lib/api-client";
import { emitModal } from "../../../lib/event-bus";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { AppearanceControls } from "./appearance-controls";
import { BitgrainEffectControls } from "./BitgrainEffectControls";
import { ShadowGlowControls } from "./shadow-glow-controls";
import { MatchPageButton } from "./match-page-button";

interface ImagePropertiesProps {
  layer: ImageLayer;
  onChange: (updates: Partial<ImageLayer>) => void;
  onUpload?: (dataUrl: string) => void;
  onAlign?: (alignment: string) => void;
  onMatchPage?: () => void;
}

export const ImageProperties: React.FC<ImagePropertiesProps> = ({
  layer,
  onChange,
  onUpload,
  onAlign,
  onMatchPage,
}) => {
  const openPicker = () => {
    emitModal({
      type: "add-image",
      title: layer.src ? "Replace image" : "Choose image",
      onPick: (src) => {
        if (onUpload) onUpload(src);
        onChange({ src } as Partial<ImageLayer>);
      },
    });
  };

  return (
    <div className="flex flex-col font-editorial pb-6">
      <PanelGroup title="Position & Size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation ?? 0,
            borderRadius: layer.borderRadius ?? 0,
          }}
          onChange={onChange}
        />
        {onMatchPage && <MatchPageButton onClick={onMatchPage} />}
      </PanelGroup>

      <PanelGroup title="Appearance">
        <button
          type="button"
          onClick={openPicker}
          className="w-full flex items-center gap-3 p-2 bg-[var(--s-bg-input)] rounded-lg border border-[var(--s-border)] hover:border-[var(--s-accent)] transition-colors cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-md border border-[var(--s-border)] overflow-hidden flex items-center justify-center shrink-0 bg-[var(--s-bg-panel)] text-[var(--s-text-muted)]">
            {layer.src ? (
              <img
                src={resolveAssetUrl(layer.src) ?? layer.src}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            )}
          </div>
          <span className="flex-1 min-w-0 text-[11.5px] text-[var(--s-text)]">
            {layer.src ? "replace image" : "choose image"}
          </span>
        </button>

        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          filters={layer.filters}
          onOpacityChange={(opacity) => onChange({ opacity })}
          onBlendModeChange={(blendMode) => onChange({ blendMode })}
          onFiltersChange={(filters) => onChange({ filters })}
        />
      </PanelGroup>

      <PanelGroup title="Image effects">
        <BitgrainEffectControls
          effect={layer.bitgrainEffect}
          onChange={(effect) => onChange({ bitgrainEffect: effect })}
        />
      </PanelGroup>

      <PanelGroup title="Shadow & glow">
        <ShadowGlowControls
          shadow={layer.shadow}
          onChange={(shadow) => onChange({ shadow })}
        />
      </PanelGroup>
    </div>
  );
};
