export {
  Paths,
  Get,
  JsonValue as Json,
  OmitDeep,
  ArrayValues,
} from 'type-fest';
import { Paths, Get, JsonValue as Json } from 'type-fest';

export type IsArray<T> = T extends Json[] ? true : false;

export type IsObject<T> = T extends object ? true : false;

export type ArrayPaths<T> = {
  [K in Paths<T>]: Get<T, K> extends Json[] ? K : never;
}[Paths<T>];

export type ObjectPaths<T> = {
  [K in Paths<T>]: Get<T, K> extends Record<string, Json> ? K : never;
}[Paths<T>];
