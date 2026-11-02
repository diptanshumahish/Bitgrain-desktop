import React, { useLayoutEffect, useRef } from "react";
import { commentPostingSignal } from "../comments/comments-store";
import { autoGrow, syncSendButton } from "./auto-grow";
import { EditActionsRow } from "./edit-actions-row";
import { focusWhenShown } from "./focus-when-shown";
import { SendButton } from "./send-button";

interface CommentInputProps {
  placeholder: string;
  initialValue?: string;
  autoFocus?: boolean;
  submitLabel: string;
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
  editing?: boolean;
}

const COMMENT_MAX_LENGTH = 2000;

const resetField = (field: HTMLTextAreaElement, button: HTMLButtonElement | null): void => {
  field.value = "";
  autoGrow(field);
  syncSendButton(field, button);
};

export const CommentInput: React.FC<CommentInputProps> = ({
  placeholder, initialValue = "", autoFocus, submitLabel, onSubmit, onCancel, editing = false,
}) => {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return undefined;
    autoGrow(field);
    return autoFocus ? focusWhenShown(field) : undefined;
  }, [autoFocus]);

  const submit = async (): Promise<void> => {
    const field = fieldRef.current;
    if (!field || field.value.trim() === "" || commentPostingSignal.value) return;
    if (await onSubmit(field.value.trim())) resetField(field, buttonRef.current);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === "Escape" && onCancel) {
      event.stopPropagation();
      onCancel();
    }
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void submit();
  };

  return (
    <form
      className="flex-1 min-w-0 flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={fieldRef}
          rows={1}
          defaultValue={initialValue}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder={placeholder}
          aria-label={placeholder}
          onKeyDown={handleKeyDown}
          onInput={(event) => {
            autoGrow(event.currentTarget);
            syncSendButton(event.currentTarget, buttonRef.current);
          }}
          className="flex-1 min-w-0 resize-none bg-transparent border-none outline-none py-[3px] text-[12.5px] leading-[18px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)]"
        />
        {!editing && <SendButton buttonRef={buttonRef} label={submitLabel} startsDisabled={initialValue.trim() === ""} />}
      </div>
      {editing && onCancel && <EditActionsRow buttonRef={buttonRef} onCancel={onCancel} />}
    </form>
  );
};
