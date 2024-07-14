import { ReadableStream } from 'stream/web';
import { Json } from './types';

export const generateMockJsonStreamFromInput = (
  json: Json
): ReadableStream<Buffer> => {
  const asBuffer = Buffer.from(JSON.stringify(json));
  const asStream = new ReadableStream<Buffer>({
    start(controller) {
      controller.enqueue(asBuffer);
      controller.close();
    },
  });

  return asStream;
};

export const mocks = {
  simple: {
    'empty-object': '{}',
    'empty-array': '[]',
    'key-value': '{"key": "value"}',
    'array-values': '[1, 2, 3]',
    comprehensive:
      '{"number": 42, "string": "Hello, world!", "boolean": true, "null": null, "array": [1, 2, 3], "object": {"nested": "value"}}',
    records:
      '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}, {"id": 3, "name": "Charlie"}]',
    deep: '{"deeply": {"nested": {"object": {"with": ["an", "array", {"inside": "it"}]}}}}',
  },
  nuanced: {
    'empty-strings': '{"emptyString": ""}',
    'large-numbers':
      '{"integer": 1234567890123456789, "float": 1.23456789, "scientific": 1.23e+100, "negativeScientific": -4.56e-10}',
    'deep-nesting':
      '{"a":{"b":{"c":{"d":{"e":{"f":{"g":{"h":{"i":{"j":{}}}}}}}}}}}',
    'complex-nesting':
      '{"array": [1, {"object": {"key": [1, 2, {"nested": "value"}]}}, 3], "object": {"key": [{"deeplyNested": {"value": 42}}]}}',
    'whitespace-variations':
      '{\n  "spaced" : true,\n  "indented": {\n    "value": 42\n  }\n}',
    'all-escape-sequences': '{"allEscapes": "\\b\\f\\n\\r\\t\\"\\\\/"}',
    'unicode-characters':
      '{"ascii": "Hello", "unicode": "こんにちは", "emoji": "😀🌈🌍", "mixedUnicode": "Hello, 世界！🌍"}',
  },
  invalid: {
    'trailing-comma': '{"trailingComma": [1, 2, 3, ]}',
    'leading-zeros': '{"invalid": 01234}',
    'single-quotes': "{'singleQuotes': 'invalid'}",
    'non-string-keys': '{42: "numeric key", true: "boolean key"}',
    'duplicate-keys': '{"key": "first value", "key": "second value"}',
    'unescaped-control-chars': '{"control": "This contains a bell: \u0007"}',
  },
  edge: {
    'empty-arrays': '{"emptyArrays": [[], [[]]], "emptyObjects": [{}, [{}]]}',
    'null-characters': '{"nullChar": "before\\u0000after"}',
    'extreme-numbers':
      '{"max": 1.7976931348623157e+308, "min": 5e-324, "infinity": 1e+1000}',
    'json-in-string': '{"jsonString": "{\\"nestedJson\\": true}"}',
    'long-string': '{"long": "' + 'a'.repeat(100000) + '"}',
    'deep-array': '[' + '1,'.repeat(1000) + '1]',
    'unusual-structures':
      '{"": "emptyKey", " ": "spaceKey", "a b": "keyWithSpace", "qu"ote": "keyWithQuote", "back\\\\slash": "keyWithBackslash"}',
    'special-numbers':
      '{"zero": 0, "negativeZero": -0, "fractional": 0.123, "negativeInteger": -42}',
  },
};
