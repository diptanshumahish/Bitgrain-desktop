import React from "react";
import { Moon, Sun } from "lucide-react";
import { ColorPicker } from "../ui/ColorPicker";
import { PanelGroup } from "../ui/panel-group";
import { useSignalValue } from "../../../lib/signal";
import { themeSignal, toggleTheme } from "../../../store/global-theme-store";
import {
  setWorkspaceAppearance,
  workspaceAppearanceSignal,
  type WorkspacePattern,
} from "../../../store/workspace-appearance-store";
import { PatternPreview } from "./pattern-preview";
import { SegmentedChoice, type SegmentedOption } from "./segmented-choice";

const FALLBACK_CANVAS_COLOR = "#0b0b11";

const THEME_OPTIONS: SegmentedOption[] = [
  { value: "light", label: "Light", icon: <Sun size={11} strokeWidth={1.75} /> },
  { value: "dark", label: "Dark", icon: <Moon size={11} strokeWidth={1.75} /> },
];

const PATTERN_OPTIONS: SegmentedOption[] = [
  { value: "dots", label: "Dots", icon: <PatternPreview pattern="dots" /> },
  { value: "grid", label: "Grid", icon: <PatternPreview pattern="grid" /> },
  { value: "none", label: "None", icon: <PatternPreview pattern="none" /> },
];

const readCanvasDefault = (): string => {
  if (typeof window === "undefined") return FALLBACK_CANVAS_COLOR;
  const value = getComputedStyle(document.documentElement).getPropertyValue("--s-bg-canvas").trim();
  return value || FALLBACK_CANVAS_COLOR;
};

const selectTheme = (next: string): void => {
  if (next !== themeSignal.value) toggleTheme();
};

export const CanvasSettings: React.FC = () => {
  const appearance = useSignalValue(workspaceAppearanceSignal);
  const theme = useSignalValue(themeSignal);
  const backgroundColor = appearance.background ?? readCanvasDefault();

  return (
    <PanelGroup title="Canvas">
      <SegmentedChoice label="Theme" options={THEME_OPTIONS} value={theme} onChange={selectTheme} />
      <SegmentedChoice
        label="Canvas pattern"
        options={PATTERN_OPTIONS}
        value={appearance.pattern}
        onChange={(value) => setWorkspaceAppearance({ pattern: value as WorkspacePattern })}
      />
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <ColorPicker color={backgroundColor} onChange={(color) => setWorkspaceAppearance({ background: color })} />
        </div>
        {appearance.background && (
          <button
            type="button"
            onClick={() => setWorkspaceAppearance({ background: null })}
            className="shrink-0 h-8 px-2 rounded-lg text-[10.5px] font-medium text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </PanelGroup>
  );
};
