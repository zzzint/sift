export * from './mocks';

export const via = <T>(fn: () => T): T => fn();
