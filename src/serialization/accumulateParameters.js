/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Index from "../Index";
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
  id: UInt64,
};

type Group = {
  tag: "group",
  id: UInt64,
  rootId: UInt64,
};

type Interface = {
  tag: "interface",
  id: UInt64,
};

type ChainMember = Struct | Group | Interface;

function chainMember(index: Index, id: UInt64): ChainMember {
  const node = index.getNode(id);
  switch (node.tag()) {
  case Node.tags.struct:
    if (node.getStruct().getIsGroup()) {
      let rootId = node.getScopeId();
      while (index.getNode(rootId).getStruct().getIsGroup()) {
        rootId = index.getNode(rootId).getScopeId();
      }

      return {
        tag: "group",
        id,
        rootId,
      };
    } else {
      return {
        tag: "struct",
        id,
      };
    }
  case Node.tags.interface:
    return {
      tag: "interface",
      id,
    };
  default: throw new Error("Unexpected node tag.");
  }
}

function chain(index: Index, sourceId: UInt64, consumerId: UInt64): $ReadOnlyArray<ChainMember> {
  let scopes = index.getScopes(consumerId);
  let begin = scopes[0].node.getId();
  while (!(begin[0] === sourceId[0] && begin[1] === sourceId[1])) {
    scopes = scopes.slice(1);
    begin = scopes[0].node.getId();
  }

  return scopes.map(scope => chainMember(index, scope.node.getId()));
}

type uint = number;

/* I want the parameters listed within my Parameters data structure listed from
   outer-most scope to inner-most scope. I use Visitor to guarantee the proper
   insertion order. */
class ParametersVisitor extends Visitor<ParametersIndex> {
  +consumers: Consumers;
  depth: uint;

  constructor(index: Index, consumers: Consumers) {
    super(index);
    this.consumers = consumers;
    this.depth = 0;
  }

  parametric(node: Node__InstanceR, acc: ParametersIndex): ParametersIndex {
    const sourceId = node.getId();
    const parameters = node.getParameters();
    if (parameters !== null) {
      parameters.forEach((parameter, i) => {
        const name = nonnull(parameter.getName());
        const parameterName = `${name.toString()}_${this.depth - 1}`;
        acc[toHex(sourceId)].specialize.push(parameterName);
        this.consumers[toHex(sourceId)][i].forEach(consumerId => {
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
              if (!(member.id[0] === sourceId[0] && member.id[1] === sourceId[1])) {
                acc[toHex(member.id)].generic.add(parameterName);
              }

              acc[toHex(member.id)].ctor.add(parameterName);

              if (member.id[0] === consumerId[0] && member.id[1] === consumerId[1]) {
                acc[toHex(member.id)].instance.add(parameterName);
              }
              break;
            case "group":
              acc[toHex(member.rootId)].instance.add(parameterName);
              acc[toHex(member.id)].instance.add(parameterName);
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

export default function accumulateParameters(index: Index): ParametersIndex {
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
  this.index.forEachNode(node => {
    const parameters = node.getParameters();
    if (parameters === null) {
      consumers[toHex(node.getId())] = [];
    } else {
      consumers[toHex(node.getId())] = parameters.map(() => []);
    }
  });

  /* Populate consumers data structure. */
  for (let sourceUuid in consumers) {
    const node = index.getNode(sourceUuid);
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
  index.forEachNode(node => {
    if (node.tag() === Node.tags.file) {
      parametersIndex = visitor.visit(node.getId(), parametersIndex);
    }
  });

  return parametersIndex;
}
