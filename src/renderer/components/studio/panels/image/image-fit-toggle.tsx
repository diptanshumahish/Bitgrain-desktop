import React from "react";
import type { UploadLayer } from "../../../../data/studioTypes";
import { BtnGroup } from "../../ui/panelPrimitives";

type ImageFit = UploadLayer["fit"];

interface ImageFitToggleProps {
  value: ImageFit;
  onChange: (fit: ImageFit) => void;
}

const FIT_OPTIONS: { value: ImageFit; label: string; title: string }[] = [
  { value: "cover", label: "Fill", title: "Fill the box, edges may be cropped" },
  { value: "contain", label: "Fit", title: "Show the whole image inside the box" },
  { value: "fill", label: "Stretch", title: "Stretch the image to the box" },
];

export const ImageFitToggle: React.FC<ImageFitToggleProps> = ({ value, onChange }) => (
  <BtnGroup options={FIT_OPTIONS} value={value} onChange={(fit) => onChange(fit as ImageFit)} />
);
