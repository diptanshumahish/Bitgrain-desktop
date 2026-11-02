import type { Point } from "./matrix";
import type { CubicSegment, Subpath } from "./subpath-types";
import { tokenizePath } from "./path-tokens";
import { arcToCubics } from "./arc-to-cubic";

const ARG_COUNTS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
const TWO_THIRDS = 2 / 3;

interface PathState {
  subpaths: Subpath[];
  current: Subpath | null;
  point: Point;
  lastCubic: Point | null;
  lastQuad: Point | null;
}

const reflect = (control: Point | null, around: Point): Point =>
  control ? { x: 2 * around.x - control.x, y: 2 * around.y - control.y } : around;

const resolve = (state: PathState, relative: boolean, x: number, y: number): Point =>
  relative ? { x: state.point.x + x, y: state.point.y + y } : { x, y };

const ensureSubpath = (state: PathState): Subpath => {
  if (state.current) return state.current;
  const subpath: Subpath = { start: state.point, segments: [], closed: false };
  state.subpaths.push(subpath);
  state.current = subpath;
  return subpath;
};

const pushSegment = (state: PathState, segment: CubicSegment): void => {
  ensureSubpath(state).segments.push(segment);
  state.point = segment.end;
};

const moveTo = (state: PathState, point: Point): void => {
  state.point = point;
  state.current = null;
  ensureSubpath(state);
};

const closePath = (state: PathState): void => {
  if (!state.current) return;
  state.current.closed = true;
  state.point = state.current.start;
  state.current = null;
};

const quadToCubic = (from: Point, control: Point, end: Point): CubicSegment => ({
  c1: { x: from.x + TWO_THIRDS * (control.x - from.x), y: from.y + TWO_THIRDS * (control.y - from.y) },
  c2: { x: end.x + TWO_THIRDS * (control.x - end.x), y: end.y + TWO_THIRDS * (control.y - end.y) },
  end,
});

const cubicCommand = (state: PathState, c1: Point, c2: Point, end: Point): void => {
  pushSegment(state, { c1, c2, end });
  state.lastCubic = c2;
};

const quadCommand = (state: PathState, control: Point, end: Point): void => {
  pushSegment(state, quadToCubic(state.point, control, end));
  state.lastQuad = control;
};

const arcCommand = (state: PathState, args: number[], relative: boolean): void => {
  const end = resolve(state, relative, args[5], args[6]);
  const segments = arcToCubics(state.point, {
    rx: args[0], ry: args[1], xAxisRotation: args[2], largeArc: args[3] !== 0, sweep: args[4] !== 0, end,
  });
  segments.forEach((segment) => pushSegment(state, segment));
};

const runCommand = (state: PathState, lower: string, args: number[], relative: boolean): void => {
  const previousCubic = state.lastCubic;
  const previousQuad = state.lastQuad;
  state.lastCubic = null;
  state.lastQuad = null;
  if (lower === "m") moveTo(state, resolve(state, relative, args[0], args[1]));
  if (lower === "l") pushSegment(state, { c1: null, c2: null, end: resolve(state, relative, args[0], args[1]) });
  if (lower === "h") pushSegment(state, { c1: null, c2: null, end: { x: relative ? state.point.x + args[0] : args[0], y: state.point.y } });
  if (lower === "v") pushSegment(state, { c1: null, c2: null, end: { x: state.point.x, y: relative ? state.point.y + args[0] : args[0] } });
  if (lower === "c") cubicCommand(state, resolve(state, relative, args[0], args[1]), resolve(state, relative, args[2], args[3]), resolve(state, relative, args[4], args[5]));
  if (lower === "s") cubicCommand(state, reflect(previousCubic, state.point), resolve(state, relative, args[0], args[1]), resolve(state, relative, args[2], args[3]));
  if (lower === "q") quadCommand(state, resolve(state, relative, args[0], args[1]), resolve(state, relative, args[2], args[3]));
  if (lower === "t") quadCommand(state, reflect(previousQuad, state.point), resolve(state, relative, args[0], args[1]));
  if (lower === "a") arcCommand(state, args, relative);
  if (lower === "z") closePath(state);
};

const runLetter = (state: PathState, letter: string, args: number[]): void => {
  const lower = letter.toLowerCase();
  const relative = letter === lower;
  const count = ARG_COUNTS[lower];
  if (count === 0) {
    runCommand(state, lower, [], relative);
    return;
  }
  for (let offset = 0; offset + count <= args.length; offset += count) {
    const effective = lower === "m" && offset > 0 ? "l" : lower;
    runCommand(state, effective, args.slice(offset, offset + count), relative);
  }
};

export const pathDataToSubpaths = (data: string): Subpath[] => {
  const state: PathState = { subpaths: [], current: null, point: { x: 0, y: 0 }, lastCubic: null, lastQuad: null };
  tokenizePath(data).forEach((command) => runLetter(state, command.letter, command.args));
  return state.subpaths.filter((subpath) => subpath.segments.length > 0);
};
