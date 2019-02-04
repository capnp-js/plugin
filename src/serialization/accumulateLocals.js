/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Index from "../Index";
import type { Node__InstanceR } from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";

import Visitor from "../Visitor";

export type Locals = {
  +names: Set<string>,
  +structs: Set<string>,
  +paramStructs: Set<string>,
  +resultStructs: Set<string>,
  +interfaces: Set<string>,
  +identifiers: { [uuid: string]: string },
};

class LocalsVisitor extends Visitor<Locals> {
  struct(node: Node__InstanceR, acc: Locals): Locals {
    const baseName = this.index.getScopes(node.getId()).slice(1).map(s => s.name).join("_");
    acc.names.add(baseName);
    acc.structs.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.struct(node, acc);
  }

  enum(node: Node__InstanceR, acc: Locals): Locals {
    const baseName = this.index.getScopes(node.getId()).slice(1).map(s => s.name).join("_");
    acc.names.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.enum(node, acc);
  }

  interface(node: Node__InstanceR, acc: Locals): Locals {
    const baseName = this.index.getScopes(node.getId()).slice(1).map(s => s.name).join("_");
    acc.names.add(baseName);
    acc.interfaces.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    const methods = node.getInterface().getMethods();
    if (methods !== null) {
      methods.forEach(method => {
        const paramId = method.getParamStructType();
        const param = this.index.getNode(paramId);
        const paramScopeId = param.getScopeId();
        if (paramScopeId[0] === 0 && paramScopeId[1] === 0) {
          const baseName = this.index.getScopes(paramId).slice(1).map(s => s.name).join("_");
          acc.names.add(baseName);
          acc.paramStructs.add(baseName);
          acc.identifiers[toHex(paramId)] = baseName;
        }

        const resultId = method.getResultStructType();
        const result = this.index.getNode(resultId);
        const resultScopeId = result.getScopeId();
        if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
          const baseName = this.index.getScopes(resultId).slice(1).map(s => s.name).join("_");
          acc.names.add(baseName);
          acc.resultStructs.add(baseName);
          acc.identifiers[toHex(resultId)] = baseName;
        }
      });
    }

    return super.interface(node, acc);
  }
}

export default function accumulateLocals(index: Index, fileId: UInt64): Locals {
  return new LocalsVisitor(index).visit(fileId, {
    names: new Set(),
    structs: new Set(),
    paramStructs: new Set(),
    resultStructs: new Set(),
    interfaces: new Set(),
    identifiers: {},
  });
}
