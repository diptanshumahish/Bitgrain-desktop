import { emitPlatformModal } from "../modals/platform-modal-events";
import { trackEvent } from "../tracker";
import { runGuestHandoff } from "./guest-handoff";
import type { GuestSignInReason } from "./guest-prompt-copy";

const handoffOrNull = async (): Promise<string | null> => {
  try {
    return await runGuestHandoff();
  } catch {
    void trackEvent("auth", "guest_handoff_failed");
    return null;
  }
};

export async function signInKeepingWork(reason: GuestSignInReason): Promise<void> {
  const resumePath = await handoffOrNull();
  void trackEvent("auth", "guest_sign_in_clicked", { details: { reason } });
  emitPlatformModal({ type: "login", reason, next: resumePath ?? undefined });
}
