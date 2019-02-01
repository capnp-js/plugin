/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";

import { nonnull } from "@capnp-js/nullary";
import { toHex } from "@capnp-js/uint64";

import { Node } from "../schema.capnp-r";

type u16 = number;

let zeroScope = null;
type ZeroScopeIndex = { [childId: string]: UInt64 };

export default function paramName(index: NodeIndex, id: UInt64, position: u16): string {
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

  const source = index[toHex(id)];
  const parameters = nonnull(source.getParameters());
  const name = nonnull(parameters.get(position).getName()).toString();

  let depth = 0;

  let scopeId = index[toHex(id)].getScopeId();
  if (scopeId[0] === 0 && scopeId[1] === 0) {
    scopeId = zeroScope[toHex(id)];
  }

  while (index[toHex(scopeId)].tag() !== Node.tags.file) {
    id = scopeId;
    scopeId = index[toHex(id)].getScopeId();
    if (scopeId[0] === 0 && scopeId[1] === 0) {
      scopeId = zeroScope[toHex(id)];
    }

    ++depth;
  }

  return `${name}_${depth}`;
}
