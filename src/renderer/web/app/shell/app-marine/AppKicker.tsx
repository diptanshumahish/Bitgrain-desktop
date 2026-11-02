import React from "react";
import { MarineWaveMark } from "../../../features/landing/marketing/marine/wave/MarineWaveMark";

interface AppKickerProps {
  label: string;
}

export const AppKicker: React.FC<AppKickerProps> = ({ label }) => (
  <span className="inline-flex items-center gap-2.5 font-display text-[14px] font-medium text-ultramarine dark:text-apricot">
    <MarineWaveMark className="h-3 w-8" />
    {label}
  </span>
);
