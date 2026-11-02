import React, { useEffect, useRef, useState } from "react";
import { trackEvent } from "../../../lib/tracker";

const FONT_SIZE_PX = 12;
const LINE_HEIGHT_PX = 16;

interface PageTitleProps {
  label: string;
  isActive: boolean;
  zoom: number;
  pageWidth: number;
  onRename: (name: string) => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  label,
  isActive,
  zoom,
  pageWidth,
  onRename,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [editing]);

  const commit = (value: string): void => {
    setEditing(false);
    const next = value.trim();
    if (!next || next === label) return;
    onRename(next);
    trackEvent("studio", "page_renamed");
  };

  const sharedStyle: React.CSSProperties = {
    transform: `scale(${1 / zoom})`,
    transformOrigin: "bottom left",
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    paddingBottom: "6px",
    paddingRight: "8px",
    maxWidth: `${pageWidth * zoom}px`,
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        defaultValue={label}
        className="absolute left-0 bottom-full whitespace-nowrap rounded-sm border border-[var(--s-accent)] bg-[var(--s-bg-panel)] px-1 py-0.5 text-[var(--s-text)] outline-none"
        style={sharedStyle}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setEditing(false);
        }}
      />
    );
  }

  return (
    <div
      className="absolute left-0 bottom-full select-none cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
      title={label}
      style={{
        ...sharedStyle,
        fontWeight: isActive ? 600 : 400,
        color: isActive ? "var(--s-text)" : "var(--s-text-muted)",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setEditing(true);
      }}
      onClick={(event) => event.stopPropagation()}
    >
      {label}
    </div>
  );
};
