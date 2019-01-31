/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";

import { nonnull } from "@capnp-js/nullary";
import { toHex } from "@capnp-js/uint64";

import address from "./address";

type u16 = number;

export default function paramName(index: NodeIndex, id: UInt64, position: u16): string {
  const source = index[toHex(id)];
  const parameters = nonnull(source.getParameters());

  const name = nonnull(parameters.get(position).getName());
  const depth = address(index, id).classes.length - 1;

  return `${name.toString()}_${depth}`;
}
