import { useEffect, useRef } from "react";
import { Dice5 } from "lucide-react";
import { onMoshRoll } from "../../../pages/home-page/mosh/feedback/mosh-roll-events";

interface RollingDiceIconProps {
  size: number;
}

const ROLL_CLASS = "dice-rolling";

const restartAnimation = (element: HTMLElement | null): void => {
  if (!element) return;
  element.classList.remove(ROLL_CLASS);
  void element.offsetWidth;
  element.classList.add(ROLL_CLASS);
};

export const RollingDiceIcon = ({ size }: RollingDiceIconProps): React.JSX.Element => {
  const diceRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      onMoshRoll(() => {
        restartAnimation(diceRef.current);
        restartAnimation(ringRef.current);
      }),
    [],
  );

  return (
    <span className="relative inline-flex items-center justify-center">
      <span ref={ringRef} className="dice-ring absolute inset-0 rounded-full border border-[var(--s-accent)] opacity-0 pointer-events-none" />
      <span ref={diceRef} className="dice-face inline-flex">
        <Dice5 size={size} strokeWidth={2} />
      </span>
    </span>
  );
};
