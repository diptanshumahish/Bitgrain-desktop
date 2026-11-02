import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import type { GuestPromptCopy } from "./guest-prompt-copy";
import { signInKeepingWork } from "./sign-in-keeping-work";

export function promptGuestSignIn(copy: GuestPromptCopy, onDecline?: () => void): void {
  emitDialog({
    type: "confirm",
    title: copy.title,
    message: copy.message,
    confirmLabel: copy.confirmLabel,
    cancelLabel: copy.cancelLabel,
    onConfirm: () => void signInKeepingWork(copy.reason),
    onCancel: onDecline,
  });
}
