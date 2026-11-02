import { useCallback, useEffect, useRef } from "react";
import type { Layer } from "../../data/studioTypes";
import { findSelectedLayers } from "../../utils/studio-layers";
import { isCopiedLayersMarker, storeCopiedLayers, takePastedLayers } from "../../store/layer-clipboard-store";
import { trackEvent } from "../../lib/tracker";

interface UseLayerClipboardArgs {
  layers: Layer[];
  selectedIds: string[];
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
}

export interface LayerClipboardHandlers {
  handleCopy: (ids: string[]) => void;
  handlePaste: () => void;
}

const isEditableTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable]");

const writeMarkerToSystemClipboard = async (marker: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(marker);
  } catch {
    trackEvent("studio", "clipboard_write_blocked");
  }
};

export const useLayerClipboard = ({
  layers, selectedIds, setLayers, setSelectedIds, pushHistory,
}: UseLayerClipboardArgs): LayerClipboardHandlers => {
  const selectedIdsRef = useRef(selectedIds);
  const layersRef = useRef(layers);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
    layersRef.current = layers;
  });

  const copyIds = useCallback((ids: string[]): string | null => {
    const copied = findSelectedLayers(layersRef.current, ids);
    if (copied.length === 0) return null;
    trackEvent("studio", "layers_copied", { details: { count: copied.length } });
    return storeCopiedLayers(copied);
  }, []);

  const handleCopy = useCallback((ids: string[]): void => {
    const marker = copyIds(ids);
    if (marker) void writeMarkerToSystemClipboard(marker);
  }, [copyIds]);

  const handlePaste = useCallback((): void => {
    const pasted = takePastedLayers();
    if (pasted.length === 0) return;
    pushHistory();
    trackEvent("studio", "layers_pasted", { details: { count: pasted.length } });
    setLayers((prev) => [...prev, ...pasted]);
    setSelectedIds(pasted.map((layer) => layer.id));
  }, [pushHistory, setLayers, setSelectedIds]);

  useEffect(() => {
    const onCopy = (event: ClipboardEvent): void => {
      if (isEditableTarget(event.target) || selectedIdsRef.current.length === 0) return;
      const marker = copyIds(selectedIdsRef.current);
      if (!marker || !event.clipboardData) return;
      event.preventDefault();
      event.clipboardData.setData("text/plain", marker);
    };
    const onPaste = (event: ClipboardEvent): void => {
      if (isEditableTarget(event.target)) return;
      if (!isCopiedLayersMarker(event.clipboardData?.getData("text/plain") ?? "")) return;
      event.preventDefault();
      handlePaste();
    };
    window.addEventListener("copy", onCopy);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("paste", onPaste);
    };
  }, [copyIds, handlePaste]);

  return { handleCopy, handlePaste };
};
