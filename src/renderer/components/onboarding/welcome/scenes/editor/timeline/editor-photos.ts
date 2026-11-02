import { ENGINE_SOURCES } from "../../../../../marketing/marketing-images";
import { POSTER_ORIGINAL_PHOTO } from "./poster-template";

export const SWAPPED_PHOTO = ENGINE_SOURCES.redDress;

export interface PhotoOption {
  id: string;
  src: string;
  isTarget: boolean;
}

export const PHOTO_OPTIONS: PhotoOption[] = [
  { id: "hotel", src: ENGINE_SOURCES.hotel, isTarget: false },
  { id: "red-dress", src: SWAPPED_PHOTO, isTarget: true },
  { id: "portrait", src: POSTER_ORIGINAL_PHOTO, isTarget: false },
];
