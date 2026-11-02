import {
  ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, ClipboardPaste, Copy, CopyPlus, EyeOff,
  FlipHorizontal2, FlipVertical2, Group, Lock, PenLine, Spline, SquaresExclude, SquaresIntersect,
  SquaresSubtract, SquaresUnite, Trash2, Ungroup, Unlock, type LucideIcon,
} from "lucide-react";
import { emitContextMenu, type ContextMenuAction } from "../../lib/event-bus";
import type { Layer } from "../../data/studioTypes";
import { shapeToVectorLayer } from "../../utils/shape-to-vector";
import { applyBooleanOp, type BooleanOp } from "../../utils/boolean-ops";
import { trackEvent } from "../../lib/tracker";
import { layerClipboardSignal } from "../../store/layer-clipboard-store";
import { emitRenameLayer } from "./rename-layer-event";
import { MOD_KEY } from "./shortcut-labels";

interface BuildLayerContextMenuArgs {
  id: string;
  x: number;
  y: number;
  selectedIds: string[];
  layers: Layer[];
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  handleDuplicate: (ids: string[]) => void;
  handleGroup: () => void;
  handleUngroup: () => void;
  handleCopy: (ids: string[]) => void;
  handlePaste: () => void;
  handleBringForward: (ids: string[]) => void;
  handleSendBackward: (ids: string[]) => void;
  handleBringToFront: (ids: string[]) => void;
  handleSendToBack: (ids: string[]) => void;
  pushHistory: () => void;
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
}

interface MenuContext extends BuildLayerContextMenuArgs {
  activeIds: string[];
  target: Layer | undefined;
  activeLayers: Layer[];
}

const BOOLEAN_OPS: Array<{ op: BooleanOp; label: string; icon: LucideIcon }> = [
  { op: "union", label: "Union", icon: SquaresUnite },
  { op: "subtract", label: "Subtract", icon: SquaresSubtract },
  { op: "intersect", label: "Intersect", icon: SquaresIntersect },
  { op: "exclude", label: "Exclude", icon: SquaresExclude },
];

const tracked = (action: string, handler: () => void) => (): void => {
  trackEvent("studio", "context_menu_action", { details: { action } });
  handler();
};

const toggleEach = (ctx: MenuContext, key: "locked" | "flipH" | "flipV"): void => {
  ctx.activeLayers.forEach((layer) => ctx.updateLayer(layer.id, { [key]: !layer[key] }));
};

const clipboardActions = (ctx: MenuContext): ContextMenuAction[] => [
  { label: "Copy", icon: Copy, shortcut: `${MOD_KEY}C`, onClick: tracked("copy", () => ctx.handleCopy(ctx.activeIds)) },
  {
    label: "Paste", icon: ClipboardPaste, shortcut: `${MOD_KEY}V`,
    disabled: !layerClipboardSignal.value, onClick: tracked("paste", ctx.handlePaste),
  },
  { label: "Duplicate", icon: CopyPlus, shortcut: `${MOD_KEY}D`, onClick: tracked("duplicate", () => ctx.handleDuplicate(ctx.activeIds)) },
];

const arrangeActions = (ctx: MenuContext): ContextMenuAction[] => [
  { label: "Bring forward", icon: ArrowUp, dividerBefore: true, onClick: tracked("bring_forward", () => ctx.handleBringForward(ctx.activeIds)) },
  { label: "Send backward", icon: ArrowDown, onClick: tracked("send_backward", () => ctx.handleSendBackward(ctx.activeIds)) },
  { label: "Bring to front", icon: ArrowUpToLine, onClick: tracked("bring_to_front", () => ctx.handleBringToFront(ctx.activeIds)) },
  { label: "Send to back", icon: ArrowDownToLine, onClick: tracked("send_to_back", () => ctx.handleSendToBack(ctx.activeIds)) },
];

const groupActions = (ctx: MenuContext): ContextMenuAction[] => {
  const isGroup = ctx.activeIds.length === 1 && ctx.target?.type === "group";
  if (isGroup) return [{ label: "Ungroup", icon: Ungroup, dividerBefore: true, onClick: tracked("ungroup", ctx.handleUngroup) }];
  return [{
    label: ctx.activeIds.length > 1 ? `Group ${ctx.activeIds.length} layers` : "Group", icon: Group,
    shortcut: `${MOD_KEY}G`, dividerBefore: true, disabled: ctx.activeIds.length < 2, onClick: tracked("group", ctx.handleGroup),
  }];
};

