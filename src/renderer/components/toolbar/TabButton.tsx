import React, { useEffect, useRef, useState } from "react";

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  ariaLabel?: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  className?: string;
  beta?: boolean;
  isNew?: boolean;
  indicator?: boolean;
  expanded?: boolean;
  primary?: boolean;
  pressed?: boolean;
}

const TOUCH_TOOLTIP_TIMEOUT_MS = 2500;

export const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  ariaLabel,
  active,
  onClick,
  disabled,
  disabledTooltip,
  className = "",
  beta,
  isNew,
  indicator,
  expanded,
  primary,
  pressed,
}) => {
  const [touchTipOpen, setTouchTipOpen] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  const showTouchTip = (): void => {
    if (!disabled || !disabledTooltip) return;
    setTouchTipOpen(true);
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = window.setTimeout(() => {
      setTouchTipOpen(false);
      dismissTimerRef.current = null;
    }, TOUCH_TOOLTIP_TIMEOUT_MS);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      showTouchTip();
    }
  };

  const showActive = !!active && !disabled;
  const showPressed = !!pressed && !disabled;
  const stateClass = primary && !disabled
    ? "bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90"
    : showActive
      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
      : showPressed
        ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)] hover:bg-[var(--s-border)]"
        : "text-[var(--s-text-muted)] hover:text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)]";

  const btn = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      aria-expanded={expanded}
      aria-pressed={expanded === undefined ? pressed ?? showActive : undefined}
      className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl min-w-[36px] md:min-w-[48px] lg:min-w-[60px] group relative transition-all duration-200
        ${stateClass}
        ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer active:scale-95"}
        ${className}`}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span className="hidden md:block text-[12px] font-medium leading-none whitespace-nowrap">
        {label}
      </span>
      {indicator && !disabled && (
        <span className="absolute top-1.5 left-1/2 ml-2.5 w-1.5 h-1.5 rounded-full bg-[var(--s-accent)] ring-2 ring-[var(--s-bg-panel)]" />
      )}
      {beta && (
        <span className="absolute -top-1.5 -right-1 bg-black text-white text-[7px] font-semibold px-1.5 py-0.5 rounded-full leading-none border border-white/20 scale-90 md:scale-100 origin-bottom-left">
          beta
        </span>
      )}
      {isNew && (
        <span className="absolute -top-1.5 -right-1 bg-white text-black text-[7px] font-medium px-1.5 py-0.5 rounded-full leading-none border border-black/10 scale-90 md:scale-100 origin-bottom-left">
          new
        </span>
      )}
    </button>
  );

  if (!disabled || !disabledTooltip) return btn;

  const tooltipVisibilityClass = touchTipOpen
    ? "opacity-100"
    : "opacity-0 group-hover/tip:opacity-100";

  return (
    <div
      className="relative group/tip"
      onPointerDown={handlePointerDown}
    >
      {btn}
      <div
        role="tooltip"
        aria-hidden={!touchTipOpen}
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[60] pointer-events-none transition-opacity duration-150 ${tooltipVisibilityClass}`}
      >
        <div className="bg-[var(--s-border-strong)] text-[var(--s-bg-panel)] text-[12px] font-medium px-2.5 py-1.5 rounded-md max-w-[200px] text-center leading-tight">
          {disabledTooltip}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[4px] border-transparent border-t-[var(--s-border-strong)]" />
      </div>
    </div>
  );
};
