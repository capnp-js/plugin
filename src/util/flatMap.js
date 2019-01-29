/* @flow */

export default function flatMap<T, U>(arr: Array<T>, map: (T => Array<U>)): Array<U> {
  return arr.reduce((flat, element) => {
    return flat.concat(map(element));
  }, []);
}
