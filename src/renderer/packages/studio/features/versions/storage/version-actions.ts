import type { NewVersionInput, ProjectVersion } from "../version-types";
import { deleteLocalVersion, listLocalVersions, putLocalVersion } from "./versions-db";
import { canUploadVersions, pushVersion } from "./cloud-sync";

export const MAX_AUTO_VERSIONS = 10;

const trimLocalAutoVersions = async (projectKey: string): Promise<void> => {
  const autos = (await listLocalVersions(projectKey)).filter((version) => version.auto);
  await Promise.all(autos.slice(MAX_AUTO_VERSIONS).map((version) => deleteLocalVersion(version.id)));
};

const buildVersion = (input: NewVersionInput): ProjectVersion => ({
  ...input,
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  cloud: canUploadVersions(input.projectKey) ? "pending" : "local",
});

export async function createVersion(input: NewVersionInput): Promise<ProjectVersion> {
  const version = buildVersion(input);
  await putLocalVersion(version);
  if (version.auto) await trimLocalAutoVersions(version.projectKey);
  return await pushVersion(version);
}
