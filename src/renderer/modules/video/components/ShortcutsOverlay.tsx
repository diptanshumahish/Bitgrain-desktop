import React from "react";
import { X } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { shortcutsOpenSignal } from "../store/shortcuts-store";

interface Shortcut {
  keys: string[];
  description: string;
}

const PLAYBACK: Shortcut[] = [
  { keys: ["Space"], description: "Play / pause" },
  { keys: ["J"], description: "Shuttle back (press again to speed up)" },
  { keys: ["K"], description: "Stop" },
  { keys: ["L"], description: "Shuttle forward (press again to speed up)" },
  { keys: ["⇧", "L"], description: "Toggle loop" },
  { keys: ["←"], description: "Previous frame" },
  { keys: ["→"], description: "Next frame" },
  { keys: [","], description: "Step back one frame" },
  { keys: ["."], description: "Step forward one frame" },
  { keys: ["Home"], description: "Go to start" },
  { keys: ["End"], description: "Go to end" },
  { keys: ["Shift", "←"], description: "Back 1 second" },
  { keys: ["Shift", "→"], description: "Forward 1 second" },
  { keys: ["↑"], description: "Previous edit point" },
  { keys: ["↓"], description: "Next edit point" },
  { keys: ["Home"], description: "Go to start" },
  { keys: ["End"], description: "Go to end" },
  { keys: ["F"], description: "Toggle fullscreen" },
];

const TOOLS: Shortcut[] = [
  { keys: ["V"], description: "Select tool" },
  { keys: ["C"], description: "Razor: click a clip to cut it" },
  { keys: ["R"], description: "Ripple: trim and pull the track along" },
  { keys: ["N"], description: "Roll: drag a cut between two clips" },
  { keys: ["Y"], description: "Slip: move the media inside a clip" },
  { keys: ["U"], description: "Slide: move a clip, neighbours absorb it" },
  { keys: ["⌘", "K"], description: "Command palette" },
  { keys: ["`"], description: "Toggle the preview instrument panel" },
];

const WORKSPACE: Shortcut[] = [
  { keys: ["⌥", "1"], description: "Edit layout" },
  { keys: ["⌥", "2"], description: "Trim layout (tall timeline)" },
  { keys: ["⌥", "3"], description: "Colour layout (big picture)" },
  { keys: ["⌥", "4"], description: "Review layout (preview only)" },
  { keys: ["⌥", "["], description: "Show / hide media browser" },
  { keys: ["⌥", "]"], description: "Show / hide inspector" },
  { keys: ["⌥", "\\"], description: "Collapse / expand timeline" },
];

const EDIT: Shortcut[] = [
  { keys: ["B"], description: "Split clip at playhead" },
  { keys: ["Q"], description: "Ripple trim head to playhead" },
  { keys: ["W"], description: "Ripple trim tail to playhead" },
  { keys: ["G"], description: "Close the gap before the clip" },
  { keys: ["⌘", "T"], description: "Cross dissolve on the nearest cut" },
  { keys: ["⌘", "D"], description: "Duplicate clip" },
  { keys: ["⌘", "C"], description: "Copy clip" },
  { keys: ["⌘", "X"], description: "Cut clip" },
  { keys: ["⌘", "V"], description: "Paste at playhead" },
  { keys: ["⌫"], description: "Delete clip" },
  { keys: ["⇧", "⌫"], description: "Ripple delete (close gap)" },
  { keys: ["⌘", "Z"], description: "Undo" },
  { keys: ["⌘", "⇧", "Z"], description: "Redo" },
];

const TIMELINE: Shortcut[] = [
  { keys: ["⌘", "Scroll"], description: "Zoom timeline" },
  { keys: ["S"], description: "Toggle snapping" },
  { keys: ["⇧", "Click"], description: "Add clip to selection" },
  { keys: ["Drag"], description: "Box select clips" },
  { keys: ["⇧", "Drag edge"], description: "Ripple trim tail" },
  { keys: ["M"], description: "Add / remove marker" },
  { keys: ["⇧", "M"], description: "Clear all markers" },
  { keys: ["I"], description: "Set range in" },
  { keys: ["O"], description: "Set range out" },
  { keys: ["Esc"], description: "Deselect, or back to projects" },
  { keys: ["?"], description: "Toggle this overlay" },
];

const Section: React.FC<{ title: string; items: Shortcut[] }> = ({
  title,
  items,
}) => (
  <div>
    <p className="text-[9px]   text-zinc-500     mb-2">{title}</p>
    <ul className="space-y-1.5">
      {items.map((s) => (
        <li
          key={s.description}
          className="flex items-center justify-between gap-3 text-[11px]"
        >
          <span className="text-zinc-300">{s.description}</span>
          <span className="flex items-center gap-1 shrink-0">
            {s.keys.map((k, i) => (
              <kbd
                key={`${s.description}-${i}`}
                className="px-1.5 py-0.5 rounded border border-white/15 bg-black/40 text-[9px]   text-zinc-200 min-w-[18px] text-center"
              >
                {k}
              </kbd>
            ))}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export const ShortcutsOverlay: React.FC = () => {
  const open = useSignalValue(shortcutsOpenSignal);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => (shortcutsOpenSignal.value = false)}
    >
      <div
        className="w-[680px] max-w-[92vw] max-h-[86vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[9px]   text-zinc-500    ">Keyboard</p>
            <h3 className="text-[14px] font-medium text-white">Shortcuts</h3>
          </div>
          <button
            onClick={() => (shortcutsOpenSignal.value = false)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <Section title="Playback" items={PLAYBACK} />
          <Section title="Tools" items={TOOLS} />
          <Section title="Edit" items={EDIT} />
          <Section title="Timeline" items={TIMELINE} />
          <Section title="Workspace" items={WORKSPACE} />
        </div>
      </div>
    </div>
  );
};
