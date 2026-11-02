import React from "react";

export const InkWashThumb: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
    <circle cx="14" cy="24" r="16" fill="currentColor" fillOpacity="0.12" />
    <circle cx="14" cy="24" r="10" fill="currentColor" fillOpacity="0.2" />
    <circle cx="14" cy="24" r="5" fill="currentColor" fillOpacity="0.3" />
    <path d="M6 30 C12 20 20 14 34 9" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M9 35 C17 28 25 25 35 23" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
  </svg>
);
