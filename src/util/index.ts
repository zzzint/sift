export const via = <T>(fn: () => T): T => fn();

export const isObject = <T>(value: T) =>
  typeof value === 'object' && value !== null;
