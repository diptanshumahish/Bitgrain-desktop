export type GuestSignInReason = "export" | "save";

export interface GuestPromptCopy {
  reason: GuestSignInReason;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

export const GUEST_EXPORT_PROMPT: GuestPromptCopy = {
  reason: "export",
  title: "Sign in to export",
  message: "Exporting needs a free account. Sign in and your work comes with you, saved and ready to download.",
  confirmLabel: "Sign in to export",
  cancelLabel: "Keep editing",
};

export const GUEST_LEAVE_PROMPT: GuestPromptCopy = {
  reason: "save",
  title: "Your work isn't saved",
  message: "You're editing without an account, so nothing is kept once you leave. Sign in to save it.",
  confirmLabel: "Sign in to save",
  cancelLabel: "Leave without saving",
};
