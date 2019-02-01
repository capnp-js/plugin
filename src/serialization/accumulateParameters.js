/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";
import type {
  Node__InstanceR,
  Type__InstanceR,
  Brand__InstanceR,
} from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";
import { nonnull } from "@capnp-js/nullary";

import Visitor from "../Visitor";
import { Node, Field, Type, Brand } from "../schema.capnp-r";

/* I only include the minimal set of parameters necessary for everything to work
   properly. This design was chosen to minimize verbosity. */

/* The Parameters type specifies a scope's generic parameters:
   * generic: The parameters inherited from ancestor scopes for use in this
     scope and its descendants. Generic scopes contain a `specialize` method for
     imposing the current scope's parameters on some specialization, so the
     scope's own parameters do not appear among its `generic` parameters. Even
     if there's no `specialize` parameters, I still generate this list for
     consistency (its data doesn't get used if there's no `specialize`
     parameters).
   * specialize: The scope's parameters as prescribed by its schema. These
     parameters dictate the `specialize` method's signature.
   * ctor: The `generic` parameters plus any `specialize` parameters that get
     used in the current scope and/or its descendants. If a `specialize`
     parameter doesn't actually get used, then it won't appear in this list.
   * instance: The `ctor` parameters that get used in the scope itself.

   Note: Groups get instantiated directly by the host struct, so there is no
   `__CtorX` suffixed output for groups. The `instance` data for groups may not
   contain all of the parameters for subgroups, but the `ctor` data necessarily
   does. In fact, the `ctor` data has the minimal necessary parameters for
   consumption by groups, although the naming bust is unfortunate. */
export type Parameters = {
  generic: Set<string>,
  specialize: Array<string>,
  ctor: Set<string>,
  instance: Set<string>,
};

export type ParametersIndex = { +[hostId: string]: Parameters };

/* To compute the minimal set of parameters necessary, I allocate an array for
   each of a source's parameters. I populate these arrays with the ids of all
   descendants that consume each parameter (these descendants include the source
   itself, as a parameter may or may not get consumed by the source). The chain
   of descendants between source and consumer must propagate a parameter down to
   its consumer, so all intermediate scopes also consume the parameter. */
type Consumers = {
  [sourceId: string]: $ReadOnlyArray<Array<UInt64>>,
};

type Struct = {
  tag: "struct",
  uuid: string,
};

type Group = {
  tag: "group",
  uuid: string,
  structUuid: string,
};

type Interface = {
  tag: "interface",
  uuid: string,
};

type ChainMember = Struct | Group | Interface;

function chainMember(index: NodeIndex, id: UInt64): ChainMember {
  const uuid = toHex(id);
  const node = index[uuid];
  switch (node.tag()) {
  case Node.tags.struct:
    if (node.getStruct().getIsGroup()) {
      let anc = node.getScopeId();
      while (index[toHex(anc)].getStruct().getIsGroup()) {
        anc = index[toHex(anc)].getScopeId();
      }

      return {
        tag: "group",
        uuid,
        structUuid: toHex(anc),
      };
    } else {
      return {
        tag: "struct",
        uuid,
      };
    }
  case Node.tags.interface:
    return {
      tag: "interface",
      uuid,
    };
  default: throw new Error("Unexpected node tag.");
  }
}

let zeroScope = null;
type ZeroScopeIndex = { [childId: string]: UInt64 };

function chain(index: NodeIndex, sourceId: string, consumerId: UInt64): Array<ChainMember> {
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

  const members = [chainMember(index, consumerId)];
  while (members[0].uuid !== sourceId) {
    let scopeId = index[members[0].uuid].getScopeId();
    if (scopeId[0] === 0 && scopeId[1] === 0) {
      scopeId = zeroScope[members[0].uuid];
    }

    members.unshift(chainMember(index, scopeId));
  }

  return members;
}

type uint = number;

/* I want the parameters listed within my Parameters data structure listed from
   outer-most scope to inner-most scope. I use Visitor to guarantee the proper
   insertion order. */
class ParametersVisitor extends Visitor<ParametersIndex> {
  +consumers: Consumers;
  depth: uint;

  constructor(index: NodeIndex, consumers: Consumers) {
    super(index);
    this.consumers = consumers;
    this.depth = 0;
  }

  parametric(node: Node__InstanceR, acc: ParametersIndex): ParametersIndex {
    const sourceId = toHex(node.getId());
    const parameters = node.getParameters();
    if (parameters !== null) {
      parameters.forEach((parameter, i) => {
        const name = nonnull(parameter.getName());
        const parameterName = `${name.toString()}_${this.depth - 1}`;
        acc[sourceId].specialize.push(parameterName);
        this.consumers[sourceId][i].forEach(consumerId => {
          /* Given a parameter source node, `source`, the ctor parameter list of
             that node must include every parameter of the `source` node and its
             enclosing scopes that are used by `source` and its encapsulated
             scopes. Taking `consumer` as a particular node that uses parameter
             `p` of `source`, every scope along interval [`host`, `user`]
             includes `p`. */
          chain(this.index, sourceId, consumerId).forEach(member => {
            switch (member.tag) {
            case "struct":
            case "interface":
              if (member.uuid !== sourceId) {
                acc[member.uuid].generic.add(parameterName);
              }

              acc[member.uuid].ctor.add(parameterName);

              if (member.uuid === toHex(consumerId)) {
                acc[member.uuid].instance.add(parameterName);
              }
              break;
            case "group":
              acc[member.structUuid].instance.add(parameterName);
              acc[member.uuid].instance.add(parameterName);
              break;
            default: throw new Error("Unrecognized chain member tag.");
            }
          });
        });
      });
    }

    return acc;
  }

