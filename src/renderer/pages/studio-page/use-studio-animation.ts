import { useCallback, useEffect, useMemo, useRef } from "react";
import { useUser } from "../../hooks/useUser";
import type { Layer, TemplateDef, TemplatePage } from "../../data/studioTypes";
import type { EasingId, LayerAnimState, PageAnimation } from "../../data/animation-types";
import { ANIMATABLE_KEYS, DEFAULT_FRAME_DURATION_MS } from "../../data/animation-types";
import {
  interpolatePageLayers,
  resolveFrameLayers,
  frameStartTimes,
  animationTotalDurationMs,
} from "../../engine/animate/tween-layers";
import {
  exportPageAnimation,
  downloadBlob,
  type AnimationFormat,
} from "../../engine/animate/export-page-animation";
import {
  setAnimationExporting,
  setAnimationExportProgress,
  setAnimationExportError,
  getExportScale,
  getExportQuality,
} from "../../store/animation-export-store";
import {
  makeFrameId,
  enableAnimation,
  addFrame,
  deleteFrame,
  setFrameTiming,
  setAnimationLoop,
  setAnimationFps,
  setLayerFrameOverride,
  captureFramePose,
} from "./animation-frame-ops";
import {
  useAnimationMode,
  useActiveFrameId,
  usePlayheadMs,
  usePlaying,
  setAnimationMode,
  setActiveFrameId,
  setActiveFrameIsOverride,
  setPlayheadMs,
  setPlaying,
  resetAnimationEditor,
} from "../../store/animation-editor-store";

type LayersUpdater = Layer[] | ((prev: Layer[]) => Layer[]);

interface UseStudioAnimationArgs {
  activePage: TemplatePage | undefined;
  activePageId: string;
  layers: Layer[];
  template: TemplateDef;
  updatePage: (pageId: string, updater: (page: TemplatePage) => TemplatePage) => void;
  setLayers: (updater: LayersUpdater) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  pushHistory: () => void;
}

export interface AnimationController {
  mode: boolean;
  animation: PageAnimation | undefined;
  hasPage: boolean;
  pageName: string;
  baseLayers: Layer[];
  background: string;
  activeFrameId: string | null;
  activeFrameIndex: number;
  playing: boolean;
  playheadMs: number;
  totalDurationMs: number;
  frameStartTimes: number[];
  width: number;
  height: number;
  toggleMode: () => void;
  enablePageAnimation: () => void;
  exit: () => void;
  addFrame: () => void;
  deleteFrame: (frameId: string) => void;
  selectFrame: (frameId: string) => void;
  setFrameTiming: (frameId: string, patch: { durationMs?: number; easing?: EasingId }) => void;
  setLoop: (loop: boolean) => void;
  setFps: (fps: number) => void;
  togglePlay: () => void;
  scrub: (ms: number) => void;
  exportAnimation: (format: AnimationFormat) => void;
}

export interface UseStudioAnimationResult {
  displayLayers: Layer[];
  setLayers: (updater: LayersUpdater) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  commitUpdate: (id: string, updates: Partial<Layer>) => void;
  controller: AnimationController;
}

