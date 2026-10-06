import { useEffect, useRef } from "react";
import { useSignalValue } from "../../../lib/signal";
import { currentProjectSignal, updateProject } from "../store/project-store";
import { getMediaBlob } from "../utils/media-blob-store";
import { extractWaveform } from "../engine/extract-waveform";

async function backfillWaveform(
  assetId: string,
  blobId: string,
  inFlight: Set<string>,
): Promise<void> {
  let peaks: number[] = [];
  try {
    const blob = await getMediaBlob(blobId);
    if (blob) peaks = (await extractWaveform(blob)).peaks;
  } finally {
    updateProject((project) => ({
      ...project,
      mediaPool: project.mediaPool.map((asset) =>
        asset.id === assetId ? { ...asset, waveformPeaks: peaks } : asset,
      ),
    }));
    inFlight.delete(blobId);
  }
}

export function useWaveformBackfill(): void {
  const project = useSignalValue(currentProjectSignal);
  const mediaPool = project?.mediaPool;
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!mediaPool) return;
    for (const asset of mediaPool) {
      if (asset.kind !== "video") continue;
      if (asset.waveformPeaks !== undefined) continue;
      if (inFlight.current.has(asset.blobId)) continue;
      inFlight.current.add(asset.blobId);
      void backfillWaveform(asset.id, asset.blobId, inFlight.current);
    }
  }, [mediaPool]);
}
