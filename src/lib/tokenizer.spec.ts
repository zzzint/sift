import { mocks } from 'src/util/mocks';
import { Tokenizer } from './tokenizer';
import { Token, Utf8 } from './tokenizer.types';

describe(Tokenizer.name, () => {
  const tokenizer = new Tokenizer();

  describe(Tokenizer['prototype'].write.name, () => {
    it('should process an empty object', () => {
      const gen = tokenizer.write(Buffer.from(mocks.simple['empty-object']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });

    it('should process an empty array', () => {
      const gen = tokenizer.write(Buffer.from(mocks.simple['empty-array']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-end' }));
    });

    it('should process an object containing a single key and value', () => {
      const gen = tokenizer.write(Buffer.from(mocks.simple['key-value']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'key' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'value' })
      );
    });

    it('should process an object containing string, number, boolean, null, and nested values', () => {
      const gen = tokenizer.write(Buffer.from(mocks.simple['comprehensive']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'number' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 42 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'string' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Hello, world!' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'boolean' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'bool', value: true }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'null' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'null' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'array' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 1 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 2 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 3 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'object' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'nested' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'value' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });

    it('should process an array of records', () => {
      const gen = tokenizer.write(Buffer.from(mocks.simple['records']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'id' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 1 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'name' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Alice' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'id' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 2 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'name' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Bob' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'id' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 3 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'name' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Charlie' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-end' }));
    });

    it('should process a deeply nested object', () => {
      const gen = tokenizer.write(Buffer.from(mocks.simple['deep']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'deeply' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'nested' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'object' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'with' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'an' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'array' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'inside' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'it' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'array-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });

    it('should process integers, floats, scientific and negative numbers', () => {
      const gen = tokenizer.write(Buffer.from(mocks.nuanced['large-numbers']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'integer' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'number', value: 1234567890123456789 })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'float' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'number', value: 1.23456789 })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'scientific' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'number', value: 1.23e100 })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'negativeScientific' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'number', value: -4.56e-10 })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });
  });

  describe(Tokenizer.prototype['isAlphabetical'].name, () => {
    for (const byte of [
      Utf8.LatinCapitalLetterA,
      Utf8.LatinCapitalLetterB,
      Utf8.LatinCapitalLetterC,
      Utf8.LatinCapitalLetterD,
      Utf8.LatinCapitalLetterE,
      Utf8.LatinCapitalLetterF,
      Utf8.LatinCapitalLetterG,
      Utf8.LatinCapitalLetterH,
      Utf8.LatinCapitalLetterI,
      Utf8.LatinCapitalLetterJ,
      Utf8.LatinCapitalLetterK,
      Utf8.LatinCapitalLetterL,
      Utf8.LatinCapitalLetterM,
      Utf8.LatinCapitalLetterN,
      Utf8.LatinCapitalLetterO,
      Utf8.LatinCapitalLetterP,
      Utf8.LatinCapitalLetterQ,
      Utf8.LatinCapitalLetterR,
      Utf8.LatinCapitalLetterS,
      Utf8.LatinCapitalLetterT,
      Utf8.LatinCapitalLetterU,
      Utf8.LatinCapitalLetterV,
      Utf8.LatinCapitalLetterW,
      Utf8.LatinCapitalLetterX,
      Utf8.LatinCapitalLetterY,
      Utf8.LatinCapitalLetterZ,
      Utf8.LatinSmallLetterA,
      Utf8.LatinSmallLetterB,
      Utf8.LatinSmallLetterC,
      Utf8.LatinSmallLetterD,
      Utf8.LatinSmallLetterE,
      Utf8.LatinSmallLetterF,
      Utf8.LatinSmallLetterG,
      Utf8.LatinSmallLetterH,
      Utf8.LatinSmallLetterI,
      Utf8.LatinSmallLetterJ,
      Utf8.LatinSmallLetterK,
      Utf8.LatinSmallLetterL,
      Utf8.LatinSmallLetterM,
      Utf8.LatinSmallLetterN,
      Utf8.LatinSmallLetterO,
      Utf8.LatinSmallLetterP,
      Utf8.LatinSmallLetterQ,
      Utf8.LatinSmallLetterR,
      Utf8.LatinSmallLetterS,
      Utf8.LatinSmallLetterT,
      Utf8.LatinSmallLetterU,
      Utf8.LatinSmallLetterV,
      Utf8.LatinSmallLetterW,
      Utf8.LatinSmallLetterX,
      Utf8.LatinSmallLetterY,
      Utf8.LatinSmallLetterZ,
    ]) {
      it(`should return true for ${byte}`, () => {
        expect(tokenizer['isAlphabetical'](byte)).toBe(true);
      });
    }
  });

  describe(Tokenizer.prototype['isNumber'].name, () => {
    for (const byte of [
      Utf8.DigitZero,
      Utf8.DigitOne,
      Utf8.DigitTwo,
      Utf8.DigitThree,
      Utf8.DigitFour,
      Utf8.DigitFive,
      Utf8.DigitSix,
      Utf8.DigitSeven,
      Utf8.DigitEight,
      Utf8.DigitNine,
    ]) {
      it(`should return true for ${byte}`, () => {
        expect(tokenizer['isNumber'](byte)).toBe(true);
      });
    }
  });
});

const t = (token: Token) => token;
