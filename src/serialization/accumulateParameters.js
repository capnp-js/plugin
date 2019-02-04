/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Index from "../Index";
import type {
  Node__InstanceR,
  Type__InstanceR,
  Brand__InstanceR,
  Brand_Scope__InstanceR,
} from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";
import { nonnull } from "@capnp-js/nullary";

import Visitor from "../Visitor";
import { Node, Field, Type, Brand } from "../schema.capnp-r";

type uint = number;
type u16 = number;

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

export type ParametersIndex = { [hostId: string]: Parameters };

/* To compute the minimal set of parameters necessary, I allocate an array for
   each of a source's parameters. I populate these arrays with the ids of all
   descendants that consume each parameter (these descendants include the source
   itself, as a parameter may or may not get consumed by the source). The chain
   of descendants between source and consumer must propagate a parameter down to
   its consumer, so all intermediate scopes also consume the parameter. */

type Leaf = {
  tag: "leaf",
  scopeId: UInt64,
  position: u16,
};

type Nonleaf = {
  tag: "nonleaf",
  type: Type__InstanceR,
};

interface ParameterLookup {
  parameter(scopeId: UInt64, position: u16): null | Nonleaf | Leaf;
}

class IdentityParameterLookup {
  +index: Index;

  constructor(index: Index) {
    this.index = index;
  }

  parameter(scopeId: UInt64, position: u16): null | Nonleaf | Leaf {
    return {
      tag: "leaf",
      scopeId,
      position,
    };
  }
}

class BrandParameterLookup {
  +index: Index;
  +scopes: { [scopeUuid: string]: Brand_Scope__InstanceR };

  constructor(index: Index, brand: null | Brand__InstanceR) {
    this.index = index;
    this.scopes = {};
    if (brand !== null) {
      const scopes = brand.getScopes();
      if (scopes !== null) {
        scopes.forEach(scope => {
          this.scopes[toHex(scope.getScopeId())] = scope;
        });
      }
    }
  }

  parameter(scopeId: UInt64, position: u16): null | Nonleaf | Leaf {
    const uuid = toHex(scopeId);
    const scope = this.scopes[uuid];
    if (scope) {
      switch (scope.tag()) {
      case Brand.Scope.tags.bind:
        {
          const binding = nonnull(scope.getBind()).get(position);
          switch (binding.tag()) {
          case Brand.Binding.tags.unbound:
            return null;
          case Brand.Binding.tags.type:
            {
              const type = nonnull(binding.getType());
              if (type.tag() === Type.tags.anyPointer) {
                const anyPointerG = Type.groups.anyPointer;
                const anyPointer = type.getAnyPointer();
                if (anyPointer.tag() === anyPointerG.tags.parameter) {
                  const parameter = anyPointer.getParameter();
                  return {
                    tag: "leaf",
                    scopeId: parameter.getScopeId(),
                    position: parameter.getParameterIndex(),
                  };
                }
              }

              return {
                tag: "nonleaf",
                type,
              };
            }
          default:
            throw new Error("Unrecognized binding tag.");
          }
        }
      case Brand.Scope.tags.inherit:
        return {
          tag: "leaf",
          scopeId,
          position,
        };
      default:
        throw new Error("Unrecognized scope tag.");
      }
    } else {
      return null;
    }
  }
}

class Consumers {
  +index: Index;
  +parameters: { [sourceId: string]: $ReadOnlyArray<Array<UInt64>> };

  constructor(index: Index, parameters: { [sourceId: string]: $ReadOnlyArray<Array<UInt64>> }) {
    this.index = index;
    this.parameters = parameters;
  }

  addType(consumerId: UInt64, type: null | Type__InstanceR, lookup: ParameterLookup): void {
    if (type === null) {
      return;
    }

    switch (type.tag()) {
    case Type.tags.void:
    case Type.tags.bool:
    case Type.tags.int8:
    case Type.tags.int16:
    case Type.tags.int32:
    case Type.tags.int64:
    case Type.tags.uint8:
    case Type.tags.uint16:
    case Type.tags.uint32:
    case Type.tags.uint64:
    case Type.tags.float32:
    case Type.tags.float64:
      break;

    case Type.tags.text:
    case Type.tags.data:
      break;

    case Type.tags.list:
      this.addType(consumerId, type.getList().getElementType(), lookup);
      break;

    case Type.tags.struct:
      this.addStructType(consumerId, type.getStruct().getTypeId(), type.getStruct().getBrand());
      break;
    case Type.tags.interface:
      break;
    case Type.tags.anyPointer:
      this.addAnyPointer(consumerId, type, lookup);
      break;
    }
  }

