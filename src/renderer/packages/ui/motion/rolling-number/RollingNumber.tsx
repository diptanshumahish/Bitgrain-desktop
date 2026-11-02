import React from "react";
import { DigitWheel } from "./DigitWheel";

interface RollingNumberProps {
  value: number;
  suffix?: string;
  className?: string;
}

interface DigitPlace {
  digit: number;
  place: number;
}

const toDigitPlaces = (value: number): DigitPlace[] => {
  const digits = String(Math.max(0, Math.round(value))).split("").map(Number);
  return digits.map((digit, index) => ({ digit, place: digits.length - index }));
};

export const RollingNumber: React.FC<RollingNumberProps> = ({ value, suffix = "", className = "" }) => (
  <span className={`inline-flex justify-center tabular-nums ${className}`}>
    <span className="sr-only">{`${Math.round(value)}${suffix}`}</span>
    {toDigitPlaces(value).map(({ digit, place }) => (
      <DigitWheel key={place} digit={digit} />
    ))}
    {suffix && <span aria-hidden="true">{suffix}</span>}
  </span>
);
