import { useCallback } from "react";
import {
  makeTextLayer, makeShapeLayer, makeUploadLayer, makeVectorLayer, makeInkLayer, makeAdjustmentLayer,
  placeTextLayer, placeShapeLayer, findSelectedLayers, updateLayersRecursively,
} from "@bitgrain/studio-core/layers/studio-layers";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitStudioModal } from "../modals/studio-dialog/host/studio-modal-events";
import { buildScatterCollage } from "@bitgrain/studio-core/layers/scatter-collage";
import type {
  Layer, ShapeType, BezierAnchor, VectorSettings, UploadLayer, InkPoint, LayerPlacement,
} from "@bitgrain/studio-core/model/studio-types";
import { useLayerStructure, type LayerStructureHandlers } from "./use-layer-structure";
import { useLayerClipboard, type LayerClipboardHandlers } from "./use-layer-clipboard";
import { fitNewImageSize, placeNewImage, type NewImageOptions } from "./fit-new-image";
import { replaceDroppedImage } from "./replace-image-source";
import { duplicateLayers } from "./duplicate/duplicate-layers";
import { useStyleClipboard, type StyleClipboardHandlers } from "./layer-style/use-style-clipboard";
import { useLayerShortcuts } from "./layer-shortcuts/use-layer-shortcuts";
import { useRememberTextStyle } from "./layer-style/use-remember-text-style";
import { readRememberedTextStyle } from "./layer-style/text-style-memory";
import { applyRememberedTextStyle } from "./layer-style/apply-remembered-text-style";

interface UseStudioLayersArgs {
  layers: Layer[];
  selectedIds: string[];
  pageWidth: number;
  pageHeight: number;
  background: string;
  setLayers: (updater: (prev: Layer[]) => Layer[] | Layer[]) => void;
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  pushHistory: () => void;
  setEditingId?: (id: string | null) => void;
  targetFrameId?: string | null;
  targetFrameSize?: { width: number; height: number } | null;
  setLayersForFrame?: (frameId: string, updater: (prev: Layer[]) => Layer[]) => void;
}

interface UseStudioLayersResult extends LayerStructureHandlers, LayerClipboardHandlers, StyleClipboardHandlers {
  handleAddText: (placement?: LayerPlacement) => void;
  handleAddShape: (shapeType: ShapeType, placement?: LayerPlacement) => void;
  handleAddImage: () => void;
  handleAddAdjustment: () => void;
  handleAddPattern: () => void;
  handleAddImageFromUrl: (src: string, opts?: NewImageOptions) => void;
  handleAddVector: (anchors: BezierAnchor[], closed: boolean, settings: VectorSettings) => void;
  handleAddInk: (strokes: InkPoint[][], settings: VectorSettings) => void;
  handleDeleteLayer: (id: string) => void;
  handleDuplicate: (ids: string[]) => void;
  handleFlipLayerH: (id: string) => void;
  handleFlipLayerV: (id: string) => void;
  handleAlign: (alignment: string) => void;
  handleScatterCollage: () => void;
}

