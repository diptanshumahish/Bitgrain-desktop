import { userSignal } from "../hooks/useAuth";
import { accountCreditsSignal } from "../store/user-credits-store";
import { getPlanLimits } from "../config/plan-limits";
import { createProject, updateProject, type ServerProject } from "./projects-api";

type CloudProjectPayload = Partial<ServerProject> & { id: string };

const planAllowsCloudCreate = (): boolean => {
  const account = accountCreditsSignal.value;
  if (!account) return true;
  return getPlanLimits(account.plan).cloudSync;
};

export async function saveToCloud(project: CloudProjectPayload): Promise<boolean> {
  if (!userSignal.value) return false;
  if (await updateProject(project.id, project)) return true;
  if (!planAllowsCloudCreate()) return false;
  const created = await createProject(project);
  return created !== null;
}
