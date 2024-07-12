import { BuilderKey } from './builder.types';

export class UnexpectedKeyForContainer extends Error {
  constructor(key: BuilderKey, container: 'array' | 'object') {
    super(
      `Unexpectedly received key (${key}) when adding a value to an (${container}) container`
    );
  }
}
