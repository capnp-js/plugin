/* @flow */

import type { UInt64 } from "@capnp-js/uint64";
import type { Node__InstanceR } from "./schema.capnp-r";

import { toHex } from "@capnp-js/uint64";

import { Node } from "./schema.capnp-r";

export type NodeIndex = { +[uuid: string]: Node__InstanceR };

export default class Visitor<T> {
  +index: NodeIndex;

  constructor(index: NodeIndex) {
    this.index = index;
  }

  visit(id: UInt64, acc: T): T {
    const node = this.index[toHex(id)];
    if (!node) {
      return acc;
    }

    let update;
    switch (node.tag()) {
    case Node.tags.file:
      update = this.file(node, acc);
      break;
    case Node.tags.struct:
      update = this.struct(node, acc);
      break;
    case Node.tags.enum:
      update = this.enum(node, acc);
      break;
    case Node.tags.interface:
      update = this.interface(node, acc);
      break;
    case Node.tags.const:
      update = this.const(node, acc);
      break;
    case Node.tags.annotation:
      update = this.annotation(node, acc);
      break;
    default: throw new Error("Unrecognized node tag.");
    }

    return update;
  }

  file(node: Node__InstanceR, acc: T): T {
    let update = acc;

    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        update = this.visit(nestedNode.getId(), update);
      });
    }

    return update;
  }

  struct(node: Node__InstanceR, acc: T): T {
    let update = acc;

    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        update = this.visit(nestedNode.getId(), update);
      });
    }

    return update;
  }

  enum(node: Node__InstanceR, acc: T): T {
    let update = acc;

    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        update = this.visit(nestedNode.getId(), update);
      });
    }

    return update;
  }

  interface(node: Node__InstanceR, acc: T): T {
    let update = acc;

    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        update = this.visit(nestedNode.getId(), update);
      });
    }

    return update;
  }

  const(node: Node__InstanceR, acc: T): T {
    let update = acc;

    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        update = this.visit(nestedNode.getId(), update);
      });
    }

    return update;
  }

  annotation(node: Node__InstanceR, acc: T): T {
    let update = acc;

    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        update = this.visit(nestedNode.getId(), update);
      });
    }

    return update;
  }
}
