import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";

type SyncStudioProject = () => Promise<CloudSyncOutcome>;

const syncRef: { current: SyncStudioProject | null } = { current: null };

export const registerStudioSync = (sync: SyncStudioProject): (() => void) => {
  syncRef.current = sync;
  return () => {
    if (syncRef.current === sync) syncRef.current = null;
  };
};

export async function syncStudioProject(): Promise<CloudSyncOutcome | null> {
  return syncRef.current ? await syncRef.current() : null;
}
