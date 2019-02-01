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

let zeroScope = null;
type ZeroScopeIndex = { [childId: string]: UInt64 };

export default function address(index: NodeIndex, id: UInt64): Address {
  if (zeroScope === null) {
    zeroScope = {};
    for (let uuid in index) {
      const node = index[uuid];
      if (node.tag() === Node.tags.interface) {
        const methods = node.getInterface().getMethods();
        if (methods !== null) {
          methods.forEach(method => {
            const paramNode = index[toHex(method.getParamStructType())];
            const paramScopeId = paramNode.getScopeId();
            if (paramScopeId[0] === 0 && paramScopeId[1] === 0) {
              ((zeroScope: any): ZeroScopeIndex)[toHex(paramNode.getId())] = node.getId(); // eslint-disable-line flowtype/no-weak-types
            }

            const resultNode = index[toHex(method.getResultStructType())];
            const resultScopeId = resultNode.getScopeId();
            if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
              ((zeroScope: any): ZeroScopeIndex)[toHex(resultNode.getId())] = node.getId(); // eslint-disable-line flowtype/no-weak-types
            }
          });
        }
      }
    }
  }

  const classes = [index[toHex(id)]];
  do {
    let scopeId = classes[0].getScopeId();
    if (scopeId[0] === 0 && scopeId[1] === 0) {
      scopeId = zeroScope[toHex(classes[0].getId())];
    }

    classes.unshift(index[toHex(scopeId)]);
  } while (classes[0].tag() !== Node.tags.file);

  const file = classes.shift();

  return { file, classes };
}
