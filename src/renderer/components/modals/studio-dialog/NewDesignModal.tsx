import React, { useRef } from "react";
import { StudioDialogShell } from "./StudioDialogShell";
import {
  DEFAULT_CUSTOM_SIZE,
  DESIGN_FORMATS,
  MAX_CUSTOM_SIDE_PX,
  MIN_CUSTOM_SIDE_PX,
  clampCustomSide,
  type DesignFormat,
  type DesignSize,
} from "./new-design-formats";

interface NewDesignModalProps {
  onCreate: (size: DesignSize) => void;
  onClose: () => void;
}

const previewClass = (format: DesignFormat): string => {
  if (format.width === format.height) return "w-12 h-12";
  return format.width > format.height ? "w-14 h-8" : "w-9 h-12";
};

const FormatCard: React.FC<{ format: DesignFormat; onPick: (format: DesignFormat) => void }> = ({ format, onPick }) => (
  <button
    type="button"
    onClick={() => onPick(format)}
    className="flex flex-col items-start gap-3 rounded-lg border border-[var(--s-border)] p-3 text-left hover:border-[var(--s-border-strong)] hover:bg-[var(--s-bg-input)] transition-colors"
  >
    <span className="flex h-14 w-full items-center justify-center">
      <span className={`${previewClass(format)} rounded-sm border border-[var(--s-text-subtle)] bg-[var(--s-bg-input)]`} />
    </span>
    <span className="flex flex-col gap-0.5">
      <span className="text-[12.5px] font-medium">{format.label}</span>
      <span className="text-[11px] text-[var(--s-text-muted)]">{format.detail}</span>
    </span>
  </button>
);

const SizeInput: React.FC<{ label: string; inputRef: React.RefObject<HTMLInputElement | null>; defaultValue: number }> = ({
  label, inputRef, defaultValue,
}) => (
  <label className="flex flex-col gap-1 text-[11px] text-[var(--s-text-muted)]">
    {label}
    <input
      ref={inputRef}
      type="number"
      min={MIN_CUSTOM_SIDE_PX}
      max={MAX_CUSTOM_SIDE_PX}
      defaultValue={defaultValue}
      className="h-9 w-28 rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] px-2 text-[13px] text-[var(--s-text)] outline-none focus:border-[var(--s-border-focus)]"
    />
  </label>
);

const CustomSizeForm: React.FC<{ onCreate: (size: DesignSize) => void }> = ({ onCreate }) => {
  const widthRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);

  const submit = (event: React.FormEvent): void => {
    event.preventDefault();
    onCreate({
      width: clampCustomSide(Number(widthRef.current?.value)),
      height: clampCustomSide(Number(heightRef.current?.value)),
    });
  };

  return (
    <form onSubmit={submit} className="mt-5 flex flex-wrap items-end gap-3 border-t border-[var(--s-border)] pt-4">
      <div className="flex w-full flex-col gap-0.5">
        <span className="text-[12.5px] font-medium">Custom size</span>
        <span className="text-[11px] text-[var(--s-text-muted)]">
          In pixels, from {MIN_CUSTOM_SIDE_PX} to {MAX_CUSTOM_SIDE_PX} on each side.
        </span>
      </div>
      <SizeInput label="Width" inputRef={widthRef} defaultValue={DEFAULT_CUSTOM_SIZE.width} />
      <SizeInput label="Height" inputRef={heightRef} defaultValue={DEFAULT_CUSTOM_SIZE.height} />
      <button
        type="submit"
        className="h-9 rounded-md bg-[var(--s-accent)] px-4 text-[12px] font-semibold text-[var(--s-accent-text)] hover:opacity-90"
      >
        Create custom design
      </button>
    </form>
  );
};

export const NewDesignModal: React.FC<NewDesignModalProps> = ({ onCreate, onClose }) => {
  const create = (size: DesignSize): void => {
    onClose();
    onCreate(size);
  };

  return (
    <StudioDialogShell title="New design" description="Pick a size to start with. You can resize pages later." onClose={onClose}>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {DESIGN_FORMATS.map((format) => (
          <FormatCard key={format.id} format={format} onPick={create} />
        ))}
      </div>
      <CustomSizeForm onCreate={create} />
    </StudioDialogShell>
  );
};
