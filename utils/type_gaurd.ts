function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

function isError(err: unknown): err is Error {
  return err instanceof Error;
}

export { isNotNull, isError }