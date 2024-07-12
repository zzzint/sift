import { ReadableStream } from 'stream/web';
import { Api } from './api.types';
import { Json } from 'src/util/types';
import { Scanner } from './scanner';

export const makeGenerator = <T extends Json>(
  stream: ReadableStream<Buffer>
): Api<T> => {
  const scanner = new Scanner<T>(stream);

  function builder() {
    return {
      take(path: string) {
        scanner.registerTake(path.split('.'));
        return builder();
      },
      build() {
        return scanner.scan();
      },
    };
  }

  return builder() as unknown as Api<T>;
};
