import { Trash2 } from "lucide-react";
import type { TrackKey } from "@bitgrain/studio-core/model/animation-types";
import { closeEasingEditor, openEasingEditor } from "../easing/open-easing-editor";
import type { TrackActions } from "./track-actions";
import { formatSeconds } from "./lane-time";

interface KeyEditorOptions {
  anchor: HTMLElement;
  trackKey: TrackKey;
  trackLabel: string;
  removable: boolean;
  actions: TrackActions;
}

export const openKeyEditor = ({ anchor, trackKey, trackLabel, removable, actions }: KeyEditorOptions): void => {
  const removeKey = (): void => {
    actions.removeKey(trackKey.id);
    closeEasingEditor();
  };
  openEasingEditor(anchor, {
    title: `${trackLabel} at ${formatSeconds(trackKey.timeMs)}`,
    initial: { easing: trackKey.easing, bezier: trackKey.bezier },
    onCommit: (value) => actions.setEasing(trackKey.id, value),
    footer: (
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--s-border)]">
        <span className="text-[12px] text-[var(--s-text-subtle)]">Easing runs into this key</span>
        <button
          type="button"
          disabled={!removable}
          onClick={removeKey}
          className="flex items-center gap-1 h-6 px-1.5 rounded-md text-[12px] text-[var(--s-text-muted)] hover:text-red-500 hover:bg-[var(--s-bg-input)] disabled:opacity-40 disabled:pointer-events-none"
        >
          <Trash2 size={11} strokeWidth={1.75} /> Remove key
        </button>
      </div>
    ),
  });
};
