interface DotScreen {
  cell: number;
  cos: number;
  sin: number;
}

interface DotSample {
  centreX: number;
  centreY: number;
  offsetAlong: number;
  offsetAcross: number;
}

const HALF = 0.5;
const SOLID_COVERAGE = 0.98;

export const createDotScreen = (cell: number, angleRad: number): DotScreen => ({
  cell,
  cos: Math.cos(angleRad),
  sin: Math.sin(angleRad),
});

export const locateDot = (screen: DotScreen, x: number, y: number): DotSample => {
  const pixelX = x + HALF;
  const pixelY = y + HALF;
  const along = (pixelX * screen.cos + pixelY * screen.sin) / screen.cell;
  const across = (-pixelX * screen.sin + pixelY * screen.cos) / screen.cell;
  const centreAlong = (Math.floor(along) + HALF) * screen.cell;
  const centreAcross = (Math.floor(across) + HALF) * screen.cell;
  return {
    centreX: centreAlong * screen.cos - centreAcross * screen.sin,
    centreY: centreAlong * screen.sin + centreAcross * screen.cos,
    offsetAlong: Math.abs(along - Math.floor(along) - HALF),
    offsetAcross: Math.abs(across - Math.floor(across) - HALF),
  };
};

const radiusForCoverage = (cell: number, coverage: number): number => cell * Math.sqrt(coverage / Math.PI);

const edgeAlpha = (radius: number, distance: number): number =>
  Math.min(1, Math.max(0, radius - distance + HALF));

export const inkForDot = (screen: DotScreen, dot: DotSample, coverage: number): number => {
  if (coverage <= 0) return 0;
  if (coverage >= SOLID_COVERAGE) return 1;
  if (coverage <= HALF) {
    const distance = Math.hypot(dot.offsetAlong, dot.offsetAcross) * screen.cell;
    return edgeAlpha(radiusForCoverage(screen.cell, coverage), distance);
  }
  const cornerDistance = Math.hypot(HALF - dot.offsetAlong, HALF - dot.offsetAcross) * screen.cell;
  return 1 - edgeAlpha(radiusForCoverage(screen.cell, 1 - coverage), cornerDistance);
};
