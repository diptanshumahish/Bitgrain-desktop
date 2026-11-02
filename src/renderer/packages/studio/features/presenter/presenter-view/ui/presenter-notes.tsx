import React from "react";

interface PresenterNotesProps {
  notes: string;
}

export const PresenterNotes: React.FC<PresenterNotesProps> = ({ notes }) => (
  <div className="flex flex-col gap-2 min-h-0 h-full">
    <span className="text-[12px] text-white/50">Notes</span>
    <div className="flex-1 min-h-0 overflow-auto rounded-lg bg-white/5 px-5 py-4">
      {notes ? (
        <p className="m-0 whitespace-pre-wrap text-[20px] leading-[1.55] text-white/90">{notes}</p>
      ) : (
        <p className="m-0 text-[14px] text-white/40">No notes for this slide.</p>
      )}
    </div>
  </div>
);
