import React, { useRef, useEffect } from "react";
import { useSignalValue } from "../../../lib/signal";
import {
  currentProjectSignal,
  projectLoadingSignal,
  projectErrorSignal,
} from "../store/project-store";
import {
  previewContainerSignal,
  isFullscreenSignal,
} from "../store/fullscreen-store";
import { loadDeviceFonts } from "../utils/device-fonts";
import {
  leftPanelWidthSignal,
  rightPanelWidthSignal,
  timelineHeightSignal,
  setLeftPanelWidth,
  setRightPanelWidth,
  setTimelineHeight,
} from "../store/panel-size-store";
import { useVideoPlayback } from "../hooks/useVideoPlayback";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useAudioEngine } from "../hooks/useAudioEngine";
import { useWaveformBackfill } from "../hooks/useWaveformBackfill";
import { TopBar } from "./TopBar";
import { MediaBrowser } from "./media-browser/MediaBrowser";
import { PreviewCanvas } from "./preview/PreviewCanvas";
import { PreviewControls } from "./preview/PreviewControls";
import { Timeline } from "./timeline/Timeline";
import { ActionBar } from "./ActionBar";
import { StatusBar } from "./StatusBar";
import { ShortcutsOverlay } from "./ShortcutsOverlay";
import { CommandPalette } from "./CommandPalette";
import { VideoToast } from "./VideoToast";
import { RightPanel } from "./RightPanel";
import { ExportPanel } from "./export/ExportPanel";
import { ExportToast } from "./export/ExportToast";
import { ResizeHandle } from "./ResizeHandle";
import { PanelStub } from "./PanelStub";
import {
  leftCollapsedSignal,
  rightCollapsedSignal,
  timelineCollapsedSignal,
  toggleLeftPanel,
  toggleRightPanel,
  restoreWorkspace,
  COLLAPSED_TIMELINE_HEIGHT,
} from "../store/workspace-layout-store";
import { PopoverPortal } from "../../../components/portal/PopoverPortal";

export const VideoEditor: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const loading = useSignalValue(projectLoadingSignal);
  const error = useSignalValue(projectErrorSignal);
  const leftWidth = useSignalValue(leftPanelWidthSignal);
  const rightWidth = useSignalValue(rightPanelWidthSignal);
  const timelineHeight = useSignalValue(timelineHeightSignal);
  const leftCollapsed = useSignalValue(leftCollapsedSignal);
  const rightCollapsed = useSignalValue(rightCollapsedSignal);
  const timelineCollapsed = useSignalValue(timelineCollapsedSignal);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    previewContainerSignal.value = previewRef.current;
    restoreWorkspace();
    void loadDeviceFonts();
    const onChange = () => {
      isFullscreenSignal.value = document.fullscreenElement === previewRef.current;
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useVideoPlayback();
  useKeyboardShortcuts();
  useAudioEngine();
  useWaveformBackfill();

  if (loading && !project) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--s-bg-canvas)] text-[var(--s-text-subtle)] text-[11px]">
        Loading project…
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--s-bg-canvas)] text-red-400 text-[11px]">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--s-bg-canvas)] text-[var(--s-text-subtle)] text-[11px]">
        Project not found
      </div>
    );
  }

  const handleTimelineResize = (next: number): void => {
    const containerHeight = splitContainerRef.current?.clientHeight ?? window.innerHeight;
    setTimelineHeight(next, containerHeight);
  };

  return (
    // `h-full`, not `h-screen`: the desktop shell already spends 40px on its
    // title bar, so a viewport-height editor pushes its own bottom chrome off
    // screen. Same reason Home.tsx made this change (PORTED.md deviation 6).
    <main className="h-full w-full flex flex-col bg-[var(--s-bg-canvas)] text-[var(--s-text)] overflow-hidden font-editorial">
      <TopBar />
      <div
        ref={splitContainerRef}
        data-editor-body
        className="flex-1 min-h-0 flex flex-col"
      >
        <div className="flex-1 min-h-0 flex">
          {leftCollapsed ? (
            <PanelStub side="left" label="Media" onExpand={toggleLeftPanel} />
          ) : (
            <>
              <MediaBrowser width={leftWidth} />
              <ResizeHandle
                orientation="vertical"
                ariaLabel="Resize media browser"
                getCurrentSize={() => leftPanelWidthSignal.value}
                onResize={setLeftPanelWidth}
              />
            </>
          )}
          <div
            ref={previewRef}
            className="flex-1 min-w-0 flex flex-col relative bg-[var(--s-bg-canvas)]"
          >
            <PreviewCanvas />
            <PreviewControls />
          </div>
          {rightCollapsed ? (
            <PanelStub side="right" label="Inspector" onExpand={toggleRightPanel} />
          ) : (
            <>
              <ResizeHandle
                orientation="vertical"
                ariaLabel="Resize inspector"
                getCurrentSize={() => rightPanelWidthSignal.value}
                onResize={setRightPanelWidth}
                invert
              />
              <RightPanel width={rightWidth} />
            </>
          )}
        </div>
        {!timelineCollapsed && (
          <ResizeHandle
            orientation="horizontal"
            ariaLabel="Resize timeline"
            getCurrentSize={() => timelineHeightSignal.value}
            onResize={handleTimelineResize}
            invert
          />
        )}
        <Timeline
          height={timelineCollapsed ? COLLAPSED_TIMELINE_HEIGHT : timelineHeight}
        />
      </div>
      <ActionBar />
      <StatusBar />
      <ShortcutsOverlay />
      <CommandPalette />
      <VideoToast />
      <ExportPanel />
      <ExportToast />
      <PopoverPortal />
    </main>
  );
};
