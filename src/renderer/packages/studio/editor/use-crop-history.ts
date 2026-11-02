import { useEffect, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { cropLayerIdSignal } from "../layers/crop/crop-mode-signal";

export function useCropHistory(pushHistory: () => void): void {
  const cropLayerId = useSignalValue(cropLayerIdSignal);
  const previousRef = useRef<string | null>(null);
  const pushRef = useRef(pushHistory);

  useEffect(() => {
    pushRef.current = pushHistory;
  });

  useEffect(() => {
    if (previousRef.current && previousRef.current !== cropLayerId) pushRef.current();
    previousRef.current = cropLayerId;
  }, [cropLayerId]);
}
