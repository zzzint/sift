import { Scanner } from './scanner';
import { generateMockSimpleJsonObjectStream } from 'src/util/mocks';

describe(Scanner.name, () => {
  it.skip('Iterates over a stream containing a non-nested JSON object', async () => {
    const stream = generateMockSimpleJsonObjectStream();
    const sifter = new Scanner(stream);
    const result = [];

    for await (const token of sifter.scan()) {
      result.push(token);
    }
  });
});
