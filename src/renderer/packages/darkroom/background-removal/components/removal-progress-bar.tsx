import React from "react";

interface RemovalProgressBarProps {
  indeterminate: boolean;
  percent: number;
}

const PERCENT_MAX = 100;
const TRACK_CLASS = "mt-2.5 h-1 rounded-full bg-[var(--s-bg-input)] overflow-hidden relative";
const PROGRESS_CLASS =
  "block w-full h-1 appearance-none border-0 bg-[var(--s-bg-input)] [&::-webkit-progress-bar]:bg-[var(--s-bg-input)] [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[var(--s-accent)] [&::-webkit-progress-value]:transition-[width] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[var(--s-accent)]";

export const RemovalProgressBar: React.FC<RemovalProgressBarProps> = ({ indeterminate, percent }) => (
  <div className={TRACK_CLASS}>
    {indeterminate ? (
      <div className="absolute inset-y-0 left-0 w-[35%] rounded-full bg-[var(--s-accent)] export-bar-slide" />
    ) : (
      <progress value={percent} max={PERCENT_MAX} aria-label="Model download" className={PROGRESS_CLASS} />
    )}
  </div>
);
