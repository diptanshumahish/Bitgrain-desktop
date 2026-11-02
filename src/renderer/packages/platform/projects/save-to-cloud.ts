import { userSignal } from "../auth/use-auth";
import { accountCreditsSignal } from "../account/user-credits-store";
import { getPlanLimits } from "../plans/plan-limits";
import { postProject, putProject, type ServerProject } from "./projects-api";
import { PAYMENT_REQUIRED_STATUS, type ApiOutcome } from "@bitgrain/api/api-outcome";
import { cloudLimitReached, countCloudProjectCreated, markCloudLimitReached } from "./cloud-usage/cloud-usage-store";
import { notifyCloudLimitOnce } from "./cloud-usage/cloud-limit-toast";
import { isKnownAbsentFromCloud, markAbsentFromCloud, markPresentInCloud } from "./cloud-usage/cloud-presence";

type CloudProjectPayload = Partial<ServerProject> & { id: string };

export type CloudSyncOutcome = "saved" | "not_synced" | "needs_pro" | "failed";

export const planAllowsCloudCreate = (): boolean => !cloudLimitReached();

export const planAllowsCloudVersions = (): boolean => {
  const account = accountCreditsSignal.value;
  if (!account) return true;
  return getPlanLimits(account.plan).cloudVersionHistory;
};

export const isPaymentRequired = (outcome: ApiOutcome<unknown>): boolean =>
  outcome.kind === "failed" && outcome.status === PAYMENT_REQUIRED_STATUS;

const syncOutcome = (outcome: ApiOutcome<unknown>): CloudSyncOutcome => {
  if (outcome.kind === "ok") return "saved";
  return isPaymentRequired(outcome) ? "needs_pro" : "failed";
};

const cloudLimitOutcome = (): CloudSyncOutcome => {
  markCloudLimitReached();
  notifyCloudLimitOnce();
  return "needs_pro";
};

const createInCloud = async (project: CloudProjectPayload): Promise<CloudSyncOutcome> => {
  if (!planAllowsCloudCreate()) return cloudLimitOutcome();
  const created = await postProject(project);
  if (isPaymentRequired(created)) return cloudLimitOutcome();
  if (created.kind === "ok") {
    countCloudProjectCreated();
    markPresentInCloud(project.id);
    return "saved";
  }
  const fallback = syncOutcome(await putProject(project.id, project));
  if (fallback === "saved") markPresentInCloud(project.id);
  return fallback;
};

export async function syncToCloud(project: CloudProjectPayload): Promise<CloudSyncOutcome> {
  if (!userSignal.value) return "not_synced";
  if (isKnownAbsentFromCloud(project.id)) return createInCloud(project);
  const updated = await putProject(project.id, project);
  if (updated.kind !== "not_found") return syncOutcome(updated);
  markAbsentFromCloud(project.id);
  return createInCloud(project);
}
