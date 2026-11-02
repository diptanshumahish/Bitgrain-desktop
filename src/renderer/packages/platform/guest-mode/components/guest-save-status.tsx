import React from "react";
import { CloudOff } from "lucide-react";
import { signInKeepingWork } from "../sign-in-keeping-work";

const ICON_SIZE = 11;

const handleSignIn = (): void => {
  void signInKeepingWork("save");
};

export const GuestSaveStatus: React.FC = () => (
  <span
    role="status"
    className="flex items-center gap-1.5 text-[11px] text-[var(--s-text-muted)] whitespace-nowrap shrink-0"
  >
    <CloudOff size={ICON_SIZE} strokeWidth={2} className="shrink-0" />
    Not saved.
    <button
      type="button"
      onClick={handleSignIn}
      className="font-semibold text-[var(--s-text)] underline underline-offset-2 hover:no-underline"
    >
      Sign in to save
    </button>
  </span>
);
