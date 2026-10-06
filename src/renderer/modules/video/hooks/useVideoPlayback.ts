import { useEffect } from "react";
import {
  isPlayingSignal,
  loopEnabledSignal,
  playbackRateSignal,
  setPlaying,
} from "../store/playback-store";
import { currentTimeSignal, setCurrentTime } from "../store/timeline-store";
import { currentProjectSignal } from "../store/project-store";
import { projectRangeIn, projectRangeOut } from "../store/markers-store";
import { droppedFrameCountSignal } from "../store/preview-perf-store";

// The transport clock.
//
// The web build advanced time by the raw wall-clock delta each rAF, so the
// playhead sat between frames and every readout showed a time no frame exists
// at. Here time is quantised to the project's frame grid: the clock accumulates
// real elapsed time and the playhead lands on frame boundaries, which is what
// makes stepping, marker snapping and split-at-playhead land where they say.
//
// A gap longer than one frame means frames the preview never had a chance to
// show; those are counted rather than silently smeared, so the perf HUD can be
// honest about whether playback is real time.

// Beyond this the tab was almost certainly suspended (backgrounded, machine
// asleep). Advancing by the true delta would teleport the playhead, so the gap is
// clamped and not counted as dropped frames.
const MAX_CATCHUP_SECONDS = 0.5;

export function useVideoPlayback(): void {
  useEffect(() => {
    let raf = 0;
    let lastWallClock = 0;
    // Time owed but not yet worth a whole frame, carried across ticks so a 30fps
    // project on a 60Hz display does not drift.
    let carry = 0;

    const tick = (now: number) => {
      if (!isPlayingSignal.value) return;
      const project = currentProjectSignal.value;
      if (!project) return;

      const fps = project.fps || 30;
      const frameDuration = 1 / fps;
      const rate = playbackRateSignal.value;

      if (lastWallClock === 0) {
        lastWallClock = now;
        raf = requestAnimationFrame(tick);
        return;
      }

      const rawDelta = (now - lastWallClock) / 1000;
      lastWallClock = now;
      const delta = Math.min(rawDelta, MAX_CATCHUP_SECONDS) * rate;

      carry += delta;
      const wholeFrames = Math.floor(Math.abs(carry) / frameDuration);
      if (wholeFrames === 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const direction = carry < 0 ? -1 : 1;
      carry -= direction * wholeFrames * frameDuration;

      // More than one frame of real time per tick means the preview could not
      // keep up with the clock.
      if (wholeFrames > 1) {
        droppedFrameCountSignal.value += wholeFrames - 1;
      }

      const currentFrame = Math.round(currentTimeSignal.value * fps);
      const nextFrame = currentFrame + direction * wholeFrames;
      let next = nextFrame / fps;

      // Play bounds: an in/out range if one is set, otherwise the whole project.
      const rangeIn = projectRangeIn(currentProjectSignal.value);
      const rangeOut = projectRangeOut(currentProjectSignal.value);
      const start = rangeIn ?? 0;
      const end = rangeOut ?? Math.max(project.duration, 0);

      if (end > start && next >= end) {
        if (loopEnabledSignal.value) {
          setCurrentTime(start);
          carry = 0;
          raf = requestAnimationFrame(tick);
          return;
        }
        setCurrentTime(end);
        setPlaying(false);
        return;
      }
      if (next < start) {
        if (!loopEnabledSignal.value) {
          setCurrentTime(start);
          setPlaying(false);
          return;
        }
        next = end;
      }

      setCurrentTime(next);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf !== 0) return;
      lastWallClock = 0;
      carry = 0;
      droppedFrameCountSignal.value = 0;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = 0;
      lastWallClock = 0;
      carry = 0;
    };

    const unsubscribe = isPlayingSignal.subscribe(() => {
      if (isPlayingSignal.value) start();
      else stop();
    });

    if (isPlayingSignal.value) start();

    return () => {
      stop();
      unsubscribe();
    };
  }, []);
}
