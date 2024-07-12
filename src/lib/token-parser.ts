import { Json } from 'src/util/types';
import { Builder } from './builder';
import { InvalidTransition, UnexpectedChar } from './token-parser-errors';
import { Container, TokenParserState as State } from './token-parser.types';
import { isPrimitiveToken } from './tokenizer';
import { PrimitiveToken, Token, TypeOfToken } from './tokenizer.types';

/** For generating valid Json-like structures from a stream of Tokens. */
export class TokenParser {
  #state: State = 'begin';
  #stack: Container[] = [];
  #builder: Builder = new Builder();
  #currentKey: string | null = null;
  #currentPath: string[] = [];

  /** A collection of paths that should be included in the Json yielded from this classes write method. */
  #pathRegistry: Set<string[]> = new Set();

  public registerPath(path: string[]) {
    this.#pathRegistry.add(path);
  }

  public *write(tokens: Generator<Token>): Generator<Json> {
    for (const token of tokens) {
      if (token.kind === 'array-start') this.toArrayStart(token);
      if (token.kind === 'array-end') this.toArrayEnd(token);
      if (token.kind === 'object-start') this.toObjectStart(token);
      if (token.kind === 'object-end') this.toObjectEnd(token);

      if (token.kind === 'comma') this.toComma(token);
      if (token.kind === 'colon') this.toColon(token);
      if (token.kind === 'eof') this.toEof(token);

      if (isPrimitiveToken(token)) this.toPrimitive(token);
    }

    yield this.built;
  }

  private get container() {
    return this.#stack.at(-1);
  }

  private get built() {
    return this.#builder.root;
  }

  private makeInvalidTransitionError(next: Token): InvalidTransition {
    return new InvalidTransition({ next, state: this.#state });
  }

  private makeUnexpectedCharError(next: Token): UnexpectedChar {
    return new UnexpectedChar({ next, state: this.#state });
  }

  private toArrayStart(token: TypeOfToken<'array-start'>) {
    if (
      this.#state === 'begin' ||
      this.#state === 'array-start' ||
      this.#state === 'array-comma' ||
      this.#state === 'object-colon'
    ) {
      this.#builder.beginArray(this.#currentKey);
      this.#stack.push('array');
      this.#state = 'array-start';
      this.#currentKey = null;
    } else throw this.makeInvalidTransitionError(token);
  }

  private toArrayEnd(token: TypeOfToken<'array-end'>) {
    switch (this.#state) {
      case 'array-value':
      case 'array-start':
      case 'array-end':
      case 'object-end': {
        if (
          this.#stack.pop() !== 'array' &&
          (this.#state === 'array-end' || this.#state === 'object-end')
        ) {
          throw this.makeUnexpectedCharError(token);
        }
        this.#builder.endContainer();
        this.#state = 'array-end';
        break;
      }
      default:
        throw this.makeInvalidTransitionError(token);
    }
  }

  private toObjectStart(token: TypeOfToken<'object-start'>) {
    if (
      this.#state === 'begin' ||
      this.#state === 'array-start' ||
      this.#state === 'array-comma' ||
      this.#state === 'object-colon'
    ) {
      this.#builder.beginObject(this.#currentKey);
      this.#stack.push('object');
      this.#state = 'object-start';
      this.#currentKey = null;
    } else throw this.makeInvalidTransitionError(token);
  }

  private toObjectEnd(token: TypeOfToken<'object-end'>) {
    switch (this.#state) {
      case 'object-value':
      case 'object-start':
      case 'object-end': {
        if (
          this.#stack.pop() !== 'object' &&
          (this.#state === 'object-end' || this.#state === 'object-start')
        ) {
          throw this.makeUnexpectedCharError(token);
        }
        this.#builder.endContainer();
        this.#state = 'object-end';
        break;
      }
      default:
        throw this.makeInvalidTransitionError(token);
    }
  }

  private toPrimitive(token: PrimitiveToken) {
    switch (this.#state) {
      case 'begin':
      case 'array-start':
      case 'array-comma':
      case 'object-colon': {
        const value = token.kind !== 'null' ? token.value : null;
        this.#builder.addValue(this.#currentKey, value);

        this.#state =
          this.#stack[this.#stack.length - 1] === 'array'
            ? 'array-value'
            : 'object-value';
        this.#currentKey = null;
        break;
      }
      case 'object-start':
      case 'object-comma': {
        if (token.kind !== 'string') {
          throw this.makeInvalidTransitionError(token);
        }
        this.#currentKey = token.value;
        this.#state = 'object-key';
        break;
      }
      default:
        throw this.makeInvalidTransitionError(token);
    }
  }

  private toColon(token: TypeOfToken<'colon'>) {
    if (this.#state === 'object-key') {
      this.#state = 'object-colon';
    } else {
      throw this.makeInvalidTransitionError(token);
    }
  }

  private toComma(token: TypeOfToken<'comma'>) {
    if (this.#state === 'array-value') this.#state = 'array-comma';
    else if (this.#state === 'object-value') this.#state = 'object-comma';
    else if (this.#state === 'object-end' || this.#state === 'array-end') {
      this.#state = this.container === 'array' ? 'array-comma' : 'object-comma';
    } else throw this.makeInvalidTransitionError(token);
  }

  private toEof(token: TypeOfToken<'eof'>) {
    if (
      this.#state !== 'array-end' &&
      this.#state !== 'object-end' &&
      this.#state !== 'begin'
    ) {
      throw this.makeUnexpectedCharError(token);
    }
    // The parsing is complete, and the result is in this.#builder.root
  }
}
