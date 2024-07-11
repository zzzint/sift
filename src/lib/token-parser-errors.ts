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
