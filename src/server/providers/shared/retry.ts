export async function withRetry<T>(
  work: () => Promise<T>,
  options?: {
    retries?: number;
    initialDelayMs?: number;
    factor?: number;
    onError?: (error: unknown, attempt: number) => Promise<void> | void;
  },
) {
  const retries = options?.retries ?? 2;
  const initialDelayMs = options?.initialDelayMs ?? 1000;
  const factor = options?.factor ?? 2;

  let attempt = 0;
  let delayMs = initialDelayMs;

  while (true) {
    try {
      return await work();
    } catch (error) {
      attempt += 1;

      if (attempt > retries) {
        throw error;
      }

      await options?.onError?.(error, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= factor;
    }
  }
}
