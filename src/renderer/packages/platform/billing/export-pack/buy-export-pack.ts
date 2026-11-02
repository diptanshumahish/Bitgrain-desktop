import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { startDodoOneTime } from "../start-dodo-redirect";
import { userSignal } from "../../auth/use-auth";
import { isPlausibleEmail } from "../guest-checkout/is-plausible-email";
import { guestPackEmailSignal, guestPackErrorSignal, guestPackFormOpenSignal } from "./guest/guest-pack-state";
import { signal } from "@bitgrain/core/signal";
import { trackEvent } from "../../tracker";
import { detectCurrency, EXPORT_PACK_BUNDLE } from "@bitgrain/core/format/currency";

export const exportPackCheckoutBusySignal = signal<boolean>(false);

const FALLBACK_RETURN_PATH = "/editor";

const currentPath = (): string => {
  const path = `${window.location.pathname}${window.location.search}`;
  return path.startsWith("/sign-in") ? FALLBACK_RETURN_PATH : path;
};
const GUEST_EMAIL_MISSING = "Add the email you'd like your receipt sent to.";

// A signed-out buyer pays first: the first click opens the email field, the second goes to Dodo.
const guestEmailOrPrompt = (): string | null => {
  if (!guestPackFormOpenSignal.value) {
    guestPackFormOpenSignal.value = true;
    return null;
  }
  const email = guestPackEmailSignal.value.trim();
  guestPackErrorSignal.value = isPlausibleEmail(email) ? null : GUEST_EMAIL_MISSING;
  return isPlausibleEmail(email) ? email : null;
};

export async function buyExportPack(trigger: string, next: string = currentPath()): Promise<void> {
  if (exportPackCheckoutBusySignal.value) return;
  trackEvent("payment", "export_pack_clicked", { details: { trigger, signed_in: Boolean(userSignal.value) } });
  const guestEmail = userSignal.value ? undefined : guestEmailOrPrompt();
  if (guestEmail === null) return;
  exportPackCheckoutBusySignal.value = true;
  const result = await startDodoOneTime({
    bundleId: EXPORT_PACK_BUNDLE,
    currency: detectCurrency(),
    appliedCoupon: null,
    next,
    guestEmail,
  });
  if (result.status === "redirecting") return;
  exportPackCheckoutBusySignal.value = false;
  emitStatusToast({
    title: "We couldn't open the checkout",
    detail: "Nothing was charged. Please try again in a moment.",
  });
}
