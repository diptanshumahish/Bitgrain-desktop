export interface AxisSpan {
  start: number;
  size: number;
}

export interface AxisCluster {
  start: number;
  end: number;
  members: number[];
}

const byStart = (spans: AxisSpan[]): number[] =>
  spans.map((_, index) => index).sort((first, second) => spans[first].start - spans[second].start);

const extendCluster = (cluster: AxisCluster, span: AxisSpan, index: number): AxisCluster => ({
  start: cluster.start,
  end: Math.max(cluster.end, span.start + span.size),
  members: [...cluster.members, index],
});

export const buildClusters = (spans: AxisSpan[]): AxisCluster[] =>
  byStart(spans).reduce<AxisCluster[]>((clusters, index) => {
    const span = spans[index];
    const last = clusters[clusters.length - 1];
    if (last && span.start <= last.end) return [...clusters.slice(0, -1), extendCluster(last, span, index)];
    return [...clusters, { start: span.start, end: span.start + span.size, members: [index] }];
  }, []);

export const clusterGaps = (clusters: AxisCluster[], length: number): number[] =>
  clusters.map((cluster, index) => cluster.start - (index === 0 ? 0 : clusters[index - 1].end))
    .concat(length - clusters[clusters.length - 1].end);
