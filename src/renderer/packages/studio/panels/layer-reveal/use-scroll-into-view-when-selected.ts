import { useEffect, useRef, type RefObject } from "react";

export const useScrollIntoViewWhenSelected = <T extends HTMLElement>(isSelected: boolean): RefObject<T | null> => {
  const rowRef = useRef<T>(null);

  useEffect(() => {
    if (isSelected) rowRef.current?.scrollIntoView({ block: "nearest" });
  }, [isSelected]);

  return rowRef;
};
