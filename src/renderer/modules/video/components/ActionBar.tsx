import React from "react";
import {
  Scissors, Move, Type, Music, Info, Copy, Trash2, Crosshair,
} from "lucide-react";
import { FxPicker } from "./FxPicker";
import { TemplatesPicker } from "./templates/TemplatesPicker";
import { addTextAtPlayhead } from "../utils/add-text-clip";
import { addTrackingAtPlayhead } from "../utils/add-tracking-clip";
import {
  splitSelectedAtPlayhead,
  duplicateSelected,
  deleteSelected,
} from "../utils/edit-ops";
import {
  importAndAddAtPlayhead,
  showProjectInfo,
  addEffectClipAtPlayhead,
} from "../utils/timeline-actions";
import { Tooltip } from "../../../components/studio/ui/Tooltip";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon, label, shortcut, onClick, primary, disabled,
}) => {
  const tip = shortcut ? `${label} (${shortcut})` : label;
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-1 w-[58px] h-11 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        primary
          ? "text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)]"
          : "text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
      }`}
    >
      <span className="h-4 flex items-center justify-center">{icon}</span>
      <span className="text-[9.5px] leading-none">{label}</span>
    </button>
  );
  return <Tooltip content={tip}>{button}</Tooltip>;
};

const Separator: React.FC = () => (
  <div className="w-px h-7 bg-[var(--s-border)] mx-1" />
);

export const ActionBar: React.FC = () => {
  return (
    <footer className="h-14 shrink-0 flex items-center justify-center px-4 border-t border-[var(--s-border)] bg-[var(--s-bg-panel)]">
      <div className="flex items-center gap-0.5">
        <ActionButton
          icon={<Scissors size={14} strokeWidth={1.75} />}
          label="Split"
          shortcut="B"
          primary
          onClick={splitSelectedAtPlayhead}
        />
        <ActionButton
          icon={<Copy size={14} strokeWidth={1.75} />}
          label="Duplicate"
          shortcut="⌘D"
          onClick={duplicateSelected}
        />
        <ActionButton
          icon={<Trash2 size={14} strokeWidth={1.75} />}
          label="Delete"
          shortcut="⌫"
          onClick={deleteSelected}
        />

        <Separator />

        <ActionButton
          icon={<Type size={14} strokeWidth={1.75} />}
          label="Text"
          onClick={addTextAtPlayhead}
        />
        <TemplatesPicker />
        <FxPicker />
        <ActionButton
          icon={<Move size={14} strokeWidth={1.75} />}
          label="Transform"
          onClick={() => addEffectClipAtPlayhead("transform")}
        />
        <ActionButton
          icon={<Crosshair size={14} strokeWidth={1.75} />}
          label="Tracking"
          onClick={addTrackingAtPlayhead}
        />
        <ActionButton
          icon={<Music size={14} strokeWidth={1.75} />}
          label="Audio"
          onClick={() => importAndAddAtPlayhead("audio/*")}
        />

        <Separator />

        <ActionButton
          icon={<Info size={14} strokeWidth={1.75} />}
          label="Info"
          onClick={showProjectInfo}
        />
      </div>
    </footer>
  );
};
