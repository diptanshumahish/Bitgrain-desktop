import { useEffect, useRef, useState } from "react";
import { VideoEditor as VideoEditorView } from "../../modules/video/components/VideoEditor";
import { createBlankProject } from "../../modules/video/utils/create-project";
import {
  setCurrentProject,
  currentProjectSignal,
  projectLoadingSignal,
  projectErrorSignal,
  selectedClipIdSignal,
} from "../../modules/video/store/project-store";
import { previewCanvasSignal } from "../../modules/video/store/preview-canvas-store";
import { setCurrentTime } from "../../modules/video/store/timeline-store";
import { setPlaying } from "../../modules/video/store/playback-store";
import { startHistoryRecorder } from "../../modules/video/store/video-history-store";
import {
  exportPanelOpenSignal,
  resetExportProgress,
} from "../../modules/video/engine/exporter/export-types";
import { newInstanceId, readInstance, writeInstance } from "../../store/workspace-store";
import { setTitlebarActions, clearTitlebarActions } from "../../store/titlebar-actions-store";
import { registerSurfaceCommands, clearSurfaceCommands } from "../../store/surface-commands-store";
import type { VideoProject } from "../../modules/video/types";

const AUTOSAVE_DEBOUNCE_MS = 1000;
const THUMB_MAX_WIDTH = 320;
const THUMB_QUALITY = 0.75;

// Snapshots the current preview canvas to a small JPEG data URL for the Home
// library card. Best-effort: returns null if the canvas is not ready.
function captureThumbnail(): string | null {
  const canvas = previewCanvasSignal.value;
  if (!canvas || canvas.width === 0 || canvas.height === 0) return null;
  const scale = Math.min(1, THUMB_MAX_WIDTH / canvas.width);
  const tw = Math.max(1, Math.floor(canvas.width * scale));
  const th = Math.max(1, Math.floor(canvas.height * scale));
  const out = document.createElement("canvas");
  out.width = tw;
  out.height = th;
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(canvas, 0, 0, tw, th);
  try {
    return out.toDataURL("image/jpeg", THUMB_QUALITY);
  } catch {
    return null;
  }
}

const persist = (project: VideoProject, thumbnail?: string | null): Promise<unknown> =>
  writeInstance({
    id: project.id,
    kind: "video",
    title: project.name || "Untitled video",
    doc: project,
    thumbnail: thumbnail ?? project.thumbnail ?? undefined,
  });

// A per-tab video document. Each tab owns a workspace instance; on first mount it
// loads that instance's `.bitgrain` file, or creates a blank project bound to the
// tab's instanceId if the file does not exist yet. Autosave keeps the file
// current, so switching away and back — or reopening from the library — is
// lossless, and a new video tab never inherits another tab's project.
export function VideoSurface({
  active,
  instanceId,
  tabId,
}: {
  active: boolean;
  instanceId?: string;
  tabId?: string;
}) {
  const idRef = useRef<string>(instanceId ?? newInstanceId());
  const [ready, setReady] = useState(false);

  // The Export action lives in the app title bar, keyed by this tab. The title
  // bar shows it only while this tab is active; clicking opens the export panel.
  useEffect(() => {
    if (!tabId) return;
    const openExport = (): void => {
      resetExportProgress();
      exportPanelOpenSignal.value = true;
    };
    setTitlebarActions(
      tabId,
      <button
        onClick={openExport}
        aria-label="Export"
        className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--s-text)] px-3 text-[12px] font-medium text-[var(--s-bg-panel)] transition-opacity hover:opacity-90 active:scale-[0.98]"
      >
        Export
      </button>,
    );
    // The native "Export Image…" menu command mirrors the title-bar button; the
    // video surface offers no other document commands, so studio/darkroom items
    // never appear in the menu while a video is active.
    registerSurfaceCommands(tabId, { export: openExport });
    return () => {
      clearTitlebarActions(tabId);
      clearSurfaceCommands(tabId);
    };
  }, [tabId]);

  useEffect(() => {
    let cancelled = false;
    void readInstance<VideoProject>(idRef.current).then(async (loaded) => {
      if (cancelled) return;
      if (!loaded) {
        const project = createBlankProject(idRef.current, "Untitled video");
        await persist(project);
      }
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active || !ready) return;
    let cancelled = false;
    let stopHistory: (() => void) | null = null;

    projectLoadingSignal.value = true;
    projectErrorSignal.value = null;
    selectedClipIdSignal.value = null;
    setCurrentTime(0);
    setPlaying(false);

    // Workspace autosave: write the current project to its instance file on
    // change, debounced. Bound to this tab's instance id.
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastSavedAt = 0;
    const stopAutosave = currentProjectSignal.subscribe(() => {
      const project = currentProjectSignal.value;
      if (!project || project.id !== idRef.current) return;
      if (project.updatedAt === lastSavedAt) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const latest = currentProjectSignal.value;
        if (!latest || latest.id !== idRef.current) return;
        lastSavedAt = latest.updatedAt;
        void persist(latest).catch(() => {
          lastSavedAt = 0;
        });
      }, AUTOSAVE_DEBOUNCE_MS);
    });

    void readInstance<VideoProject>(idRef.current)
      .then((loaded) => {
        if (cancelled || !loaded) return;
        setCurrentProject(loaded.doc);
        stopHistory = startHistoryRecorder();
      })
      .finally(() => {
        if (!cancelled) projectLoadingSignal.value = false;
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stopAutosave();
      if (stopHistory) stopHistory();
      // Capture a fresh thumbnail and flush a final save on the way out.
      const project = currentProjectSignal.value;
      if (project && project.id === idRef.current) {
        const thumb = captureThumbnail();
        void persist(
          thumb ? { ...project, thumbnail: thumb } : project,
          thumb,
        );
      }
    };
  }, [active, ready]);

  if (!ready) return null;
  return (
    <div className="h-full w-full">
      <VideoEditorView />
    </div>
  );
}
