import React from "react";
import {
  MousePointer2,
  Scissors,
  ChevronsLeftRight,
  ArrowLeftRight,
  MoveHorizontal,
  SquareSplitHorizontal,
} from "lucide-react";
import { useSignalValue } from "../../../../lib/signal";
import {
  activeToolSignal,
  setTool,
  TIMELINE_TOOLS,
  type TimelineTool,
} from "../../store/tool-store";

const ICONS: Record<TimelineTool, React.ReactNode> = {
  select: <MousePointer2 size={12} />,
  razor: <Scissors size={12} />,
  ripple: <ChevronsLeftRight size={12} />,
  roll: <SquareSplitHorizontal size={12} />,
  slip: <ArrowLeftRight size={12} />,
  slide: <MoveHorizontal size={12} />,
};

// The tool strip. Each tool changes what a drag on the timeline means, and each
// has a single-key shortcut, so the common edits stay under the left hand.
export const ToolBar: React.FC = () => {
  const active = useSignalValue(activeToolSignal);

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-0.5"
      role="radiogroup"
      aria-label="Timeline tool"
    >
      {TIMELINE_TOOLS.map((tool) => {
        const selected = active === tool.id;
        return (
          <button
            key={tool.id}
            role="radio"
            aria-checked={selected}
            aria-label={tool.label}
            title={`${tool.label} (${tool.code.replace("Key", "")}) — ${tool.hint}`}
            onClick={() => setTool(tool.id)}
            className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
              selected
                ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                : "text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
            }`}
          >
            {ICONS[tool.id]}
          </button>
        );
      })}
    </div>
  );
};
