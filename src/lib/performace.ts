export async function measure<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    return await fn();
  } finally {
    const elapsed =
      performance.now() - start;

    console.log(
      `[PERF] ${label}: ${elapsed.toFixed(0)}ms`
    );
  }
}