import { buildCheckoutPath } from "../../billing/checkout-session";
import { trackEvent } from "../../tracker";
import type { UpgradeFeature } from "./upgrade-copy";

export const openPlansInNewTab = (feature: UpgradeFeature): void => {
  trackEvent("payment", "modal_opened", { details: { trigger: `upgrade_prompt_${feature}` } });
  const current = window.location.pathname + window.location.search;
  window.open(buildCheckoutPath(current), "_blank", "noopener");
};
