import React from "react";
import { gapLength, type SnapMeasurement } from "./snap-measure";

interface SnapMeasureLineProps {
  measurement: SnapMeasurement;
  zoom: number;
}

const MIN_ZOOM = 0.0001;

const lineBox = (measurement: SnapMeasurement, thickness: number): React.CSSProperties =>
  measurement.axis === "x"
    ? { left: measurement.start, top: measurement.cross - thickness / 2, width: gapLength(measurement), height: thickness }
    : { left: measurement.cross - thickness / 2, top: measurement.start, width: thickness, height: gapLength(measurement) };

const labelBox = (measurement: SnapMeasurement, zoom: number): React.CSSProperties => {
  const center = (measurement.start + measurement.end) / 2;
  const position = measurement.axis === "x"
    ? { left: center, top: measurement.cross }
    : { left: measurement.cross, top: center };
  return { ...position, transform: `translate(-50%, -50%) scale(${1 / zoom})` };
};

const labelTone = (measurement: SnapMeasurement): string =>
  measurement.equal ? "bg-[#FF3D7F] text-white" : "bg-white text-[#FF3D7F] ring-1 ring-[#FF3D7F]";

export const SnapMeasureLine = ({ measurement, zoom }: SnapMeasureLineProps): React.ReactElement => {
  const safeZoom = Math.max(zoom, MIN_ZOOM);
  const fade = measurement.toPageEdge ? "opacity-50" : "opacity-100";
  return (
    <>
      <div className={`absolute bg-[#FF3D7F] ${fade}`} style={lineBox(measurement, 1 / safeZoom)} />
      <div
        className={`absolute rounded-sm px-1 text-[12px] leading-4 font-medium tabular-nums whitespace-nowrap ${labelTone(measurement)} ${fade}`}
        style={labelBox(measurement, safeZoom)}
      >
        {Math.round(gapLength(measurement))}
      </div>
    </>
  );
};
