import React from "react";
import { Move, Spline, X } from "lucide-react";

export type NodeEditMode = "move" | "bend";

interface ModeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border-none outline-none cursor-pointer text-[11px] font-semibold font-editorial transition-all duration-150 ${
      active
        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
        : "bg-transparent text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
    }`}
  >
    {icon}
    {label}
  </button>
);

interface NodeEditToolbarProps {
  mode: NodeEditMode;
  onModeChange: (mode: NodeEditMode) => void;
  onClose: () => void;
}

export const NodeEditToolbar: React.FC<NodeEditToolbarProps> = ({ mode, onModeChange, onClose }) => (
  <div className="flex flex-row items-center gap-1 bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-2xl px-2 py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
    <ModeButton
      icon={<Move size={13} strokeWidth={1.5} />}
      label="Move"
      active={mode === "move"}
      onClick={() => onModeChange("move")}
    />
    <ModeButton
      icon={<Spline size={13} strokeWidth={1.5} />}
      label="Bend"
      active={mode === "bend"}
      onClick={() => onModeChange("bend")}
    />

    <div className="w-px h-5 bg-[var(--s-border)] mx-1" />

    <button
      onClick={onClose}
      title="Done editing (Escape)"
      className="w-7 h-7 flex items-center justify-center rounded-lg border-none outline-none cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-all duration-150"
    >
      <X size={14} strokeWidth={1.5} />
    </button>
  </div>
);
