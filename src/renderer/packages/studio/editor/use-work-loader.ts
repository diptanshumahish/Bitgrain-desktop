import { useCallback, useEffect, useRef } from "react";
import { loadWorkById } from "@bitgrain/platform/projects/works-store";
import { savedWorkFoundSignal, workLoadStateSignal } from "../state/studio-load-state";
import type { Work } from "@bitgrain/studio-core/model/work";
import { requestCanvasFit } from "../state/canvas-fit-request";

interface UseWorkLoaderArgs {
  workId: string | undefined;
  onWorkLoaded: (work: Work) => void;
}

export const useWorkLoader = ({ workId, onWorkLoaded }: UseWorkLoaderArgs): (() => Promise<void>) => {
  const onWorkLoadedRef = useRef(onWorkLoaded);
  const requestIdRef = useRef(0);

  useEffect(() => {
    onWorkLoadedRef.current = onWorkLoaded;
  });

  const load = useCallback(async (): Promise<void> => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    if (!workId) {
      workLoadStateSignal.value = "idle";
      return;
    }
    workLoadStateSignal.value = "loading";
    savedWorkFoundSignal.value = false;
    const result = await loadWorkById(workId);
    if (requestId !== requestIdRef.current) return;
    if (result.kind === "found") {
      savedWorkFoundSignal.value = true;
      onWorkLoadedRef.current(result.work);
      requestCanvasFit();
    }
    workLoadStateSignal.value = result.kind === "failed" ? "failed" : "loaded";
  }, [workId]);

  useEffect(() => {
    void load();
    return () => {
      requestIdRef.current += 1;
      workLoadStateSignal.value = "idle";
    };
  }, [load]);

  return load;
};
