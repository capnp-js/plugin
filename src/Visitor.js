/* @flow */

import type { UInt64 } from "@capnp-js/uint64";
import type { Node__InstanceR } from "./schema.capnp-r";

import { toHex } from "@capnp-js/uint64";
import { nonnull } from "@capnp-js/nullary";

import { Node } from "./schema.capnp-r";

export type NodeIndex = { +[uuid: string]: Node__InstanceR };

export type Scope = {
  +name: string,
  +id: UInt64,
};

export default class Visitor<T> {
  +index: NodeIndex;

  constructor(index: NodeIndex) {
    this.index = index;
  }

  visit(scopes: $ReadOnlyArray<Scope>, id: UInt64, acc: T): T {
    const node = this.index[toHex(id)];
    if (!node) {
      return acc;
    }

    let update;
    switch (node.tag()) {
    case Node.tags.file:
      update = this.file(scopes, node, acc);
      break;
    case Node.tags.struct:
      update = this.struct(scopes, node, acc);
      break;
    case Node.tags.enum:
      update = this.enum(scopes, node, acc);
      break;
    case Node.tags.interface:
      update = this.interface(scopes, node, acc);
      break;
    case Node.tags.const:
      update = this.const(scopes, node, acc);
      break;
    case Node.tags.annotation:
      update = this.annotation(scopes, node, acc);
      break;
    default: throw new Error("Unrecognized node tag.");
    }

    return update;
  }

  file(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        const update = scopes.slice(0);
        update.push({
          name: nonnull(nestedNode.getName()).toString(),
          id: nestedNode.getId(),
        });
        acc = this.visit(update, nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  struct(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        const update = scopes.slice(0);
        update.push({
          name: nonnull(nestedNode.getName()).toString(),
          id: nestedNode.getId(),
        });
        acc = this.visit(update, nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  enum(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        const update = scopes.slice(0);
        update.push({
          name: nonnull(nestedNode.getName()).toString(),
          id: nestedNode.getId(),
        });
        acc = this.visit(update, nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  interface(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        const update = scopes.slice(0);
        update.push({
          name: nonnull(nestedNode.getName()).toString(),
          id: nestedNode.getId(),
        });
        acc = this.visit(update, nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  const(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        const update = scopes.slice(0);
        update.push({
          name: nonnull(nestedNode.getName()).toString(),
          id: nestedNode.getId(),
        });
        acc = this.visit(update, nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  annotation(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        const update = scopes.slice(0);
        update.push({
          name: nonnull(nestedNode.getName()).toString(),
          id: nestedNode.getId(),
        });
        acc = this.visit(update, nestedNode.getId(), acc);
      });
    }

    return acc;
  }
}
