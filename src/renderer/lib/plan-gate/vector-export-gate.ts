import { getPlanLimits } from "../../config/plan-limits";
import { emitModal } from "../event-bus";
import { trackEvent as trackPosthog } from "../analytics";
import { trackEvent } from "../tracker";

export const VECTOR_EXPORT_LOCKED_MESSAGE = "Vector exports are part of Pro. Upgrade to export SVG or Lottie.";

export class VectorExportLockedError extends Error {
  constructor() {
    super(VECTOR_EXPORT_LOCKED_MESSAGE);
    this.name = "VectorExportLockedError";
  }
}

export function allowVectorExportOrPrompt(plan: string, trigger: string): boolean {
  if (getPlanLimits(plan).allowSvgExport) return true;
  trackPosthog("payment_modal_opened", { trigger });
  trackEvent("payment", "modal_opened", { details: { trigger } });
  emitModal({ type: "studio-payment" });
  return false;
}
