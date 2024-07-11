import { TokenizerState } from './tokenizer.types';

export class InvalidToken extends Error {
  constructor(value: unknown) {
    super(`Invalid token: ${String(value)}`);
  }
}

export class InvalidTransition extends Error {
  constructor(args: { from: TokenizerState; to: number }) {
    super(
      `Invalid transition: ${JSON.stringify({
        from: args.from,
        to: String.fromCharCode(args.to),
      })}`
    );
  }
}

export class StateNotFlushableError extends Error {
  constructor(state: TokenizerState) {
    super(`Tokenizer is not in a flushable state (state: ${state})`);
  }
}
