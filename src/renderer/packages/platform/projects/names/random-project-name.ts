import { PROJECT_NAME_ADJECTIVES, PROJECT_NAME_NOUNS } from "./project-name-words";

const pickRandom = (words: readonly string[]): string =>
  words[Math.floor(Math.random() * words.length)];

export function randomProjectName(): string {
  return `${pickRandom(PROJECT_NAME_ADJECTIVES)} ${pickRandom(PROJECT_NAME_NOUNS)}`;
}
