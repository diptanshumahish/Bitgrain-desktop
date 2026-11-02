import React, { useRef } from "react";
import { useGravityField } from "./use-gravity-field";

interface GravityFieldProps {
  className?: string;
}

export const GravityField: React.FC<GravityFieldProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGravityField(canvasRef);
  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
};
