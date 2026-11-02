interface PathCommand {
  letter: string;
  args: number[];
}

const COMMAND_PATTERN = /[MmZzLlHhVvCcSsQqTtAa]/;
const NUMBER_PATTERN = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/;
const SEPARATOR_PATTERN = /[\s,]/;
const ARC_LETTERS = "Aa";
const ARC_ARG_COUNT = 7;
const ARC_LARGE_FLAG_INDEX = 3;
const ARC_SWEEP_FLAG_INDEX = 4;

const isFlagSlot = (letter: string, argIndex: number): boolean => {
  if (!ARC_LETTERS.includes(letter)) return false;
  const slot = argIndex % ARC_ARG_COUNT;
  return slot === ARC_LARGE_FLAG_INDEX || slot === ARC_SWEEP_FLAG_INDEX;
};

interface ScanState {
  source: string;
  index: number;
}

const skipSeparators = (state: ScanState): void => {
  while (state.index < state.source.length && SEPARATOR_PATTERN.test(state.source[state.index])) state.index += 1;
};

const readNumber = (state: ScanState, flag: boolean): number | null => {
  const rest = state.source.slice(state.index);
  if (flag && (rest[0] === "0" || rest[0] === "1")) {
    state.index += 1;
    return Number(rest[0]);
  }
  const match = NUMBER_PATTERN.exec(rest);
  if (!match) return null;
  state.index += match[0].length;
  return Number(match[0]);
};

export const tokenizePath = (source: string): PathCommand[] => {
  const state: ScanState = { source, index: 0 };
  const commands: PathCommand[] = [];
  let current: PathCommand | null = null;
  while (state.index < source.length) {
    skipSeparators(state);
    if (state.index >= source.length) break;
    const char = source[state.index];
    if (COMMAND_PATTERN.test(char)) {
      current = { letter: char, args: [] };
      commands.push(current);
      state.index += 1;
      continue;
    }
    if (!current) break;
    const value = readNumber(state, isFlagSlot(current.letter, current.args.length));
    if (value === null) break;
    current.args.push(value);
  }
  return commands;
};
