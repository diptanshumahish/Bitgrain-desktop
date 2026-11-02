import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { FREE_CLOUD_PROJECT_LIMIT } from "../../plans/plan-limits";

const toastState = { shown: false };

export const notifyCloudLimitOnce = (): void => {
  if (toastState.shown) return;
  toastState.shown = true;
  emitStatusToast({
    title: "Saved on this device",
    detail: `The free plan keeps ${FREE_CLOUD_PROJECT_LIMIT} projects in the cloud. New ones stay safe in this browser.`,
    action: { label: "See Pro", href: "/pricing" },
  });
};
