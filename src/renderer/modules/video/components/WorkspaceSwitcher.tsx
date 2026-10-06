import React from "react";
import { PanelLeft, PanelRight, PanelBottom } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import {
  WORKSPACES,
  activeWorkspaceSignal,
  applyWorkspace,
  leftCollapsedSignal,
  rightCollapsedSignal,
  timelineCollapsedSignal,
  toggleLeftPanel,
  toggleRightPanel,
  toggleTimelinePanel,
  workspaceMatches,
} from "../store/workspace-layout-store";

const PanelToggle: React.FC<{
  active: boolean;
  label: string;
  shortcut: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, label, shortcut, onClick, children }) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    title={`${active ? "Show" : "Hide"} ${label} (${shortcut})`}
    className={`flex h-full w-6 items-center justify-center transition-colors hover:bg-[var(--s-bg-input)] ${
      active ? "text-[var(--s-text-subtle)]/50" : "text-[var(--s-text-subtle)]"
    }`}
  >
    {children}
  </button>
);

// Workspace presets and the three panel toggles, living in the status bar.
// A preset that has since been adjusted by hand is marked, so the label never
// claims a layout the screen is not actually in.
export const WorkspaceSwitcher: React.FC = () => {
  const active = useSignalValue(activeWorkspaceSignal);
  const leftCollapsed = useSignalValue(leftCollapsedSignal);
  const rightCollapsed = useSignalValue(rightCollapsedSignal);
  const timelineCollapsed = useSignalValue(timelineCollapsedSignal);

  // Read so the "modified" dot re-evaluates when any panel moves.
  void leftCollapsed;
  void rightCollapsed;
  void timelineCollapsed;
  const modified = !workspaceMatches(active);

  return (
    <div className="flex h-full items-center">
      <div className="flex h-full items-center" role="radiogroup" aria-label="Workspace">
        {WORKSPACES.map((workspace, index) => {
          const selected = active === workspace.id;
          return (
            <button
              key={workspace.id}
              role="radio"
              aria-checked={selected}
              title={`${workspace.label} workspace (⌥${index + 1}) — ${workspace.hint}`}
              onClick={() => applyWorkspace(workspace.id)}
              className={`h-full px-2 text-[10px] transition-colors ${
                selected
                  ? "text-[var(--s-accent)]"
                  : "text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
              }`}
            >
              {workspace.label}
              {selected && modified && (
                <span
                  className="ml-1 text-[var(--s-text-subtle)]"
                  title="Adjusted since the preset was applied"
                >
                  ·
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mx-1 h-3 w-px bg-[var(--s-border)]" />
      <PanelToggle
        active={leftCollapsed}
        label="the media browser"
        shortcut="⌥["
        onClick={toggleLeftPanel}
      >
        <PanelLeft size={11} />
      </PanelToggle>
      <PanelToggle
        active={timelineCollapsed}
        label="the timeline"
        shortcut="⌥\\"
        onClick={toggleTimelinePanel}
      >
        <PanelBottom size={11} />
      </PanelToggle>
      <PanelToggle
        active={rightCollapsed}
        label="the inspector"
        shortcut="⌥]"
        onClick={toggleRightPanel}
      >
        <PanelRight size={11} />
      </PanelToggle>
    </div>
  );
};
