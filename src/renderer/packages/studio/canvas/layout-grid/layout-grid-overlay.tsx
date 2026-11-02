import React, { useMemo } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { collectFrameGrids, type GridHost } from "./collect-frame-grids";
import { LayoutGridShapes } from "./layout-grid-shapes";

interface LayoutGridOverlayProps {
  page: TemplatePage;
  zoom: number;
}

export const LayoutGridOverlay = ({ page, zoom }: LayoutGridOverlayProps): React.ReactElement | null => {
  const hosts = useMemo<GridHost[]>(() => {
    const pageGrids = (page.layoutGrids ?? []).filter((grid) => grid.visible);
    const pageHost: GridHost[] = pageGrids.length
      ? [{ key: page.id, transform: "", width: page.width, height: page.height, grids: pageGrids }]
      : [];
    return [...pageHost, ...collectFrameGrids(page.layers)];
  }, [page]);

  if (hosts.length === 0) return null;
  return (
    <svg
      className="absolute top-0 left-0 z-[45] pointer-events-none overflow-visible"
      width={page.width}
      height={page.height}
      viewBox={`0 0 ${page.width} ${page.height}`}
    >
      {hosts.map((host) => (
        <g key={host.key} transform={host.transform || undefined}>
          {host.grids.map((grid) => (
            <LayoutGridShapes key={grid.id} grid={grid} width={host.width} height={host.height} zoom={zoom} />
          ))}
        </g>
      ))}
    </svg>
  );
};
