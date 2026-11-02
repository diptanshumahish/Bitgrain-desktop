import { SHOWCASE_IMAGES } from "../../../../../landing/marketing/marketing-images";
import { POSTER_PHOTO } from "./poster-template";

export const PHOTO_FILE_NAME = "red-sun.jpg";

interface PhotoOption {
  id: string;
  src: string;
  isTarget: boolean;
}

export const PHOTO_OPTIONS: PhotoOption[] = [
  { id: "kites", src: SHOWCASE_IMAGES.kites.small, isTarget: false },
  { id: "red-sun", src: POSTER_PHOTO, isTarget: true },
  { id: "city", src: SHOWCASE_IMAGES.city.small, isTarget: false },
];
