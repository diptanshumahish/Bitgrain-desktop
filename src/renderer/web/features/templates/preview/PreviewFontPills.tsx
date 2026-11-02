import React from "react";

interface PreviewFontPillsProps {
  fonts: string[];
}

export const PreviewFontPills: React.FC<PreviewFontPillsProps> = ({ fonts }) => (
  <span className="flex flex-wrap justify-end gap-1.5">
    {fonts.map((font) => (
      <span
        key={font}
        className="rounded-lg bg-apricot/70 px-2.5 py-1 text-[12.5px] font-medium text-ultramarine dark:bg-white/10 dark:text-apricot"
      >
        {font}
      </span>
    ))}
  </span>
);
