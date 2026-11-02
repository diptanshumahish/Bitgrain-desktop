import { useEffect, useMemo, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { studioPagesSignal } from "../../state/studio-document-store";
import { resolveBackdrop, type BackdropSource } from "./resolve-backdrop";
import { backdropSamplesSignal, cancelBackdropSample, scheduleBackdropSample } from "./backdrop-sample-store";
import { sampleBackdropColor } from "./sample-backdrop";

export type BackdropView =
  | { state: "solid"; color: string; source: BackdropSource }
  | { state: "sampled"; color: string }
  | { state: "sampling" }
  | { state: "manual" };

export const useTextBackdrop = (layerId: string): BackdropView => {
  const pages = useSignalValue(studioPagesSignal);
  const samples = useSignalValue(backdropSamplesSignal);
  const backdrop = useMemo(() => resolveBackdrop(pages, layerId), [pages, layerId]);

  const backdropRef = useRef(backdrop);
  const sampleKey = backdrop?.kind === "image" ? backdrop.key : null;

  useEffect(() => {
    backdropRef.current = backdrop;
  }, [backdrop]);

  useEffect(() => {
    if (!sampleKey) return;
    scheduleBackdropSample(sampleKey, (abortSignal) => {
      const latest = backdropRef.current;
      return latest?.kind === "image" ? sampleBackdropColor(latest, abortSignal) : Promise.resolve(null);
    });
    return () => cancelBackdropSample(sampleKey);
  }, [sampleKey]);

  if (!backdrop) return { state: "manual" };
  if (backdrop.kind === "solid") return { state: "solid", color: backdrop.color, source: backdrop.source };
  const sample = samples.get(backdrop.key);
  if (!sample || sample.status === "pending") return { state: "sampling" };
  return sample.status === "done" ? { state: "sampled", color: sample.color } : { state: "manual" };
};
