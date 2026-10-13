import React from "react";
import type { BezierAnchor, VectorSettings } from "../../../data/studioTypes";
import { anchorsToPath, previewSegment, dashArrayFor } from "../../../utils/vector-utils";

interface Point { x: number; y: number; }

interface PenPathPreviewProps {
  anchors: BezierAnchor[];
  pendingAnchor: BezierAnchor | null;
  mousePos: Point | null;
  nearFirst: boolean;
  settings: VectorSettings;
  zoom: number;
}

const ANCHOR_SCREEN_RADIUS = 4;
const CLOSE_SCREEN_RADIUS = 6;
const HANDLE_SCREEN_RADIUS = 2.75;
const GUIDE_SCREEN_WIDTH = 1;
const ANCHOR_SCREEN_STROKE = 1.5;
const RUBBER_BAND_OPACITY = 0.5;
const PENDING_OPACITY = 0.7;

interface HandleLinesProps {
  anchor: BezierAnchor;
  zoom: number;
}

const HandleLines: React.FC<HandleLinesProps> = ({ anchor, zoom }) => (
  <>
    {[anchor.inHandle, anchor.outHandle].map((handle, index) =>
      handle ? (
        <g key={index}>
          <line x1={anchor.x} y1={anchor.y} x2={handle.x} y2={handle.y} stroke="var(--s-canvas-selection)" strokeWidth={GUIDE_SCREEN_WIDTH / zoom} />
          <circle cx={handle.x} cy={handle.y} r={HANDLE_SCREEN_RADIUS / zoom} fill="var(--s-canvas-selection)" />
        </g>
      ) : null,
    )}
  </>
);

export const PenPathPreview: React.FC<PenPathPreviewProps> = ({ anchors, pendingAnchor, mousePos, nearFirst, settings, zoom }) => {
  const strokeProps = {
    fill: "none",
    stroke: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    strokeLinecap: settings.lineCap,
    strokeLinejoin: settings.lineJoin,
  };
  const lastAnchor = pendingAnchor ?? anchors[anchors.length - 1] ?? null;
  const closing = nearFirst && !pendingAnchor;
  const anchorRadius = ANCHOR_SCREEN_RADIUS / zoom;

  return (
    <>
      {anchors.length >= 2 && (
        <path d={anchorsToPath(anchors, false)} {...strokeProps} strokeDasharray={dashArrayFor(settings.dashStyle, settings.strokeWidth)} />
      )}
      {pendingAnchor && anchors.length >= 1 && (
        <path d={previewSegment(anchors[anchors.length - 1], pendingAnchor)} {...strokeProps} opacity={PENDING_OPACITY} />
      )}
      {!pendingAnchor && mousePos && lastAnchor && (
        <path
          d={previewSegment(lastAnchor, closing ? anchors[0] : mousePos)}
          fill="none"
          stroke="var(--s-canvas-selection)"
          strokeWidth={GUIDE_SCREEN_WIDTH / zoom}
          opacity={RUBBER_BAND_OPACITY}
        />
      )}
      {anchors.map((anchor, index) => (
        <HandleLines key={`handles-${index}`} anchor={anchor} zoom={zoom} />
      ))}
      {pendingAnchor && <HandleLines anchor={pendingAnchor} zoom={zoom} />}
      {[...anchors, ...(pendingAnchor ? [pendingAnchor] : [])].map((anchor, index) => {
        const isClosingTarget = index === 0 && closing;
        return (
          <circle
            key={`anchor-${index}`}
            cx={anchor.x}
            cy={anchor.y}
            r={isClosingTarget ? CLOSE_SCREEN_RADIUS / zoom : anchorRadius}
            fill={isClosingTarget ? "var(--s-canvas-selection)" : "white"}
            stroke="var(--s-canvas-selection)"
            strokeWidth={ANCHOR_SCREEN_STROKE / zoom}
          />
        );
      })}
    </>
  );
};
