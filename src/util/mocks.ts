import { ReadableStream } from 'stream/web';

export const generateMockJsonStreamFromInput = (
  json: Record<string, unknown> | Array<Record<string, unknown>>
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

export const generateMockSimpleJsonObjectStream = () => {
  return generateMockJsonStreamFromInput({ name: 'John Doe', age: 42 });
};

export const generateMockSimpleJsonArrayStream = () => {
  return generateMockJsonStreamFromInput([
    { name: 'John Doe', age: 42 },
    { name: 'Jane Doe', age: 39 },
  ]);
};

export const generateMockNestedJsonObjectStream = () => {
  return generateMockJsonStreamFromInput({
    name: 'John Doe',
    age: 42,
    children: [{ name: 'Alice Doe', age: 12 }],
  });
};

export const generateMockNestedJsonArrayStream = () => {
  return generateMockJsonStreamFromInput([
    { name: 'John Doe', age: 42, children: [{ name: 'Alice Doe', age: 12 }] },
    { name: 'Jane Doe', age: 39, children: [{ name: 'Bob Doe', age: 8 }] },
  ]);
};

export const mockJsonStrings = {
  simpleObject: '{}',
  simpleArray: '[]',
  simpleKeyValue: '{"key": "value"}',
  simpleArrayValues: '[1, 2, 3]',
  comprehensive:
    '{"number": 42, "string": "Hello, world!", "boolean": true, "null": null, "array": [1, 2, 3], "object": {"nested": "value"}}',
  records: '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}, {"id": 3, "name": "Charlie"}]',
  deeplyNested: '{"deeply": {"nested": {"object": {"with": ["an", "array", {"inside": "it"}]}}}}',
  escapes:
    '{"escapes": "\\"Quote\\", \\\\Backslash\\n, \\t Tab", "unicode": "\\u00A9 \\u2665 \\uD83D\\uDE00"}',
};
