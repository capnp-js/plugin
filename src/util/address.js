/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";
import type { Node__InstanceR } from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";

import { Node } from "../schema.capnp-r";

export type Address = {|
  file: Node__InstanceR,
  classes: $ReadOnlyArray<Node__InstanceR>,
|};

export default function address(index: NodeIndex, id: UInt64): Address {
  const classes = [index[toHex(id)]];
  do {
    classes.unshift(index[toHex(classes[0].getScopeId())]);
  } while (classes[0].tag() !== Node.tags.file);
  const file = classes.shift();

  return { file, classes };
}
