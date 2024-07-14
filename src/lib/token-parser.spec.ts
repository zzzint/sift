import { mockJsonStrings } from 'src/util/mocks';
import { TokenParser } from './token-parser';
import { Tokenizer } from './tokenizer';

describe(TokenParser.name, () => {
  describe(TokenParser['prototype'].write.name, () => {
    describe(`${JSON.parse.name} parity`, () => {
      let parser: TokenParser;
      let tokenizer: Tokenizer;

      const jp = JSON.parse;
      const from = Buffer.from;

      beforeEach(() => {
        parser = new TokenParser();
        tokenizer = new Tokenizer();
      });

      it('should process an empty object', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.simpleObject));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.simpleObject));
      });

      it('should process an empty array', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.simpleArray));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.simpleArray));
      });

      it('should process an object containing a single key and value', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.simpleKeyValue));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.simpleKeyValue));
      });

      it('should process an object containing string, number, boolean, null, and nested values', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.comprehensive));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.comprehensive));
      });

      it('should process an array of records', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.records));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.records));
      });

      it.skip('should process a heavily escaped string', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.escapes));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.escapes));
      });

      it('should process a deeply nested object', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.deeplyNested));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.deeplyNested));
      });
    });

    describe(`Parsing with registered paths`, () => {
      let parser: TokenParser;

      beforeEach(() => {
        parser = new TokenParser();
      });

      const parseJson = (json: string) => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.write(Buffer.from(json));
        return parser.write(tokens).next().value;
      };

      it('should process an empty object with no registered paths', () => {
        const result = parseJson(mockJsonStrings.simpleObject);
        expect(result).toEqual({});
      });

      it('should process a simple key-value object with registered path', () => {
        parser.registerPath('key');
        const result = parseJson(mockJsonStrings.simpleKeyValue);
        expect(result).toEqual({ key: 'value' });
      });

      it('should process a simple key-value object with no registered path', () => {
        const result = parseJson(mockJsonStrings.simpleKeyValue);
        expect(result).toEqual({ key: 'value' });
      });

      it('should process a comprehensive object with registered paths', () => {
        parser.registerPath('number');
        parser.registerPath('string');
        parser.registerPath('array');
        parser.registerPath('object');
        const result = parseJson(mockJsonStrings.comprehensive);

        expect(result).toEqual({
          number: 42,
          string: 'Hello, world!',
          array: [1, 2, 3],
          object: { nested: 'value' },
        });
      });

      it('should process a nested object with a registered nested path', () => {
        parser.registerPath('object.nested');
        const result = parseJson(mockJsonStrings.comprehensive);
        expect(result).toEqual({
          object: {
            nested: 'value',
          },
        });
      });

      it('should process an array of objects with registered paths', () => {
        parser.registerPath('id');
        const result = parseJson(mockJsonStrings.records);
        expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      });

      it('should process a deeply nested object with registered deep path', () => {
        parser.registerPath('deeply.nested.object.with');
        const result = parseJson(mockJsonStrings.deeplyNested);
        expect(result).toEqual({
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
        const result = parseJson(mockJsonStrings.comprehensive);
        expect(result).toEqual({ object: { nested: 'value' } });
      });

      it('should process an empty array with no registered paths', () => {
        const result = parseJson(mockJsonStrings.simpleArray);
        expect(result).toEqual([]);
      });
    });
  });
});
