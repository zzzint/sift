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

      it('Can process an empty object', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.simpleObject));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.simpleObject));
      });

      it('Can process an empty array', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.simpleArray));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.simpleArray));
      });

      it('Can process an object containing a single key and value', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.simpleKeyValue));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.simpleKeyValue));
      });

      it('Can process an object containing string, number, boolean, null, and nested values', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.comprehensive));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.comprehensive));
      });

      it('Can process an array of records', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.records));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.records));
      });

      it.skip('Can process a heavily escaped string', () => {
        const tokens = tokenizer.write(from(mockJsonStrings.escapes));
        const parsed = parser.write(tokens);

        expect(parsed.next().value).toEqual(jp(mockJsonStrings.escapes));
      });
    });
  });
});
