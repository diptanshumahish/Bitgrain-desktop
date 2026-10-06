import { useEffect } from "react";
import {
  togglePlaying,
  shuttleForward,
  shuttleBackward,
  shuttleStop,
  toggleLoop,
} from "../store/playback-store";
import { setCurrentTime, currentTimeSignal } from "../store/timeline-store";
import { currentProjectSignal, selectedClipIdSignal } from "../store/project-store";
import {
  splitSelectedAtPlayhead,
  duplicateSelected,
  deleteSelected,
  rippleDeleteSelected,
} from "../utils/edit-ops";
import { copySelected, cutSelected, pasteClipboard } from "../utils/clip-clipboard";
import { toggleSnap } from "../store/timeline-store";
import { toggleFullscreen } from "../store/fullscreen-store";
import {
  toggleMarkerAtPlayhead,
  clearMarkers,
  setRangeIn,
  setRangeOut,
  projectMarkers,
} from "../store/markers-store";
import { undo, redo } from "../store/video-history-store";
import { toggleShortcuts } from "../store/shortcuts-store";
import { setTool, toolForCode } from "../store/tool-store";
import { togglePerfHud } from "../store/preview-perf-store";
import { closeGapBefore, rippleTrimHead, rippleTrimTail } from "../utils/trim-ops";
import { clipEdgesInProject, nextEdgeAfter, previousEdgeBefore } from "../utils/edit-points";
import {
  commandPaletteOpenSignal,
  toggleCommandPalette,
} from "../store/command-store";
import { applyTransitionAtPlayhead } from "../utils/apply-transition-at-playhead";
import {
  applyWorkspace,
  toggleLeftPanel,
  toggleRightPanel,
  toggleTimelinePanel,
  WORKSPACES,
} from "../store/workspace-layout-store";
import { handleTransportKey } from "./transport-keys";
import { handleEscapeKey } from "./escape-key";

