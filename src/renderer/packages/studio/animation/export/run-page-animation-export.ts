import { exportPageAnimation, type ExportAnimationArgs } from "./export-page-animation";
import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import { saveExportedAnimation } from "./save-exported-animation";

const PLAN_UNKNOWN_MESSAGE = "We couldn't check your plan. Please try the export again in a moment.";

type PageAnimationRequest = Omit<ExportAnimationArgs, "plan">;

export async function runPageAnimationExport(request: PageAnimationRequest, pageName: string): Promise<void> {
  const grant = await resolveExportPlan();
  if (!grant) throw new Error(PLAN_UNKNOWN_MESSAGE);
  try {
    const result = await exportPageAnimation({ ...request, plan: grant.plan });
    saveExportedAnimation(result, request.format, pageName);
  } catch (error) {
    await settleExportPack(grant, "failed");
    throw error;
  }
  await settleExportPack(grant, "done");
}
