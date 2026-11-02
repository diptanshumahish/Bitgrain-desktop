import React from "react";

type Rgb = [number, number, number];

interface PaletteStripProps {
  colours: Rgb[];
  className: string;
}

const rgbFill = (colour: Rgb): string => `rgb(${colour[0]},${colour[1]},${colour[2]})`;

export const PaletteStrip: React.FC<PaletteStripProps> = ({ colours, className }) => (
  <svg aria-hidden="true" viewBox={`0 0 ${colours.length} 1`} preserveAspectRatio="none" className={className}>
    {colours.map((colour, index) => (
      <rect key={`${index}-${rgbFill(colour)}`} x={index} y={0} width={1.02} height={1} fill={rgbFill(colour)} />
    ))}
  </svg>
);
