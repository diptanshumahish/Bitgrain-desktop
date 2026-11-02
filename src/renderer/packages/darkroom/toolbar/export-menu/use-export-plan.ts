import { usePayment } from "@bitgrain/platform/billing/use-payment";
import { usePlanKnown } from "@bitgrain/platform/plans/gate/plan-status";
import { useExportPackBalance } from "@bitgrain/platform/billing/export-pack/export-pack-balance";
import { isPlainConversion } from "../../editor/export/plain-conversion/is-plain-conversion";

const PRO_PLAN = "pro";
const FREE_PLAN = "free";

interface ExportPlanState {
  exportPlan: string;
  displayPlan: string;
  showsWatermark: boolean;
  packNote: string | null;
}

export const useExportPlan = (): ExportPlanState => {
  const { credits } = usePayment();
  const planKnown = usePlanKnown();
  const packBalance = useExportPackBalance();
  const isFreePlan = planKnown && credits.plan === FREE_PLAN;
  const isPlain = isPlainConversion();
  const usesPack = isFreePlan && packBalance > 0 && !isPlain;
  return {
    exportPlan: isFreePlan && !usesPack ? FREE_PLAN : PRO_PLAN,
    displayPlan: planKnown ? credits.plan : PRO_PLAN,
    showsWatermark: isFreePlan && packBalance === 0 && !isPlain,
    packNote: usesPack ? `Clean download from your pack, ${packBalance} left` : null,
  };
};
