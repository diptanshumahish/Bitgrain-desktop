import { buildClusters, clusterGaps, type AxisCluster, type AxisSpan } from "./axis-clusters";

const EDGE_PIN_RATIO = 0.08;

interface AxisTarget {
  start: number;
  length: number;
  scale: number;
}

const isPinnedMargin = (gap: number, length: number): boolean => gap <= length * EDGE_PIN_RATIO;

const singleClusterWeights = (gaps: number[]): number[] => {
  const [leading, trailing] = gaps.map((gap) => Math.max(gap, 0));
  if (leading + trailing === 0) return [1, 1];
  return [leading, trailing];
};

const gapWeights = (gaps: number[], length: number): number[] => {
  if (gaps.length === 2) return singleClusterWeights(gaps);
  const lastIndex = gaps.length - 1;
  const weights = gaps.map((gap, index) => {
    const isEdge = index === 0 || index === lastIndex;
    if (isEdge && isPinnedMargin(gap, length)) return 0;
    return Math.max(gap, 0);
  });
  return weights.some((weight) => weight > 0) ? weights : gaps.map((_, index) => (index === 0 || index === lastIndex ? 0 : 1));
};

const distribute = (extra: number, weights: number[]): number[] => {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => (total > 0 ? (extra * weight) / total : 0));
};

const clusterStarts = (clusters: AxisCluster[], gaps: number[], allocations: number[], target: AxisTarget): number[] => {
  const starts: number[] = [];
  let cursor = target.start;
  clusters.forEach((cluster, index) => {
    cursor += gaps[index] * target.scale + allocations[index];
    starts.push(cursor);
    cursor += (cluster.end - cluster.start) * target.scale;
  });
  return starts;
};

export const layoutAxis = (spans: AxisSpan[], sourceLength: number, target: AxisTarget): number[] => {
  if (spans.length === 0) return [];
  const clusters = buildClusters(spans);
  const gaps = clusterGaps(clusters, sourceLength);
  const extra = Math.max(0, target.length - sourceLength * target.scale);
  const starts = clusterStarts(clusters, gaps, distribute(extra, gapWeights(gaps, sourceLength)), target);
  const placed = new Array<number>(spans.length);
  clusters.forEach((cluster, index) => {
    cluster.members.forEach((member) => {
      placed[member] = starts[index] + (spans[member].start - cluster.start) * target.scale;
    });
  });
  return placed;
};
