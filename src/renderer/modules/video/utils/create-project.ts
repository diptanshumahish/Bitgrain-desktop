import {
  DEFAULT_PROJECT_FPS,
  DEFAULT_PROJECT_HEIGHT,
  DEFAULT_PROJECT_WIDTH,
  TRACK_HEIGHT,
} from "../constants";
import type { Track, VideoProject } from "../types";
import { newId } from "./id";

export function createDefaultTracks(): Track[] {
  return [
    {
      id: newId(),
      kind: "video",
      name: "V1",
      locked: false,
      muted: false,
      visible: true,
      height: TRACK_HEIGHT,
      clips: [],
    },
    {
      id: newId(),
      kind: "effect",
      name: "FX",
      locked: false,
      muted: false,
      visible: true,
      height: TRACK_HEIGHT,
      clips: [],
    },
    {
      id: newId(),
      kind: "text",
      name: "Aa",
      locked: false,
      muted: false,
      visible: true,
      height: TRACK_HEIGHT,
      clips: [],
    },
    {
      id: newId(),
      kind: "audio",
      name: "A1",
      locked: false,
      muted: false,
      visible: true,
      height: TRACK_HEIGHT,
      clips: [],
    },
  ];
}

export interface BlankProjectOptions {
  width?: number;
  height?: number;
  fps?: number;
}

export function createBlankProject(
  id: string,
  name = "Untitled",
  options: BlankProjectOptions = {},
): VideoProject {
  const now = Date.now();
  return {
    id,
    name,
    thumbnail: null,
    width: options.width ?? DEFAULT_PROJECT_WIDTH,
    height: options.height ?? DEFAULT_PROJECT_HEIGHT,
    fps: options.fps ?? DEFAULT_PROJECT_FPS,
    duration: 0,
    createdAt: now,
    updatedAt: now,
    tracks: createDefaultTracks(),
    mediaPool: [],
  };
}
