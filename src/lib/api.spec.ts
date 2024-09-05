import { makeGenerator as makeTheThing } from './api';
import { generateMockJsonStreamFromInput } from 'src/util/mocks';

// Incrementally process a stream of JSON
// Pick and choose in a type safe way what you want to be restreamed out to you

type Transaction = {
  id: string;
  accountId: string;
  instrumentId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;

  parents: {
    Account: {
      id: string;
      type: 'BROKERAGE' | 'SWAP';
    };

    Instrument: {
      id: string;
      type: 'FUTURE' | 'OPTION';
    };
  };

  children: {
    Fees: {
      id: string;
      type: 'WIRE_CHARGE' | 'COMMISSION';
      price: number;
      transactionId: string;
    }[];
  };
};

describe(makeTheThing.name, () => {
  it.skip('', async () => {
    const stream = generateMockJsonStreamFromInput({ num: 10, str: 'str' });

    const topLevelValues = makeTheThing<{ name: string; age: number }[]>(stream)
      .yieldEachValue('*')
      .take('age')
      .build();

    for await (const value of topLevelValues) {
      console.log(value);
    }

    const topLevelEntries = makeTheThing<{ name: string; age: number }>(stream)
      .yieldEachEntry('*')
      .take('age')
      .build();

    for await (const value of topLevelEntries) {
      console.log(value);
    }

    const nestedValues = makeTheThing<Transaction>(stream)
      .yieldEachValue('children.Fees')
      .take('price')
      .take('transactionId')
      .build();

    for await (const value of nestedValues) {
      console.log(value);
    }

    const nestedEntries = makeTheThing<Transaction>(stream)
      .yieldEachEntry('parents.Account')
      .take('id')
      .build();

    for await (const value of nestedEntries) {
      console.log(value);
    }
  });
});
