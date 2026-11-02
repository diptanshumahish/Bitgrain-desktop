import React from "react";
import { usePayment } from "@bitgrain/platform/billing/use-payment";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { usePlanKnown } from "@bitgrain/platform/plans/gate/plan-status";
import { ExportFreeNudge } from "../../../panels/ExportFreeNudge";

interface MobileExportPlanNoteProps {
  requestedLongEdge: number;
}

export const MobileExportPlanNote: React.FC<MobileExportPlanNoteProps> = ({ requestedLongEdge }) => {
  const { credits } = usePayment();
  const planKnown = usePlanKnown();
  if (!planKnown || !getPlanLimits(credits.plan).watermark) return null;
  return <ExportFreeNudge requestedLongEdge={requestedLongEdge} />;
};