function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // The palette's own field is a text input, so this has to be tested before
      // the text-input bail-out, otherwise the shortcut could not close it.
      if (meta && e.code === "KeyK") {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (isTextInput(e.target)) return;
      // While the palette is open it owns the keyboard: arrows move its cursor
      // and single letters are being typed, not firing tools.
      if (commandPaletteOpenSignal.value) return;

      // ⌥1..4 switch workspace; ⌥[ ⌥\\ ⌥] collapse the three panels. Option
      // keeps them clear of the single-key tool bindings.
      if (e.altKey && !meta) {
        const workspaceIndex = ["Digit1", "Digit2", "Digit3", "Digit4"].indexOf(e.code);
        if (workspaceIndex >= 0) {
          e.preventDefault();
          applyWorkspace(WORKSPACES[workspaceIndex].id);
          return;
        }
        if (e.code === "BracketLeft") {
          e.preventDefault();
          toggleLeftPanel();
          return;
        }
        if (e.code === "BracketRight") {
          e.preventDefault();
          toggleRightPanel();
          return;
        }
        if (e.code === "Backslash") {
          e.preventDefault();
          toggleTimelinePanel();
          return;
        }
      }

      // Esc closes the shortcuts sheet or export panel, then clears the clip
      // selection. On the web it finally leaves the editor; here the tab is the
      // editor, so there is nothing further to leave.
      if (e.code === "Escape") {
        if (e.defaultPrevented) return;
        e.preventDefault();
        handleEscapeKey(() => {});
        return;
      }

      // , and . step one frame (Home/End are handled with the edit points below).
      if (e.code === "Comma" || e.code === "Period") {
        if (handleTransportKey(e)) {
          e.preventDefault();
          return;
        }
      }

      if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault();
        toggleShortcuts();
        return;
      }

      if (meta && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if (meta && e.code === "KeyY") {
        e.preventDefault();
        redo();
        return;
      }

      // ⌘T drops a cross dissolve on the cut nearest the playhead, the one
      // transition common enough to deserve a chord of its own.
      if (meta && e.code === "KeyT") {
        e.preventDefault();
        applyTransitionAtPlayhead("cross-dissolve");
        return;
      }

      if (meta && e.code === "KeyD") {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      if (meta && e.code === "KeyC") {
        e.preventDefault();
        copySelected();
        return;
      }

      if (meta && e.code === "KeyX") {
        e.preventDefault();
        cutSelected();
        return;
      }

      if (meta && e.code === "KeyV") {
        e.preventDefault();
        pasteClipboard();
        return;
      }

      // Tool selection: V select, C razor, R ripple, N roll, Y slip, U slide.
      // Unmodified single keys, so the whole toolset is under the left hand.
      if (!meta && !e.shiftKey) {
        const tool = toolForCode(e.code);
        if (tool) {
          e.preventDefault();
          setTool(tool);
          return;
        }
      }

      // J / K / L shuttle. K stops, J and L walk the speed ladder outward in
      // each direction.
      if (!meta && e.code === "KeyJ") {
        e.preventDefault();
        shuttleBackward();
        return;
      }
      if (!meta && e.code === "KeyK") {
        e.preventDefault();
        shuttleStop();
        return;
      }
      if (!meta && e.code === "KeyL") {
        e.preventDefault();
        if (e.shiftKey) toggleLoop();
        else shuttleForward();
        return;
      }

      if (e.code === "KeyB" && !meta) {
        e.preventDefault();
        splitSelectedAtPlayhead();
        return;
      }

      if (e.code === "KeyS" && !meta) {
        e.preventDefault();
        toggleSnap();
        return;
      }

      if (e.code === "KeyF" && !meta) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.code === "Backquote" && !meta) {
        e.preventDefault();
        togglePerfHud();
        return;
      }

      if (e.code === "KeyM" && !meta) {
        e.preventDefault();
        if (e.shiftKey) clearMarkers();
        else toggleMarkerAtPlayhead();
        return;
      }

      if (e.code === "KeyI" && !meta) {
        e.preventDefault();
        setRangeIn();
        return;
      }

      if (e.code === "KeyO" && !meta) {
        e.preventDefault();
        setRangeOut();
        return;
      }

      // W / Q: ripple trim the selected clip to the playhead, the two edits that
      // tighten a cut without opening a gap.
      if (e.code === "KeyW" && !meta) {
        e.preventDefault();
        const id = selectedClipIdSignal.value;
        if (id) rippleTrimTail(id, currentTimeSignal.value);
        return;
      }
      if (e.code === "KeyQ" && !meta) {
        e.preventDefault();
        const id = selectedClipIdSignal.value;
        if (id) rippleTrimHead(id, currentTimeSignal.value);
        return;
      }

      if (e.code === "KeyG" && !meta) {
        e.preventDefault();
        const id = selectedClipIdSignal.value;
        if (id) closeGapBefore(id);
        return;
      }

      if (e.code === "Backspace" || e.code === "Delete") {
        e.preventDefault();
        if (e.shiftKey) rippleDeleteSelected();
        else deleteSelected();
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlaying();
        return;
      }

      const project = currentProjectSignal.value;
      const fps = project?.fps ?? 30;

      if (e.code === "Home") {
        e.preventDefault();
        setCurrentTime(0);
        return;
      }
      if (e.code === "End") {
        e.preventDefault();
        setCurrentTime(project?.duration ?? 0);
        return;
      }

      // Up / Down jump between edit points: every clip edge and marker in the
      // project. This is how you navigate a cut without hunting with the mouse.
      if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
        if (!project) return;
        const edges = [...clipEdgesInProject(project), ...projectMarkers(project)];
        const now = currentTimeSignal.value;
        const target =
          e.code === "ArrowDown"
            ? nextEdgeAfter(edges, now)
            : previousEdgeBefore(edges, now);
        if (target !== null) setCurrentTime(target);
        return;
      }

      if (e.code === "ArrowLeft") {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 1 / fps;
        setCurrentTime(currentTimeSignal.value - step);
        return;
      }

      if (e.code === "ArrowRight") {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 1 / fps;
        setCurrentTime(currentTimeSignal.value + step);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
