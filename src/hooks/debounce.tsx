type DebouncedFunction<F extends (...args: unknown[]) => void> = (...args: Parameters<F>) => void;

export function debounce<F extends (...args: unknown[]) => void>(
  func: F,
  waitFor: number
): DebouncedFunction<F> {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}
