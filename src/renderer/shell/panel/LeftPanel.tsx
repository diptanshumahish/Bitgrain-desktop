import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Slider } from "../../components/toolbar/slider";

// The unified left panel shell: a fixed-width, scrollable sidebar that every
// surface fills with its own controls. This replaces the floating toolbar era
// with a persistent Figma-style options column. Presentation lives here; the
// controls inside call each surface's existing state setters, so behaviour and
// engine output are unchanged.
export function LeftPanel({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col border-r border-[var(--s-border)] bg-[var(--s-bg-panel)] font-editorial select-none">
      <div className="flex shrink-0 flex-col gap-0.5 border-b border-[var(--s-border)] px-4 py-3">
        <span className="truncate text-[13px] font-semibold text-[var(--s-text)]">{title}</span>
        {subtitle && (
          <span className="truncate text-[11px] text-[var(--s-text-muted)]">{subtitle}</span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && (
        <div className="shrink-0 border-t border-[var(--s-border)] px-3 py-2.5">{footer}</div>
      )}
    </aside>
  );
}

// A collapsible section. Sections start open unless `defaultOpen={false}`.
// The header is sticky: while a section's body is scrolled, its header pins to
// the top of the panel until the next section pushes it up, so you never lose
// track of which control group you're in. `active` shows a red activity dot when
// the section is currently contributing to the image.
export function PanelSection({
  title,
  right,
  active = false,
  defaultOpen = true,
  children,
}: {
  title: string;
  right?: ReactNode;
  active?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-[var(--s-border)]/70">
      {/* Solid-background wrapper so the pinned header never shows scrolled
          content bleeding through it (the hover tint sits on the button). */}
      <div className="sticky top-0 z-10 border-b border-[var(--s-border)]/50 bg-[var(--s-bg-panel)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 px-3 py-2 text-left transition-colors hover:bg-[var(--s-bg-input)]/40"
        >
          <ChevronRight
            size={13}
            strokeWidth={2.25}
            className={`shrink-0 text-[var(--s-text-muted)] transition-transform ${open ? "rotate-90" : ""}`}
          />
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--s-text-muted)]">
            {title}
          </span>
          {active && (
            <span
              aria-label="active"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444] shadow-[0_0_0_2px_rgba(239,68,68,0.18)]"
            />
          )}
          {right}
        </button>
      </div>
      {open && <div className="flex flex-col gap-2.5 px-3 pb-3 pt-0.5">{children}</div>}
    </section>
  );
}

// A labelled slider row driven by a numeric setter. `format` renders the value
// readout; `onDone` commits history on release.
export function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  onDone,
  format,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onDone?: () => void;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[var(--s-text-muted)]">{label}</span>
        <span className="text-[11px] tabular-nums text-[var(--s-text)]">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider min={min} max={max} step={step} value={value} onChange={onChange} onDone={onDone} />
    </div>
  );
}

// A pill-style toggle row.
export function ToggleRow({
  label,
  active,
  onToggle,
  disabled,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-[12px] transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        active
          ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
          : "text-[var(--s-text)] hover:bg-[var(--s-bg-input)]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`relative h-3.5 w-6 rounded-full transition-colors ${
          active ? "bg-[var(--s-accent)]" : "bg-[var(--s-bg-input)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${
            active ? "left-3" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

// A row of compact action buttons.
export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-1.5">{children}</div>;
}

export function PanelButton({
  label,
  icon,
  onClick,
  disabled,
  tone = "default",
}: {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-[var(--s-danger,#e5484d)] hover:bg-[var(--s-danger,#e5484d)]/10"
      : "text-[var(--s-text)] hover:bg-[var(--s-bg-input)]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-md border border-[var(--s-border)] px-2 py-1.5 text-[12px] transition-colors disabled:pointer-events-none disabled:opacity-40 ${toneClass}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
