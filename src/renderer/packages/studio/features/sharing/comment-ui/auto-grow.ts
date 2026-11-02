const MAX_FIELD_HEIGHT_PX = 160;

export const autoGrow = (field: HTMLTextAreaElement): void => {
  field.style.height = "auto";
  field.style.height = `${Math.min(field.scrollHeight, MAX_FIELD_HEIGHT_PX)}px`;
};

export const syncSendButton = (field: HTMLTextAreaElement, button: HTMLButtonElement | null): void => {
  if (button) button.disabled = field.value.trim() === "";
};
