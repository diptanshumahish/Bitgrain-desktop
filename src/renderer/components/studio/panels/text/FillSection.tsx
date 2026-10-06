import React, { useEffect, useRef } from "react";
import { ColorPicker } from "../../ui/ColorPicker";

const ColorStackRow: React.FC<{
  color: string;
  onRecolor: (fromHex: string, toHex: string) => void;
}> = ({ color, onRecolor }) => {
  const currentRef = useRef(color);
  useEffect(() => {
    currentRef.current = color;
  }, [color]);
  return (
    <ColorPicker
      color={color}
      onChange={(next) => {
        onRecolor(currentRef.current, next);
        currentRef.current = next;
      }}
    />
  );
};

interface FillSectionProps {
  isStack: boolean;
  singleColor: string;
  stackColors: string[];
  colorVar?: string;
  onApplyColor: (hex: string) => void;
  onBindColor?: (varId: string, value: string) => void;
  onRecolor: (fromHex: string, toHex: string) => void;
}

export const FillSection: React.FC<FillSectionProps> = ({
  isStack, singleColor, stackColors, colorVar, onApplyColor, onBindColor, onRecolor,
}) => {
  if (!isStack) {
    return (
      <ColorPicker
        color={singleColor}
        varId={colorVar}
        onChange={onApplyColor}
        onBindVariable={onBindColor}
      />
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {stackColors.map((color, index) => (
        <ColorStackRow key={index} color={color} onRecolor={onRecolor} />
      ))}
      <ColorPicker color={stackColors[0]} onChange={onApplyColor} label="Unify color" />
    </div>
  );
};
