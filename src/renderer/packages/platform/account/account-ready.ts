type AccountReadyListener = (userId: string) => void;

const listeners = new Set<AccountReadyListener>();

export const onAccountReady = (listener: AccountReadyListener): (() => void) => {
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
};

export const notifyAccountReady = (userId: string): void => {
  listeners.forEach((listener) => listener(userId));
};
