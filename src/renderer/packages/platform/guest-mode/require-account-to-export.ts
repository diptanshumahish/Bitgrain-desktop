import { isGuest } from "./is-guest";
import { promptGuestSignIn } from "./prompt-guest-sign-in";
import { GUEST_EXPORT_PROMPT } from "./guest-prompt-copy";

export function requireAccountToExport(): boolean {
  if (!isGuest()) return true;
  promptGuestSignIn(GUEST_EXPORT_PROMPT);
  return false;
}
