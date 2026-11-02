import { useCallback, useEffect, useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";

interface ConvertedShape {
  id: string;
  signature: string;
}

const layerSignature = (layer: Layer): string => JSON.stringify(layer);

export function useRevertUntouchedVector(
  vectorEditingId: string | null,
  layers: Layer[],
  undo: () => void,
): (id: string, vectorLayer: Layer) => void {
  const convertedRef = useRef<ConvertedShape | null>(null);
  const previousIdRef = useRef(vectorEditingId);

  useEffect(() => {
    const previousId = previousIdRef.current;
    previousIdRef.current = vectorEditingId;
    const converted = convertedRef.current;
    if (!previousId || previousId === vectorEditingId || converted?.id !== previousId) return;
    convertedRef.current = null;
    const current = findLayerById(layers, previousId);
    if (current && layerSignature(current) === converted.signature) undo();
  }, [vectorEditingId, layers, undo]);

  return useCallback((id: string, vectorLayer: Layer): void => {
    convertedRef.current = { id, signature: layerSignature(vectorLayer) };
  }, []);
}