  struct(node: Node__InstanceR, acc: ParametersIndex): ParametersIndex {
    ++this.depth;
    acc = this.parametric(node, acc);

    /* The visitor ignores groups, so scour the fields for groups and visit
       them. */
    const fields = node.getStruct().getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          acc = this.visit(field.getGroup().getTypeId(), acc);
        }
      });
    }

    const next = super.struct(node, acc);

    --this.depth;

    return next;
  }

  interface(node: Node__InstanceR, acc: ParametersIndex): ParametersIndex {
    ++this.depth;
    acc = this.parametric(node, acc);

    /* Param and result lists are not listed among the interface's nested nodes,
       so I need to visit them manually. */
    const methods = node.getInterface().getMethods();
    if (methods !== null) {
      methods.forEach(method => {
        const paramNodeId = method.getParamStructType();
        if (paramNodeId[0] === 0 && paramNodeId[1] === 0) {
          acc = this.visit(paramNodeId, acc);
        }

        const resultNodeId = method.getResultStructType();
        if (resultNodeId[0] === 0 && resultNodeId[1] === 0) {
          acc = this.visit(resultNodeId, acc);
        }
      });
    }

    const next = super.interface(node, acc);

    --this.depth;

    return next;
  }
}

export default function accumulateParameters(index: NodeIndex): ParametersIndex {
  function addBrandParameters(brand: null | Brand__InstanceR, consumerId: UInt64, consumers: Consumers): void {
    if (brand === null) {
      return;
    }

    const scopes = brand.getScopes();
    if (scopes !== null) {
      scopes.forEach(scope => {
        if (scope.tag() === Brand.Scope.tags.bind) {
          const bind = scope.getBind();
          if (bind !== null) {
            bind.forEach(binding => {
              addTypeParameters(binding.getType(), consumerId, consumers);
            });
          }
        }
      });
    }
  }

  function addTypeParameters(type: null | Type__InstanceR, consumerId: UInt64, consumers: Consumers): void {
    if (type === null) {
      return;
    }

    switch (type.tag()) {
    case Type.tags.list:
      {
        const list = type.getList();
        if (list !== null) {
          addTypeParameters(list.getElementType(), consumerId, consumers);
        }
      }
      break;
    case Type.tags.struct:
      addBrandParameters(type.getStruct().getBrand(), consumerId, consumers);
      break;
    case Type.tags.interface:
      break;
    case Type.tags.anyPointer:
      {
        const anyPointerG = Type.groups.anyPointer;
        const anyPointer = type.getAnyPointer();
        if (anyPointer.tag() === anyPointerG.tags.parameter) {
          const parameter = anyPointer.getParameter();
          const parameterIndex = parameter.getParameterIndex();
          const sourceId = parameter.getScopeId();
          consumers[toHex(sourceId)][parameterIndex].push(consumerId);
        }
      }
      break;
    }
  }

  const consumers = {};

  /* Initialize consumers data structure. */
  for (let uuid in index) {
    const node = index[uuid];
    const parameters = node.getParameters();
    if (parameters === null) {
      consumers[uuid] = [];
    } else {
      consumers[uuid] = parameters.map(() => []);
    }
  }

  /* Populate consumers data structure. */
  for (let sourceUuid in consumers) {
    const node = index[sourceUuid];
    switch (node.tag()) {
    case Node.tags.file:
      break;
    case Node.tags.struct:
      {
        const fields = node.getStruct().getFields();
        if (fields !== null) {
          fields.forEach(field => {
            /* Since the index includes group nodes, I don't need to treat them
               specially. */
            if (field.tag() === Field.tags.slot) {
              addTypeParameters(field.getSlot().getType(), node.getId(), consumers);
            }
          });
        }
      }
      break;
    case Node.tags.enum:
      break;
    case Node.tags.interface:
      break;
    case Node.tags.const:
      addTypeParameters(node.getConst().getType(), node.getId(), consumers);
      break;
    case Node.tags.annotation:
      break;
    default:
      throw new Error("Unrecognized node tag.");
    }
  }

  /* I create a Parameters data structure for all nodes. Things work out nicely,
     although it's kinda goofy to have such a Parameters data structure for
     constant node, for instance. But then it's kinda goofy to have a
     `Parameters` field for constants in the CodeGeneratorRequest schema. */
  let parametersIndex = {};
  for (let uuid in index) {
    parametersIndex[uuid] = {
      generic: new Set(),
      specialize: [],
      ctor: new Set(),
      instance: new Set(),
    };
  }
  const visitor = new ParametersVisitor(index, consumers);
  for (let uuid in index) {
    if (index[uuid].tag() === Node.tags.file) {
      parametersIndex = visitor.visit(index[uuid].getId(), parametersIndex);
    }
  }

  return parametersIndex;
}
