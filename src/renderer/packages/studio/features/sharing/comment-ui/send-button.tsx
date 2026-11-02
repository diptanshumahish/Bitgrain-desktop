import React from "react";
import { ArrowUp } from "lucide-react";

interface SendButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  label: string;
  startsDisabled: boolean;
}

const ICON_SIZE = 14;

export const SendButton: React.FC<SendButtonProps> = ({ buttonRef, label, startsDisabled }) => (
  <button
    ref={buttonRef}
    type="submit"
    aria-label={label}
    title={label}
    disabled={startsDisabled}
    className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full border-none cursor-pointer bg-[var(--s-accent)] text-[var(--s-accent-text)] transition-colors disabled:cursor-default disabled:bg-[var(--s-bg-input)] disabled:text-[var(--s-text-subtle)]"
  >
    <ArrowUp size={ICON_SIZE} strokeWidth={2.25} />
  </button>
);
