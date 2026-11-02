import React from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Minus } from "lucide-react";

const ICON_SIZE = 12;
const ICON_STROKE = 1.75;

interface PaintRowControlsProps {
  visible: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleVisible: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

interface RowButtonProps {
  title: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const RowButton: React.FC<RowButtonProps> = ({ title, disabled = false, danger = false, onClick, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className={`w-6 h-6 rounded-md flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-default text-[var(--s-text-subtle)] ${
      danger ? "hover:text-red-400 hover:bg-red-400/10" : "hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
    }`}
  >
    {children}
  </button>
);

export const PaintRowControls: React.FC<PaintRowControlsProps> = ({
  visible, canMoveUp, canMoveDown, onToggleVisible, onMoveUp, onMoveDown, onRemove,
}) => (
  <div className="flex items-center gap-0.5 shrink-0">
    <RowButton title={visible ? "Hide" : "Show"} onClick={onToggleVisible}>
      {visible ? <Eye size={ICON_SIZE} strokeWidth={ICON_STROKE} /> : <EyeOff size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
    </RowButton>
    {(canMoveUp || canMoveDown) && (
      <>
        <RowButton title="Move up" disabled={!canMoveUp} onClick={onMoveUp}>
          <ChevronUp size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </RowButton>
        <RowButton title="Move down" disabled={!canMoveDown} onClick={onMoveDown}>
          <ChevronDown size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </RowButton>
      </>
    )}
    <RowButton title="Remove" danger onClick={onRemove}>
      <Minus size={ICON_SIZE} strokeWidth={ICON_STROKE} />
    </RowButton>
  </div>
);
