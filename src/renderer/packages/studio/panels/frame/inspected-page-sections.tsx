import React from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { emitPageAidsUpdate } from "../../state/canvas-aids/page-aids-event";
import { PageNotesSection } from "../../features/presenter/notes/page-notes-section";
import { FrameProperties } from "../FrameProperties";
import { PageGuidesSection } from "../guides/page-guides-section";
import { WorkspaceDetails } from "../workspace-details";
import { PageResizeSection } from "./page-resize-section";

interface InspectedPageSectionsProps {
  page: TemplatePage;
  pageIndex: number;
  pages: TemplatePage[];
  onRename: (id: string, name: string) => void;
  onBackgroundChange: (id: string, color: string) => void;
  onBackgroundBind?: (pageId: string, varId: string, value: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export const InspectedPageSections: React.FC<InspectedPageSectionsProps> = ({
  page, pageIndex, pages, onRename, onBackgroundChange, onBackgroundBind, onResize, onMove,
}) => (
  <>
    <FrameProperties
      name={page.name}
      background={page.background}
      backgroundVar={page.backgroundVar}
      width={page.width}
      height={page.height}
      x={page.x}
      y={page.y}
      clip={page.clip ?? true}
      indexLabel={`Page ${pageIndex + 1} of ${pages.length}`}
      namePlaceholder={`Page ${pageIndex + 1}`}
      onRename={(name) => onRename(page.id, name)}
      onBackgroundChange={(color) => onBackgroundChange(page.id, color)}
      onBackgroundBind={onBackgroundBind ? (varId, value) => onBackgroundBind(page.id, varId, value) : undefined}
      onResize={(width, height) => onResize(page.id, width, height)}
      onMove={(x, y) => onMove(page.id, x, y)}
      layoutGrids={page.layoutGrids}
      onLayoutGridsChange={(layoutGrids) => emitPageAidsUpdate({ pageId: page.id, patch: { layoutGrids }, recordHistory: true })}
      scaleContents={page.scaleContents ?? true}
      onScaleContentsChange={(scaleContents) => emitPageAidsUpdate({ pageId: page.id, patch: { scaleContents }, recordHistory: true })}
    />
    <PageResizeSection />
    <PageGuidesSection page={page} />
    <PageNotesSection pageId={page.id} notes={page.notes} />
    <WorkspaceDetails pages={pages} />
  </>
);
