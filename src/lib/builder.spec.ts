import { Builder } from './builder';
import { UnexpectedKeyForContainer } from './builder.errors';

describe(Builder.name, () => {
  let builder: Builder;

  beforeEach(() => {
    builder = new Builder();
  });

  it('should build a simple value', () => {
    builder.addValue(null, 42);
    expect(builder.root).toBe(42);
  });

  it('should build a simple object', () => {
    builder.beginObject();
    builder.addValue('key', 'value');
    builder.endContainer();
    expect(builder.root).toEqual({ key: 'value' });
  });

  it('should build a simple array', () => {
    builder.beginArray();
    builder.addValue(null, 1);
    builder.addValue(null, 2);
    builder.addValue(null, 3);
    builder.endContainer();
    expect(builder.root).toEqual([1, 2, 3]);
  });

  it('should build a nested object', () => {
    builder.beginObject();
    builder.addValue('str', 'value');
    builder.addValue('num', 42);
    builder.beginObject('nested');
    builder.addValue('bool', true);
    builder.endContainer();
    builder.endContainer();
    expect(builder.root).toEqual({
      str: 'value',
      num: 42,
      nested: { bool: true },
    });
  });

  it('should build a nested array', () => {
    builder.beginArray();
    builder.addValue(null, 1);
    builder.beginArray();
    builder.addValue(null, 2);
    builder.addValue(null, 3);
    builder.endContainer();
    builder.addValue(null, 4);
    builder.endContainer();
    expect(builder.root).toEqual([1, [2, 3], 4]);
  });

  it('should build a complex nested structure', () => {
    builder.beginObject();
    builder.addValue('name', 'John');
    builder.beginArray('hobbies');
    builder.addValue(null, 'reading');
    builder.addValue(null, 'cycling');
    builder.endContainer();
    builder.beginObject('address');
    builder.addValue('street', 'Main St');
    builder.addValue('number', 123);
    builder.beginArray('coordinates');
    builder.addValue(null, 40.7128);
    builder.addValue(null, -74.006);
    builder.endContainer();
    builder.endContainer();
    builder.endContainer();
    expect(builder.root).toEqual({
      name: 'John',
      hobbies: ['reading', 'cycling'],
      address: {
        street: 'Main St',
        number: 123,
        coordinates: [40.7128, -74.006],
      },
    });
  });

  it('should handle null values', () => {
    builder.beginObject();
    builder.addValue('nullValue', null);
    builder.endContainer();
    expect(builder.root).toEqual({ nullValue: null });
  });

  it('should handle boolean values', () => {
    builder.beginObject();
    builder.addValue('trueValue', true);
    builder.addValue('falseValue', false);
    builder.endContainer();
    expect(builder.root).toEqual({ trueValue: true, falseValue: false });
  });

  it('should handle empty objects', () => {
    builder.beginObject();
    builder.endContainer();
    expect(builder.root).toEqual({});
  });

  it('should handle empty arrays', () => {
    builder.beginArray();
    builder.endContainer();
    expect(builder.root).toEqual([]);
  });

  it('should handle multiple endContainer calls', () => {
    builder.beginObject();
    builder.beginArray('arr');
    builder.addValue(null, 1);
    builder.endContainer();
    builder.endContainer();
    builder.endContainer(); // Extra endContainer
    expect(builder.root).toEqual({ arr: [1] });
  });

  it('should handle writing to root multiple times', () => {
    builder.addValue(null, 1);
    builder.addValue(null, 'string');
    builder.addValue(null, true);
    expect(builder.root).toBe(true);
  });

  it('should throw error when writing with key to array', () => {
    builder.beginArray();
    expect(() => builder.addValue('key', 'value')).toThrow(
      UnexpectedKeyForContainer
    );
  });

  it('should throw error when writing without key to object', () => {
    builder.beginObject();
    expect(() => builder.addValue(null, 'value')).toThrow(
      UnexpectedKeyForContainer
    );
  });
});
