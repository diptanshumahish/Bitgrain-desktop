import { signal } from "../../../../lib/signal";
import { projectRevisionSignal } from "../../store/project-store";
import { assetEpochSignal } from "./asset-epoch";

// A frame cache for the preview, the thing that makes an effect-heavy timeline
// play back smoothly instead of crawling.
//
// Every composed frame is kept as an ImageBitmap keyed by (project revision,
// frame index). Playing over a stretch a second time, or scrubbing back and
// forth across a cut, then costs one `drawImage` instead of a full decode →
// worker → composite round trip. The revision in the key means a single counter
// bump invalidates everything an edit could have changed, with no walking.

// Roughly 1.5 GB of decoded frames. Desktop-sized on purpose: a 1080p frame is
// ~8 MB, so this holds ~190 of them, about 6 seconds of 30fps at full quality
// and a lot more once the auto quality controller steps down.
const DEFAULT_BUDGET_BYTES = 1_536 * 1024 * 1024;
const STATS_PUBLISH_MS = 150;

interface CacheEntry {
  bitmap: ImageBitmap;
  bytes: number;
}

export interface CacheStats {
  frames: number;
  bytes: number;
  budgetBytes: number;
  hits: number;
  misses: number;
}

export const cacheStatsSignal = signal<CacheStats>({
  frames: 0,
  bytes: 0,
  budgetBytes: DEFAULT_BUDGET_BYTES,
  hits: 0,
  misses: 0,
});

// Bumped whenever the set of cached frames changes, so the timeline's cache bar
// can re-derive its ranges without diffing anything.
export const cachedFramesVersionSignal = signal(0);

class RenderCache {
  // Insertion order is the LRU order: `get` re-inserts on hit, so the oldest
  // untouched entry is always first.
  private entries = new Map<string, CacheEntry>();
  private bytes = 0;
  private stateKey = "";
  private hits = 0;
  private misses = 0;
  private statsTimer: ReturnType<typeof setTimeout> | null = null;
  private budget = DEFAULT_BUDGET_BYTES;

  private key(frame: number): string {
    return `${this.stateKey}:${frame}`;
  }

  // Switching state key drops the whole cache: any frame in it was composed from
  // a project state that no longer exists.
  setStateKey(key: string): void {
    if (key === this.stateKey) return;
    this.stateKey = key;
    this.clear();
  }

  get(frame: number): ImageBitmap | null {
    const key = this.key(frame);
    const entry = this.entries.get(key);
    if (!entry) {
      this.misses++;
      this.scheduleStats();
      return null;
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    this.hits++;
    this.scheduleStats();
    return entry.bitmap;
  }

  has(frame: number): boolean {
    return this.entries.has(this.key(frame));
  }

  put(frame: number, bitmap: ImageBitmap): void {
    const key = this.key(frame);
    const existing = this.entries.get(key);
    if (existing) {
      existing.bitmap.close();
      this.bytes -= existing.bytes;
      this.entries.delete(key);
    }
    const bytes = bitmap.width * bitmap.height * 4;
    // A single frame larger than the whole budget would evict everything and
    // then itself; refuse it rather than thrash.
    if (bytes > this.budget) {
      bitmap.close();
      return;
    }
    this.entries.set(key, { bitmap, bytes });
    this.bytes += bytes;
    this.evictToBudget();
    this.scheduleStats();
    cachedFramesVersionSignal.value++;
  }

  private evictToBudget(): void {
    while (this.bytes > this.budget && this.entries.size > 1) {
      const oldest = this.entries.keys().next();
      if (oldest.done) break;
      const entry = this.entries.get(oldest.value);
      if (entry) {
        entry.bitmap.close();
        this.bytes -= entry.bytes;
      }
      this.entries.delete(oldest.value);
    }
  }

  // Frame indices currently cached for the live state, ascending. The cache bar
  // turns these into contiguous ranges.
  cachedFrames(): number[] {
    const prefix = `${this.stateKey}:`;
    const frames: number[] = [];
    for (const key of this.entries.keys()) {
      if (!key.startsWith(prefix)) continue;
      frames.push(Number(key.slice(prefix.length)));
    }
    frames.sort((a, b) => a - b);
    return frames;
  }

  clear(): void {
    for (const entry of this.entries.values()) entry.bitmap.close();
    this.entries.clear();
    this.bytes = 0;
    this.publishStats();
    cachedFramesVersionSignal.value++;
  }

  private scheduleStats(): void {
    if (this.statsTimer !== null) return;
    this.statsTimer = setTimeout(() => {
      this.statsTimer = null;
      this.publishStats();
    }, STATS_PUBLISH_MS);
  }

  private publishStats(): void {
    cacheStatsSignal.value = {
      frames: this.entries.size,
      bytes: this.bytes,
      budgetBytes: this.budget,
      hits: this.hits,
      misses: this.misses,
    };
  }
}

export const renderCache = new RenderCache();

// Everything that can change what a composed frame looks like, in one key: the
// edit state of the project, and which assets have finished loading. Live
// preview and the background pre-renderer both key on this, which is what lets
// them share cached frames.
export function currentStateKey(): string {
  return `${projectRevisionSignal.value}.${assetEpochSignal.value}`;
}

export function frameIndexFor(time: number, fps: number): number {
  return Math.max(0, Math.round(time * fps));
}
