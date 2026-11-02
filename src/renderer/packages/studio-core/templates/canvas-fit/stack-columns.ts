import type { Layer } from "../../model/studio-types";
import { buildClusters, clusterGaps, type AxisCluster } from "./axis-clusters";
import type { FitContext, FitSize } from "./fit-context";

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 3;
const MIN_SCALE_GAIN = 1.25;
const MIN_MARGIN_RATIO = 0.06;

export interface FlowSource {
  layers: Layer[];
  from: FitSize;
  scale: number;
}

interface ColumnBox {
  cluster: AxisCluster;
  top: number;
  bottom: number;
}

const columnBox = (cluster: AxisCluster, layers: Layer[]): ColumnBox => ({
  cluster,
  top: Math.min(...cluster.members.map((index) => layers[index].y)),
  bottom: Math.max(...cluster.members.map((index) => layers[index].y + layers[index].height)),
});

const stackMargins = (gaps: number[], columns: ColumnBox[], from: FitSize): FitSize => {
  const minimum = Math.min(from.width, from.height) * MIN_MARGIN_RATIO;
  return {
    width: Math.max(minimum, Math.min(gaps[0], gaps[gaps.length - 1])),
    height: Math.max(minimum, Math.min(...columns.map((column) => column.top))),
  };
};

const fitScale = (context: FitContext, from: FitSize): number =>
  Math.min(context.content.width / from.width, context.content.height / from.height);

const stackedLayers = (layers: Layer[], flowIndexes: number[], columns: ColumnBox[], margins: FitSize, gap: number): { layers: Layer[]; from: FitSize } => {
  const widest = Math.max(...columns.map((column) => column.cluster.end - column.cluster.start));
  const moved = [...layers];
  let cursor = margins.height;
  columns.forEach((column) => {
    const inset = margins.width + (widest - (column.cluster.end - column.cluster.start)) / 2;
    column.cluster.members.forEach((member) => {
      const index = flowIndexes[member];
      moved[index] = { ...layers[index], x: layers[index].x - column.cluster.start + inset, y: layers[index].y - column.top + cursor };
    });
    cursor += column.bottom - column.top + gap;
  });
  return { layers: moved, from: { width: widest + margins.width * 2, height: cursor - gap + margins.height } };
};

export const stackColumnsIfTaller = (layers: Layer[], flowIndexes: number[], context: FitContext): FlowSource => {
  const unchanged = { layers, from: context.from, scale: context.scale };
  if (context.content.height / context.content.width <= context.from.height / context.from.width) return unchanged;
  const clusters = buildClusters(flowIndexes.map((index) => ({ start: layers[index].x, size: layers[index].width })));
  if (clusters.length < MIN_COLUMNS || clusters.length > MAX_COLUMNS) return unchanged;
  const gaps = clusterGaps(clusters, context.from.width);
  const flowLayers = flowIndexes.map((index) => layers[index]);
  const columns = clusters.map((cluster) => columnBox(cluster, flowLayers));
  const margins = stackMargins(gaps, columns, context.from);
  const stacked = stackedLayers(layers, flowIndexes, columns, margins, Math.max(...gaps.slice(1, -1), margins.height));
  const scale = fitScale(context, stacked.from);
  return scale >= context.scale * MIN_SCALE_GAIN ? { ...stacked, scale } : unchanged;
};
