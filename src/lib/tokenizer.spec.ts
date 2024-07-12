import { mockJsonStrings } from 'src/util/mocks';
import { Tokenizer } from './tokenizer';
import { Token, Utf8 } from './tokenizer.types';

describe(Tokenizer.name, () => {
  const tokenizer = new Tokenizer();

  describe(Tokenizer['prototype'].write.name, () => {
    it('Can process an empty object', () => {
      const generator = tokenizer.write(
        Buffer.from(mockJsonStrings.simpleObject)
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });

    it('Can process an empty array', () => {
      const generator = tokenizer.write(
        Buffer.from(mockJsonStrings.simpleArray)
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-end' }));
    });

    it('Can process an object containing a single key and value', () => {
      const generator = tokenizer.write(
        Buffer.from(mockJsonStrings.simpleKeyValue)
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'key' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'value' })
      );
    });

    it('Can process an object containing string, number, boolean, null, and nested values', () => {
      const generator = tokenizer.write(
        Buffer.from(mockJsonStrings.comprehensive)
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'number' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'number', value: 42 })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'string' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Hello, world!' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'boolean' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'bool', value: true })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'null' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'null' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'array' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'number', value: 1 })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'number', value: 2 })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'number', value: 3 })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'object' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'nested' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'value' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });

    it('Can process an array of records', () => {
      const generator = tokenizer.write(Buffer.from(mockJsonStrings.records));
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'id' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'number', value: 1 })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'name' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Alice' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'id' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'number', value: 2 })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'name' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Bob' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'id' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'number', value: 3 })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'name' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'Charlie' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-end' }));
    });

    it('Can process a deeply nested object', () => {
      const generator = tokenizer.write(
        Buffer.from(mockJsonStrings.deeplyNested)
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'deeply' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'nested' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'object' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'with' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'an' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'array' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'inside' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'it' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'array-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });

    it('Can process a heavily escaped string', () => {
      const generator = tokenizer.write(Buffer.from(mockJsonStrings.escapes));
      expect(generator.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'escapes' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: '\\"Quote\\", \\\\Backslash\\n, \\t Tab' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: 'unicode' })
      );
      expect(generator.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(generator.next().value).toStrictEqual(
        t({ kind: 'string', value: '\\u00A9 \\u2665 \\uD83D\\uDE00' })
      );
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

  describe(Tokenizer.prototype['isNumerical'].name, () => {
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
        expect(tokenizer['isNumerical'](byte)).toBe(true);
      });
    }
  });
});

const t = (token: Token) => token;
