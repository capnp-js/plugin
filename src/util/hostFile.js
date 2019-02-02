/* @flow */

import type { UInt64 } from "@capnp-js/uint64";
import type Index from "../Index";

export default function hostFile(index: Index, memberId: UInt64): null | UInt64 {
  if (memberId[0] === 0 && memberId[1] === 0) {
    return null;
  }

  return index.getScopes(memberId)[0].node.getScopeId();
}
