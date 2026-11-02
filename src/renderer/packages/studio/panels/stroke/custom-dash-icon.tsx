import React from "react";

const ICON_SIZE = 16;

export const CustomDashIcon: React.FC = () => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 6 H14" className="stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="6 2" />
    <path d="M2 10.5 H14" className="stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1.5 3" />
  </svg>
);
