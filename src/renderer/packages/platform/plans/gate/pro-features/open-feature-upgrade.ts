import { emitPlatformModal } from "../../../modals/platform-modal-events";
import type { UpgradeFeature } from "../../../modals/upgrade-prompt/upgrade-copy";
import { trackEvent } from "../../../tracker";

export function openFeatureUpgrade(feature: UpgradeFeature, trigger: string): void {
  trackEvent("payment", "modal_opened", { details: { trigger } });
  emitPlatformModal({ type: "upgrade-prompt", feature });
}
