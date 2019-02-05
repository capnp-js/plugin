/* @flow */

export default function flatMap<T, U>(arr: $ReadOnlyArray<T>, map: (T => Array<U>)): Array<U> {
  return arr.reduce((flat, element) => {
    return flat.concat(map(element));
  }, []);
}
