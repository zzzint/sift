import { Builder } from './builder';
import { UnexpectedKeyForContainer } from './builder.errors';

describe(Builder.name, () => {
  let builder: Builder;

  beforeEach(() => {
    builder = new Builder();
  });

  it('should build a simple value', () => {
    builder.set(null, 42);
    expect(builder.root).toBe(42);
  });

  it('should build a simple object', () => {
    builder.openObject();
    builder.set('key', 'value');
    builder.closeContainer();
    expect(builder.root).toEqual({ key: 'value' });
  });

  it('should build a simple array', () => {
    builder.openArray();
    builder.set(null, 1);
    builder.set(null, 2);
    builder.set(null, 3);
    builder.closeContainer();
    expect(builder.root).toEqual([1, 2, 3]);
  });

  it('should build a nested object', () => {
    builder.openObject();
    builder.set('str', 'value');
    builder.set('num', 42);
    builder.openObject('nested');
    builder.set('bool', true);
    builder.closeContainer();
    builder.closeContainer();
    expect(builder.root).toEqual({
      str: 'value',
      num: 42,
      nested: { bool: true },
    });
  });

  it('should build a nested array', () => {
    builder.openArray();
    builder.set(null, 1);
    builder.openArray();
    builder.set(null, 2);
    builder.set(null, 3);
    builder.closeContainer();
    builder.set(null, 4);
    builder.closeContainer();
    expect(builder.root).toEqual([1, [2, 3], 4]);
  });

  it('should build a complex nested structure', () => {
    builder.openObject();
    builder.set('name', 'John');
    builder.openArray('hobbies');
    builder.set(null, 'reading');
    builder.set(null, 'cycling');
    builder.closeContainer();
    builder.openObject('address');
    builder.set('street', 'Main St');
    builder.set('number', 123);
    builder.openArray('coordinates');
    builder.set(null, 40.7128);
    builder.set(null, -74.006);
    builder.closeContainer();
    builder.closeContainer();
    builder.closeContainer();
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
    builder.openObject();
    builder.set('nullValue', null);
    builder.closeContainer();
    expect(builder.root).toEqual({ nullValue: null });
  });

  it('should handle boolean values', () => {
    builder.openObject();
    builder.set('trueValue', true);
    builder.set('falseValue', false);
    builder.closeContainer();
    expect(builder.root).toEqual({ trueValue: true, falseValue: false });
  });

  it('should handle empty objects', () => {
    builder.openObject();
    builder.closeContainer();
    expect(builder.root).toEqual({});
  });

  it('should handle empty arrays', () => {
    builder.openArray();
    builder.closeContainer();
    expect(builder.root).toEqual([]);
  });

  it('should handle multiple endContainer calls', () => {
    builder.openObject();
    builder.openArray('arr');
    builder.set(null, 1);
    builder.closeContainer();
    builder.closeContainer();
    builder.closeContainer(); // Extra endContainer
    expect(builder.root).toEqual({ arr: [1] });
  });

  it('should handle writing to root multiple times', () => {
    builder.set(null, 1);
    builder.set(null, 'string');
    builder.set(null, true);
    expect(builder.root).toBe(true);
  });

  it('should throw error when writing with key to array', () => {
    builder.openArray();
    expect(() => builder.set('key', 'value')).toThrow(
      UnexpectedKeyForContainer
    );
  });

  it('should throw error when writing without key to object', () => {
    builder.openObject();
    expect(() => builder.set(null, 'value')).toThrow(UnexpectedKeyForContainer);
  });

  describe.skip(Builder['prototype'].popObjectEntry.name, () => {
    it('should return the most recently added key/value pair', () => {
      builder.openObject();
      builder.set('k1', 'v1');
      builder.set('k2', 'v2');
      expect(builder.popObjectEntry()).toEqual({
        k2: 'v2',
      });
    });
  });
});
