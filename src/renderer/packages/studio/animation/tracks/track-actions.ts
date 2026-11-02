import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { TrackGroupId } from "@bitgrain/studio-core/model/animation-types";
import {
  addTrackKey,
  makeTrackKeyId,
  moveTrackKey,
  removeTrackKey,
  resetTrack,
  setTrackKeyEasing,
} from "@bitgrain/studio-core/animate/tracks/track-ops";
import type { EasingValue } from "../easing/easing-presets";

export type PageEditor = (updater: (page: TemplatePage) => TemplatePage, recordHistory: boolean) => void;

interface TrackTarget {
  layerId: string;
  group: TrackGroupId;
}

export interface TrackActions {
  moveKey: (keyId: string, timeMs: number, recordHistory: boolean) => void;
  setEasing: (keyId: string, value: EasingValue) => void;
  addKey: (timeMs: number) => void;
  removeKey: (keyId: string) => void;
  reset: () => void;
}

export const createTrackActions = (editPage: PageEditor, target: TrackTarget): TrackActions => {
  const { layerId, group } = target;
  return {
    moveKey: (keyId, timeMs, recordHistory) =>
      editPage((page) => moveTrackKey(page, layerId, group, keyId, timeMs), recordHistory),
    setEasing: (keyId, value) =>
      editPage((page) => setTrackKeyEasing(page, layerId, group, keyId, value.easing, value.bezier), true),
    addKey: (timeMs) => editPage((page) => addTrackKey(page, layerId, group, timeMs, makeTrackKeyId()), true),
    removeKey: (keyId) => editPage((page) => removeTrackKey(page, layerId, group, keyId), true),
    reset: () => editPage((page) => resetTrack(page, layerId, group), true),
  };
};
