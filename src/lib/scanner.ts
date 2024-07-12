import { Tokenizer } from './tokenizer';
import { ReadableStream, TransformStream } from 'stream/web';
import {
  StreamLockedError,
  UnrecognizedStreamValueError,
} from './scanner.errors';
import { TokenParser } from './token-parser';
import { Token } from './tokenizer.types';
import { Json } from 'src/util/types';

/* For reading, transforming and incrementally yielding parts of a UTF-8 encoded Json stream. */
export class Scanner<T extends Json> {
  constructor(private stream: ReadableStream<Buffer>) {}

  #parser = new TokenParser();
  #tokenizer = new Tokenizer();

  public registerTake(path: string[]): void {
    this.#parser.registerPath(path);
  }

  public async *scan(): AsyncGenerator<T> {
    if (this.stream.locked) throw new StreamLockedError();

    const stream = this.stream
      .pipeThrough(this.validate)
      .pipeThrough(this.tokenize)
      .pipeThrough(this.parse)
      .pipeThrough(this.output);

    for await (const value of stream) {
      yield value;
    }
  }

  /** A transform stream over an unknown stream ensuring each chunk is a buffer. */
  public get validate(): TransformStream<unknown, Buffer> {
    return new TransformStream<unknown, Buffer>({
      async transform(unknown, controller) {
        if (Buffer.isBuffer(unknown)) controller.enqueue(unknown);
        else controller.error(UnrecognizedStreamValueError);
      },
    });
  }

  /** A transform stream over a byte stream of JSON that tokenizes the bytes. */
  public get tokenize(): TransformStream<Buffer, Generator<Token>> {
    const tokenizer = this.#tokenizer;
    return new TransformStream<Buffer, Generator<Token>>({
      async transform(buffer, controller) {
        controller.enqueue(tokenizer.write(buffer));
      },
    });
  }

  /** A transform stream over a stream of raw tokens that filters for data desired in the output.  */
  public get parse(): TransformStream<Generator<Token>, Json> {
    const parser = this.#parser;
    return new TransformStream<Generator<Token>, Json>({
      async transform(tokens, controller) {
        const generator = parser.write(tokens);
        for (const value of generator) {
          controller.enqueue(value);
        }
      },
    });
  }

  /** A transform stream over a stream of JSON objects that shapes the data into the final output. */
  public get output(): TransformStream<Json, T> {
    return new TransformStream<Json, T>({
      async transform(json, controller) {
        controller.enqueue(json as T);
      },
    });
  }
}
