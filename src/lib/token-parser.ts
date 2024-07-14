import { Json } from 'src/util/types';
import { Builder } from './builder';
import { InvalidTransition, UnexpectedChar } from './token-parser-errors';
import {
  TokenParserMode as Mode,
  TokenParserState as State,
} from './token-parser.types';
import { isPrimitiveToken } from './tokenizer';
import { PrimitiveToken, Token, TypeOfToken } from './tokenizer.types';

/** For generating valid Json-like structures from a stream of Tokens. */
export class TokenParser {
  #state: State = 'begin';
  #builder: Builder = new Builder();
  #currentKey: string | null = null;

  #stacks = {
    mode: Array.from<Mode>([]),
    path: Array.from<string>([]),
  };

  #registries = {
    /** A collection of paths that should be included in the Json yielded from this classes write method. */
    path: new Set<string>(),
  };

  public registerPath(path: string) {
    this.#registries.path.add(path);
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

  private get mode() {
    return this.#stacks.mode.at(-1);
  }

  private get built() {
    return this.#builder.root;
  }

  private get currentPathIsRegistered() {
    // TODO: Make this more efficient & ensure via tests that it isn't returning true when it shouldn't
    if (this.#registries.path.size === 0) return true;
    const currentPath = this.#stacks.path;
    const currentPathString = currentPath.join('.');

    const registeredParentSegmentExists = [...this.#registries.path].some(
      (registeredPath) =>
        currentPathString.startsWith(registeredPath + '.') ||
        currentPathString === registeredPath
    );

    const registeredChildSegmentExists = [...this.#registries.path].some(
      (registeredPath) =>
        registeredPath.startsWith(currentPathString + '.') ||
        registeredPath === currentPathString
    );

    return registeredParentSegmentExists || registeredChildSegmentExists;
  }

  private setCurrentKey(k: string | null) {
    this.#currentKey = k;
    if (k !== null) this.#stacks.path.push(k);
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
      if (this.currentPathIsRegistered || this.#currentKey === null) {
        this.#builder.openArray(this.#currentKey);
      }
      this.#stacks.mode.push('array');
      this.#state = 'array-start';
      this.setCurrentKey(null);
    } else throw this.makeInvalidTransitionError(token);
  }

  private toArrayEnd(token: TypeOfToken<'array-end'>) {
    switch (this.#state) {
      case 'array-value':
      case 'array-start':
      case 'array-end':
      case 'object-end': {
        if (
          this.#stacks.mode.pop() !== 'array' &&
          (this.#state === 'array-end' || this.#state === 'object-end')
        ) {
          throw this.makeUnexpectedCharError(token);
        }
        if (this.currentPathIsRegistered) this.#builder.closeContainer();
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
      if (this.currentPathIsRegistered || this.#currentKey === null)
        this.#builder.openObject(this.#currentKey);
      this.#stacks.mode.push('object');
      this.#state = 'object-start';
      this.setCurrentKey(null);
    } else throw this.makeInvalidTransitionError(token);
  }

  private toObjectEnd(token: TypeOfToken<'object-end'>) {
    switch (this.#state) {
      case 'array-end':
      case 'object-value':
      case 'object-start':
      case 'object-end': {
        if (
          this.#stacks.mode.pop() !== 'object' &&
          (this.#state === 'object-end' || this.#state === 'object-start')
        ) {
          throw this.makeUnexpectedCharError(token);
        }
        this.#builder.closeContainer();
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
        if (this.currentPathIsRegistered) {
          const tokenValue = token.kind !== 'null' ? token.value : null;
          this.#builder.set(this.#currentKey, tokenValue);
        }

        this.#state = this.mode === 'array' ? 'array-value' : 'object-value';
        this.setCurrentKey(null);
        break;
      }
      case 'object-start':
      case 'object-comma': {
        if (token.kind !== 'string') {
          throw this.makeInvalidTransitionError(token);
        }

        this.setCurrentKey(token.value);
        this.#state = 'object-key';
        break;
      }
      default:
        throw this.makeInvalidTransitionError(token);
    }
  }

  private toColon(token: TypeOfToken<'colon'>) {
    if (this.#state === 'object-key') this.#state = 'object-colon';
    else throw this.makeInvalidTransitionError(token);
  }

  private toComma(token: TypeOfToken<'comma'>) {
    if (this.#state === 'array-value') this.#state = 'array-comma';
    else if (this.#state === 'object-value') {
      this.#state = 'object-comma';
      this.#stacks.path.pop();
    } else if (this.#state === 'object-end' || this.#state === 'array-end') {
      this.#state = this.mode === 'array' ? 'array-comma' : 'object-comma';
      this.#stacks.path.pop();
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
  }
}
