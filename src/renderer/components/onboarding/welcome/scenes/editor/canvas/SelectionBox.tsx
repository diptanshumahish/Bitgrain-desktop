import React from "react";

const HANDLE_POSITIONS: string[] = [
  "-left-[4px] -top-[4px]",
  "-right-[4px] -top-[4px]",
  "-bottom-[4px] -left-[4px]",
  "-bottom-[4px] -right-[4px]",
];

interface SelectionBoxProps {
  label: string;
  visible: boolean;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ label, visible }) => (
  <span className={`pointer-events-none absolute inset-0 border border-violet-500 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
    {HANDLE_POSITIONS.map((position) => (
      <span key={position} className={`absolute h-2 w-2 border border-violet-500 bg-white ${position}`} />
    ))}
    <span className="absolute -top-6 left-0 rounded bg-violet-500 px-1.5 py-0.5 text-[10px] font-medium text-white">{label}</span>
  </span>
);
