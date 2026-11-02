import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { backendEnabled } from "@bitgrain/api/api-client";
import { isPaymentRequired, planAllowsCloudVersions } from "@bitgrain/platform/projects/save-to-cloud";
import type { ApiOutcome } from "@bitgrain/api/api-outcome";
import { DRAFT_PROJECT_KEY, type ProjectVersion, type VersionCloudState } from "../version-types";
import { deleteLocalVersion, putLocalVersion } from "./versions-db";
import { fetchCloudVersions, uploadCloudVersion } from "./versions-cloud-api";
import { mergeVersions } from "./merge-versions";

export const canReadCloudVersions = (projectKey: string): boolean =>
  backendEnabled && !!userSignal.value && projectKey !== DRAFT_PROJECT_KEY;

export const canUploadVersions = (projectKey: string): boolean =>
  canReadCloudVersions(projectKey) && planAllowsCloudVersions();

const stateAfterUpload = (outcome: ApiOutcome<unknown>): VersionCloudState => {
  if (outcome.kind === "ok") return "synced";
  if (outcome.kind === "not_found" || isPaymentRequired(outcome)) return "local";
  return "pending";
};

export async function pushVersion(version: ProjectVersion): Promise<ProjectVersion> {
  if (!version.snapshot || !canUploadVersions(version.projectKey)) return version;
  const next: ProjectVersion = { ...version, cloud: stateAfterUpload(await uploadCloudVersion(version)) };
  await putLocalVersion(next);
  return next;
}

const pushPending = async (local: ProjectVersion[]): Promise<ProjectVersion[]> =>
  await Promise.all(local.map((version) => (version.cloud === "pending" ? pushVersion(version) : version)));

export async function reconcileWithCloud(projectKey: string, local: ProjectVersion[]): Promise<ProjectVersion[]> {
  const pushed = await pushPending(local);
  const cloud = await fetchCloudVersions(projectKey);
  if (cloud.kind !== "ok") return pushed;
  const { merged, staleIds, updated } = mergeVersions(projectKey, pushed, cloud.data);
  await Promise.all([...staleIds.map(deleteLocalVersion), ...updated.map(putLocalVersion)]);
  return merged;
}