export const useStudioLayers = ({
  layers,
  selectedIds,
  pageWidth,
  pageHeight,
  background,
  setLayers,
  setSelectedIds,
  pushHistory,
  setEditingId,
  targetFrameId = null,
  targetFrameSize = null,
  setLayersForFrame,
}: UseStudioLayersArgs): UseStudioLayersResult => {
  const addW = targetFrameSize?.width ?? pageWidth;
  const addH = targetFrameSize?.height ?? pageHeight;

  const structure = useLayerStructure({ layers, selectedIds, setLayers, setSelectedIds, pushHistory });
  const clipboard = useLayerClipboard({ layers, selectedIds, setLayers, setSelectedIds, pushHistory });
  const styleClipboard = useStyleClipboard({ layers, setLayers, pushHistory });
  useLayerShortcuts({ selectedIds, setLayers, pushHistory, ...styleClipboard, handlePasteInPlace: clipboard.handlePasteInPlace });
  useRememberTextStyle(layers, selectedIds);

  const commitNewLayer = useCallback(
    (layer: Layer, intoFrame: boolean) => {
      if (intoFrame && targetFrameId && setLayersForFrame) {
        setLayersForFrame(targetFrameId, (prev) => [...prev, layer]);
      } else {
        setLayers((prev) => [...prev, layer]);
      }
      setSelectedIds([layer.id]);
    },
    [targetFrameId, setLayersForFrame, setLayers, setSelectedIds],
  );

  const handleAddText = useCallback((placement?: LayerPlacement) => {
    pushHistory();
    const rememberedStyle = readRememberedTextStyle();
    const base = applyRememberedTextStyle(makeTextLayer(addW, addH, layers.length, background), rememberedStyle);
    const placed = placement ? placeTextLayer(base, placement) : base;
    const l = rememberedStyle?.align ? { ...placed, align: rememberedStyle.align } : placed;
    trackEvent("studio", "layer_added", { details: { type: "text" } });
    commitNewLayer(l, !placement);
    setEditingId?.(l.id);
  }, [addW, addH, background, layers.length, pushHistory, commitNewLayer, setEditingId]);

  const handleAddShape = useCallback((shapeType: ShapeType, placement?: LayerPlacement) => {
    pushHistory();
    const base = makeShapeLayer(addW, addH, shapeType, layers.length);
    const l = placement ? placeShapeLayer(base, placement) : base;
    trackEvent("studio", "layer_added", { details: { type: "shape", shape: shapeType } });
    commitNewLayer(l, !placement);
  }, [addW, addH, layers.length, pushHistory, commitNewLayer]);

  const handleAddImageFromUrl = useCallback(
    (src: string, opts?: NewImageOptions) => {
      pushHistory();
      if (opts?.replaceLayerId) {
        replaceDroppedImage({ layerId: opts.replaceLayerId, src, name: opts.name, setLayers, setSelectedIds });
        return;
      }
      const base = makeUploadLayer(addW, addH, layers.length);
      const size = fitNewImageSize(opts, { width: addW, height: addH });
      const layer: Layer = {
        ...base,
        id: `upload-${crypto.randomUUID()}`,
        src,
        name: opts?.name ?? base.name,
        width: size.width,
        height: size.height,
        ...placeNewImage(size, { width: addW, height: addH }, opts),
      };
      trackEvent("studio", "layer_added", { details: { type: "image_plugin" } });
      commitNewLayer(layer, true);
    },
    [addW, addH, layers.length, pushHistory, commitNewLayer, setLayers, setSelectedIds],
  );

  const handleAddImage = useCallback(() => {
    emitStudioModal({
      type: "add-image",
      onPick: (src, dims, name) =>
        handleAddImageFromUrl(src, { name, width: dims?.width, height: dims?.height }),
    });
  }, [handleAddImageFromUrl]);

  const handleAddAdjustment = useCallback(() => {
    pushHistory();
    const layer = makeAdjustmentLayer(addW, addH, layers.length);
    trackEvent("studio", "layer_added", { details: { type: "adjustment" } });
    commitNewLayer(layer, true);
  }, [addW, addH, layers.length, pushHistory, commitNewLayer]);

  const handleAddPattern = useCallback(() => {
    emitStudioModal({
      type: "pattern",
      canvasWidth: addW,
      canvasHeight: addH,
      onApply: (group) => {
        pushHistory();
        trackEvent("studio", "layer_added", { details: { type: "pattern", name: group.name } });
        commitNewLayer(group, true);
      },
    });
  }, [addW, addH, pushHistory, commitNewLayer]);

  const handleAddVector = useCallback((anchors: BezierAnchor[], closed: boolean, settings: VectorSettings) => {
    if (anchors.length < 2) return;
    pushHistory();
    const l = makeVectorLayer(anchors, closed, settings, layers.length);
    trackEvent("studio", "layer_added", {
      details: { type: "vector", layer_id: l.id, anchor_count: anchors.length, closed },
    });
    setLayers((prev) => [...prev, l]);
    setSelectedIds([l.id]);
  }, [layers.length, pushHistory, setLayers, setSelectedIds]);

  const handleAddInk = useCallback((strokes: InkPoint[][], settings: VectorSettings) => {
    const usable = strokes.filter((stroke) => stroke.length >= 2);
    if (usable.length === 0) return;
    pushHistory();
    const l = makeInkLayer(usable, settings, layers.length);
    if (l.strokes.length === 0) return;
    trackEvent("studio", "layer_added", {
      details: { type: "ink", layer_id: l.id, stroke_count: usable.length },
    });
    setLayers((prev) => [...prev, l]);
    setSelectedIds([l.id]);
  }, [layers.length, pushHistory, setLayers, setSelectedIds]);

  const handleDeleteLayer = useCallback((id: string) => {
    pushHistory();
    trackEvent("studio", "layer_deleted", { details: { trigger: "panel" } });
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((sid) => sid !== id));
  }, [pushHistory, setLayers, setSelectedIds]);

  const handleDuplicate = useCallback((ids: string[]) => {
    const result = duplicateLayers(layers, ids);
    if (result.clones.length === 0) return;
    pushHistory();
    trackEvent("studio", "layer_duplicated", { details: { count: result.clones.length } });
    setLayers(() => result.layers);
    setSelectedIds(result.clones.map((clone) => clone.id));
  }, [layers, pushHistory, setLayers, setSelectedIds]);

  const handleFlipLayerH = useCallback((id: string) => {
    pushHistory();
    trackEvent("studio", "layer_flipped", { details: { axis: "horizontal" } });
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? ({ ...l, flipH: !l.flipH } as Layer) : l)),
    );
  }, [pushHistory, setLayers]);

  const handleFlipLayerV = useCallback((id: string) => {
    pushHistory();
    trackEvent("studio", "layer_flipped", { details: { axis: "vertical" } });
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? ({ ...l, flipV: !l.flipV } as Layer) : l)),
    );
  }, [pushHistory, setLayers]);

  const handleAlign = useCallback((alignment: string) => {
    if (selectedIds.length === 0) return;
    pushHistory();

    const selectedLayers = findSelectedLayers(layers, selectedIds);
    if (selectedLayers.length === 0) return;
    trackEvent("studio", "align_used", { details: { alignment, count: selectedLayers.length } });

    let targetBox = { minX: 0, minY: 0, maxX: pageWidth, maxY: pageHeight };

    if (selectedLayers.length > 1) {
      const minX = Math.min(...selectedLayers.map((l) => l.x));
      const minY = Math.min(...selectedLayers.map((l) => l.y));
      const maxX = Math.max(...selectedLayers.map((l) => l.x + l.width));
      const maxY = Math.max(...selectedLayers.map((l) => l.y + l.height));
      targetBox = { minX, minY, maxX, maxY };
    }

    const { minX, minY, maxX, maxY } = targetBox;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setLayers((prev) =>
      updateLayersRecursively(prev, selectedIds, (l) => {
        switch (alignment) {
          case "left": return { x: minX };
          case "center": return { x: centerX - l.width / 2 };
          case "right": return { x: maxX - l.width };
          case "top": return { y: minY };
          case "middle": return { y: centerY - l.height / 2 };
          case "bottom": return { y: maxY - l.height };
          default: return {};
        }
      }),
    );
  }, [selectedIds, layers, pageWidth, pageHeight, pushHistory, setLayers]);

  const handleScatterCollage = useCallback(() => {
    const uploads = findSelectedLayers(layers, selectedIds).filter(
      (layer): layer is UploadLayer => layer.type === "upload" && Boolean(layer.src),
    );
    if (uploads.length < 2) return;
    pushHistory();
    const updateById = new Map(
      buildScatterCollage(uploads, pageWidth, pageHeight).map((entry) => [entry.id, entry.updates]),
    );
    setLayers((prev) =>
      updateLayersRecursively(prev, selectedIds, (layer) => updateById.get(layer.id) ?? {}),
    );
    trackEvent("studio", "scatter_collage", { details: { count: uploads.length } });
  }, [selectedIds, layers, pageWidth, pageHeight, pushHistory, setLayers]);

  return {
    handleAddText,
    handleAddShape,
    handleAddImage,
    handleAddAdjustment,
    handleAddPattern,
    handleAddImageFromUrl,
    handleAddVector,
    handleAddInk,
    handleDeleteLayer,
    handleDuplicate,
    ...structure,
    ...clipboard,
    ...styleClipboard,
    handleFlipLayerH,
    handleFlipLayerV,
    handleAlign,
    handleScatterCollage,
  };
};
