import { isObject } from 'src/util';
import { BuilderKey } from './builder.types';
import { UnexpectedKeyForContainer } from './builder.errors';
import { Json } from 'src/util/types';

/** For dynamically constructing Json-like structures. */
export class Builder {
  /** The root of the Json structure being built. */
  #root: Json = null;
  /** A stack to keep track of nested structures during building. */
  #stack: Array<{ key: BuilderKey; value: Json }> = [];

  public get root(): Json {
    return this.#root;
  }

  public addValue(key: BuilderKey = null, value: Json) {
    if (this.#stack.length === 0) return this.setRootValue(value);

    this.addValueToParent(this.currentParent, key, value);
    if (this.isObjectOrArray(value)) this.#stack.push({ value, key });
  }

  public beginArray(key: BuilderKey = null) {
    const newArray: Json[] = [];
    this.addValue(key, newArray);
  }

  public beginObject(key: BuilderKey = null) {
    const newObject: Json = {};
    this.addValue(key, newObject);
  }

  public endContainer() {
    if (this.#stack.length > 0) {
      this.#stack.pop();
    }
  }

  private setRootValue(value: Json) {
    this.#root = value;
    if (this.isObjectOrArray(value)) {
      this.#stack.push({ value, key: null });
    }
  }

  private get currentParent() {
    return this.#stack[this.#stack.length - 1].value;
  }

  private addValueToParent(parent: Json, key: BuilderKey, value: Json) {
    if (Array.isArray(parent)) this.addValueToArray(parent, key, value);
    else if (isObject(parent)) this.addValueToObject(parent, key, value);
  }

  private addValueToArray(array: Json[], key: BuilderKey, value: Json) {
    if (key !== null) throw new UnexpectedKeyForContainer(key, 'array');
    array.push(value);
  }

  private addValueToObject(obj: Json, key: BuilderKey, value: Json) {
    if (key === null) throw new UnexpectedKeyForContainer(key, 'object');
    obj[key] = value;
  }

  private isObjectOrArray(value: Json) {
    return typeof value === 'object' && value !== null;
  }
}
