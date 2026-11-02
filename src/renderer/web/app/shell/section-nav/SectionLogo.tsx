import React from "react";
import { emitSectionMenu } from "./section-menu-events";
import { trackEvent } from "@bitgrain/platform/tracker";

interface SectionLogoProps {
  className?: string;
  imageClassName?: string;
  label?: string;
  labelClassName?: string;
  trailing?: React.ReactNode;
}

export const SectionLogo: React.FC<SectionLogoProps> = ({
  className = "flex items-center gap-2 group",
  imageClassName = "w-4 h-4 rounded group-hover:scale-110 transition-transform",
  label,
  labelClassName = "text-[12px] font-medium text-zinc-900 dark:text-white",
  trailing,
}) => {
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent("nav", "section_menu_opened");
    emitSectionMenu({ anchorRect: event.currentTarget.getBoundingClientRect() });
  };

  return (
    <button
      type="button"
      onClick={openMenu}
      aria-label="Switch workspace"
      title="Switch workspace"
      className={className}
    >
      <img src="/bitgrainlogo.png" alt="Bitgrain" className={imageClassName} />
      {label && <span className={labelClassName}>{label}</span>}
      {trailing}
    </button>
  );
};
