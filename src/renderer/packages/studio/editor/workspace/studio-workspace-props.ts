import type React from "react";
import type { AnimationController } from "../use-studio-animation";
import type {
  TemplateDef,
  TemplatePage,
  Layer,
  CustomFontEntry,
  ShapeType,
  BezierAnchor,
  VectorSettings,
  InkPoint,
} from "@bitgrain/studio-core/model/studio-types";
import type { FrameRect } from "../use-studio-pages";
import type { DistributeAxis } from "@bitgrain/studio-core/layers/layer-order";
import type { TextStyleVariable, NumberToken } from "@bitgrain/studio-core/model/design-kit-types";
import type { BTGStudioProject } from "@bitgrain/studio-core/io/btg-export";

export interface StudioWorkspaceProps {
  template: TemplateDef;
  activeTemplateId: string;
  effectiveTemplate: TemplateDef;
  background: string;
  layers: Layer[];
  selectedIds: string[];
  selectedLayer: Layer | null;
  image: string | null;
  zoom: number;
  dark: boolean;
  past: unknown[];
  future: unknown[];
  editingId: string | null;
  vectorEditingId: string | null;
  scaleContents: boolean;
  canvasW: number;
  canvasH: number;
  customFonts: CustomFontEntry[];
  workName?: string;
  onRenameWork: (name: string) => void;
  canvasWRef: React.MutableRefObject<number>;
  canvasHRef: React.MutableRefObject<number>;
  dragCanvasWRef: React.MutableRefObject<number | null>;
  dragCanvasHRef: React.MutableRefObject<number | null>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setBackground: (bg: string) => void;
  setCanvasW: (w: number) => void;
  setCanvasH: (h: number) => void;
  setEditingId: (id: string | null) => void;
  setVectorEditingId: (id: string | null) => void;
  setZoom: (z: number) => void;
  setImage: (img: string | null) => void;
  setCustomFonts: React.Dispatch<React.SetStateAction<CustomFontEntry[]>>;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  commitUpdate: (id: string, updates: Partial<Layer>) => void;
  handleApplyKitColor: (varId: string, hex: string) => void;
  handleApplyKitTextStyle: (style: TextStyleVariable) => void;
  handleApplyKitNumber: (token: NumberToken) => void;
  handleVariableColorChange: (varId: string, hex: string) => void;
  handlePageBackgroundBind: (pageId: string, varId: string, value: string) => void;
  handleExit: () => void;
  handleNewProject: () => void;
  handleLoadBTG: (project: BTGStudioProject, fonts: Array<{ label: string; dataUrl: string }>) => void;
  handleSelectTemplate: (t: TemplateDef) => void;
  handleOpenAccount: () => void;
  handleAddText: () => void;
  handleAddShape: (s: ShapeType) => void;
  handleAddImage: () => void;
  handleAddImageFromUrl: (src: string, opts?: { name?: string; width?: number; height?: number }) => void;
  handleAddAdjustment: () => void;
  handleAddPattern: () => void;
  handleAddVector: (a: BezierAnchor[], c: boolean, s: VectorSettings) => void;
  handleAddInk: (strokes: InkPoint[][], s: VectorSettings) => void;
  handleDeleteLayer: (id: string) => void;
  handleDuplicate: (ids: string[]) => void;
  handleGroup: () => void;
  handleUngroup: () => void;
  handleMoveLayerUp: (id: string) => void;
  handleMoveLayerDown: (id: string) => void;
  handleFlipLayerH: (id: string) => void;
  handleFlipLayerV: (id: string) => void;
  handleAlign: (a: string) => void;
  handleScatterCollage: () => void;
  handleDistribute: (axis: DistributeAxis) => void;
  handleBringToFront: (ids: string[]) => void;
  handleSendToBack: (ids: string[]) => void;
  handleMatchPageToLayer: (id: string) => void;
  handleResizeToFormats: (formatIds: string[]) => void;
  handleAddMockupPage: (dataUrl: string, width: number, height: number) => void;
  handleLayerContextMenu: (id: string, x: number, y: number) => void;
  animation: AnimationController;
  pages: TemplatePage[];
  activePageId: string;
  selectedFramePageId: string | null;
  setSelectedFramePageId: (id: string | null) => void;
  handleSelectPage: (id: string) => void;
  handleSelectFramePage: (id: string) => void;
  handleAddPage: () => void;
  handleDuplicatePage: (pageId: string) => void;
  handleDeletePage: (id: string) => void;
  handleReorderLayersForPage: (pageId: string, layers: Layer[]) => void;
  handlePageMoveStart: () => void;
  handlePageMoveTo: (pageId: string, x: number, y: number) => void;
  handleRenamePage: (id: string, name: string) => void;
  handlePageBackgroundChange: (id: string, color: string) => void;
  handlePageResize: (id: string, width: number, height: number) => void;
  handlePageFrameTransform: (id: string, x: number, y: number, width: number, height: number) => void;
  handleAddFrame: (parentId: string | null, rect: FrameRect) => string;
  handleDeleteFrame: (frameId: string) => void;
  handleReparentFrame: (frameId: string, newParentId: string | null, dropLocal?: { x: number; y: number }) => void;
  handleMoveLayersToFrame: (layerIds: string[], targetFrameId: string) => void;
}
