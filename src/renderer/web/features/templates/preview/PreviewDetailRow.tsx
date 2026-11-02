import React from "react";
import { PREVIEW_DIVIDER_CLASS, PREVIEW_LABEL_CLASS, PREVIEW_VALUE_CLASS } from "./preview-classes";

interface PreviewDetailRowProps {
  label: string;
  children: React.ReactNode;
}

export const PreviewDetailRow: React.FC<PreviewDetailRowProps> = ({ label, children }) => (
  <div className={`flex items-baseline justify-between gap-6 py-3 ${PREVIEW_DIVIDER_CLASS}`}>
    <span className={`shrink-0 ${PREVIEW_LABEL_CLASS}`}>{label}</span>
    <span className={PREVIEW_VALUE_CLASS}>{children}</span>
  </div>
);
