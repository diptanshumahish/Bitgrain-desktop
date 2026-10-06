import { signal } from "../../../lib/signal";
import {
  leftPanelWidthSignal,
  rightPanelWidthSignal,
  timelineHeightSignal,
  setLeftPanelWidth,
  setRightPanelWidth,
} from "./panel-size-store";

// Workspaces: named arrangements of the editor, switchable in one keystroke.
//
// Different jobs want different amounts of the screen. Trimming wants a tall
// timeline and no media browser; grading wants the biggest possible picture and
// the inspector; reviewing wants the frame and nothing else. The web build had
// one fixed arrangement and three drag handles, so every switch was four manual
// drags — and going back was four more.
//
// Panels collapse rather than undock. A collapsed panel keeps its width, so
// reopening it restores the size you had rather than a default.

export type WorkspaceId = "edit" | "trim" | "colour" | "review";

export interface WorkspaceLayout {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  timelineCollapsed: boolean;
  leftWidth: number;
  rightWidth: number;
  timelineHeight: number;
}

export interface WorkspaceDefinition {
  id: WorkspaceId;
  label: string;
  hint: string;
  layout: WorkspaceLayout;
}

export const WORKSPACES: WorkspaceDefinition[] = [
  {
    id: "edit",
    label: "Edit",
    hint: "Everything on screen: media, preview, inspector, timeline",
    layout: {
      leftCollapsed: false,
      rightCollapsed: false,
      timelineCollapsed: false,
      leftWidth: 300,
      rightWidth: 300,
      timelineHeight: 280,
    },
  },
  {
    id: "trim",
    label: "Trim",
    hint: "Tall timeline, media browser out of the way",
    layout: {
      leftCollapsed: true,
      rightCollapsed: false,
      timelineCollapsed: false,
      leftWidth: 300,
      rightWidth: 280,
      timelineHeight: 460,
    },
  },
  {
    id: "colour",
    label: "Colour",
    hint: "Biggest picture, inspector open, timeline minimal",
    layout: {
      leftCollapsed: true,
      rightCollapsed: false,
      timelineCollapsed: false,
      leftWidth: 300,
      rightWidth: 360,
      timelineHeight: 160,
    },
  },
  {
    id: "review",
    label: "Review",
    hint: "Preview only, everything else collapsed",
    layout: {
      leftCollapsed: true,
      rightCollapsed: true,
      timelineCollapsed: true,
      leftWidth: 300,
      rightWidth: 300,
      timelineHeight: 280,
    },
  },
];

const STORAGE_KEY = "video-editor-workspace";

export const activeWorkspaceSignal = signal<WorkspaceId>("edit");
export const leftCollapsedSignal = signal(false);
export const rightCollapsedSignal = signal(false);
export const timelineCollapsedSignal = signal(false);

// Height the timeline collapses to: enough for the ruler, the tool strip and the
// cache bar, so the collapsed state is still a usable scrub target.
export const COLLAPSED_TIMELINE_HEIGHT = 64;

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        workspace: activeWorkspaceSignal.value,
        leftCollapsed: leftCollapsedSignal.value,
        rightCollapsed: rightCollapsedSignal.value,
        timelineCollapsed: timelineCollapsedSignal.value,
      }),
    );
  } catch {
    /* ignore quota errors */
  }
}

export function restoreWorkspace(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      workspace?: WorkspaceId;
      leftCollapsed?: boolean;
      rightCollapsed?: boolean;
      timelineCollapsed?: boolean;
    };
    if (parsed.workspace) activeWorkspaceSignal.value = parsed.workspace;
    leftCollapsedSignal.value = Boolean(parsed.leftCollapsed);
    rightCollapsedSignal.value = Boolean(parsed.rightCollapsed);
    timelineCollapsedSignal.value = Boolean(parsed.timelineCollapsed);
  } catch {
    /* fall back to defaults */
  }
}

// The editor body's height, which bounds how tall a workspace may make the
// timeline. Read from the DOM so any caller can apply a workspace without
// having to thread a ref through to it.
function editorBodyHeight(): number {
  if (typeof document === "undefined") return 800;
  const body = document.querySelector("[data-editor-body]");
  return body instanceof HTMLElement ? body.clientHeight : window.innerHeight;
}

export function applyWorkspace(id: WorkspaceId, height?: number): void {
  const containerHeight = height ?? editorBodyHeight();
  const workspace = WORKSPACES.find((w) => w.id === id);
  if (!workspace) return;
  const { layout } = workspace;

  activeWorkspaceSignal.value = id;
  leftCollapsedSignal.value = layout.leftCollapsed;
  rightCollapsedSignal.value = layout.rightCollapsed;
  timelineCollapsedSignal.value = layout.timelineCollapsed;

  setLeftPanelWidth(layout.leftWidth);
  setRightPanelWidth(layout.rightWidth);
  // Written straight rather than through `setTimelineHeight` so a workspace can
  // ask for a tall timeline on a big window without being clamped by whatever
  // the previous layout left behind; the clamp below still protects the preview.
  const maxTimeline = Math.max(160, containerHeight - 200);
  timelineHeightSignal.value = Math.min(layout.timelineHeight, maxTimeline);
  persist();
}

// Toggling a panel by hand puts the workspace into a modified state rather than
// silently claiming to still be the preset it started from.
function markCustom(): void {
  persist();
}

export function toggleLeftPanel(): void {
  leftCollapsedSignal.value = !leftCollapsedSignal.value;
  markCustom();
}

export function toggleRightPanel(): void {
  rightCollapsedSignal.value = !rightCollapsedSignal.value;
  markCustom();
}

export function toggleTimelinePanel(): void {
  timelineCollapsedSignal.value = !timelineCollapsedSignal.value;
  markCustom();
}

// True when the live panel state still matches the named workspace, so the
// switcher can show whether the preset is intact or has been adjusted.
export function workspaceMatches(id: WorkspaceId): boolean {
  const workspace = WORKSPACES.find((w) => w.id === id);
  if (!workspace) return false;
  const { layout } = workspace;
  return (
    leftCollapsedSignal.value === layout.leftCollapsed &&
    rightCollapsedSignal.value === layout.rightCollapsed &&
    timelineCollapsedSignal.value === layout.timelineCollapsed &&
    leftPanelWidthSignal.value === layout.leftWidth &&
    rightPanelWidthSignal.value === layout.rightWidth
  );
}
