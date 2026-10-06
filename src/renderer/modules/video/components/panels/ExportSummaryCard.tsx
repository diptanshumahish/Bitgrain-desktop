import React from "react";

interface ExportSummaryCardProps {
  duration: string;
  width: number;
  height: number;
  codecLabel: string;
  codecString: string;
  estimatedSize: string;
}

interface SummaryFieldProps {
  label: string;
  value: string;
  title?: string;
  truncate?: boolean;
}

const SummaryField: React.FC<SummaryFieldProps> = ({ label, value, title, truncate }) => (
  <div className="flex flex-col min-w-0">
    <span className="text-[9px] font-mono font-bold text-[var(--s-text-subtle)]">
      {label}
    </span>
    <span
      className={`text-[12px] font-mono font-bold text-[var(--s-text)] mt-1 ${truncate ? "truncate" : ""}`}
      title={title}
    >
      {value}
    </span>
  </div>
);

export const ExportSummaryCard: React.FC<ExportSummaryCardProps> = ({
  duration,
  width,
  height,
  codecLabel,
  codecString,
  estimatedSize,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3 p-4 bg-[var(--s-bg-input)] border border-[var(--s-border)] rounded-md">
      <SummaryField label="Duration" value={duration} />
      <SummaryField label="Output" value={`${width}×${height}`} />
      <SummaryField label="Codec" value={codecLabel} title={codecString} truncate />
      <SummaryField label="Est. Size" value={`~${estimatedSize}`} />
    </div>
  );
};
