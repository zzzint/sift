import { ReadableStream } from 'stream/web';
import { Api } from './api.types';
import { Json } from 'src/util/types';
import { Scanner } from './scanner';

export const makeGenerator = <T extends Json>(
  stream: ReadableStream<Buffer>
): Api<T> => {
  const scanner = new Scanner<T>(stream);

  return () => ({
    yieldEachEntry(path: string) {
      return builder();
    },
    yieldEachValue(path: string) {
      return builder();
    },

    take(path: string) {
      scanner.registerTake(path);
      return builder();
    },

    build() {
      return scanner.scan();
    },
  });
};
