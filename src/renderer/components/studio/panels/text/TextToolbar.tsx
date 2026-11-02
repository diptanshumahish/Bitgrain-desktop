import React from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Strikethrough, Underline } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TextLayer } from "../../../../data/studioTypes";

export type TextFormatKey = "bold" | "italic" | "underline" | "strike";

export interface TextFormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
}

interface TextToolbarProps {
  format: TextFormatState;
  showItalic: boolean;
  align: TextLayer["align"];
  onToggleFormat: (key: TextFormatKey) => void;
  onAlign: (align: TextLayer["align"]) => void;
}

interface ToolbarButtonProps {
  Icon: LucideIcon;
  title: string;
  active: boolean;
  onClick: () => void;
}

const FORMAT_BUTTONS: Array<{ key: TextFormatKey; Icon: LucideIcon; title: string }> = [
  { key: "bold", Icon: Bold, title: "Bold (Cmd B)" },
  { key: "italic", Icon: Italic, title: "Italic (Cmd I)" },
  { key: "underline", Icon: Underline, title: "Underline (Cmd U)" },
  { key: "strike", Icon: Strikethrough, title: "Strikethrough (Cmd Shift X)" },
];

const ALIGN_BUTTONS: Array<{ value: TextLayer["align"]; Icon: LucideIcon; title: string }> = [
  { value: "left", Icon: AlignLeft, title: "Align left" },
  { value: "center", Icon: AlignCenter, title: "Align center" },
  { value: "right", Icon: AlignRight, title: "Align right" },
];

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ Icon, title, active, onClick }) => (
  <button
    type="button"
    title={title}
    aria-pressed={active}
    onClick={onClick}
    className={`flex-1 h-[28px] rounded-md border-none cursor-pointer flex items-center justify-center transition-colors duration-100 ${
      active
        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
        : "bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
    }`}
  >
    <Icon size={14} strokeWidth={active ? 2.25 : 1.75} />
  </button>
);

export const TextToolbar: React.FC<TextToolbarProps> = ({ format, showItalic, align, onToggleFormat, onAlign }) => (
  <div className="flex items-center gap-[2px] bg-[var(--s-bg-input)] rounded-lg p-[3px]">
    {FORMAT_BUTTONS.filter((button) => showItalic || button.key !== "italic").map(({ key, Icon, title }) => (
      <ToolbarButton key={key} Icon={Icon} title={title} active={format[key]} onClick={() => onToggleFormat(key)} />
    ))}
    <span className="w-px h-4 mx-1 shrink-0 bg-[var(--s-border)]" />
    {ALIGN_BUTTONS.map(({ value, Icon, title }) => (
      <ToolbarButton key={value} Icon={Icon} title={title} active={align === value} onClick={() => onAlign(value)} />
    ))}
  </div>
);
