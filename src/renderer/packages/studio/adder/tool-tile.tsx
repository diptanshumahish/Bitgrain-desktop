import React from "react";

interface ToolTileContentProps {
  icon: React.ReactNode;
  label: string;
}

export const ToolTileContent: React.FC<ToolTileContentProps> = ({ icon, label }) => (
  <>
    {icon}
    <span className="text-[12px] font-medium leading-none whitespace-nowrap">{label}</span>
  </>
);
