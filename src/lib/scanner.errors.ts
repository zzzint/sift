export class UnrecognizedStreamValueError extends Error {
  constructor(value: unknown) {
    super(
      `Expected to received a Buffer when reading from the supplied stream, but received: ${String(
        value
      )}`
    );
  }
}

export class StreamLockedError extends Error {
  constructor() {
    super('The stream is locked and cannot be read from.');
  }
}
