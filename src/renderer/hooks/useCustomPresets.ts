import { useState, useEffect } from "react";
import type { Preset, PresetConfig } from "../components/toolbar/popovers/PresetsPopover";
import { callApi } from "../lib/api-client";
import { userSignal } from "./useAuth";
import { useSignalValue } from "../lib/signal";

const STORAGE_KEY = "bitgrain_custom_presets";

interface ServerPreset {
  id: string;
  name: string;
  config: PresetConfig;
}

function loadLocal(): Preset[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Preset[]) : [];
  } catch {
    return [];
  }
}

function persistLocal(presets: Preset[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore quota errors
  }
}

export function useCustomPresets() {
  const [customPresets, setCustomPresets] = useState<Preset[]>(loadLocal);
  const user = useSignalValue(userSignal);

  useEffect(() => {
    if (!user) return;
    callApi<ServerPreset[]>("/api/presets").then((remote) => {
      if (!remote) return;
      const mapped: Preset[] = remote.map((p) => ({ name: p.name, tag: "★", config: p.config }));
      setCustomPresets(mapped);
      persistLocal(mapped);
    });
  }, [user]);

  const savePreset = (name: string, config: PresetConfig) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setCustomPresets((prev) => {
      const filtered = prev.filter((p) => p.name !== trimmed);
      const next = [...filtered, { name: trimmed, tag: "★", config }];
      persistLocal(next);
      return next;
    });

    if (user) {
      callApi("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, config }),
      });
    }
  };

  const deletePreset = (name: string) => {
    setCustomPresets((prev) => {
      const next = prev.filter((p) => p.name !== name);
      persistLocal(next);
      return next;
    });

    if (user) {
      callApi<ServerPreset[]>("/api/presets").then((remote) => {
        const match = remote?.find((p) => p.name === name);
        if (match) {
          callApi(`/api/presets/${match.id}`, { method: "DELETE" });
        }
      });
    }
  };

  return { customPresets, savePreset, deletePreset };
}
