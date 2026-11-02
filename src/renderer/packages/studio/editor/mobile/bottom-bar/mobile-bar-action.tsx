import React from "react";

interface MobileBarActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  tone?: "default" | "danger";
  children?: React.ReactNode;
}

const BASE_CLASS =
  "relative flex flex-col items-center justify-center gap-1 shrink-0 min-w-[44px] flex-1 h-14 px-1 rounded-xl transition-colors active:bg-[var(--s-bg-input-hover)] cursor-pointer";

const toneClass = (active: boolean, tone: "default" | "danger"): string => {
  if (tone === "danger") return "text-red-500";
  return active ? "bg-[var(--s-accent-soft)] text-[var(--s-text)]" : "text-[var(--s-text-muted)]";
};

export const MobileBarAction: React.FC<MobileBarActionProps> = ({ icon, label, onClick, active = false, tone = "default", children }) => {
  const className = `${BASE_CLASS} ${toneClass(active, tone)}`;
  const content = (
    <>
      {icon}
      <span className="text-[12px] font-medium leading-none whitespace-nowrap">{label}</span>
    </>
  );
  if (children) {
    return (
      <label className={className}>
        {content}
        {children}
      </label>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={className}>
      {content}
    </button>
  );
};
