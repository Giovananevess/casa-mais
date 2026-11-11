const shouldLog = process.env.NODE_ENV === "development" || process.env.CASA_PERF_LOG === "1";

/** Mede o tempo de uma operação assíncrona (logado só em desenvolvimento). */
export async function measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!shouldLog) return fn();

  const start = performance.now();

  try {
    return await fn();
  } finally {
    console.log(`[perf] ${label}: ${(performance.now() - start).toFixed(0)}ms`);
  }
}
