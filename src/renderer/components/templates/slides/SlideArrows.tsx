import React from "react";
import { useSignalValue, type Signal } from "../../../lib/signal";
import { SlideArrow } from "./SlideArrow";

interface SlideArrowsProps {
  count: number;
  activeSignal: Signal<number>;
  onSelect: (index: number) => void;
}

export const SlideArrows: React.FC<SlideArrowsProps> = ({ count, activeSignal, onSelect }) => {
  const activeIndex = useSignalValue(activeSignal);
  return (
    <>
      <SlideArrow
        direction="previous"
        hidden={activeIndex === 0}
        onStep={() => onSelect(activeIndex - 1)}
      />
      <SlideArrow
        direction="next"
        hidden={activeIndex >= count - 1}
        onStep={() => onSelect(activeIndex + 1)}
      />
    </>
  );
};
