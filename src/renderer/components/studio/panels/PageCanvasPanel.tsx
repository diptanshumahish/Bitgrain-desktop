import React from "react";
import { ColorPicker } from "../ui/ColorPicker";
import { BtnGroup } from "../ui/panelPrimitives";
import { PanelGroup } from "../ui/panel-group";
import { useSignalValue } from "../../../lib/signal";
import type { WorkspacePattern } from "../../../store/workspace-appearance-store";
import {
  workspaceAppearanceSignal,
  setWorkspaceAppearance,
} from "../../../store/workspace-appearance-store";
import {
  designKitsSignal,
  activeKitIdSignal,
  setActiveKit,
} from "../../../store/design-kits-store";

const PATTERN_OPTIONS = [
  { label: "Dots", value: "dots" },
  { label: "Grid", value: "grid" },
  { label: "None", value: "none" },
];

const KIT_SWATCH_LIMIT = 6;
const FALLBACK_CANVAS_COLOR = "#0b0b11";

const readCanvasDefault = (): string => {
  if (typeof window === "undefined") return FALLBACK_CANVAS_COLOR;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--s-bg-canvas")
    .trim();
  return value || FALLBACK_CANVAS_COLOR;
};

export const PageCanvasPanel: React.FC = () => {
  const appearance = useSignalValue(workspaceAppearanceSignal);
  const kits = useSignalValue(designKitsSignal);
  const activeKitId = useSignalValue(activeKitIdSignal);

  const backgroundColor = appearance.background ?? readCanvasDefault();

  return (
    <div className="flex flex-col font-editorial">
      <PanelGroup title="Workspace background">
        <ColorPicker
          color={backgroundColor}
          onChange={(color) => setWorkspaceAppearance({ background: color })}
        />
        {appearance.background && (
          <button
            type="button"
            onClick={() => setWorkspaceAppearance({ background: null })}
            className="flex items-center gap-1 text-[11px] text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] transition-colors bg-transparent border-none cursor-pointer w-fit"
          >
            Reset to theme
          </button>
        )}
      </PanelGroup>

      <PanelGroup title="Pattern">
        <BtnGroup
          options={PATTERN_OPTIONS}
          value={appearance.pattern}
          onChange={(value) => setWorkspaceAppearance({ pattern: value as WorkspacePattern })}
        />
      </PanelGroup>

      <PanelGroup title="Design kits">
        {kits.length === 0 ? (
          <span className="text-[11px] text-[var(--s-text-subtle)]">
            No kits yet. Create one from the Kit menu.
          </span>
        ) : (
          <div className="flex flex-col gap-1.5">
            {kits.map((kit) => {
              const active = kit.id === activeKitId;
              return (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => setActiveKit(kit.id)}
                  className={`flex items-center gap-2 rounded-lg p-2 border cursor-pointer text-left transition-colors ${
                    active
                      ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)]"
                      : "border-[var(--s-border)] bg-[var(--s-bg-input)] hover:border-[var(--s-accent)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] text-[var(--s-text)] truncate">{kit.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {kit.colors.length === 0 ? (
                        <span className="text-[10px] text-[var(--s-text-subtle)]">No colors</span>
                      ) : (
                        kit.colors.slice(0, KIT_SWATCH_LIMIT).map((color) => (
                          <span
                            key={color.id}
                            className="w-3.5 h-3.5 rounded-full border border-[var(--s-border)]"
                            style={{ backgroundColor: color.value }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                  {active && (
                    <span className="text-[10px] text-[var(--s-accent)] font-medium shrink-0">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </PanelGroup>
    </div>
  );
};
