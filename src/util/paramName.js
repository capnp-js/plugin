/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Index from "../Index";

import { nonnull } from "@capnp-js/nullary";

type u16 = number;

export default function paramName(index: Index, id: UInt64, position: u16): string {
  const source = index.getNode(id);
  const parameters = nonnull(source.getParameters());
  const name = nonnull(parameters.get(position).getName()).toString();
  const depth = index.getScopes(id).length - 1;

  return `${name}_${depth}`;
}
