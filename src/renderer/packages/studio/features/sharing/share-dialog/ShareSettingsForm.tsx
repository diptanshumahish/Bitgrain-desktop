import React from "react";
import type { ShareAccess, ShareSettings } from "../api/share-types";
import { CURRENT_EXPIRY, EXPIRY_OPTIONS, NO_EXPIRY, describeExpiry, expiresAtFromOption } from "./share-expiry";

interface ShareSettingsFormProps {
  settings: ShareSettings;
  disabled: boolean;
  onChange: (settings: ShareSettings) => void;
}

interface AccessOption {
  value: ShareAccess;
  label: string;
  hint: string;
}

const ACCESS_OPTIONS: AccessOption[] = [
  { value: "view", label: "Can view", hint: "Anyone with the link can look through the pages." },
  { value: "comment", label: "Can comment", hint: "People who sign in can pin comments and reply." },
];

const FIELD_CLASS =
  "h-8 w-full rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] px-2 text-[12.5px] text-[var(--s-text)] outline-none focus:border-[var(--s-border-focus)]";

export const ShareSettingsForm: React.FC<ShareSettingsFormProps> = ({ settings, disabled, onChange }) => (
  <fieldset disabled={disabled} className="flex flex-col gap-4">
    <div role="radiogroup" aria-label="Who can do what" className="grid grid-cols-2 gap-2">
      {ACCESS_OPTIONS.map((option) => {
        const selected = settings.access === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange({ ...settings, access: option.value })}
            className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-colors ${selected ? "border-[var(--s-border-strong)] bg-[var(--s-bg-panel)]" : "border-[var(--s-border)] bg-[var(--s-bg-panel-alt)] hover:border-[var(--s-border-hover)]"}`}
          >
            <span className="text-[12.5px] font-semibold text-[var(--s-text)]">{option.label}</span>
            <span className="text-[11.5px] leading-snug text-[var(--s-text-muted)]">{option.hint}</span>
          </button>
        );
      })}
    </div>

    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-[var(--s-text)]">Link expiry</span>
      <select
        value={settings.expiresAt ? CURRENT_EXPIRY : NO_EXPIRY}
        onChange={(event) => onChange({ ...settings, expiresAt: expiresAtFromOption(event.target.value) })}
        className={FIELD_CLASS}
      >
        {settings.expiresAt && <option value={CURRENT_EXPIRY}>{describeExpiry(settings.expiresAt)}</option>}
        {EXPIRY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>

    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={settings.allowDownload}
        onChange={(event) => onChange({ ...settings, allowDownload: event.target.checked })}
        className="mt-0.5 accent-[var(--s-text)]"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[12.5px] font-medium text-[var(--s-text)]">Allow downloads</span>
        <span className="text-[11.5px] text-[var(--s-text-muted)]">Viewers can save each page as a PNG.</span>
      </span>
    </label>
  </fieldset>
);
