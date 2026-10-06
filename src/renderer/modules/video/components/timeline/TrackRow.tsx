import React, { useState } from "react";
import type { Track, AudioClip, VideoClip, ImageClip, MediaAsset } from "../../types";
import { ClipBlock } from "./ClipBlock";
import { TransitionLayer } from "./TransitionLayer";
import { Waveform } from "./Waveform";
import { MEDIA_ASSET_DRAG_TYPE } from "../../utils/drag-types";
import { currentProjectSignal, updateProject } from "../../store/project-store";
import { pxToTime, timeToPx } from "./timeline-math";
import { TRACK_HEIGHT } from "../../constants";
import type { TrackKind } from "../../types";

// Empty-lane tints echo each track's clip colour but stay soft and balanced so
// the stacked lanes read as one cohesive set (warm hues run lighter/lower to
// avoid muddy tones over the dark canvas).
const KIND_BG: Record<TrackKind, string> = {
  video: "bg-violet-400/12",
  image: "bg-blue-400/10",
  audio: "bg-teal-400/10",
  effect: "bg-amber-300/8",
  text: "bg-rose-400/10",
  tracking: "bg-sky-400/10",
};
import { newId } from "../../utils/id";
import { importMediaFiles } from "../../utils/import-media";

interface TrackRowProps {
  track: Track;
  pxPerSecond: number;
}

function clipLabel(clip: Track["clips"][number]): string {
  if ("text" in clip) return clip.text;
  if ("nodeCount" in clip) return "Tracking";
  if ("assetId" in clip) {
    const project = currentProjectSignal.value;
    const asset = project?.mediaPool.find((a) => a.id === clip.assetId);
    return asset?.name ?? clip.id.slice(0, 6);
  }
  if ("effects" in clip && clip.effects.length > 0) {
    return clip.effects.map((e) => e.mode).join(" + ");
  }
  return clip.id.slice(0, 6);
}

function acceptsAssetKind(track: Track, assetKind: string): boolean {
  if (track.kind === "video") return assetKind === "video" || assetKind === "image";
  if (track.kind === "audio") return assetKind === "audio";
  if (track.kind === "image") return assetKind === "image";
  return false;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, pxPerSecond }) => {
  const [dropHover, setDropHover] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (track.locked) return;
    const hasAsset = e.dataTransfer.types.includes(MEDIA_ASSET_DRAG_TYPE);
    const hasFiles = e.dataTransfer.types.includes("Files");
    if (!hasAsset && !hasFiles) return;
    e.preventDefault();
    setDropHover(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    setDropHover(false);
    const project = currentProjectSignal.value;
    if (!project || track.locked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const time = pxToTime(e.clientX - rect.left, pxPerSecond);

    let asset: MediaAsset | undefined;
    const assetId = e.dataTransfer.getData(MEDIA_ASSET_DRAG_TYPE);
    if (assetId) {
      asset = project.mediaPool.find((a) => a.id === assetId);
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      const newAssets = await importMediaFiles(e.dataTransfer.files);
      const compatible = newAssets.find((a) => acceptsAssetKind(track, a.kind));
      if (compatible) asset = compatible;
      updateProject((p) => ({
        ...p,
        mediaPool: [...p.mediaPool, ...newAssets],
      }));
    }
    if (!asset) return;
    if (!acceptsAssetKind(track, asset.kind)) return;
    e.preventDefault();

    const assetSnap = asset;
    updateProject((p) => {
      const tracks = p.tracks.map((t) => {
        if (t.id !== track.id) return t;
        if (t.kind === "video" && (assetSnap.kind === "video" || assetSnap.kind === "image")) {
          const duration =
            assetSnap.kind === "video" ? Math.max(assetSnap.duration, 1 / p.fps) : Math.max(assetSnap.duration || 5, 1 / p.fps);
          return {
            ...t,
            clips: [
              ...t.clips,
              {
                id: newId(),
                assetId: assetSnap.id,
                trackStart: time,
                inPoint: 0,
                duration,
                effects: [],
                transform: { x: 0, y: 0, scale: 1, rotation: 0 },
                opacity: 1,
                audioDetached: false,
              },
            ],
          };
        }
        if (t.kind === "audio" && assetSnap.kind === "audio") {
          return {
            ...t,
            clips: [
              ...t.clips,
              {
                id: newId(),
                assetId: assetSnap.id,
                trackStart: time,
                inPoint: 0,
                duration: Math.max(assetSnap.duration, 0.1),
                volume: 1,
                fadeIn: 0,
                fadeOut: 0,
              },
            ],
          };
        }
        if (t.kind === "image" && assetSnap.kind === "image") {
          const imageClip: ImageClip = {
            id: newId(),
            assetId: assetSnap.id,
            trackStart: time,
            duration: Math.max(assetSnap.duration || 5, 1 / p.fps),
            position: { x: 0.5, y: 0.5 },
            scale: 1,
            rotation: 0,
            opacity: 1,
            filters: {},
            fadeIn: 0,
            fadeOut: 0,
          };
          return { ...t, clips: [...t.clips, imageClip] };
        }
        return t;
      });
      const duration = tracks.reduce((max, t) => {
        for (const c of t.clips) {
          const end = c.trackStart + c.duration;
          if (end > max) max = end;
        }
        return max;
      }, 0);
      return { ...p, tracks, duration };
    });
  };

  return (
    <div
      className={`group/track relative shrink-0 border-b border-[var(--s-border)] ${
        dropHover ? "bg-[var(--s-accent-soft)]" : KIND_BG[track.kind]
      }`}
      style={{ height: track.height }}
      data-track-id={track.id}
      data-track-kind={track.kind}
      onDragOver={handleDragOver}
      onDragLeave={() => setDropHover(false)}
      onDrop={handleDrop}
    >
      {track.clips.map((clip) => {
        const decoration =
          track.kind === "audio" || track.kind === "video" ? (
            <ClipWaveform
              assetId={(clip as AudioClip | VideoClip).assetId}
              inPoint={(clip as AudioClip | VideoClip).inPoint}
              duration={clip.duration}
              pxPerSecond={pxPerSecond}
              height={track.height ?? TRACK_HEIGHT}
            />
          ) : undefined;
        return (
          <ClipBlock
            key={clip.id}
            clip={clip}
            trackId={track.id}
            trackKind={track.kind}
            pxPerSecond={pxPerSecond}
            label={clipLabel(clip)}
            locked={track.locked}
            decoration={decoration}
          />
        );
      })}
      {track.kind === "video" && (
        <TransitionLayer track={track} pxPerSecond={pxPerSecond} />
      )}
    </div>
  );
};

interface ClipWaveformProps {
  assetId: string;
  inPoint: number;
  duration: number;
  pxPerSecond: number;
  height: number;
}

const ClipWaveform: React.FC<ClipWaveformProps> = ({
  assetId,
  inPoint,
  duration,
  pxPerSecond,
  height,
}) => {
  const project = currentProjectSignal.value;
  const asset = project?.mediaPool.find((a) => a.id === assetId);
  if (!asset?.waveformPeaks?.length) return null;
  const w = Math.max(2, timeToPx(duration, pxPerSecond));
  return (
    <Waveform
      peaks={asset.waveformPeaks}
      inPoint={inPoint}
      duration={duration}
      assetDuration={asset.duration}
      width={w}
      height={Math.max(8, height - 18)}
    />
  );
};
