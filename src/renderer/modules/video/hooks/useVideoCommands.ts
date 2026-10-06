import { useMemo } from "react";
import { useSignalValue } from "../../../lib/signal";
import { currentProjectSignal, selectedClipIdSignal } from "../store/project-store";
import { currentTimeSignal, toggleSnap } from "../store/timeline-store";
import {
  togglePlaying,
  toggleLoop,
  shuttleForward,
  shuttleBackward,
  shuttleStop,
} from "../store/playback-store";
import { toggleFullscreen } from "../store/fullscreen-store";
import {
  toggleMarkerAtPlayhead,
  clearMarkers,
  setRangeIn,
  setRangeOut,
} from "../store/markers-store";
import { undo, redo, canUndoSignal, canRedoSignal } from "../store/video-history-store";
import { toggleShortcuts } from "../store/shortcuts-store";
import { setTool, TIMELINE_TOOLS } from "../store/tool-store";
import {
  setPreviewQuality,
  togglePerfHud,
  type PreviewQuality,
} from "../store/preview-perf-store";
import {
  splitSelectedAtPlayhead,
  duplicateSelected,
  deleteSelected,
  rippleDeleteSelected,
} from "../utils/edit-ops";
import { copySelected, cutSelected, pasteClipboard } from "../utils/clip-clipboard";
import {
  closeGapBefore,
  rippleTrimHead,
  rippleTrimTail,
} from "../utils/trim-ops";
import { addTextAtPlayhead } from "../utils/add-text-clip";
import { addTrackingAtPlayhead } from "../utils/add-tracking-clip";
import { addNewTrack, importAndAddAtPlayhead } from "../utils/timeline-actions";
import { renderCache } from "../engine/preview/render-cache";
import {
  applyTransitionAtPlayhead,
  TRANSITION_KINDS,
  TRANSITION_LABELS,
} from "../utils/apply-transition-at-playhead";
import {
  WORKSPACES,
  applyWorkspace,
  toggleLeftPanel,
  toggleRightPanel,
  toggleTimelinePanel,
} from "../store/workspace-layout-store";
import { exportPanelOpenSignal } from "../engine/exporter/export-types";

export interface VideoCommand {
  id: string;
  group: string;
  label: string;
  shortcut?: string;
  enabled?: boolean;
  run: () => void;
}

const QUALITIES: { quality: PreviewQuality; label: string }[] = [
  { quality: "auto", label: "Auto (hold frame rate)" },
  { quality: "full", label: "Full resolution" },
  { quality: "half", label: "Half resolution" },
  { quality: "quarter", label: "Quarter resolution" },
];

