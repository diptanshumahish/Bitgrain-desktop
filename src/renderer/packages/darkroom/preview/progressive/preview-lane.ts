export interface PreviewJob {
  generation: number;
  params: Record<string, unknown>;
}

export interface PreviewLane {
  worker: Worker;
  busy: boolean;
  pending: PreviewJob | null;
  sentAt: number;
}

export const createPreviewLane = (worker: Worker): PreviewLane => ({
  worker,
  busy: false,
  pending: null,
  sentAt: 0,
});

const postJob = (lane: PreviewLane, job: PreviewJob): void => {
  lane.busy = true;
  lane.sentAt = performance.now();
  lane.worker.postMessage({ type: "process", id: job.generation, params: job.params });
};

export const submitToLane = (lane: PreviewLane, job: PreviewJob): void => {
  if (lane.busy) {
    lane.pending = job;
    return;
  }
  postJob(lane, job);
};

export const completeLaneJob = (lane: PreviewLane): number => {
  const elapsedMs = performance.now() - lane.sentAt;
  lane.busy = false;
  const next = lane.pending;
  lane.pending = null;
  if (next) postJob(lane, next);
  return elapsedMs;
};

export const resetLane = (lane: PreviewLane): void => {
  lane.busy = false;
  lane.pending = null;
};
