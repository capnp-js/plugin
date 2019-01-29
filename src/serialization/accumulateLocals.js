/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";
import type { Node__InstanceR } from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";

import Visitor from "../Visitor";
import address from "../util/address";
import unprefixName from "../util/unprefixName";

export type Locals = {
  +names: Set<string>,
  +identifiers: { [uuid: string]: string },
};

class LocalsVisitor extends Visitor<Locals> {
  struct(node: Node__InstanceR, acc: Locals): Locals {
    const baseName = address(this.index, node.getId()).classes.map(unprefixName).join("_");
    acc.names.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.struct(node, acc);
  }

  enum(node: Node__InstanceR, acc: Locals): Locals {
    const baseName = address(this.index, node.getId()).classes.map(unprefixName).join("_");
    acc.names.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.enum(node, acc);
  }

  interface(node: Node__InstanceR, acc: Locals): Locals {
    const baseName = address(this.index, node.getId()).classes.map(unprefixName).join("_");
    acc.names.add(baseName);
    acc.identifiers[toHex(node.getId())] = baseName;

    return super.interface(node, acc);
  }
}

export default function accumulateLocals(index: NodeIndex, fileId: UInt64): Locals {
  return new LocalsVisitor(index).visit(fileId, {
    names: new Set(),
    identifiers: {},
  });
}
