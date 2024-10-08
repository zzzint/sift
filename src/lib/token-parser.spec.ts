import { mocks } from 'src/util/mocks';
import { TokenParser } from './token-parser';
import { Tokenizer } from './tokenizer';

describe(TokenParser.name, () => {
  describe(TokenParser['prototype'].write.name, () => {
    let parser: TokenParser;

    beforeEach(() => {
      parser = new TokenParser();
    });

    const generateJson = (json: string) => {
      const tokenizer = new Tokenizer();
      const tokens = tokenizer.write(Buffer.from(json));
      return parser.write(tokens).next().value;
    };

    describe(`JSON.parse parity`, () => {
      const jp = JSON.parse;

      describe('Parity for simple Json', () => {
        it('should handle an empty object', () => {
          const mock = mocks.simple['empty-object'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle an empty array', () => {
          const mock = mocks.simple['empty-array'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle an object with a single key and value', () => {
          const mock = mocks.simple['key-value'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle an array with simple values', () => {
          const mock = mocks.simple['array-values'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle an array of records', () => {
          const mock = mocks.simple['records'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle a deep object', () => {
          const mock = mocks.simple['deep'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle a comprehensive object', () => {
          const mock = mocks.simple['comprehensive'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
      });

      describe('Parity for nuanced Json', () => {
        it('should handle empty string values', () => {
          const mock = mocks.nuanced['empty-strings'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle large numbers', () => {
          const mock = mocks.nuanced['large-numbers'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle deep nesting', () => {
          const mock = mocks.nuanced['deep-nesting'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle complex nesting', () => {
          const mock = mocks.nuanced['complex-nesting'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle whitespace variations', () => {
          const mock = mocks.nuanced['whitespace-variations'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it.skip('should handle all escape sequences', () => {
          const mock = mocks.nuanced['all-escape-sequences'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it.skip('should handle unicode characters', () => {
          const mock = mocks.nuanced['unicode-characters'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
      });

      describe('Parity for invalid Json', () => {
        it('should throw when encountering a trailing comma', () => {
          const mock = mocks.invalid['trailing-comma'];
          expect(() => generateJson(mock)).toThrow();
        });
        it('should throw when encountering a leading zero', () => {
          const mock = mocks.invalid['leading-zeros'];
          expect(() => generateJson(mock)).toThrow();
        });
        it('should throw when encountering single quotes around keys or string values', () => {
          const mock = mocks.invalid['single-quotes'];
          expect(() => generateJson(mock)).toThrow();
        });
        it('should throw when encountering non string keys', () => {
          const mock = mocks.invalid['non-string-keys'];
          expect(() => generateJson(mock)).toThrow();
        });
        it('should throw when encountering unescaped control chars', () => {
          const mock = mocks.invalid['control-chars'];
          expect(() => generateJson(mock)).toThrow();
        });
        it('should throw when encountering duplicate keys', () => {
          const mock = mocks.invalid['duplicate-keys'];
          expect(() => generateJson(mock)).toThrow();
        });
      });

      describe('Parity for edge cases', () => {
        it('should handle empty arrays', () => {
          const mock = mocks.edge['empty-arrays'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it.skip('should handle null characters', () => {
          const mock = mocks.edge['null-characters'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it.skip('should handle json in strings', () => {
          const mock = mocks.edge['json-in-string'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle long strings', () => {
          const mock = mocks.edge['long-string'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle deep arrays', () => {
          const mock = mocks.edge['deep-array'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it.skip('should handle unusual structures', () => {
          const mock = mocks.edge['unusual-structures'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
        it('should handle special numbers', () => {
          const mock = mocks.edge['special-numbers'];
          expect(generateJson(mock)).toEqual(jp(mock));
        });
      });
    });

    describe(`Parsing with registered paths`, () => {
      it('should process an empty object with no registered paths', () => {
        const parsed = generateJson(mocks.simple['empty-object']);
        expect(parsed).toEqual({});
      });

      it('should process a simple key-value object with registered path', () => {
        parser.registerPath('key');
        const parsed = generateJson(mocks.simple['key-value']);
        expect(parsed).toEqual({ key: 'value' });
      });

      it('should process a simple key-value object with no registered path', () => {
        const parsed = generateJson(mocks.simple['key-value']);
        expect(parsed).toEqual({ key: 'value' });
      });

      it('should process a comprehensive object with registered paths', () => {
        parser.registerPath('number');
        parser.registerPath('string');
        parser.registerPath('array');
        parser.registerPath('object');
        const parsed = generateJson(mocks.simple['comprehensive']);

        expect(parsed).toEqual({
          number: 42,
          string: 'Hello, world!',
          array: [1, 2, 3],
          object: { nested: 'value' },
        });
      });

      it('should process a nested object with a registered nested path', () => {
        parser.registerPath('object.nested');
        const parsed = generateJson(mocks.simple['comprehensive']);
        expect(parsed).toEqual({
          object: {
            nested: 'value',
          },
        });
      });

      it('should process an array of objects with registered paths', () => {
        parser.registerPath('id');
        const parsed = generateJson(mocks.simple['records']);
        expect(parsed).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      });

      it('should process a deeply nested object with registered deep path', () => {
        parser.registerPath('deeply.nested.object.with');
        const parsed = generateJson(mocks.simple['deep']);
        expect(parsed).toEqual({
          deeply: {
            nested: {
              object: {
                with: ['an', 'array', { inside: 'it' }],
              },
            },
          },
        });
      });

      it('should handle path prefixes', () => {
        parser.registerPath('object');
        const parsed = generateJson(mocks.simple['comprehensive']);
        expect(parsed).toEqual({ object: { nested: 'value' } });
      });

      it('should process an empty array with no registered paths', () => {
        const parsed = generateJson(mocks.simple['empty-array']);
        expect(parsed).toEqual([]);
      });
    });
  });
});
