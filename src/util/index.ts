export const via = <T>(fn: () => T): T => fn();

export const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;
