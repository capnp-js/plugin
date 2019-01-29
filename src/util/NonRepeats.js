/* @flow */

type uint = number;

export default class NonRepeats<T> {
  +array: $ReadOnlyArray<T>;
  position: uint;

  constructor(array: $ReadOnlyArray<T>) {
    this.array = array;
    this.position = 0;
  }

  next(): IteratorResult<T, void> {
    if (this.position >= this.array.length) {
      return { done: true };
    }

    const value = this.array[this.position];
    do {
      ++this.position;
    } while (this.array[this.position] === value);

    return { done: false, value };
  }
}
