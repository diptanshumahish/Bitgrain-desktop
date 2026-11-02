import React, { useLayoutEffect, useRef } from "react";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const PERCENT_PER_DIGIT = 100 / DIGITS.length;

interface DigitWheelProps {
  digit: number;
}

export const DigitWheel: React.FC<DigitWheelProps> = ({ digit }) => {
  const columnRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (columnRef.current) columnRef.current.style.transform = `translateY(-${digit * PERCENT_PER_DIGIT}%)`;
  }, [digit]);

  return (
    <span aria-hidden="true" className="inline-block h-[1lh] overflow-hidden">
      <span
        ref={columnRef}
        className="flex flex-col transition-transform duration-[420ms] ease-[cubic-bezier(0.2,1.15,0.4,1)] motion-reduce:transition-none"
      >
        {DIGITS.map((glyph) => (
          <span key={glyph} className="h-[1lh] text-center">
            {glyph}
          </span>
        ))}
      </span>
    </span>
  );
};
