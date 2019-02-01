/* @flow */

import type { UInt64 } from "@capnp-js/uint64";
import type { NodeIndex } from "../Visitor";

import { toHex } from "@capnp-js/uint64";
import { Node } from "../schema.capnp-r";

export default function hostFile(index: NodeIndex, memberId: UInt64): null | UInt64 {
  if (memberId[0] === 0 && memberId[1] === 0) {
    return null;
  }

  let uuid = toHex(memberId);
  while (index[uuid].tag() !== Node.tags.file) {
    memberId = index[uuid].getScopeId();
    uuid = toHex(memberId);

    if (memberId[0] === 0 && memberId[1] === 0) {
      return null;
    }
  }

  return memberId;
}
