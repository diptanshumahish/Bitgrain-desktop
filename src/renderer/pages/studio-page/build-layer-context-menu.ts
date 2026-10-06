import { emitContextMenu } from "../../lib/event-bus";
import type { Layer } from "../../data/studioTypes";
import { shapeToVectorLayer } from "../../utils/shape-to-vector";
import { applyBooleanOp, type BooleanOp } from "../../utils/boolean-ops";

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
  pushHistory: () => void;
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
}

const BOOLEAN_OPS: Array<{ op: BooleanOp; label: string; icon: string }> = [
  { op: "union", label: "Union", icon: "U+" },
  { op: "subtract", label: "Subtract", icon: "U-" },
  { op: "intersect", label: "Intersect", icon: "Un" },
  { op: "exclude", label: "Exclude", icon: "Ux" },
];

export const buildLayerContextMenu = ({
  id,
  x,
  y,
  selectedIds,
  layers,
  setSelectedIds,
  updateLayer,
  handleDuplicate,
  handleGroup,
  handleUngroup,
  pushHistory,
  setLayers,
}: BuildLayerContextMenuArgs): void => {
  const isSelected = selectedIds.includes(id);
  const activeIds = isSelected ? selectedIds : [id];
  if (!isSelected) setSelectedIds([id]);
  const target = layers.find((l) => l.id === activeIds[0]);
  const isGroup = activeIds.length === 1 && target?.type === "group";
  const canConvertToVector = activeIds.length === 1 && target?.type === "shape";
  const activeLayers = layers.filter((l) => activeIds.includes(l.id));
  const canBoolean =
    activeLayers.length >= 2 &&
    activeLayers.every((l) => l.type === "shape" || l.type === "vector");

  const convertToVector = () => {
    if (!target || target.type !== "shape") return;
    pushHistory();
    const vectorLayer = shapeToVectorLayer(target);
    setLayers((prev) => prev.map((l) => (l.id === target.id ? vectorLayer : l)));
    setSelectedIds([vectorLayer.id]);
  };

  const runBoolean = (op: BooleanOp) => {
    if (!canBoolean) return;
    const merged = applyBooleanOp(op, activeLayers, layers.length);
    if (!merged) return;
    pushHistory();
    setLayers((prev) => [
      ...prev.filter((l) => !activeIds.includes(l.id)),
      merged,
    ]);
    setSelectedIds([merged.id]);
  };

  emitContextMenu({
    x,
    y,
    actions: [
      {
        label: "Rename",
        icon: '""',
        onClick: () => {
          const newName = prompt("Enter new name:", target?.name);
          if (newName && target) updateLayer(target.id, { name: newName });
        },
        disabled: activeIds.length !== 1,
      },
      {
        label: "Duplicate",
        icon: "::",
        onClick: () => handleDuplicate(activeIds),
      },
      {
        label: "Convert to Vector",
        icon: "()",
        onClick: convertToVector,
        disabled: !canConvertToVector,
      },
      ...BOOLEAN_OPS.map(({ op, label, icon }) => ({
        label,
        icon,
        onClick: () => runBoolean(op),
        disabled: !canBoolean,
      })),
      {
        label: target?.locked ? "Unlock" : "Lock",
        icon: target?.locked ? ".." : "##",
        onClick: () =>
          activeIds.forEach((lid) => {
            const t = layers.find((l) => l.id === lid);
            if (t) updateLayer(lid, { locked: !t.locked });
          }),
      },
      {
        label: "Flip Horizontal",
        icon: "<>",
        onClick: () =>
          activeIds.forEach((lid) => {
            const t = layers.find((l) => l.id === lid);
            if (t) updateLayer(lid, { flipH: !t.flipH });
          }),
      },
      {
        label: "Flip Vertical",
        icon: "^v",
        onClick: () =>
          activeIds.forEach((lid) => {
            const t = layers.find((l) => l.id === lid);
            if (t) updateLayer(lid, { flipV: !t.flipV });
          }),
      },
      {
        label:
          activeIds.length > 1
            ? `Group ${activeIds.length} layers`
            : "Group",
        icon: "[]",
        onClick: handleGroup,
        disabled: activeIds.length < 2,
      },
      {
        label: "Ungroup",
        icon: "][",
        onClick: handleUngroup,
        disabled: !isGroup,
      },
      {
        label: "Delete",
        icon: "XX",
        onClick: () => {
          pushHistory();
          setLayers((prev) => prev.filter((l) => !activeIds.includes(l.id)));
          setSelectedIds((prev) =>
            prev.filter((sid) => !activeIds.includes(sid)),
          );
        },
      },
    ],
  });
};
