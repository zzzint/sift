import { TokenParserState } from './token-parser.types';
import { Token } from './tokenizer.types';

export class InvalidTransition extends Error {
  constructor(args: { state: TokenParserState; next: Token }) {
    super(`Invalid transition from ${args.state} to ${args.next.kind}`);
  }
}

export class UnexpectedChar extends Error {
  constructor(args: { state: TokenParserState; next: Token }) {
    super(
      `Encountered an unexpected char when transitioning from ${args.state} to ${args.next.kind}`
    );
  }
}

export class StrategyAdjustment extends Error {
  constructor() {
    super(
      'Adjusting the yield strategy after parsing has begun is not allowed'
    );
  }
}

export class MultipleStrategies extends Error {
  constructor() {
    super('Multiple yield strategies are not allowed.');
  }
}

export class NoStrategyExists extends Error {
  constructor() {
    super('');
  }
}
