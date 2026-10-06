import { app } from "electron";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type {
  InstanceRecord,
  LoadedInstance,
  WriteInstanceInput,
} from "../shared/bridge";

// File-based workspace under the app's user-data dir. Each open document is one
// self-contained `<id>.bitgrain` file (a JSON document with assets embedded as
// data URLs), and a single `index.json` lists the lightweight records the Home
// library reads. One file per instance means a new document never collides with,
// or reopens, an existing one: creating an instance mints a fresh id and a fresh
// file. This is swappable for SQLite later behind the same IPC contract.
const workspaceDir = (): string => join(app.getPath("userData"), "workspace");
const indexPath = (): string => join(workspaceDir(), "index.json");
const instanceFile = (id: string): string =>
  join(workspaceDir(), `${safeId(id)}.bitgrain`);

const safeId = (id: string): string => id.replace(/[^a-zA-Z0-9_-]/g, "");

async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function readIndex(): Promise<InstanceRecord[]> {
  try {
    const raw = await readFile(indexPath(), "utf8");
    const parsed = JSON.parse(raw) as InstanceRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(records: InstanceRecord[]): Promise<void> {
  await ensureDir(workspaceDir());
  await writeFile(indexPath(), JSON.stringify(records, null, 2));
}

export async function listInstances(): Promise<InstanceRecord[]> {
  const records = await readIndex();
  return [...records].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function writeInstance(
  input: WriteInstanceInput,
  now: number,
): Promise<InstanceRecord> {
  const id = safeId(input.id);
  await ensureDir(workspaceDir());
  await writeFile(instanceFile(id), input.doc);

  const records = await readIndex();
  const existing = records.find((record) => record.id === id);
  const record: InstanceRecord = {
    id,
    kind: input.kind,
    title: input.title,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    thumbnail:
      input.thumbnail !== undefined ? input.thumbnail : existing?.thumbnail ?? null,
  };
  await writeIndex([record, ...records.filter((r) => r.id !== id)]);
  return record;
}

export async function readInstance(id: string): Promise<LoadedInstance | null> {
  const safe = safeId(id);
  const records = await readIndex();
  const record = records.find((r) => r.id === safe);
  if (!record) return null;
  try {
    const doc = await readFile(instanceFile(safe), "utf8");
    return { record, doc };
  } catch {
    return null;
  }
}

export async function deleteInstance(id: string): Promise<void> {
  const safe = safeId(id);
  const records = await readIndex();
  await writeIndex(records.filter((r) => r.id !== safe));
  await rm(instanceFile(safe), { force: true });
}

// Reads the raw `.bitgrain` bytes for a Save-As export, or null if the instance
// is gone. The native save dialog itself lives in the IPC layer.
export async function readInstanceBytes(id: string): Promise<Buffer | null> {
  const file = instanceFile(id);
  if (!existsSync(file)) return null;
  return readFile(file);
}
