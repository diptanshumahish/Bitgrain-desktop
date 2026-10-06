import React, { useLayoutEffect, useRef } from "react";
import { Film, MousePointer2 } from "lucide-react";

interface AnimateModeToggleProps {
  active: boolean;
  onToggle: () => void;
}

const SEGMENT_BASE =
  "relative z-10 flex items-center gap-1.5 h-full px-2.5 rounded-[5px] cursor-pointer transition-colors duration-150";

export const AnimateModeToggle: React.FC<AnimateModeToggleProps> = ({
  active,
  onToggle,
}) => {
  const designRef = useRef<HTMLButtonElement>(null);
  const animateRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const firstRunRef = useRef(true);

  useLayoutEffect(() => {
    const pill = pillRef.current;
    const target = (active ? animateRef : designRef).current;
    if (!pill || !target) return;

    const applyPosition = () => {
      pill.style.width = `${target.offsetWidth}px`;
      pill.style.transform = `translateX(${target.offsetLeft}px)`;
    };

    if (firstRunRef.current) {
      pill.style.transition = "none";
      applyPosition();
      pill.getBoundingClientRect();
      pill.style.transition = "";
      firstRunRef.current = false;
    } else {
      applyPosition();
    }
  }, [active]);

  return (
    <div className="relative flex items-center h-7 p-0.5 rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] text-[11px] font-medium select-none shrink-0">
      <span
        ref={pillRef}
        aria-hidden
        className="absolute left-0 top-0.5 bottom-0.5 rounded-[5px] bg-[var(--s-accent)] transition-[transform,width] duration-200 ease-out"
      />
      <button
        ref={designRef}
        type="button"
        onClick={() => active && onToggle()}
        className={`${SEGMENT_BASE} ${
          active
            ? "text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
            : "text-[var(--s-accent-text)]"
        }`}
      >
        <MousePointer2 size={12} strokeWidth={2} />
        Design
      </button>
      <button
        ref={animateRef}
        type="button"
        onClick={() => !active && onToggle()}
        className={`${SEGMENT_BASE} ${
          active
            ? "text-[var(--s-accent-text)]"
            : "text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
        }`}
      >
        <Film size={12} strokeWidth={2} />
        Animate
      </button>
    </div>
  );
};
