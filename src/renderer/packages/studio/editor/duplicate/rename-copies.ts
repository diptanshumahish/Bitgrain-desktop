import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { makeDuplicateName } from "./duplicate-name";

export const renameAsCopies = (copies: Layer[], siblings: Layer[]): Layer[] => {
  const takenNames = new Set(siblings.map((layer) => layer.name));
  return copies.map((copy): Layer => {
    const name = makeDuplicateName(copy.name, takenNames);
    takenNames.add(name);
    return { ...copy, name };
  });
};
