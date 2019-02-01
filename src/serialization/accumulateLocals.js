/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex, Scope } from "../Visitor";
import type { Node__InstanceR } from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";

import Visitor from "../Visitor";

export type Locals = {
  +names: Set<string>,
  +structs: Set<string>,
  +interfaces: Set<string>,
  +identifiers: { [uuid: string]: string },
};

class LocalsVisitor extends Visitor<Locals> {
  struct(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: Locals): Locals {
    const baseName = scopes.map(s => s.name).join("_");
    acc.names.add(baseName);
    acc.structs.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.struct(scopes, node, acc);
  }

  enum(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: Locals): Locals {
    const baseName = scopes.map(s => s.name).join("_");
    acc.names.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.enum(scopes, node, acc);
  }

  interface(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: Locals): Locals {
    const baseName = scopes.map(s => s.name).join("_");
    acc.names.add(baseName);
    acc.interfaces.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.interface(scopes, node, acc);
  }
}

export default function accumulateLocals(index: NodeIndex, fileId: UInt64): Locals {
  return new LocalsVisitor(index).visit([], fileId, {
    names: new Set(),
    structs: new Set(),
    interfaces: new Set(),
    identifiers: {},
  });
}
