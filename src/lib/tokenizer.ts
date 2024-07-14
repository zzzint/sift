import { via } from 'src/util';
import { StateNotFlushableError, InvalidTransition } from './tokenizer.errors';
import {
  Token,
  TokenizerState as State,
  Utf8,
  PrimitiveToken,
} from './tokenizer.types';

/** For generating Tokens from a UTF-8 Buffer. */
export class Tokenizer {
  #state: State = State.Yielded;
  #buffer: Array<number> = [];

  public *write(buffer: Buffer): Generator<Token> {
    for (const byte of buffer) {
      yield* this.transition(byte);
    }
  }

  private *transition(byte: number): Generator<Token> {
    if (this.isSeparator(byte)) yield* this.toSeparator(byte);
    else if (this.isWhitespace(byte)) this.toWhitespace(byte);
    else if (this.isNumberRelated(byte)) this.toNumberRelated(byte);
    else if (this.isAlphabetical(byte)) this.toAlphabetical(byte);
    else if (this.isPunctuation(byte)) this.toPunctuation(byte);

    if (this.isYieldable) yield this.flush();
  }
  private flush(): Token {
    if (!this.isYieldable) throw new StateNotFlushableError(this.#state);

    const token = via(() => {
      if (this.#state === State.YieldableTrue)
        return { kind: 'bool', value: true };
      if (this.#state === State.YieldableFalse)
        return { kind: 'bool', value: false };
      if (this.#state === State.YieldableNull) return { kind: 'null' };
      if (this.#state === State.YieldableNumber)
        return { kind: 'number', value: this.convertBufferToNumber() };
      if (this.#state === State.YieldableString)
        return { kind: 'string', value: this.convertBufferToString() };
    }) satisfies Token;

    this.#state = State.Yielded;
    this.#buffer = [];
    return token;
  }

  private convertBufferToNumber(): number {
    return parseFloat(this.convertBufferToString());
  }

  private convertBufferToString(): string {
    return String.fromCharCode(...this.#buffer);
  }

  private *toSeparator(byte: number): Generator<Token> {
    if (
      this.#state === State.PartialNumberInteger ||
      this.#state === State.PartialNumberDecimal ||
      this.#state === State.PartialNumberExponentValue
    ) {
      this.#state = State.YieldableNumber;
      yield this.flush();
    }

    if (byte === Utf8.Colon) yield { kind: 'colon' };
    if (byte === Utf8.LeftCurlyBracket) yield { kind: 'object-start' };
    if (byte === Utf8.RightCurlyBracket) yield { kind: 'object-end' };
    if (byte === Utf8.LeftSquareBracket) yield { kind: 'array-start' };

    if (this.#state === State.PartialString) {
      this.#buffer.push(byte);
      return;
    }

    if (byte === Utf8.Comma || byte === Utf8.RightSquareBracket) {
      if (this.isPartialLiteral) {
        if (this.#state === State.PartialNumber)
          this.#state = State.YieldableNumber;
        if (this.#state === State.PartialFalse4)
          this.#state = State.YieldableFalse;
        if (this.#state === State.PartialTrue3)
          this.#state = State.YieldableTrue;
        if (this.#state === State.PartialNull3)
          this.#state = State.YieldableNull;

        yield this.flush();
      }

      if (byte === Utf8.Comma) yield { kind: 'comma' };
      if (byte === Utf8.RightSquareBracket) yield { kind: 'array-end' };
    }
  }

  private toAlphabetical(byte: number) {
    this.#buffer.push(byte);
    switch (this.#state) {
      case State.EscapedChar: {
        this.#state = State.PartialString;
        break;
      }

      case State.Yielded: {
        if (byte === Utf8.LatinSmallLetterN) this.#state = State.PartialNull1;
        else if (byte === Utf8.LatinSmallLetterT)
          this.#state = State.PartialTrue1;
        else if (byte === Utf8.LatinSmallLetterF)
          this.#state = State.PartialFalse1;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialString: {
        break;
      }
      case State.PartialTrue1: {
        if (byte === Utf8.LatinSmallLetterR) this.#state = State.PartialTrue2;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialTrue2: {
        if (byte === Utf8.LatinSmallLetterU) this.#state = State.PartialTrue3;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialTrue3: {
        if (byte === Utf8.LatinSmallLetterE) this.#state = State.YieldableTrue;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialFalse1: {
        if (byte === Utf8.LatinSmallLetterA) this.#state = State.PartialFalse2;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialFalse2: {
        if (byte === Utf8.LatinSmallLetterL) this.#state = State.PartialFalse3;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialFalse3: {
        if (byte === Utf8.LatinSmallLetterS) this.#state = State.PartialFalse4;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialFalse4: {
        if (byte === Utf8.LatinSmallLetterE) this.#state = State.YieldableFalse;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialNull1: {
        if (byte === Utf8.LatinSmallLetterU) this.#state = State.PartialNull2;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialNull2: {
        if (byte === Utf8.LatinSmallLetterL) this.#state = State.PartialNull3;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      case State.PartialNull3: {
        if (byte === Utf8.LatinSmallLetterL) this.#state = State.YieldableNull;
        else throw new InvalidTransition({ from: this.#state, to: byte });
        break;
      }
      default: {
        throw new InvalidTransition({ from: this.#state, to: byte });
      }
    }
  }

  private toNumberRelated(byte: number) {
    switch (this.#state) {
      case State.Yielded:
        if (this.isNumber(byte) && byte !== Utf8.DigitZero) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberInteger;
        } else if (byte === Utf8.HyphenMinus) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberNegative;
        } else if (byte === Utf8.FullStop) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberDecimal;
        } else {
          throw new InvalidTransition({ from: this.#state, to: byte });
        }
        break;
      case State.PartialNumberNegative:
        if (this.isNumber(byte)) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberInteger;
        } else if (byte === Utf8.FullStop) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberDecimal;
        } else {
          throw new InvalidTransition({ from: this.#state, to: byte });
        }
        break;
      case State.PartialNumberInteger:
        if (this.isNumber(byte)) {
          this.#buffer.push(byte);
        } else if (byte === Utf8.FullStop) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberDecimal;
        } else if (
          byte === Utf8.LatinSmallLetterE ||
          byte === Utf8.LatinCapitalLetterE
        ) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberExponent;
        } else {
          throw new InvalidTransition({ from: this.#state, to: byte });
        }
        break;
      case State.PartialNumberDecimal:
        if (this.isNumber(byte)) {
          this.#buffer.push(byte);
        } else if (
          byte === Utf8.LatinSmallLetterE ||
          byte === Utf8.LatinCapitalLetterE
        ) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberExponent;
        } else {
          throw new InvalidTransition({ from: this.#state, to: byte });
        }
        break;
      case State.PartialNumberExponent:
        if (this.isNumber(byte)) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberExponentValue;
        } else if (byte === Utf8.HyphenMinus || byte === Utf8.PlusSign) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberExponentSign;
        } else {
          throw new InvalidTransition({ from: this.#state, to: byte });
        }
        break;
      case State.PartialNumberExponentSign:
      case State.PartialNumberExponentValue:
        if (this.isNumber(byte)) {
          this.#buffer.push(byte);
          this.#state = State.PartialNumberExponentValue;
        } else {
          throw new InvalidTransition({ from: this.#state, to: byte });
        }
        break;
      case State.PartialTrue3:
      case State.PartialString:
        this.toAlphabetical(byte);
        break;
      default:
        throw new InvalidTransition({ from: this.#state, to: byte });
    }
  }

  private toPunctuation(byte: number) {
    switch (this.#state) {
      case State.Yielded: {
        if (byte === Utf8.QuotationMark) {
          this.#state = State.PartialString;
          // Don't add the opening quote to the buffer
        }
        break;
      }
      case State.PartialString: {
        if (byte === Utf8.ReverseSolidus) {
          this.#state = State.EscapedChar;
          this.#buffer.push(byte);
        } else if (byte === Utf8.QuotationMark) {
          this.#state = State.YieldableString;
          // Don't add the closing quote to the buffer
        } else {
          this.#buffer.push(byte);
        }
        break;
      }
      case State.EscapedChar: {
        if (byte === Utf8.QuotationMark || byte === Utf8.ReverseSolidus) {
          this.#state = State.PartialString;
        }
        this.#buffer.push(byte);
        break;
      }
      default: {
        throw new InvalidTransition({ from: this.#state, to: byte });
      }
    }
  }

  private toWhitespace(byte: number) {
    if (this.#state === State.PartialString) {
      this.#buffer.push(byte);
    }
  }

  private get isYieldable() {
    return (
      this.#state === State.YieldableTrue ||
      this.#state === State.YieldableFalse ||
      this.#state === State.YieldableNull ||
      this.#state === State.YieldableString ||
      this.#state === State.YieldableNumber
    );
  }

  private get isPartialLiteral() {
    return (
      this.#state === State.PartialNull1 ||
      this.#state === State.PartialNull2 ||
      this.#state === State.PartialNull3 ||
      this.#state === State.PartialTrue1 ||
      this.#state === State.PartialTrue2 ||
      this.#state === State.PartialTrue3 ||
      this.#state === State.PartialFalse1 ||
      this.#state === State.PartialFalse2 ||
      this.#state === State.PartialFalse3 ||
      this.#state === State.PartialFalse4 ||
      this.#state === State.PartialNumber
    );
  }

  private isSeparator(byte: number): boolean {
    return (
      byte === Utf8.Comma ||
      byte === Utf8.Colon ||
      byte === Utf8.LeftCurlyBracket ||
      byte === Utf8.RightCurlyBracket ||
      byte === Utf8.LeftSquareBracket ||
      byte === Utf8.RightSquareBracket
    );
  }

  private isAlphabetical(byte: number): boolean {
    return (
      (byte >= Utf8.LatinSmallLetterA && byte <= Utf8.LatinSmallLetterZ) ||
      (byte >= Utf8.LatinCapitalLetterA && byte <= Utf8.LatinCapitalLetterZ)
    );
  }

  private isNumber(byte: number): boolean {
    return byte >= Utf8.DigitZero && byte <= Utf8.DigitNine;
  }

  private isNumberRelated(byte: number): boolean {
    return this.isNumber(byte) || this.isNumberSpecialChar(byte);
  }

  private isNumberSpecialChar(byte: number): boolean {
    return (
      byte === Utf8.HyphenMinus ||
      byte === Utf8.FullStop ||
      byte === Utf8.LatinSmallLetterE ||
      byte === Utf8.LatinCapitalLetterE ||
      byte === Utf8.PlusSign
    );
  }

  private isWhitespace(byte: number): boolean {
    return (
      byte === Utf8.Space ||
      byte === Utf8.Tab ||
      byte === Utf8.Newline ||
      byte === Utf8.CarriageReturn
    );
  }

  private isPunctuation(byte: number): boolean {
    return (
      byte === Utf8.ExclamationMark ||
      byte === Utf8.QuotationMark ||
      byte === Utf8.NumberSign ||
      byte === Utf8.DollarSign ||
      byte === Utf8.PercentSign ||
      byte === Utf8.Ampersand ||
      byte === Utf8.Apostrophe ||
      byte === Utf8.LeftParenthesis ||
      byte === Utf8.RightParenthesis ||
      byte === Utf8.Asterisk ||
      byte === Utf8.PlusSign ||
      byte === Utf8.HyphenMinus ||
      byte === Utf8.FullStop ||
      byte === Utf8.Solidus ||
      byte === Utf8.Semicolon ||
      byte === Utf8.LessThanSign ||
      byte === Utf8.EqualsSign ||
      byte === Utf8.GreaterThanSign ||
      byte === Utf8.QuestionMark ||
      byte === Utf8.CommercialAt ||
      byte === Utf8.ReverseSolidus ||
      byte === Utf8.CircumflexAccent ||
      byte === Utf8.LowLine ||
      byte === Utf8.GraveAccent ||
      byte === Utf8.VerticalLine ||
      byte === Utf8.Tilde
    );
  }
}

export function isPrimitiveToken(token: Token): token is PrimitiveToken {
  return (
    token.kind === 'null' ||
    token.kind === 'bool' ||
    token.kind === 'string' ||
    token.kind === 'number'
  );
}

export function isSeparatorToken(token: Token): boolean {
  return (
    token.kind === 'comma' ||
    token.kind === 'colon' ||
    token.kind === 'object-start' ||
    token.kind === 'object-end' ||
    token.kind === 'array-start' ||
    token.kind === 'array-end'
  );
}
