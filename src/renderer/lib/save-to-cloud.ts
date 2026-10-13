import { userSignal } from "../hooks/useAuth";
import { accountCreditsSignal } from "../store/user-credits-store";
import { getPlanLimits } from "../config/plan-limits";
import { createProject, putProject, type ServerProject } from "./projects-api";

type CloudProjectPayload = Partial<ServerProject> & { id: string };

export type CloudSyncOutcome = "saved" | "not_synced" | "failed";

export const planAllowsCloudCreate = (): boolean => {
  const account = accountCreditsSignal.value;
  if (!account) return true;
  return getPlanLimits(account.plan).cloudSync;
};

const createInCloud = async (project: CloudProjectPayload): Promise<CloudSyncOutcome> => {
  if (!planAllowsCloudCreate()) return "not_synced";
  if (await createProject(project)) return "saved";
  const retried = await putProject(project.id, project);
  return retried.kind === "ok" ? "saved" : "failed";
};

export async function syncToCloud(project: CloudProjectPayload): Promise<CloudSyncOutcome> {
  if (!userSignal.value) return "not_synced";
  const updated = await putProject(project.id, project);
  if (updated.kind === "ok") return "saved";
  if (updated.kind === "failed") return "failed";
  return createInCloud(project);
}