  addStructType(consumerId: UInt64, structId: UInt64, brand: null | Brand__InstanceR): void {
    const struct = this.index.getNode(structId).getStruct();
    const lookup = new BrandParameterLookup(this.index, brand);
    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        switch (field.tag()) {
        case Field.tags.slot:
          {
            let type = field.getSlot().getType();
            if (type === null) {
              type = Type.empty();
            }

            switch (type.tag()) {
            case Type.tags.void:
            case Type.tags.bool:
            case Type.tags.int8:
            case Type.tags.int16:
            case Type.tags.int32:
            case Type.tags.int64:
            case Type.tags.uint8:
            case Type.tags.uint16:
            case Type.tags.uint32:
            case Type.tags.uint64:
            case Type.tags.float32:
            case Type.tags.float64:
              break;

            case Type.tags.text:
            case Type.tags.data:
              break;

            case Type.tags.list:
              this.addType(consumerId, type.getList().getElementType(), lookup);
              break;

            case Type.tags.enum:
              break;

            case Type.tags.struct:
              this.addStructType(consumerId, type.getStruct().getTypeId(), type.getStruct().getBrand());
              break;

            case Type.tags.interface:
              throw new Error("TODO");

            case Type.tags.anyPointer:
              this.addAnyPointer(consumerId, type, lookup);
              break;

            default:
              throw new Error("Unrecognized type tag.");
            }
          }
          break;
        case Field.tags.group:
          break;
        default:
          throw new Error("Unrecognized field tag.");
        }
      });
    }
  }

  addAnyPointer(consumerId: UInt64, type: Type__InstanceR, lookup: ParameterLookup): void {
    const anyPointerG = Type.groups.anyPointer;
    const anyPointer = type.getAnyPointer();
    if (anyPointer.tag() === anyPointerG.tags.parameter) {
      const parameter = anyPointer.getParameter();
      const p = lookup.parameter(parameter.getScopeId(), parameter.getParameterIndex());
      if (p !== null) {
        if (p.tag === "leaf") {
          this.parameters[toHex(p.scopeId)][p.position].push(consumerId);
        } else {
          (p.tag: "nonleaf");
          this.addType(consumerId, p.type, lookup);
        }
      }
    }
  }
}

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
        this.consumers.parameters[toHex(sourceId)][i].forEach(consumerId => {
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
  const consumerParameters = {};

  /* Initialize consumers data structure. */
  index.forEachNode(node => {
    const parameters = node.getParameters();
    const sourceUuid = toHex(node.getId());
    if (parameters === null) {
      consumerParameters[sourceUuid] = [];
    } else {
      consumerParameters[sourceUuid] = parameters.map(() => []);
    }
  });

  const consumers = new Consumers(index, consumerParameters);

  index.forEachNode(node => {
    switch (node.tag()) {
    case Node.tags.file:
      break;
    case Node.tags.struct:
      {
        const fields = node.getStruct().getFields();
        if (fields !== null) {
          const lookup = new IdentityParameterLookup(index);
          fields.forEach(field => {
            switch (field.tag()) {
            case Field.tags.slot:
              consumers.addType(
                node.getId(),
                field.getSlot().getType(),
                lookup,
              );
              break;
            case Field.tags.group:
              break;
            default:
              throw new Error("Unrecognized field tag.");
            }
          });
        }
      }
      break;
    case Node.tags.enum:
      break;
    case Node.tags.interface:
      {
        const iface = node.getInterface();
        const methods = iface.getMethods();
        if (methods !== null) {
          methods.forEach(method => {
            const param = index.getNode(method.getParamStructType());
            const paramScopeId = param.getScopeId();
            if (!(paramScopeId[0] === 0 && paramScopeId[1] === 0)) {
              consumers.addStructType(
                node.getId(),
                method.getParamStructType(),
                method.getParamBrand(),
              );
            }

            const result = index.getNode(method.getResultStructType());
            const resultScopeId = result.getScopeId();
            if (!(resultScopeId[0] === 0 && resultScopeId[1] === 0)) {
              consumers.addStructType(
                node.getId(),
                method.getResultStructType(),
                method.getResultBrand(),
              );
            }
          });
        }
      }
      break;
    case Node.tags.const:
      {
        const lookup = new IdentityParameterLookup(index);
        consumers.addType(node.getId(), node.getConst().getType(), lookup);
      }
      break;
    case Node.tags.annotation:
      break;
    default:
      throw new Error("Unrecognized node tag.");
    }
  });

  /* I create a Parameters data structure for all nodes. Things work out nicely,
     although it's kinda goofy to have such a Parameters data structure for a
     constant node, for instance. But then it's kinda goofy to have a
     `Parameters` field for constants in the CodeGeneratorRequest schema. */
  let parametersIndex = {};
  index.forEachNode(node => {
    parametersIndex[toHex(node.getId())] = {
      generic: new Set(),
      specialize: [],
      ctor: new Set(),
      instance: new Set(),
    };
  });

  const visitor = new ParametersVisitor(index, consumers);
  index.forEachNode(node => {
    if (node.tag() === Node.tags.file) {
      parametersIndex = visitor.visit(node.getId(), parametersIndex);
    }
  });

  return parametersIndex;
}
