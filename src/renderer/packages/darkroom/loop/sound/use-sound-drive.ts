import { useSignalValue } from "@bitgrain/core/signal";
import { lutIdSignal, modesSignal } from "../../state/transform-store";
import { soundSettingsSignal, type SoundDrive } from "./sound-settings";
import { availableSoundDrives, resolveSoundDrive } from "./engine/sound-drives";

interface SoundDriveState {
  drives: SoundDrive[];
  drive: SoundDrive;
}

export const useSoundDrive = (): SoundDriveState => {
  const modes = useSignalValue(modesSignal);
  const lutId = useSignalValue(lutIdSignal);
  const preferred = useSignalValue(soundSettingsSignal).drive;
  const drives = availableSoundDrives(modes, lutId);
  return { drives, drive: resolveSoundDrive(preferred, drives) };
};
