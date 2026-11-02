import React from "react";
import type { SnapGuide } from "./snap-engine";
import type { SnapMeasurement } from "./snap-measure";
import { SnapMeasureLine } from "./snap-measure-line";

interface SnapGuidesOverlayProps {
  guides: SnapGuide[];
  measurements: SnapMeasurement[];
  width: number;
  height: number;
  zoom: number;
}

const GUIDE_COLOR = "#FF3D7F";

export const SnapGuidesOverlay = ({
  guides,
  measurements,
  width,
  height,
  zoom,
}: SnapGuidesOverlayProps): React.ReactElement | null => {
  if (guides.length === 0 && measurements.length === 0) return null;
  const thickness = 1 / Math.max(zoom, 0.0001);
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none overflow-visible"
      style={{ width, height }}
    >
      {guides.map((guide, index) => {
        if (guide.orientation === "vertical") {
          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: guide.position - thickness / 2,
                top: guide.start,
                width: thickness,
                height: guide.end - guide.start,
                backgroundColor: GUIDE_COLOR,
              }}
            />
          );
        }
        return (
          <div
            key={index}
            className="absolute"
            style={{
              left: guide.start,
              top: guide.position - thickness / 2,
              width: guide.end - guide.start,
              height: thickness,
              backgroundColor: GUIDE_COLOR,
            }}
          />
        );
      })}
      {measurements.map((measurement) => (
        <SnapMeasureLine
          key={`${measurement.axis}-${measurement.start}-${measurement.end}`}
          measurement={measurement}
          zoom={zoom}
        />
      ))}
    </div>
  );
};
