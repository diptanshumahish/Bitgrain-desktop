import { useEffect, useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { refitVectorLayer } from "../layers/vector-refit";

export function useVectorRefitOnExit(
  vectorEditingId: string | null,
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void,
): void {
  const previousIdRef = useRef(vectorEditingId);

  useEffect(() => {
    const previousId = previousIdRef.current;
    previousIdRef.current = vectorEditingId;
    if (!previousId || previousId === vectorEditingId) return;
    setLayers((prev) =>
      updateLayersRecursively(prev, [previousId], (layer) =>
        layer.type === "vector" ? refitVectorLayer(layer) ?? {} : {},
      ),
    );
  }, [vectorEditingId, setLayers]);
}
