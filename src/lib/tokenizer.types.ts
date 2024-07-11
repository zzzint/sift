export type Token =
  | { kind: 'eof' }
  | { kind: 'null' }
  | { kind: 'bool'; value: boolean }
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'object-start' }
  | { kind: 'object-end' }
  | { kind: 'array-start' }
  | { kind: 'array-end' }
  | { kind: 'comma' }
  | { kind: 'colon' };

export type TypeOfToken<T extends Token['kind']> = Extract<Token, { kind: T }>;

export type PrimitiveToken =
  | TypeOfToken<'string'>
  | TypeOfToken<'number'>
  | TypeOfToken<'bool'>
  | TypeOfToken<'null'>;

export enum TokenizerState {
  Yielded = 'Yielded',
  YieldableString = 'YieldableString',
  YieldableNumber = 'YieldableNumber',
  YieldableTrue = 'YieldableTrue',
  YieldableFalse = 'YieldableFalse',
  YieldableNull = 'YieldableNull',
  PartialString = 'PartialString',
  PartialNumber = 'PartialNumber',
  PartialTrue1 = 'PartialTrue1',
  PartialTrue2 = 'PartialTrue2',
  PartialTrue3 = 'PartialTrue3',
  PartialFalse1 = 'PartialFalse1',
  PartialFalse2 = 'PartialFalse2',
  PartialFalse3 = 'PartialFalse3',
  PartialFalse4 = 'PartialFalse4',
  PartialNull1 = 'PartialNull1',
  PartialNull2 = 'PartialNull2',
  PartialNull3 = 'PartialNull3',
  EscapedChar = 'EscapedChar',
}

export enum Utf8 {
  Ampersand = 0x26, // &
  Apostrophe = 0x27, // '
  Asterisk = 0x2a, // *
  Backspace = 0x8, // "\b"
  CarriageReturn = 0xd, // "\r"
  CircumflexAccent = 0x5e, // ^
  Colon = 0x3a, // =
  Comma = 0x2c, // ,
  CommercialAt = 0x40, // @
  DigitEight = 0x38, // 8
  DigitFive = 0x35, // 5
  DigitFour = 0x34, // 4
  DigitNine = 0x39, // 9
  DigitOne = 0x31, // 1
  DigitSeven = 0x37, // 7
  DigitSix = 0x36, // 6
  DigitThree = 0x33, // 3
  DigitTwo = 0x32, // 2
  DigitZero = 0x30, // 0
  DollarSign = 0x24, // $
  EqualsSign = 0x3d, // =
  ExclamationMark = 0x21, // !
  FormFeed = 0xc, // "\f"
  FullStop = 0x2e, // .
  GraveAccent = 0x60, // `
  GreaterThanSign = 0x3e, // >
  HyphenMinus = 0x2d, // -
  LatinCapitalLetterA = 0x41, // A
  LatinCapitalLetterB = 0x42, // B
  LatinCapitalLetterC = 0x43, // C
  LatinCapitalLetterD = 0x44, // D
  LatinCapitalLetterE = 0x45, // E
  LatinCapitalLetterF = 0x46, // F
  LatinCapitalLetterG = 0x47, // G
  LatinCapitalLetterH = 0x48, // H
  LatinCapitalLetterI = 0x49, // I
  LatinCapitalLetterJ = 0x4a, // J
  LatinCapitalLetterK = 0x4b, // K
  LatinCapitalLetterL = 0x4c, // L
  LatinCapitalLetterM = 0x4d, // M
  LatinCapitalLetterN = 0x4e, // N
  LatinCapitalLetterO = 0x4f, // O
  LatinCapitalLetterP = 0x50, // P
  LatinCapitalLetterQ = 0x51, // Q
  LatinCapitalLetterR = 0x52, // R
  LatinCapitalLetterS = 0x53, // S
  LatinCapitalLetterT = 0x54, // T
  LatinCapitalLetterU = 0x55, // U
  LatinCapitalLetterV = 0x56, // V
  LatinCapitalLetterW = 0x57, // W
  LatinCapitalLetterX = 0x58, // X
  LatinCapitalLetterY = 0x59, // Y
  LatinCapitalLetterZ = 0x5a, // Z
  LatinSmallLetterA = 0x61, // a
  LatinSmallLetterB = 0x62, // b
  LatinSmallLetterC = 0x63, // c
  LatinSmallLetterD = 0x64, // d
  LatinSmallLetterE = 0x65, // e
  LatinSmallLetterF = 0x66, // f
  LatinSmallLetterG = 0x67, // g
  LatinSmallLetterH = 0x68, // h
  LatinSmallLetterI = 0x69, // i
  LatinSmallLetterJ = 0x6a, // j
  LatinSmallLetterK = 0x6b, // k
  LatinSmallLetterL = 0x6c, // l
  LatinSmallLetterM = 0x6d, // m
  LatinSmallLetterN = 0x6e, // n
  LatinSmallLetterO = 0x6f, // o
  LatinSmallLetterP = 0x70, // p
  LatinSmallLetterQ = 0x71, // q
  LatinSmallLetterR = 0x72, // r
  LatinSmallLetterS = 0x73, // s
  LatinSmallLetterT = 0x74, // t
  LatinSmallLetterU = 0x75, // u
  LatinSmallLetterV = 0x76, // v
  LatinSmallLetterW = 0x77, // w
  LatinSmallLetterX = 0x78, // x
  LatinSmallLetterY = 0x79, // y
  LatinSmallLetterZ = 0x7a, // z
  LeftCurlyBracket = 0x7b, // {
  LeftParenthesis = 0x28, // (
  LeftSquareBracket = 0x5b, // [
  LessThanSign = 0x3c, //
  LowLine = 0x5f, // _
  Newline = 0xa, // "\n"
  NumberSign = 0x23, // #
  PercentSign = 0x25, // %
  PlusSign = 0x2b, // +
  QuestionMark = 0x3f, // ?
  QuotationMark = 0x22, // "
  ReverseSolidus = 0x5c, // \
  RightCurlyBracket = 0x7d, // }
  RightParenthesis = 0x29, // )
  RightSquareBracket = 0x5d, // ]
  Semicolon = 0x3b, // ;
  Solidus = 0x2f, // /
  Space = 0x20, //
  Tab = 0x9, // "\t"
  Tilde = 0x7e, // ~
  VerticalLine = 0x7c, // |
}
