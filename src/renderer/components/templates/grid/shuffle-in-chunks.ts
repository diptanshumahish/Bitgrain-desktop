
const SHUFFLE_CHUNK_SIZE = 24;
const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;
const SESSION_SEED = Math.floor(Math.random() * FNV_OFFSET);

const seededHash = (id: string): number => {
  let hash = FNV_OFFSET ^ SESSION_SEED;
  for (let index = 0; index < id.length; index++) {
    hash = Math.imul(hash ^ id.charCodeAt(index), FNV_PRIME);
  }
  return hash >>> 0;
};

const shuffleChunk = <T extends { id: string }>(chunk: T[]): T[] =>
  [...chunk].sort((first, second) => seededHash(first.id) - seededHash(second.id));

export const shuffleInChunks = <T extends { id: string }>(templates: T[]): T[] => {
  const shuffled: T[] = [];
  for (let start = 0; start < templates.length; start += SHUFFLE_CHUNK_SIZE) {
    shuffled.push(...shuffleChunk(templates.slice(start, start + SHUFFLE_CHUNK_SIZE)));
  }
  return shuffled;
};
