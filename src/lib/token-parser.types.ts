/** Representative of what the parser most recently saw */
export type TokenParserState =
  | 'begin'
  | 'end'
  | 'top-level-primitive'
  | 'object-start'
  | 'object-end'
  | 'object-key'
  | 'object-colon'
  | 'object-value'
  | 'object-comma'
  | 'array-start'
  | 'array-end'
  | 'array-value'
  | 'array-comma';

/** Representative of the type of container the parser is currently operating within */
export type TokenParserMode = 'array' | 'object';
export type TokenParserYieldStrategy = 'entries' | 'values' | 'all';
