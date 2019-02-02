/* @flow */

import type { UInt64 } from "@capnp-js/uint64";
import type { Node__InstanceR } from "./schema.capnp-r";

import Index from "./Index";
import { Node } from "./schema.capnp-r";

export default class Visitor<T> {
  +index: Index;

  constructor(index: Index) {
    this.index = index;
  }

  visit(id: UInt64, acc: T): T {
    const node = this.index.getNode(id);
    if (!node) {
      return acc;
    }

    switch (node.tag()) {
    case Node.tags.file:
      acc = this.file(node, acc);
      break;
    case Node.tags.struct:
      acc = this.struct(node, acc);
      break;
    case Node.tags.enum:
      acc = this.enum(node, acc);
      break;
    case Node.tags.interface:
      acc = this.interface(node, acc);
      break;
    case Node.tags.const:
      acc = this.const(node, acc);
      break;
    case Node.tags.annotation:
      acc = this.annotation(node, acc);
      break;
    default: throw new Error("Unrecognized node tag.");
    }

    return acc;
  }

  file(node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        acc = this.visit(nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  struct(node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        acc = this.visit(nestedNode.getId(), acc);
      });
    }

    /* I don't iterate through the struct's groups in case some subclass chooses
       to ignore them. */

    return acc;
  }

  enum(node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        acc = this.visit(nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  interface(node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        acc = this.visit(nestedNode.getId(), acc);
      });
    }

    /* I don't iterate through the interfaces param nor result structs in case
       some subclass chooses to ignore them. */

    return acc;
  }

  const(node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        acc = this.visit(nestedNode.getId(), acc);
      });
    }

    return acc;
  }

  annotation(node: Node__InstanceR, acc: T): T {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        acc = this.visit(nestedNode.getId(), acc);
      });
    }

    return acc;
  }
}
