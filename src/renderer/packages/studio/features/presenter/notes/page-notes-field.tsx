import React, { useRef } from "react";
import { emitPageNotesUpdate } from "./page-notes-event";

interface PageNotesFieldProps {
  pageId: string;
  notes: string;
  className: string;
  autoFocus?: boolean;
}

const NOTES_PLACEHOLDER = "What do you want to say on this slide? Only you see these notes.";

export const PageNotesField: React.FC<PageNotesFieldProps> = ({ pageId, notes, className, autoFocus }) => {
  const recordHistoryRef = useRef(true);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    emitPageNotesUpdate({ pageId, notes: event.target.value, recordHistory: recordHistoryRef.current });
    recordHistoryRef.current = false;
  };

  return (
    <textarea
      key={pageId}
      value={notes}
      autoFocus={autoFocus}
      onFocus={() => {
        recordHistoryRef.current = true;
      }}
      onChange={handleChange}
      onKeyDown={(event) => event.stopPropagation()}
      placeholder={NOTES_PLACEHOLDER}
      aria-label="Speaker notes"
      spellCheck
      className={`w-full resize-none bg-[var(--s-bg-input)] border border-[var(--s-border)] rounded-md px-2.5 py-2 text-[12px] leading-[1.5] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)] focus:outline-none focus:border-[var(--s-text-subtle)] transition-colors ${className}`}
    />
  );
};
