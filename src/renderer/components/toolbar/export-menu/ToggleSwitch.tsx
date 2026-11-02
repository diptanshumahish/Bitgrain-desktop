import React from "react";

interface ToggleSwitchProps {
  on: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ on }) => (
  <span aria-hidden="true" className={`w-6 h-3 rounded-full transition-colors flex items-center px-0.5 ${on ? "bg-[var(--s-accent)]" : "bg-[var(--s-border)]"}`}>
    <span className={`w-2 h-2 rounded-full transition-transform ${on ? "translate-x-3 bg-[var(--s-accent-text)]" : "translate-x-0 bg-white"}`} />
  </span>
);
