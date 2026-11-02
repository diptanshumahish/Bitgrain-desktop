import { signal } from "@bitgrain/core/signal";
import type { ProjectVersion } from "../version-types";
import { listLocalVersions } from "./versions-db";
import { canReadCloudVersions, reconcileWithCloud } from "./cloud-sync";

export const versionsSignal = signal<ProjectVersion[]>([]);
export const versionsLoadingSignal = signal<boolean>(false);

const withoutSnapshots = (versions: ProjectVersion[]): ProjectVersion[] =>
  versions.map((version) => ({ ...version, snapshot: null }));

export async function refreshVersions(projectKey: string): Promise<void> {
  versionsLoadingSignal.value = true;
  try {
    const local = await listLocalVersions(projectKey);
    versionsSignal.value = withoutSnapshots(local);
    if (!canReadCloudVersions(projectKey)) return;
    versionsSignal.value = withoutSnapshots(await reconcileWithCloud(projectKey, local));
  } finally {
    versionsLoadingSignal.value = false;
  }
}
