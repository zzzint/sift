import { isObject } from 'src/util';
import { BuilderKey } from './builder.types';
import {
  KeyAlreadyInObject,
  UnexpectedKeyForContainer,
} from './builder.errors';
import { Json } from 'src/util/types';

// TODO: Explore storing object key-value pairs as tuples until they need to be yielded/popped

/** For dynamically constructing Json-like structures. */
export class Builder {
  /** The root of the Json structure being built. */
  #root: Json = null;
  /** A stack to keep track of nested structures during building. */
  #stack: Array<{ key: BuilderKey; value: Json }> = [];

  public get root(): Json {
    return this.#root;
  }

  public set(key: BuilderKey = null, value: Json) {
    if (this.#stack.length === 0) return this.setRootValue(value);

    this.addValueToHead(this.head, key, value);
    if (this.isObjectOrArray(value)) this.#stack.push({ value, key });
  }

  public openArray(key: BuilderKey = null) {
    const newArray: Json[] = [];
    this.set(key, newArray);
  }

  public openObject(key: BuilderKey = null) {
    const newObject: Json = {};
    this.set(key, newObject);
  }

  public closeContainer() {
    if (this.#stack.length > 0) this.#stack.pop();
  }

  /** Pop and return the most recent key/value pair from the current stack if it's an object */
  public popObjectEntry() {
    if (this.#stack.length === 0) return;
    if (Array.isArray(this.head)) return;
    if (!isObject(this.head)) return;
    const obj = this.head as Record<string, Json>;
  }

  public popArrayValue() {
    if (this.#stack.length === 0) return;
    if (!Array.isArray(this.head)) return;
    const arr = this.head;
  }

  private get head() {
    return this.#stack[this.#stack.length - 1].value;
  }

  private setRootValue(value: Json) {
    this.#root = value;
    if (this.isObjectOrArray(value)) this.#stack.push({ value, key: null });
  }

  private addValueToHead(parent: Json, key: BuilderKey, value: Json) {
    if (Array.isArray(parent)) this.addValueToArray(parent, key, value);
    else if (isObject(parent)) this.addValueToObject(parent, key, value);
  }

  private addValueToArray(array: Json[], key: BuilderKey, value: Json) {
    if (key !== null) throw new UnexpectedKeyForContainer(key, 'array');
    array.push(value);
  }

  private addValueToObject(obj: Json & object, key: BuilderKey, value: Json) {
    if (key === null) throw new UnexpectedKeyForContainer(key, 'object');
    // TODO: This should ideally be the responsibility of the parser.
    if (key in obj) throw new KeyAlreadyInObject(key);
    obj[key] = value;
  }

  private isObjectOrArray(value: Json) {
    return typeof value === 'object' && value !== null;
  }
}
