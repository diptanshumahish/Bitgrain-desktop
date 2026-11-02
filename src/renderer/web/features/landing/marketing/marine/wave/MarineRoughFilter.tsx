import React from "react";

interface MarineRoughFilterProps {
  id: string;
  scale: number;
}

const TURBULENCE_FREQUENCY = "0.04";
const TURBULENCE_OCTAVES = 2;
const TURBULENCE_SEED = 7;

export const MarineRoughFilter: React.FC<MarineRoughFilterProps> = ({ id, scale }) => (
  <filter id={id} x="-5%" y="-20%" width="110%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency={TURBULENCE_FREQUENCY} numOctaves={TURBULENCE_OCTAVES} seed={TURBULENCE_SEED} result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);
