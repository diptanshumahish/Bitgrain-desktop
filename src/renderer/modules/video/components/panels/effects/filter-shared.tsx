import React from "react";
import { SliderRow } from "./SliderRow";

const JITTER_MAX_HZ = 60;

interface ToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, active, onClick }) => (
  <div className="flex items-center justify-between p-2 bg-[var(--s-bg-input)] rounded-lg border border-[var(--s-border)]">
    <span className="text-[10px] text-[var(--s-text-subtle)]">{label}</span>
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
        active
          ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
          : "bg-[var(--s-bg-panel)] text-[var(--s-text-subtle)] border border-[var(--s-border)]"
      }`}
    >
      {active ? "ON" : "OFF"}
    </button>
  </div>
);

interface JitterControlsProps {
  hz: number;
  auto: boolean;
  onChangeHz: (hz: number) => void;
  onToggleAuto: () => void;
}

export const JitterControls: React.FC<JitterControlsProps> = ({
  hz,
  auto,
  onChangeHz,
  onToggleAuto,
}) => (
  <div className="flex flex-col gap-2 p-2 bg-[var(--s-bg-input)] rounded-lg border border-[var(--s-border)]">
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-[var(--s-text-subtle)] font-bold">Jitter</span>
      <button
        onClick={onToggleAuto}
        className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all ${
          auto
            ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
            : "bg-[var(--s-bg-panel)] text-[var(--s-text-subtle)] border border-[var(--s-border)] hover:text-[var(--s-text)]"
        }`}
      >
        {auto ? "AUTO" : "MANUAL"}
      </button>
    </div>
    {!auto && (
      <SliderRow label="Frequency" min={0} max={JITTER_MAX_HZ} step={1} unit="hz" value={hz} onChange={onChangeHz} />
    )}
    {auto && (
      <span className="text-[9px] text-[var(--s-text-subtle)] font-mono">
        Frequency follows on-screen motion
      </span>
    )}
  </div>
);
