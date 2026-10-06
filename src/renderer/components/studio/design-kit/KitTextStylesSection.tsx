import React from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { NameField, ApplyButton } from "./kit-row-controls";
import type { TextStyleVariable } from "../../../data/design-kit-types";
import { newId } from "../../../data/design-kit-types";
import { addTextStyle, updateTextStyle, removeTextStyle } from "../../../store/design-kits-store";

type CapturedStyle = Omit<TextStyleVariable, "id" | "name">;

const DEFAULT_STYLE: CapturedStyle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: "400",
  fontSize: 18,
  lineHeight: 1.5,
  letterSpacing: 0,
  textTransform: "none",
  fontStyle: "regular",
};

const shortFamily = (family: string): string =>
  family.replace(/['"]/g, "").split(",")[0];

const StyleRow: React.FC<{
  style: TextStyleVariable;
  captured: CapturedStyle | null;
  canApply: boolean;
  onApply: (style: TextStyleVariable) => void;
}> = ({ style, captured, canApply, onApply }) => (
    <div className="flex items-center gap-2">
      <span
        className="w-7 text-center text-[15px] leading-none text-[var(--s-text)] shrink-0"
        style={{
          fontFamily: style.fontFamily,
          fontWeight: Number(style.fontWeight) || 400,
          fontStyle: style.fontStyle === "italic" ? "italic" : "normal",
        }}
      >
        Ag
      </span>
      <div className="flex-1 min-w-0 flex flex-col">
        <NameField value={style.name} onCommit={(name) => updateTextStyle(style.id, { name })} />
        <span className="text-[9px] text-[var(--s-text-subtle)] truncate">
          {shortFamily(style.fontFamily)} · {style.fontSize}px · {style.fontWeight}
        </span>
      </div>
      <button
        onClick={() => captured && updateTextStyle(style.id, captured)}
        disabled={!captured}
        title="Update from selected text"
        className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
      >
        <Copy size={11} strokeWidth={1.75} />
      </button>
      <ApplyButton enabled={canApply} title="Apply to selected text" onClick={() => onApply(style)} />
      <button
        onClick={() => removeTextStyle(style.id)}
        title="Remove"
        className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
      >
        <Trash2 size={11} strokeWidth={1.75} />
      </button>
    </div>
  );

interface KitTextStylesSectionProps {
  styles: TextStyleVariable[];
  captured: CapturedStyle | null;
  canApply: boolean;
  onApply: (style: TextStyleVariable) => void;
}

export const KitTextStylesSection: React.FC<KitTextStylesSectionProps> = ({
  styles, captured, canApply, onApply,
}) => (
  <div className="flex flex-col gap-2 px-3 py-2.5 border-t border-[var(--s-border)]">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold text-[var(--s-text-muted)]">Text styles</span>
      <button
        onClick={() =>
          addTextStyle({ id: newId(), name: `Style ${styles.length + 1}`, ...(captured ?? DEFAULT_STYLE) })
        }
        title={captured ? "Add style from selected text" : "Add style"}
        className="w-5 h-5 rounded-md flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)] transition-colors"
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
    {styles.length === 0 ? (
      <p className="text-[10px] text-[var(--s-text-subtle)] py-1">No text styles yet.</p>
    ) : (
      styles.map((style) => (
        <StyleRow key={style.id} style={style} captured={captured} canApply={canApply} onApply={onApply} />
      ))
    )}
  </div>
);
