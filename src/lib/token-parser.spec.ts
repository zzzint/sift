import { mockJsonStrings } from 'src/util/mocks';
import { TokenParser } from './token-parser';
import { Tokenizer } from './tokenizer';

describe(TokenParser.name, () => {
  describe(TokenParser['prototype'].write.name, () => {
    let parser: TokenParser;

    beforeEach(() => {
      parser = new TokenParser();
    });

    const tokenizeAndGenerateJson = (json: string) => {
      const tokenizer = new Tokenizer();
      const tokens = tokenizer.write(Buffer.from(json));
      return parser.write(tokens);
    };

    describe(`${JSON.parse.name} parity`, () => {
      const jp = JSON.parse;

      it('should process an empty object', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.simpleObject);
        expect(gen.next().value).toEqual(jp(mockJsonStrings.simpleObject));
      });

      it('should process an empty array', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.simpleArray);
        expect(gen.next().value).toEqual(jp(mockJsonStrings.simpleArray));
      });

      it('should process an object containing a single key and value', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.simpleKeyValue);
        expect(gen.next().value).toEqual(jp(mockJsonStrings.simpleKeyValue));
      });

      it('should process an object containing string, number, boolean, null, and nested values', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.comprehensive);
        expect(gen.next().value).toEqual(jp(mockJsonStrings.comprehensive));
      });

      it('should process an array of records', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.records);
        expect(gen.next().value).toEqual(jp(mockJsonStrings.records));
      });

      it.skip('should process a heavily escaped string', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.escapes);
        expect(gen.next().value).toEqual(jp(mockJsonStrings.escapes));
      });

      it('should process a deeply nested object', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.deeplyNested);
        expect(gen.next().value).toEqual(jp(mockJsonStrings.deeplyNested));
      });
    });

    describe(`Parsing with registered paths`, () => {
      it('should process an empty object with no registered paths', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.simpleObject);
        expect(gen.next().value).toEqual({});
      });

      it('should process a simple key-value object with registered path', () => {
        parser.registerPath('key');
        const gen = tokenizeAndGenerateJson(mockJsonStrings.simpleKeyValue);
        expect(gen.next().value).toEqual({ key: 'value' });
      });

      it('should process a simple key-value object with no registered path', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.simpleKeyValue);
        expect(gen.next().value).toEqual({ key: 'value' });
      });

      it('should process a comprehensive object with registered paths', () => {
        parser.registerPath('number');
        parser.registerPath('string');
        parser.registerPath('array');
        parser.registerPath('object');
        const gen = tokenizeAndGenerateJson(mockJsonStrings.comprehensive);

        expect(gen.next().value).toEqual({
          number: 42,
          string: 'Hello, world!',
          array: [1, 2, 3],
          object: { nested: 'value' },
        });
      });

      it('should process a nested object with a registered nested path', () => {
        parser.registerPath('object.nested');
        const gen = tokenizeAndGenerateJson(mockJsonStrings.comprehensive);
        expect(gen.next().value).toEqual({
          object: {
            nested: 'value',
          },
        });
      });

      it('should process an array of objects with registered paths', () => {
        parser.registerPath('id');
        const gen = tokenizeAndGenerateJson(mockJsonStrings.records);
        expect(gen.next().value).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
      });

      it('should process a deeply nested object with registered deep path', () => {
        parser.registerPath('deeply.nested.object.with');
        const gen = tokenizeAndGenerateJson(mockJsonStrings.deeplyNested);
        expect(gen.next().value).toEqual({
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
        const gen = tokenizeAndGenerateJson(mockJsonStrings.comprehensive);
        expect(gen.next().value).toEqual({ object: { nested: 'value' } });
      });

      it('should process an empty array with no registered paths', () => {
        const gen = tokenizeAndGenerateJson(mockJsonStrings.simpleArray);
        expect(gen.next().value).toEqual([]);
      });
    });
  });
});
