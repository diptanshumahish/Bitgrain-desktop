import { resolveAssetUrl } from "@bitgrain/api/api-client";
import type { ProjectVersion } from "../version-types";
import type { CloudVersionSummary } from "./versions-cloud-api";

interface VersionMergeResult {
  merged: ProjectVersion[];
  staleIds: string[];
  updated: ProjectVersion[];
}

const fromCloud = (projectKey: string, summary: CloudVersionSummary): ProjectVersion => ({
  id: summary.id,
  projectKey,
  name: summary.name,
  auto: summary.auto,
  createdAt: new Date(summary.createdAt).getTime(),
  thumbnail: resolveAssetUrl(summary.thumbnail),
  snapshot: null,
  cloud: "remote",
});

const applyCloudMeta = (local: ProjectVersion, summary: CloudVersionSummary): ProjectVersion => ({
  ...local,
  name: summary.name,
  auto: summary.auto,
  cloud: "synced",
});

const isStale = (local: ProjectVersion, cloudById: Map<string, CloudVersionSummary>): boolean =>
  local.cloud === "synced" && !cloudById.has(local.id);

const needsUpdate = (local: ProjectVersion, summary: CloudVersionSummary): boolean =>
  local.cloud !== "synced" || local.name !== summary.name || local.auto !== summary.auto;

export function mergeVersions(
  projectKey: string,
  local: ProjectVersion[],
  cloud: CloudVersionSummary[],
): VersionMergeResult {
  const cloudById = new Map(cloud.map((summary) => [summary.id, summary]));
  const localIds = new Set(local.map((version) => version.id));
  const staleIds = local.filter((version) => isStale(version, cloudById)).map((version) => version.id);
  const kept = local.filter((version) => !isStale(version, cloudById));
  const updated = kept.flatMap((version) => {
    const summary = cloudById.get(version.id);
    return summary && needsUpdate(version, summary) ? [applyCloudMeta(version, summary)] : [];
  });
  const updatedById = new Map(updated.map((version) => [version.id, version]));
  const remote = cloud.filter((summary) => !localIds.has(summary.id)).map((summary) => fromCloud(projectKey, summary));
  const merged = [...kept.map((version) => updatedById.get(version.id) ?? version), ...remote];
  return { merged: merged.sort((left, right) => right.createdAt - left.createdAt), staleIds, updated };
}
