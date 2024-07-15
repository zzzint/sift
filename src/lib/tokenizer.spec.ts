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

    it('should process special numbers', () => {
      const gen = tokenizer.write(Buffer.from(mocks.edge['special-numbers']));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-start' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'zero' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: 0 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'negativeZero' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: -0 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'fractional' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'number', value: 0.123 })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'comma' }));
      expect(gen.next().value).toStrictEqual(
        t({ kind: 'string', value: 'negativeInteger' })
      );
      expect(gen.next().value).toStrictEqual(t({ kind: 'colon' }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'number', value: -42 }));
      expect(gen.next().value).toStrictEqual(t({ kind: 'object-end' }));
    });
  });
});

const t = (token: Token) => token;
