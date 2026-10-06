import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { commandPaletteOpenSignal, closeCommandPalette } from "../store/command-store";
import { useVideoCommands, type VideoCommand } from "../hooks/useVideoCommands";

// Subsequence match, the behaviour every command palette has: "rtt" finds
// "Ripple trim tail". Returns null when the query does not match at all, and a
// score otherwise, lower being a tighter match.
function fuzzyScore(haystack: string, needle: string): number | null {
  if (needle.length === 0) return 0;
  const hay = haystack.toLowerCase();
  const query = needle.toLowerCase();
  let score = 0;
  let from = 0;
  let previous = -1;
  for (const char of query) {
    const at = hay.indexOf(char, from);
    if (at < 0) return null;
    // Gaps cost, and a run of adjacent characters costs nothing, so contiguous
    // matches sort above scattered ones.
    if (previous >= 0) score += at - previous - 1;
    previous = at;
    from = at + 1;
  }
  return score + hay.length * 0.01;
}

export const CommandPalette: React.FC = () => {
  const open = useSignalValue(commandPaletteOpenSignal);
  const commands = useVideoCommands();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(0);
    // The input mounts with the dialog, so focus on the next frame.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const results = useMemo(() => {
    const scored: { command: VideoCommand; score: number }[] = [];
    for (const command of commands) {
      if (command.enabled === false) continue;
      const score = fuzzyScore(`${command.group} ${command.label}`, query);
      if (score === null) continue;
      scored.push({ command, score });
    }
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 40).map((entry) => entry.command);
  }, [commands, query]);

  if (!open) return null;

  const run = (command: VideoCommand) => {
    closeCommandPalette();
    command.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeCommandPalette();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const command = results[cursor];
      if (command) run(command);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[14vh]"
      onClick={closeCommandPalette}
    >
      <div
        className="w-[560px] max-w-[92vw] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3.5">
          <Search size={13} className="text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search commands…"
            className="h-11 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-600"
            aria-label="Search commands"
          />
          <kbd className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[9px] text-zinc-400">
            esc
          </kbd>
        </div>

        <ul className="max-h-[52vh] overflow-y-auto py-1.5">
          {results.length === 0 && (
            <li className="px-3.5 py-6 text-center text-[11px] text-zinc-500">
              No matching command
            </li>
          )}
          {results.map((command, index) => (
            <li key={command.id}>
              <button
                onMouseEnter={() => setCursor(index)}
                onClick={() => run(command)}
                className={`flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-[12px] transition-colors ${
                  index === cursor ? "bg-white/10 text-white" : "text-zinc-300"
                }`}
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="shrink-0 text-[9px] uppercase tracking-wide text-zinc-500">
                    {command.group}
                  </span>
                  <span className="truncate">{command.label}</span>
                </span>
                {command.shortcut && (
                  <span className="shrink-0 text-[9px] text-zinc-500">
                    {command.shortcut}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
