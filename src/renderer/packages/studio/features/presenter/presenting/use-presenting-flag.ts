import { useEffect } from "react";
import { presentingSignal } from "@bitgrain/ui/overlays/presentation-mode";

export const usePresentingFlag = (): void => {
  useEffect(() => {
    presentingSignal.value = true;
    return () => {
      presentingSignal.value = false;
    };
  }, []);
};
