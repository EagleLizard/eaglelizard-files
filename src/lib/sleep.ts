
export function sleep(ms?: number): Promise<void> {
  ms = ms ?? 0;
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
