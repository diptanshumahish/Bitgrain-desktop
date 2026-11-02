import { stripMetadata } from "../strip/strip-metadata";
import { putCleanEntry, type CleanEntry } from "./cleaner-store";

const workingEntry = (file: File): CleanEntry => ({
  id: crypto.randomUUID(),
  name: file.name,
  status: "working",
  found: [],
  rebuilt: false,
  blob: null,
  error: null,
});

const cleanOne = async (file: File): Promise<void> => {
  const entry = workingEntry(file);
  putCleanEntry(entry);
  try {
    const cleaned = await stripMetadata(file);
    putCleanEntry({ ...entry, status: "done", found: cleaned.found, rebuilt: cleaned.rebuilt, blob: cleaned.blob });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read this image";
    putCleanEntry({ ...entry, status: "failed", error: message });
  }
};

export const cleanFiles = async (files: File[]): Promise<void> => {
  await Promise.all(files.map(cleanOne));
};
