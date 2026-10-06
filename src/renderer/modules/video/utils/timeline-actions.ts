import { importMediaFiles } from "./import-media";
import { addAssetToTimeline } from "./add-clip-to-timeline";
import { currentProjectSignal, updateProject, selectedClipIdSignal } from "../store/project-store";
import { currentTimeSignal } from "../store/timeline-store";
import { TRACK_HEIGHT } from "../constants";
import { newId } from "./id";
import { MODE_DEFAULTS } from "../components/panels/effects/mode-options";
import type {
  TrackKind,
  Track,
  EffectApplication,
  EffectClip,
  TransformMode,
} from "../types";

function buildEffect(mode: TransformMode): EffectApplication {
  return {
    id: newId(),
    mode,
    params: { brightness: 1, contrast: 1, saturation: 1, ...(MODE_DEFAULTS[mode] ?? {}) },
  };
}

export function addNewTrack(kind: TrackKind): void {
  updateProject((p) => {
    const newTrack: Track = {
      id: newId(),
      kind,
      name: `${kind.toUpperCase()} ${p.tracks.filter((t) => t.kind === kind).length + 1}`,
      locked: false,
      muted: false,
      visible: true,
      height: TRACK_HEIGHT,
      clips: [] as never[],
    };
    return { ...p, tracks: [...p.tracks, newTrack] };
  });
}

export function addEffectClipAtPlayhead(mode: TransformMode): void {
  updateProject((project) => {
    // Find the first visible/unlocked FX track
    const fxTrackIdx = project.tracks.findIndex(
      (t) => t.kind === "effect" && !t.locked && t.visible
    );
    
    if (fxTrackIdx < 0) {
      // If no FX track, maybe create one? 
      // For now, let's just return if none found (user should add one)
      return project;
    }

    const tracks = [...project.tracks];
    const track = { ...tracks[fxTrackIdx] };
    tracks[fxTrackIdx] = track;

    const at = currentTimeSignal.value;
    const clip: EffectClip = {
      kind: "effect",
      id: newId(),
      trackStart: at,
      duration: 5,
      effects: [buildEffect(mode)],
    };

    if (track.kind !== "effect") return project;
    track.clips = [...track.clips, clip];
    selectedClipIdSignal.value = clip.id;
    
    return { ...project, tracks };
  });
}

export function addEffectClipToTrack(trackId: string, mode: TransformMode): void {
  updateProject((project) => {
    const tracks = project.tracks.map((t) => {
      if (t.id !== trackId) return t;
      if (t.kind !== "effect") return t;
      const at = currentTimeSignal.value;
      const clip: EffectClip = {
        kind: "effect",
        id: newId(),
        trackStart: at,
        duration: 5,
        effects: [buildEffect(mode)],
      };
      return { ...t, clips: [...t.clips, clip] };
    });

    // Select the newly added clip
    const lastTrack = tracks.find(t => t.id === trackId);
    if (lastTrack && lastTrack.clips.length > 0) {
      selectedClipIdSignal.value = lastTrack.clips[lastTrack.clips.length - 1].id;
    }

    return { ...project, tracks };
  });
}

export function addEffectToClip(clipId: string, mode: TransformMode): void {
  updateProject((project) => {
    const tracks = project.tracks.map((t) => {
      if (t.kind !== "effect") return t;
      if (!t.clips.some((c) => c.id === clipId)) return t;
      return {
        ...t,
        clips: t.clips.map((c) =>
          c.id === clipId
            ? { ...c, effects: [...c.effects, buildEffect(mode)] }
            : c,
        ),
      };
    });
    return { ...project, tracks };
  });
}

export function removeEffectFromClip(clipId: string, effectId: string): void {
  updateProject((project) => {
    let clipEmptied = false;
    const tracks = project.tracks.map((t) => {
      if (t.kind !== "effect") return t;
      if (!t.clips.some((c) => c.id === clipId)) return t;
      const clips = t.clips
        .map((c) => {
          if (c.id !== clipId) return c;
          const effects = c.effects.filter((e) => e.id !== effectId);
          if (effects.length === 0) clipEmptied = true;
          return { ...c, effects };
        })
        .filter((c) => c.effects.length > 0);
      return { ...t, clips };
    });
    if (clipEmptied) selectedClipIdSignal.value = null;
    return { ...project, tracks };
  });
}

export async function importAndAddAtPlayhead(accept = "video/*,audio/*,image/*"): Promise<void> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = true;
  
  return new Promise((resolve) => {
    input.onchange = async () => {
      const files = input.files;
      if (!files || files.length === 0) {
        resolve();
        return;
      }
      
      const assets = await importMediaFiles(files);
      if (assets.length === 0) {
        resolve();
        return;
      }
      
      // Add to media pool
      updateProject((p) => ({
        ...p,
        mediaPool: [...p.mediaPool, ...assets],
      }));
      
      // Add first asset to timeline (or all of them)
      for (const asset of assets) {
        addAssetToTimeline(asset);
      }
      
      resolve();
    };
    
    input.oncancel = () => resolve();
    input.click();
  });
}

export function removeTrack(trackId: string): void {
  updateProject((p) => {
    const tracks = p.tracks.filter((t) => t.id !== trackId);
    if (tracks.length === p.tracks.length) return p;
    return { ...p, tracks };
  });
}

export function moveTrack(trackId: string, direction: "up" | "down"): void {
  updateProject((p) => {
    const idx = p.tracks.findIndex((t) => t.id === trackId);
    if (idx < 0) return p;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= p.tracks.length) return p;
    const tracks = [...p.tracks];
    [tracks[idx], tracks[swapIdx]] = [tracks[swapIdx], tracks[idx]];
    return { ...p, tracks };
  });
}

export function moveClipToTrack(
  clipId: string,
  targetTrackId: string,
  newStart?: number,
): void {
  updateProject((p) => {
    const sourceTrack = p.tracks.find((t) =>
      t.clips.some((c) => c.id === clipId),
    );
    if (!sourceTrack) return p;
    const targetTrack = p.tracks.find((t) => t.id === targetTrackId);
    if (!targetTrack || targetTrack.kind !== sourceTrack.kind) return p;
    if (sourceTrack.locked || targetTrack.locked) return p;
    const movedClip = sourceTrack.clips.find((c) => c.id === clipId);
    if (!movedClip) return p;
    const finalClip = (
      typeof newStart === "number"
        ? { ...movedClip, trackStart: Math.max(0, newStart) }
        : movedClip
    ) as typeof movedClip;
    const tracks = p.tracks.map((t) => {
      if (t.id === sourceTrack.id) {
        return {
          ...t,
          clips: t.clips.filter((c) => c.id !== clipId),
        } as Track;
      }
      if (t.id === targetTrackId) {
        return {
          ...t,
          clips: [...t.clips, finalClip],
        } as Track;
      }
      return t;
    });
    return { ...p, tracks };
  });
}

export function showProjectInfo(): void {
  const project = currentProjectSignal.value;
  if (!project) return;
  
  const trackCount = project.tracks.length;
  const clipCount = project.tracks.reduce((sum, t) => sum + t.clips.length, 0);
  const assetCount = project.mediaPool.length;
  
  alert(`Project: ${project.name}
Dimensions: ${project.width}x${project.height} @ ${project.fps}fps
Duration: ${project.duration.toFixed(2)}s
Tracks: ${trackCount}
Clips: ${clipCount}
Assets in pool: ${assetCount}`);
}
