import React from "react";

interface SheetTileProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const TILE_CLASS =
  "relative flex flex-col items-center justify-center gap-2 min-h-[76px] rounded-xl bg-[var(--s-bg-input)] text-[var(--s-text)] active:bg-[var(--s-bg-input-hover)] transition-colors cursor-pointer";

export const SheetTile: React.FC<SheetTileProps> = ({ icon, label, onClick, children }) => {
  if (children) {
    return (
      <label className={TILE_CLASS}>
        {icon}
        <span className="text-[12px] font-medium">{label}</span>
        {children}
      </label>
    );
  }
  return (
    <button type="button" onClick={onClick} className={TILE_CLASS}>
      {icon}
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
};