// Every command the editor can run, in one list. The palette searches it, and it
// doubles as the inventory of what the editor actually does, which is easier to
// keep honest than a menu spread across four components.
export function useVideoCommands(): VideoCommand[] {
  const selectedId = useSignalValue(selectedClipIdSignal);
  const project = useSignalValue(currentProjectSignal);
  const canUndo = useSignalValue(canUndoSignal);
  const canRedo = useSignalValue(canRedoSignal);

  return useMemo(() => {
    const hasClip = Boolean(selectedId);
    const withClip = (fn: (id: string) => void) => () => {
      const id = selectedClipIdSignal.value;
      if (id) fn(id);
    };

    const commands: VideoCommand[] = [
      { id: "play", group: "Playback", label: "Play / pause", shortcut: "Space", run: togglePlaying },
      { id: "shuttle-fwd", group: "Playback", label: "Shuttle forward", shortcut: "L", run: shuttleForward },
      { id: "shuttle-back", group: "Playback", label: "Shuttle backward", shortcut: "J", run: shuttleBackward },
      { id: "shuttle-stop", group: "Playback", label: "Stop", shortcut: "K", run: shuttleStop },
      { id: "loop", group: "Playback", label: "Toggle loop", shortcut: "⇧L", run: toggleLoop },
      { id: "fullscreen", group: "Playback", label: "Toggle fullscreen preview", shortcut: "F", run: toggleFullscreen },

      ...TIMELINE_TOOLS.map((tool) => ({
        id: `tool-${tool.id}`,
        group: "Tool",
        label: `${tool.label} tool — ${tool.hint}`,
        shortcut: tool.code.replace("Key", ""),
        run: () => setTool(tool.id),
      })),

      { id: "split", group: "Edit", label: "Split clip at playhead", shortcut: "B", enabled: hasClip, run: splitSelectedAtPlayhead },
      { id: "ripple-head", group: "Edit", label: "Ripple trim head to playhead", shortcut: "Q", enabled: hasClip, run: withClip((id) => rippleTrimHead(id, currentTimeSignal.value)) },
      { id: "ripple-tail", group: "Edit", label: "Ripple trim tail to playhead", shortcut: "W", enabled: hasClip, run: withClip((id) => rippleTrimTail(id, currentTimeSignal.value)) },
      { id: "close-gap", group: "Edit", label: "Close gap before clip", shortcut: "G", enabled: hasClip, run: withClip(closeGapBefore) },
      { id: "duplicate", group: "Edit", label: "Duplicate clip", shortcut: "⌘D", enabled: hasClip, run: duplicateSelected },
      { id: "copy", group: "Edit", label: "Copy clip", shortcut: "⌘C", enabled: hasClip, run: copySelected },
      { id: "cut", group: "Edit", label: "Cut clip", shortcut: "⌘X", enabled: hasClip, run: cutSelected },
      { id: "paste", group: "Edit", label: "Paste at playhead", shortcut: "⌘V", run: pasteClipboard },
      { id: "delete", group: "Edit", label: "Delete clip", shortcut: "⌫", enabled: hasClip, run: deleteSelected },
      { id: "ripple-delete", group: "Edit", label: "Ripple delete clip (close the gap)", shortcut: "⇧⌫", enabled: hasClip, run: rippleDeleteSelected },
      { id: "undo", group: "Edit", label: "Undo", shortcut: "⌘Z", enabled: canUndo, run: undo },
      { id: "redo", group: "Edit", label: "Redo", shortcut: "⌘⇧Z", enabled: canRedo, run: redo },

      ...TRANSITION_KINDS.map((kind) => ({
        id: `transition-${kind}`,
        group: "Transition",
        label: `${TRANSITION_LABELS[kind]} on the nearest cut`,
        shortcut: kind === "cross-dissolve" ? "⌘T" : undefined,
        run: () => applyTransitionAtPlayhead(kind),
      })),

      { id: "marker", group: "Timeline", label: "Add or remove marker at playhead", shortcut: "M", run: toggleMarkerAtPlayhead },
      { id: "clear-markers", group: "Timeline", label: "Clear all markers", shortcut: "⇧M", run: clearMarkers },
      { id: "range-in", group: "Timeline", label: "Set range in", shortcut: "I", run: setRangeIn },
      { id: "range-out", group: "Timeline", label: "Set range out", shortcut: "O", run: setRangeOut },
      { id: "snap", group: "Timeline", label: "Toggle snapping", shortcut: "S", run: toggleSnap },
      { id: "add-video-track", group: "Timeline", label: "Add video track", run: () => addNewTrack("video") },
      { id: "add-audio-track", group: "Timeline", label: "Add audio track", run: () => addNewTrack("audio") },
      { id: "add-text-track", group: "Timeline", label: "Add text track", run: () => addNewTrack("text") },
      { id: "add-fx-track", group: "Timeline", label: "Add effect track", run: () => addNewTrack("effect") },

      { id: "import", group: "Media", label: "Import media at playhead", run: () => void importAndAddAtPlayhead() },
      { id: "add-text", group: "Media", label: "Add text at playhead", run: addTextAtPlayhead },
      { id: "add-tracking", group: "Media", label: "Add tracking overlay at playhead", run: addTrackingAtPlayhead },

      ...QUALITIES.map(({ quality, label }) => ({
        id: `quality-${quality}`,
        group: "Preview",
        label: `Preview quality: ${label}`,
        run: () => setPreviewQuality(quality),
      })),
      ...WORKSPACES.map((workspace, index) => ({
        id: `workspace-${workspace.id}`,
        group: "Workspace",
        label: `${workspace.label} layout — ${workspace.hint}`,
        shortcut: `⌥${index + 1}`,
        run: () => applyWorkspace(workspace.id),
      })),
      { id: "panel-left", group: "Workspace", label: "Show or hide the media browser", shortcut: "⌥[", run: toggleLeftPanel },
      { id: "panel-right", group: "Workspace", label: "Show or hide the inspector", shortcut: "⌥]", run: toggleRightPanel },
      { id: "panel-timeline", group: "Workspace", label: "Collapse or expand the timeline", shortcut: "⌥\\", run: toggleTimelinePanel },

      { id: "hud", group: "Preview", label: "Toggle preview instrument panel", shortcut: "`", run: togglePerfHud },
      {
        id: "flush-cache",
        group: "Preview",
        label: "Flush the render cache",
        run: () => renderCache.clear(),
      },

      { id: "export", group: "Export", label: "Export video…", run: () => { exportPanelOpenSignal.value = true; } },
      { id: "shortcuts", group: "Help", label: "Keyboard shortcuts", shortcut: "?", run: toggleShortcuts },
    ];

    return commands;
  }, [selectedId, project, canUndo, canRedo]);
}
