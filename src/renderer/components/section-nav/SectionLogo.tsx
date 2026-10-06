import React from "react";

interface SectionLogoProps {
  className?: string;
  imageClassName?: string;
  label?: string;
  labelClassName?: string;
}

// On desktop the workspace switcher is the title-bar tabs, so this is just the
// app mark. The web "switch workspace" menu is intentionally dropped.
export const SectionLogo: React.FC<SectionLogoProps> = ({
  className = "flex items-center gap-2",
  imageClassName = "w-4 h-4 rounded",
  label,
  labelClassName = "text-[11px] font-medium text-zinc-900 dark:text-white",
}) => {
  return (
    <span className={className}>
      <img src="/bitgrainlogo.png" alt="Bitgrain" className={imageClassName} />
      {label && <span className={labelClassName}>{label}</span>}
    </span>
  );
};
