import { signal } from "../lib/signal";
import type {
  InstanceKind,
  InstanceRecord,
  LoadedInstance,
} from "../../shared/bridge";

// Renderer-side client for the main-process workspace. Every open document is an
// instance backed by a single `.bitgrain` file; this store is the one place the
// UI talks to that file store. Surfaces serialize their own document payload and
// hand it here as an opaque JSON string.
export const instancesSignal = signal<InstanceRecord[]>([]);

const bridge = () => window.bitgrain;

export const newInstanceId = (): string => crypto.randomUUID();

export const refreshInstances = async (): Promise<void> => {
  try {
    const list = await bridge()?.listInstances();
    if (list) instancesSignal.value = list;
  } catch {
    // backend unavailable, keep the current library
  }
};

export interface WriteInstanceArgs {
  id: string;
  kind: InstanceKind;
  title: string;
  doc: unknown;
  thumbnail?: string | null;
}

export const writeInstance = async (
  args: WriteInstanceArgs,
): Promise<InstanceRecord | null> => {
  try {
    const record = await bridge()?.writeInstance({
      id: args.id,
      kind: args.kind,
      title: args.title,
      doc: JSON.stringify(args.doc),
      thumbnail: args.thumbnail,
    });
    if (record) {
      instancesSignal.value = [
        record,
        ...instancesSignal.value.filter((r) => r.id !== record.id),
      ];
    }
    return record ?? null;
  } catch {
    return null;
  }
};

export const readInstance = async <T = unknown>(
  id: string,
): Promise<{ record: InstanceRecord; doc: T } | null> => {
  try {
    const loaded: LoadedInstance | null | undefined = await bridge()?.readInstance(id);
    if (!loaded) return null;
    return { record: loaded.record, doc: JSON.parse(loaded.doc) as T };
  } catch {
    return null;
  }
};

export const deleteInstance = async (id: string): Promise<void> => {
  try {
    await bridge()?.deleteInstance(id);
  } catch {
    // ignore, the record simply stays until the next refresh
  }
  instancesSignal.value = instancesSignal.value.filter((r) => r.id !== id);
};

export const exportInstance = async (
  id: string,
  suggestedName: string,
): Promise<string | null> => {
  try {
    return (await bridge()?.exportInstance(id, suggestedName)) ?? null;
  } catch {
    return null;
  }
};
