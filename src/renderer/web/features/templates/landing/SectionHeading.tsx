import React from "react";
import { LIBRARY_HEADING_CLASS } from "./marine/marine-library-classes";

interface SectionHeadingProps {
  title: string;
  action?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ title, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <h2 className={LIBRARY_HEADING_CLASS}>{title}</h2>
    {action}
  </div>
);
