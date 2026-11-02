import { useLayoutEffect, useRef } from "react";
import { requestCanvasFit } from "../state/canvas-fit-request";

export const useRefitOnTimelineChange = (layoutKey: string): void => {
  const previousKeyRef = useRef(layoutKey);

  useLayoutEffect(() => {
    if (previousKeyRef.current === layoutKey) return;
    previousKeyRef.current = layoutKey;
    requestCanvasFit();
  }, [layoutKey]);
};
