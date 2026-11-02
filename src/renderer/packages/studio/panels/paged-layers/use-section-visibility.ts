import { useEffect, useRef, useState, type RefObject } from "react";

const LAYERS_SCROLL_ROOT_SELECTOR = "[data-layers-scroll-root]";

const ESTIMATED_ROW_HEIGHT_PX = 28;
const PRELOAD_MARGIN = "600px 0px";

interface SectionVisibility {
  sectionRef: RefObject<HTMLDivElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  isNearViewport: boolean;
  placeholderHeight: number;
}

export const useSectionVisibility = (rowCount: number): SectionVisibility => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const root = section.closest(LAYERS_SCROLL_ROOT_SELECTOR);
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry.isIntersecting && listRef.current) setMeasuredHeight(listRef.current.offsetHeight);
        setIsNearViewport(entry.isIntersecting);
      },
      { root, rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return {
    sectionRef,
    listRef,
    isNearViewport,
    placeholderHeight: measuredHeight ?? rowCount * ESTIMATED_ROW_HEIGHT_PX,
  };
};
