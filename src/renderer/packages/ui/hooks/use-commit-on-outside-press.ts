import { useEffect, useEffectEvent, type RefObject } from "react";

export const useCommitOnOutsidePress = (
  active: boolean,
  fieldRef: RefObject<HTMLElement | null>,
  commit: () => void,
): void => {
  const handlePress = useEffectEvent((event: PointerEvent): void => {
    if (event.target instanceof Node && fieldRef.current?.contains(event.target)) return;
    commit();
  });

  useEffect(() => {
    if (!active) return;
    const listener = (event: PointerEvent): void => handlePress(event);
    document.addEventListener("pointerdown", listener, true);
    return () => document.removeEventListener("pointerdown", listener, true);
  }, [active]);
};
