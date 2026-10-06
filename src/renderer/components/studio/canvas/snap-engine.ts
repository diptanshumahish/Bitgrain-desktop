export interface SnapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapGuide {
  orientation: "vertical" | "horizontal";
  position: number;
  start: number;
  end: number;
}

export interface SnapResult {
  correctionX: number;
  correctionY: number;
  guides: SnapGuide[];
}

interface TargetLine {
  position: number;
  perpStart: number;
  perpEnd: number;
}

const ALIGN_TOLERANCE = 0.5;

const xLines = (rect: SnapRect): TargetLine[] => {
  const perpStart = rect.y;
  const perpEnd = rect.y + rect.height;
  return [
    { position: rect.x, perpStart, perpEnd },
    { position: rect.x + rect.width / 2, perpStart, perpEnd },
    { position: rect.x + rect.width, perpStart, perpEnd },
  ];
};

const yLines = (rect: SnapRect): TargetLine[] => {
  const perpStart = rect.x;
  const perpEnd = rect.x + rect.width;
  return [
    { position: rect.y, perpStart, perpEnd },
    { position: rect.y + rect.height / 2, perpStart, perpEnd },
    { position: rect.y + rect.height, perpStart, perpEnd },
  ];
};

const canvasXLines = (canvas: { width: number; height: number }): TargetLine[] => [
  { position: 0, perpStart: 0, perpEnd: canvas.height },
  { position: canvas.width / 2, perpStart: 0, perpEnd: canvas.height },
  { position: canvas.width, perpStart: 0, perpEnd: canvas.height },
];

const canvasYLines = (canvas: { width: number; height: number }): TargetLine[] => [
  { position: 0, perpStart: 0, perpEnd: canvas.width },
  { position: canvas.height / 2, perpStart: 0, perpEnd: canvas.width },
  { position: canvas.height, perpStart: 0, perpEnd: canvas.width },
];

const movingXEdges = (rect: SnapRect): number[] => [rect.x, rect.x + rect.width / 2, rect.x + rect.width];
const movingYEdges = (rect: SnapRect): number[] => [rect.y, rect.y + rect.height / 2, rect.y + rect.height];

const findCorrection = (
  movingEdges: number[],
  targetLines: TargetLine[],
  threshold: number,
): number => {
  let bestCorrection = 0;
  let bestDistance = threshold + 1;
  for (const line of targetLines) {
    for (const edge of movingEdges) {
      const diff = line.position - edge;
      const distance = Math.abs(diff);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestCorrection = diff;
      }
    }
  }
  return bestDistance <= threshold ? bestCorrection : 0;
};

const collectMatches = (
  movingEdges: number[],
  targetLines: TargetLine[],
  correction: number,
): TargetLine[] => {
  const matched: TargetLine[] = [];
  for (const line of targetLines) {
    for (const edge of movingEdges) {
      if (Math.abs(line.position - (edge + correction)) < ALIGN_TOLERANCE) {
        matched.push(line);
        break;
      }
    }
  }
  return matched;
};

export const computeSnap = (
  moving: SnapRect,
  targets: SnapRect[],
  canvas: { width: number; height: number },
  threshold: number,
): SnapResult => {
  const targetXLines: TargetLine[] = [...canvasXLines(canvas)];
  const targetYLines: TargetLine[] = [...canvasYLines(canvas)];
  for (const t of targets) {
    targetXLines.push(...xLines(t));
    targetYLines.push(...yLines(t));
  }

  const movingXs = movingXEdges(moving);
  const movingYs = movingYEdges(moving);

  const correctionX = findCorrection(movingXs, targetXLines, threshold);
  const correctionY = findCorrection(movingYs, targetYLines, threshold);

  const snappedX = moving.x + correctionX;
  const snappedY = moving.y + correctionY;
  const snappedXExtent: [number, number] = [snappedX, snappedX + moving.width];
  const snappedYExtent: [number, number] = [snappedY, snappedY + moving.height];

  const matchedX = collectMatches(movingXs, targetXLines, correctionX);
  const matchedY = collectMatches(movingYs, targetYLines, correctionY);

  const guides: SnapGuide[] = [];
  for (const line of matchedX) {
    guides.push({
      orientation: "vertical",
      position: line.position,
      start: Math.min(line.perpStart, snappedYExtent[0]),
      end: Math.max(line.perpEnd, snappedYExtent[1]),
    });
  }
  for (const line of matchedY) {
    guides.push({
      orientation: "horizontal",
      position: line.position,
      start: Math.min(line.perpStart, snappedXExtent[0]),
      end: Math.max(line.perpEnd, snappedXExtent[1]),
    });
  }

  return { correctionX, correctionY, guides };
};
