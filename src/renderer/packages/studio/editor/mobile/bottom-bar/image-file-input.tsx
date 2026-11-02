import React from "react";
import { readPickedImage, type PickedImage } from "./read-picked-image";

interface ImageFileInputProps {
  onPicked: (image: PickedImage) => void;
  label: string;
}

export const ImageFileInput: React.FC<ImageFileInputProps> = ({ onPicked, label }) => {
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const picked = await readPickedImage(file);
    if (picked) onPicked(picked);
  };

  return (
    <input
      type="file"
      accept="image/*"
      aria-label={label}
      className="sr-only"
      onChange={(event) => void handleChange(event)}
    />
  );
};
