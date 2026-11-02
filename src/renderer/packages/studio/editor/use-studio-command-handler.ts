import { useEffect, useRef } from "react";
import { onStudioCommand, type StudioCommand } from "./studio-command-event";

export const useStudioCommandHandler = (command: StudioCommand, handler: () => void): void => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => onStudioCommand((received) => {
    if (received === command) handlerRef.current();
  }), [command]);
};
