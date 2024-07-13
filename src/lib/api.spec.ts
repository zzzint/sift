import { generateMockJsonStreamFromInput } from 'src/util/mocks';
import { makeGenerator } from './api';

describe(makeGenerator.name, () => {
  it.skip('', async () => {
    const stream = generateMockJsonStreamFromInput({ num: 10, str: 'str' });
    const generator = makeGenerator<{ num: number; str: string }>(
      stream
    ).build();

    for await (const value of generator) {
      console.log(value);
    }
  });
});
