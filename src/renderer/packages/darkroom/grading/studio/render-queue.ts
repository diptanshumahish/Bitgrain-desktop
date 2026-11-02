type Task<T> = () => Promise<T>;
type RunQueued = <T>(task: Task<T>) => Promise<T>;

export const createRenderQueue = (maxConcurrent: number): RunQueued => {
  let running = 0;
  const waiting: Array<() => void> = [];

  const startNext = (): void => {
    if (running >= maxConcurrent) return;
    const next = waiting.shift();
    if (next) next();
  };

  return <T>(task: Task<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      waiting.push(() => {
        running += 1;
        task()
          .then(resolve, reject)
          .finally(() => {
            running -= 1;
            startNext();
          });
      });
      startNext();
    });
};
