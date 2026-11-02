import type { ProjectVersion, VersionSnapshot } from "../version-types";
import { deleteLocalVersion, getLocalVersion, putLocalVersion } from "./versions-db";
import { deleteCloudVersion, fetchCloudVersion, renameCloudVersion } from "./versions-cloud-api";

const isInCloud = (version: ProjectVersion): boolean => version.cloud === "synced" || version.cloud === "remote";

export async function renameVersion(version: ProjectVersion, name: string): Promise<boolean> {
  if (isInCloud(version)) {
    const outcome = await renameCloudVersion(version, name);
    if (outcome.kind === "failed") return false;
  }
  const local = await getLocalVersion(version.id);
  if (local) await putLocalVersion({ ...local, name, auto: false });
  return true;
}

export async function removeVersion(version: ProjectVersion): Promise<boolean> {
  if (isInCloud(version)) {
    const outcome = await deleteCloudVersion(version);
    if (outcome.kind === "failed") return false;
  }
  await deleteLocalVersion(version.id);
  return true;
}

const fetchRemoteSnapshot = async (version: ProjectVersion): Promise<VersionSnapshot | null> => {
  const outcome = await fetchCloudVersion(version.projectKey, version.id);
  if (outcome.kind !== "ok") return null;
  await putLocalVersion({ ...version, snapshot: outcome.data.data, cloud: "synced" });
  return outcome.data.data;
};

export async function loadVersionSnapshot(version: ProjectVersion): Promise<VersionSnapshot | null> {
  if (version.snapshot) return version.snapshot;
  const local = await getLocalVersion(version.id);
  if (local?.snapshot) return local.snapshot;
  return await fetchRemoteSnapshot(version);
}
