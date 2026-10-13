import React, { useLayoutEffect, useRef } from "react";
import { setLeftPanelTab, type LeftPanelTab } from "../../../store/studio-panels-store";

interface LeftPanelTabsProps {
  activeTab: LeftPanelTab;
}

const TABS: { value: LeftPanelTab; label: string }[] = [
  { value: "layers", label: "Layers" },
  { value: "elements", label: "Elements library" },
  { value: "templates", label: "Templates" },
];

export const LeftPanelTabs: React.FC<LeftPanelTabsProps> = ({ activeTab }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Partial<Record<LeftPanelTab, HTMLButtonElement | null>>>({});

  useLayoutEffect(() => {
    const list = listRef.current;
    const placeIndicator = (): void => {
      const tab = tabRefs.current[activeTab];
      const indicator = indicatorRef.current;
      if (!tab || !indicator) return;
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    };
    placeIndicator();
    if (!list) return;
    const observer = new ResizeObserver(placeIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeTab]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Left panel"
      className="relative px-3.5 pt-2 flex items-end gap-4 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)] shrink-0"
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          ref={(node) => {
            tabRefs.current[tab.value] = node;
          }}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.value}
          onClick={() => setLeftPanelTab(tab.value)}
          className={`pt-2.5 pb-3 text-[11.5px] font-semibold transition-colors duration-200 ${
            activeTab === tab.value ? "text-[var(--s-text)]" : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="absolute left-0 -bottom-px h-[2px] bg-[var(--s-text)] rounded-full transition-[transform,width] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
      />
    </div>
  );
};