export const useStudioAnimation = ({
  activePage,
  activePageId,
  layers,
  template,
  updatePage,
  setLayers,
  updateLayer,
  pushHistory,
}: UseStudioAnimationArgs): UseStudioAnimationResult => {
  const mode = useAnimationMode();
  const activeFrameId = useActiveFrameId();
  const playheadMs = usePlayheadMs();
  const playing = usePlaying();

  const animation = activePage?.animation;

  const { credits } = useUser();
  const planRef = useRef(credits.plan);

  const exportSourceRef = useRef({ activePage, layers, animation, template });

  useEffect(() => {
    exportSourceRef.current = { activePage, layers, animation, template };
    planRef.current = credits.plan;
  });

  const frames = useMemo(() => animation?.frames ?? [], [animation]);
  const starts = useMemo(() => (animation ? frameStartTimes(animation) : [0]), [animation]);
  const activeFrameIndex = activeFrameId
    ? frames.findIndex((frame) => frame.id === activeFrameId)
    : -1;
  const isOverrideFrame = mode && !!animation && activeFrameIndex > 0 && !!activeFrameId;

  useEffect(() => {
    setActiveFrameIsOverride(isOverrideFrame);
  }, [isOverrideFrame]);

  useEffect(() => {
    setActiveFrameId(null);
    setPlayheadMs(0);
    setPlaying(false);
  }, [activePageId]);

  useEffect(() => {
    if (!mode || frames.length === 0) return;
    if (!activeFrameId) {
      setActiveFrameId(frames[0].id);
    }
  }, [mode, frames, activeFrameId]);

  const displayLayers = useMemo(() => {
    if (!mode || !animation) return layers;
    return interpolatePageLayers(layers, animation, playheadMs);
  }, [mode, animation, layers, playheadMs]);

  const effectiveSetLayers = useCallback(
    (updater: LayersUpdater) => {
      if (isOverrideFrame && activeFrameId) {
        updatePage(activePageId, (page) => {
          const pose = resolveFrameLayers(page.layers, activeFrameId);
          const next = typeof updater === "function" ? updater(pose) : updater;
          return captureFramePose(page, activeFrameId, next);
        });
        return;
      }
      setLayers(updater);
    },
    [isOverrideFrame, activeFrameId, activePageId, updatePage, setLayers],
  );

  const effectiveUpdateLayer = useCallback(
    (id: string, updates: Partial<Layer>) => {
      if (isOverrideFrame && activeFrameId) {
        const animPart: Record<string, unknown> = {};
        const rest: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
          const animatable =
            ANIMATABLE_KEYS.includes(key) && value !== undefined && value !== null;
          if (animatable) {
            animPart[key] = value;
          } else {
            rest[key] = value;
          }
        }
        if (Object.keys(animPart).length > 0) {
          updatePage(activePageId, (page) => setLayerFrameOverride(page, activeFrameId, id, animPart as LayerAnimState));
        }
        if (Object.keys(rest).length > 0) {
          updateLayer(id, rest as Partial<Layer>);
        }
        return;
      }
      updateLayer(id, updates);
    },
    [isOverrideFrame, activeFrameId, activePageId, updatePage, updateLayer],
  );

  const effectiveCommitUpdate = useCallback(
    (id: string, updates: Partial<Layer>) => {
      pushHistory();
      effectiveUpdateLayer(id, updates);
    },
    [pushHistory, effectiveUpdateLayer],
  );

  const enablePageAnimation = useCallback(() => {
    if (animation) return;
    const frameId = makeFrameId();
    pushHistory();
    updatePage(activePageId, (page) => enableAnimation(page, frameId));
    setActiveFrameId(frameId);
    setPlayheadMs(0);
  }, [animation, activePageId, updatePage, pushHistory]);

  const toggleMode = useCallback(() => {
    if (mode) {
      setPlaying(false);
      setAnimationMode(false);
      return;
    }
    enablePageAnimation();
    setPlayheadMs(0);
    setAnimationMode(true);
  }, [mode, enablePageAnimation]);

  const exit = useCallback(() => {
    resetAnimationEditor();
  }, []);

  const handleAddFrame = useCallback(() => {
    if (!animation) return;
    const frameId = makeFrameId();
    pushHistory();
    updatePage(activePageId, (page) => addFrame(page, frameId));
    setActiveFrameId(frameId);
    setPlaying(false);
    setPlayheadMs((starts[starts.length - 1] ?? 0) + DEFAULT_FRAME_DURATION_MS);
  }, [animation, activePageId, updatePage, pushHistory, starts]);

  const handleDeleteFrame = useCallback(
    (frameId: string) => {
      if (!animation || animation.frames.length <= 1) return;
      pushHistory();
      updatePage(activePageId, (page) => deleteFrame(page, frameId));
      if (activeFrameId === frameId) setActiveFrameId(animation.frames[0].id);
    },
    [animation, activeFrameId, activePageId, updatePage, pushHistory],
  );

  const selectFrame = useCallback(
    (frameId: string) => {
      setPlaying(false);
      setActiveFrameId(frameId);
      const index = frames.findIndex((frame) => frame.id === frameId);
      if (index >= 0 && index < starts.length) setPlayheadMs(starts[index]);
    },
    [frames, starts],
  );

  const handleSetFrameTiming = useCallback(
    (frameId: string, patch: { durationMs?: number; easing?: EasingId }) => {
      pushHistory();
      updatePage(activePageId, (page) => setFrameTiming(page, frameId, patch));
    },
    [activePageId, updatePage, pushHistory],
  );

  const setLoop = useCallback(
    (loop: boolean) => {
      pushHistory();
      updatePage(activePageId, (page) => setAnimationLoop(page, loop));
    },
    [activePageId, updatePage, pushHistory],
  );

  const setFps = useCallback(
    (fps: number) => {
      updatePage(activePageId, (page) => setAnimationFps(page, fps));
    },
    [activePageId, updatePage],
  );

  const togglePlay = useCallback(() => {
    setPlaying(!playing);
  }, [playing]);

  const scrub = useCallback((ms: number) => {
    setPlaying(false);
    setPlayheadMs(ms);
  }, []);

  const totalDurationMs = animation ? animationTotalDurationMs(animation) : 0;

  const exportAnimation = useCallback((format: AnimationFormat) => {
    const source = exportSourceRef.current;
    if (!source.animation || !source.activePage) return;
    const { activePage: page, layers: pageLayers, animation: pageAnimation, template: pageTemplate } = source;
    setPlaying(false);
    setAnimationExporting(true);
    setAnimationExportProgress(0);
    setAnimationExportError(null);
    void exportPageAnimation({
      template: pageTemplate,
      background: page.background,
      baseLayers: pageLayers,
      image: page.image ?? null,
      animation: pageAnimation,
      width: page.width,
      height: page.height,
      format,
      scale: getExportScale(),
      quality: getExportQuality(),
      plan: planRef.current,
      onProgress: setAnimationExportProgress,
    })
      .then(({ blob, extension }) => {
        downloadBlob(blob, `${page.name || "animation"}.${extension}`);
      })
      .catch((caught: unknown) => {
        setAnimationExportError(caught instanceof Error ? caught.message : String(caught));
      })
      .finally(() => {
        setAnimationExporting(false);
      });
  }, []);

  useEffect(() => {
    if (!playing || !animation || totalDurationMs <= 0) return;
    const startPlayhead = playheadMs;
    let startTs: number | null = null;
    let raf = 0;
    const step = (ts: number): void => {
      if (startTs === null) startTs = ts;
      const elapsed = ts - startTs;
      let next = startPlayhead + elapsed;
      if (animation.loop) {
        next = ((next % totalDurationMs) + totalDurationMs) % totalDurationMs;
      } else if (next >= totalDurationMs) {
        setPlayheadMs(totalDurationMs);
        setPlaying(false);
        return;
      }
      setPlayheadMs(next);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // playheadMs is captured at play start only; including it would restart the loop each frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, animation, totalDurationMs]);

  return {
    displayLayers,
    setLayers: effectiveSetLayers,
    updateLayer: effectiveUpdateLayer,
    commitUpdate: effectiveCommitUpdate,
    controller: {
      mode,
      animation,
      hasPage: !!activePage,
      pageName: activePage?.name ?? "",
      baseLayers: layers,
      background: activePage?.background ?? "#0b0b11",
      activeFrameId,
      activeFrameIndex,
      playing,
      playheadMs,
      totalDurationMs,
      frameStartTimes: starts,
      width: activePage?.width ?? 0,
      height: activePage?.height ?? 0,
      toggleMode,
      enablePageAnimation,
      exit,
      addFrame: handleAddFrame,
      deleteFrame: handleDeleteFrame,
      selectFrame,
      setFrameTiming: handleSetFrameTiming,
      setLoop,
      setFps,
      togglePlay,
      scrub,
      exportAnimation,
    },
  };
};
