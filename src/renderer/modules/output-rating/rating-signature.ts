const HASH_SEED = 5381;
const HASH_SHIFT = 5;
const HASH_RADIX = 36;

export function hashSignature(input: string): string {
  let hash = HASH_SEED;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << HASH_SHIFT) + hash + input.charCodeAt(index)) | 0;
  }
  return (hash >>> 0).toString(HASH_RADIX);
}
