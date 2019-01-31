/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";
import type { Node__InstanceR, Type__InstanceR } from "../schema.capnp-r";

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

type ChainMember = Struct | Group;

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
  default: throw new Error("TODO");
  }
}

//TODO: This will fail for method parameters and method results, right? They've got scopeId===0, right?
//      Yup. Instead of working around the scopeId===0 algorithmically,
//      I'm going to implement the builder side without interfaces and I'm going to
//      use builders to patch the schema to get rid of the scopeId===0 case.
function chain(index: NodeIndex, sourceId: string, consumerId: UInt64): Array<ChainMember> {
  const members = [chainMember(index, consumerId)];
  while (members[0].uuid !== sourceId) {
    members.unshift(chainMember(index, index[members[0].uuid].getScopeId()));
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

  constructor(nodes: NodeIndex, consumers: Consumers) {
    super(nodes);
    this.consumers = consumers;
    this.depth = 0;
  }

  struct(node: Node__InstanceR, acc: ParametersIndex): ParametersIndex {
    ++this.depth;
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
            default: throw new Error("TODO");
            }
          });
        });
      });
    }

    /* The visitor ignores groups, so scour the fields for groups and visit
       them. A lot of the generated data will get ignored (i.e. `generic`,
       `ctor`, and `specialize`). */
    const fields = node.getStruct().getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          this.visit(field.getGroup().getTypeId(), acc);
        }
      });
    }

    const next = super.struct(node, acc);

    --this.depth;

    return next;
  }

  interface(node: Node__InstanceR, acc: ParametersIndex): ParametersIndex {
    //TODO: Fill this in
    const next = super.interface(node, acc);

    --this.depth;

    return next;
  }
}

export default function accumulateParameters(index: NodeIndex): ParametersIndex {
  function addParameters(type: null | Type__InstanceR, consumerId: UInt64, consumers: Consumers): void {
    if (type === null) {
      return;
    }

    switch (type.tag()) {
    case Type.tags.list:
      {
        const list = type.getList();
        if (list !== null) {
          addParameters(list.getElementType(), consumerId, consumers);
        }
      }
      break;
    case Type.tags.struct:
      {
        const brand = type.getStruct().getBrand();
        if (brand !== null) {
          const scopes = brand.getScopes();
          if (scopes !== null) {
            scopes.forEach(scope => {
              if (scope.tag() === Brand.Scope.tags.bind) {
                const bind = scope.getBind();
                if (bind !== null) {
                  bind.forEach(binding => {
                    addParameters(binding.getType(), consumerId, consumers);
                  });
                }
              }
            });
          }
        }
      }
      break;
    case Type.tags.interface:
      break; // TODO
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
    case Node.tags.struct:
      {
        const fields = node.getStruct().getFields();
        if (fields !== null) {
          fields.forEach(field => {
            /* Since the index includes group nodes, I don't need to treat them
               specially. */
            if (field.tag() === Field.tags.slot) {
              addParameters(field.getSlot().getType(), node.getId(), consumers);
            }
          });
        }
      }
      break;
    case Node.tags.interface:
      //TODO;
      break;
    case Node.tags.const:
      addParameters(node.getConst().getType(), node.getId(), consumers);
      break;
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
