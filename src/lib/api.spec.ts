import { generateMockSimpleJsonObjectStream } from 'src/util/mocks';
import { makeGenerator } from './api';

describe(makeGenerator.name, () => {
  it.skip('', async () => {
    const stream = generateMockSimpleJsonObjectStream();
    const generator = makeGenerator(stream).build();

    for await (const value of generator) {
      console.log(value);
    }
  });
});