const layerStateActions = (ctx: MenuContext): ContextMenuAction[] => [
  {
    label: ctx.target?.locked ? "Unlock" : "Lock", icon: ctx.target?.locked ? Unlock : Lock,
    onClick: tracked(ctx.target?.locked ? "unlock" : "lock", () => toggleEach(ctx, "locked")),
  },
  {
    label: "Hide", icon: EyeOff,
    onClick: tracked("hide", () => ctx.activeIds.forEach((layerId) => ctx.updateLayer(layerId, { visible: false }))),
  },
  { label: "Flip horizontal", icon: FlipHorizontal2, onClick: tracked("flip_horizontal", () => toggleEach(ctx, "flipH")) },
  { label: "Flip vertical", icon: FlipVertical2, onClick: tracked("flip_vertical", () => toggleEach(ctx, "flipV")) },
  {
    label: "Rename", icon: PenLine, disabled: ctx.activeIds.length !== 1,
    onClick: tracked("rename", () => emitRenameLayer(ctx.activeIds[0])),
  },
];

const convertToVector = (ctx: MenuContext): void => {
  const target = ctx.target;
  if (!target || target.type !== "shape") return;
  ctx.pushHistory();
  const vectorLayer = shapeToVectorLayer(target);
  ctx.setLayers((prev) => prev.map((layer) => (layer.id === target.id ? vectorLayer : layer)));
  ctx.setSelectedIds([vectorLayer.id]);
};

const runBoolean = (ctx: MenuContext, op: BooleanOp): void => {
  const merged = applyBooleanOp(op, ctx.activeLayers, ctx.layers.length);
  if (!merged) return;
  ctx.pushHistory();
  ctx.setLayers((prev) => [...prev.filter((layer) => !ctx.activeIds.includes(layer.id)), merged]);
  ctx.setSelectedIds([merged.id]);
};

const shapeActions = (ctx: MenuContext): ContextMenuAction[] => {
  const canConvert = ctx.activeIds.length === 1 && ctx.target?.type === "shape";
  const canBoolean = ctx.activeLayers.length >= 2
    && ctx.activeLayers.every((layer) => layer.type === "shape" || layer.type === "vector");
  const convert = canConvert
    ? [{ label: "Convert to vector", icon: Spline, dividerBefore: true, onClick: tracked("convert_to_vector", () => convertToVector(ctx)) }]
    : [];
  const booleans = canBoolean
    ? BOOLEAN_OPS.map(({ op, label, icon }, index) => ({
        label, icon, dividerBefore: index === 0, onClick: tracked(`boolean_${op}`, () => runBoolean(ctx, op)),
      }))
    : [];
  return [...convert, ...booleans];
};

const deleteAction = (ctx: MenuContext): ContextMenuAction => ({
  label: "Delete", icon: Trash2, shortcut: "⌫", danger: true, dividerBefore: true,
  onClick: tracked("delete", () => {
    ctx.pushHistory();
    ctx.setLayers((prev) => prev.filter((layer) => !ctx.activeIds.includes(layer.id)));
    ctx.setSelectedIds((prev) => prev.filter((selectedId) => !ctx.activeIds.includes(selectedId)));
  }),
});

export const buildLayerContextMenu = (args: BuildLayerContextMenuArgs): void => {
  const isSelected = args.selectedIds.includes(args.id);
  const activeIds = isSelected ? args.selectedIds : [args.id];
  if (!isSelected) args.setSelectedIds([args.id]);
  const ctx: MenuContext = {
    ...args,
    activeIds,
    target: args.layers.find((layer) => layer.id === activeIds[0]),
    activeLayers: args.layers.filter((layer) => activeIds.includes(layer.id)),
  };
  emitContextMenu({
    x: args.x,
    y: args.y,
    actions: [
      ...clipboardActions(ctx), ...arrangeActions(ctx), ...groupActions(ctx),
      ...layerStateActions(ctx), ...shapeActions(ctx), deleteAction(ctx),
    ],
  });
};
