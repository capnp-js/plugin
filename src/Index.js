/* @flow */

import type { StructListR } from "@capnp-js/reader-core";
import type { UInt64 } from "@capnp-js/uint64";

import type { Node__InstanceR } from "./schema.capnp-r";

import { nonnull } from "@capnp-js/nullary";
import { toHex } from "@capnp-js/uint64";

import { Field, Node } from "./schema.capnp-r";

export type Scope = {
  +name: string,
  +node: Node__InstanceR,
};

type ScopesIndex = { [uuid: string]: $ReadOnlyArray<Scope> };

class BootstrapVisitor {
  +nodesIndex: { [uuid: string]: Node__InstanceR };

  constructor(nodes: StructListR<Node__InstanceR>) {
    this.nodesIndex = {};
    nodes.forEach(node => {
      this.nodesIndex[toHex(node.getId())] = node;
    });
  }

  visit(scopes: $ReadOnlyArray<Scope>, id: UInt64, scopesIndex: ScopesIndex): void {
    const node = this.nodesIndex[toHex(id)];
    if (!node) {
      return;
    }

    switch (node.tag()) {
    case Node.tags.file:
      this.file(scopes, node, scopesIndex);
      break;
    case Node.tags.struct:
      this.struct(scopes, node, scopesIndex);
      break;
    case Node.tags.enum:
      this.enum(scopes, node, scopesIndex);
      break;
    case Node.tags.interface:
      this.interface(scopes, node, scopesIndex);
      break;
    case Node.tags.const:
      this.const(scopes, node, scopesIndex);
      break;
    case Node.tags.annotation:
      this.annotation(scopes, node, scopesIndex);
      break;
    default: throw new Error("Unrecognized node tag.");
    }

    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      nestedNodes.forEach(nestedNode => {
        const name = nonnull(nestedNode.getName()).toString();
        const id = nestedNode.getId();
        const nestedScope = scopes.slice(0);
        nestedScope.push({
          name,
          node: this.nodesIndex[toHex(id)],
        });

        this.visit(nestedScope, id, scopesIndex);
      });
    }
  }

  file(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, scopesIndex: ScopesIndex): void {
    const uuid = toHex(node.getId());
    scopesIndex[uuid] = scopes;
  }

  struct(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, scopesIndex: ScopesIndex): void {
    const uuid = toHex(node.getId());
    scopesIndex[uuid] = scopes;

    const fields = node.getStruct().getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          const name = nonnull(field.getName()).toString();
          const id = field.getGroup().getTypeId();
          const groupScope = scopes.slice(0);
          groupScope.push({
            name,
            node: this.nodesIndex[toHex(id)],
          });

          this.visit(groupScope, id, scopesIndex);
        }
      });
    }
  }

  enum(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, scopesIndex: ScopesIndex): void {
    const uuid = toHex(node.getId());
    scopesIndex[uuid] = scopes;
  }

  interface(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, scopesIndex: ScopesIndex): void {
    const uuid = toHex(node.getId());
    scopesIndex[uuid] = scopes;

    const methods = node.getInterface().getMethods();
    if (methods !== null) {
      methods.forEach(method => {
        const paramId = method.getParamStructType();
        const param = this.nodesIndex[toHex(paramId)];
        const paramScopeId = param.getScopeId();
        if (paramScopeId[0] === 0 && paramScopeId[1] === 0) {
          const name = nonnull(method.getName()).toString();
          const methodScope = scopes.slice(0);
          methodScope.push({
            name,
            node: this.nodesIndex[toHex(paramId)],
          });

          this.visit(methodScope, paramId, scopesIndex);
        }

        const resultId = method.getResultStructType();
        const result = this.nodesIndex[toHex(resultId)];
        const resultScopeId = result.getScopeId();
        if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
          const name = nonnull(method.getName()).toString();
          const methodScope = scopes.slice(0);
          methodScope.push({
            name,
            node: this.nodesIndex[toHex(resultId)],
          });

          this.visit(methodScope, resultId, scopesIndex);
        }
      });
    }
  }

  const(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, scopesIndex: ScopesIndex): void {
    const uuid = toHex(node.getId());
    scopesIndex[uuid] = scopes;
  }

  annotation(scopes: $ReadOnlyArray<Scope>, node: Node__InstanceR, scopesIndex: ScopesIndex): void {
    const uuid = toHex(node.getId());
    scopesIndex[uuid] = scopes;
  }
}

//TODO: + variance on indexer.
export type ReadOnlyScopesIndex = { [uuid: string]: $ReadOnlyArray<Scope> };

export default class Index {
  +scopesIndex: ReadOnlyScopesIndex;

  constructor(nodes: null | StructListR<Node__InstanceR>) {
    this.scopesIndex = {};
    if (nodes !== null) {
      const visitor = new BootstrapVisitor(nodes);
      nodes.forEach(node => {
        if (node.tag() === Node.tags.file) {
          visitor.visit([{ name: "<file>", node }], node.getId(), this.scopesIndex);
        }
      });
    }
  }

  getScopes(id: UInt64 | string): $ReadOnlyArray<Scope> {
    if (typeof id !== "string") {
      id = toHex(id);
    }
    return this.scopesIndex[id];
  }

  getNode(id: UInt64 | string): Node__InstanceR {
    if (typeof id !== "string") {
      id = toHex(id);
    }
    const scopes = this.scopesIndex[id];
    return scopes[scopes.length - 1].node;
  }

  forEachNode(fn: (node: Node__InstanceR) => mixed) {
    for (let uuid in this.scopesIndex) {
      const scopes = this.scopesIndex[uuid];
      fn(scopes[scopes.length - 1].node);
    }
  }
}
