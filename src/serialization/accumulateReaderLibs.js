/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Index from "../Index";
import type {
  Node__InstanceR,
  Brand__InstanceR,
  Type__InstanceR,
} from "../schema.capnp-r";
import type { Libs } from "./libs";

import { Brand, Field, Type } from "../schema.capnp-r";
import Visitor from "../Visitor";

type Acc = {
  +type: {
    +int64: { [naive: string]: string },
    +uint64: { [naive: string]: string },
    +layout: { [naive: string]: string },
    +memory: { [naive: string]: string },
    +"reader-core": { [naive: string]: string },
    +"builder-core": { [naive: string]: string },
  },
  +value: {
    +int64: { [naive: string]: string },
    +uint64: { [naive: string]: string },
    +layout: { [naive: string]: string },
    +memory: { [naive: string]: string },
    +"reader-core": { [naive: string]: string },
    +"builder-core": { [naive: string]: string },
    +"reader-arena": { [naive: string]: string },
  },
  +"all-value": {
    "read-data": null | "decode",
    "write-data": null | "encode",
  },
};

function addNames(table: { [naive: string]: string }, acc: Set<string>): void {
  Object.keys(table).forEach(naive => {
    acc.add(table[naive]);
  });
}

class LibsVisitor extends Visitor<Acc> {
  +names: Set<string>;

  constructor(index: Index, names: Set<string>) {
    super(index);
    this.names = names;
  }

  mangle(naive: string): string {
    return this.names.has(naive) ? "capnp_" + naive : naive;
  }

  struct(node: Node__InstanceR, acc: Acc): Acc {
    /* GenericR */
    const parameters = node.getParameters();
    if (parameters !== null && parameters.length() > 0) {
      acc.type["reader-core"]["AnyGutsR"] = this.mangle("AnyGutsR");
      acc.type["reader-core"]["CtorR"] = this.mangle("CtorR");
    }

    /* CtorR */
    acc.type["reader-core"]["StructCtorR"] = this.mangle("StructCtorR");
    acc.type["reader-core"]["StructGutsR"] = this.mangle("StructGutsR");
    acc.type["reader-core"]["ArenaR"] = this.mangle("ArenaR");
    acc.type["reader-core"]["AnyGutsR"] = this.mangle("AnyGutsR");
    acc.type.layout["Bytes"] = this.mangle("Bytes");
    acc.type.memory["SegmentR"] = this.mangle("SegmentR");
    acc.type.memory["Word"] = this.mangle("Word");
    acc.value.memory["isNull"] = "isNull";
    acc.value["reader-core"]["RefedStruct"] = this.mangle("RefedStruct");
    acc.value["reader-arena"]["empty"] = "empty";

    /* InstanceR */
    const fields = node.getStruct().getFields();
    if (fields !== null) {
      fields.forEach(field => {
        switch (field.tag()) {
        case Field.tags.slot:
          this.addType(field.getSlot().getType(), acc);
          break;
        case Field.tags.group:
          /* Dig into the struct's groups for their field types too. */
          acc = this.visit(field.getGroup().getTypeId(), acc);
          break;
        default: throw new Error("Unrecognized field tag.");
        }
      });
    }

    return super.struct(node, acc);
  }

  interface(node: Node__InstanceR, acc: Acc): Acc {
    /* GenericR */
    const parameters = node.getParameters();
    if (parameters !== null && parameters.length() > 0) {
      acc.type["reader-core"]["AnyGutsR"] = this.mangle("AnyGutsR");
      acc.type["reader-core"]["CtorR"] = this.mangle("CtorR");
    }

    const methods = node.getInterface().getMethods();
    if (methods !== null) {
      methods.forEach(method => {
        const paramId = method.getParamStructType();
        const param = this.index.getNode(paramId);
        const paramScopeId = param.getScopeId();
        if (paramScopeId[0] === 0 && paramScopeId[1] === 0) {
          acc = this.visit(paramId, acc);
        }

        const resultId = method.getResultStructType();
        const result = this.index.getNode(resultId);
        const resultScopeId = result.getScopeId();
        if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
          acc = this.visit(resultId, acc);
        }
      });
    }

    return super.interface(node, acc);
  }

  const(node: Node__InstanceR, acc: Acc): Acc {
    this.addType(node.getConst().getType(), acc);

    return super.const(node, acc);
  }

  addType(type: null | Type__InstanceR, acc: Acc): void {
    if (type === null) {
      type = Type.empty();
    }

    switch (type.tag()) {
    case Type.tags.void:
      break;
    case Type.tags.bool:
    case Type.tags.int8:
    case Type.tags.int16:
    case Type.tags.int32:
    case Type.tags.uint8:
    case Type.tags.uint16:
    case Type.tags.uint32:
    case Type.tags.float32:
      acc["all-value"]["read-data"] = "decode";
      break;
    case Type.tags.float64:
      acc["all-value"]["read-data"] = "decode";
      acc.value.int64["inject"] = "injectI64";
      break;
    case Type.tags.int64:
      acc.type.int64["Int64"] = this.mangle("Int64");
      acc.value.int64["inject"] = "injectI64";
      break;
    case Type.tags.uint64:
      acc.type.uint64["UInt64"] = this.mangle("UInt64");
      acc.value.uint64["inject"] = "injectU64";
      break;
    case Type.tags.text:
      acc.value["reader-core"]["Text"] = this.mangle("Text");
      break;
    case Type.tags.data:
      acc.value["reader-core"]["Data"] = this.mangle("Data");
      break;
    case Type.tags.list:
      this.addList(type.getList().getElementType(), acc);
      break;
    case Type.tags.enum:
      acc["all-value"]["read-data"] = "decode";
      break;
    case Type.tags.struct:
      this.addStruct(type.getStruct().getBrand(), acc);
      //TODO: Eslint rule for `//fall through` switch statements.
      break;
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer:
      const anyPointerGroup = Type.groups.anyPointer;
      const anyPointer = type.getAnyPointer();
      switch (anyPointer.tag()) {
      case anyPointerGroup.tags.unconstrained:
        {
          const unconstrainedGroup = anyPointerGroup.groups.unconstrained;
          const unconstrained = anyPointer.getUnconstrained();
          switch (unconstrained.tag()) {
          case unconstrainedGroup.tags.anyKind:
            acc.value["reader-core"]["AnyValue"] = this.mangle("AnyValue");
            break;
          case unconstrainedGroup.tags.struct:
            acc.value["reader-core"]["StructValue"] = this.mangle("StructValue");
            break;
          case unconstrainedGroup.tags.list:
            acc.value["reader-core"]["ListValue"] = this.mangle("ListValue");
            break;
          case unconstrainedGroup.tags.capability:
            throw new Error("TODO");
          default:
            throw new Error("Unrecognized unconstrained-AnyPointer tag.");
          }
        }
      case anyPointerGroup.tags.parameter:
        break; //TODO: Can a parameter name collide with anything? My hunch is no given the underscores. If collisions can occure, then consider `__r` instead of `_r`.
      case anyPointerGroup.tags.implicitMethodParameter:
        throw new Error("TODO");
      default:
        throw new Error("Unrecognized type tag.");
      }
    }
  }

  //TODO: Flag on Flow to stop treating uncalled functions as any. If you forget the parens, then you get errors silenced.
  addList(elementType: null | Type__InstanceR, acc: Acc): void {
    if (elementType === null) {
      elementType = Type.empty();
    }

    switch (elementType.tag()) {
    case Type.tags.void:
      acc.value["reader-core"]["VoidList"] = this.mangle("VoidList");
      break;
    case Type.tags.bool:
      acc.value["reader-core"]["BoolList"] = this.mangle("BoolList");
      break;
    case Type.tags.int8:
      acc.value["reader-core"]["Int8List"] = this.mangle("Int8List");
      break;
    case Type.tags.int16:
      acc.value["reader-core"]["Int16List"] = this.mangle("Int16List");
      break;
    case Type.tags.int32:
      acc.value["reader-core"]["Int32List"] = this.mangle("Int32List");
      break;
    case Type.tags.int64:
      acc.value["reader-core"]["Int64List"] = this.mangle("Int64List");
      break;
    case Type.tags.uint8:
      acc.value["reader-core"]["UInt8List"] = this.mangle("UInt8List");
      break;
    case Type.tags.uint16:
      acc.value["reader-core"]["UInt16List"] = this.mangle("UInt16List");
      break;
    case Type.tags.uint32:
      acc.value["reader-core"]["UInt32List"] = this.mangle("UInt32List");
      break;
    case Type.tags.uint64:
      acc.value["reader-core"]["UInt64List"] = this.mangle("UInt64List");
      break;
    case Type.tags.float32:
      acc.value["reader-core"]["Float32List"] = this.mangle("Float32List");
      break;
    case Type.tags.float64:
      acc.value["reader-core"]["Float64List"] = this.mangle("Float64List");
      break;
    case Type.tags.text:
      acc.type["reader-core"]["ListListR"] = this.mangle("ListListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.value["reader-core"]["Text"] = this.mangle("Text");
      acc.value["reader-core"]["lists"] = "lists";
      break;
    case Type.tags.data:
      acc.type["reader-core"]["ListListR"] = this.mangle("ListListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.value["reader-core"]["Data"] = this.mangle("Data");
      acc.value["reader-core"]["lists"] = "lists";
      break;
    case Type.tags.list:
      acc.type["reader-core"]["ListListR"] = this.mangle("ListListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.value["reader-core"]["lists"] = "lists";
      this.addList(elementType.getList().getElementType(), acc);
      break;
    case Type.tags.enum:
      acc.type["reader-core"]["UInt16List"] = this.mangle("UInt16List");
      break;
    case Type.tags.struct:
      acc.type["reader-core"]["StructListR"] = this.mangle("StructListR");
      acc.value["reader-core"]["structs"] = "structs";
      break;
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer:
      const anyPointerGroup = Type.groups.anyPointer;
      const anyPointer = elementType.getAnyPointer();
      switch (anyPointer.tag()) {
      case anyPointerGroup.tags.unconstrained:
        {
          const unconstrainedGroup = anyPointerGroup.groups.unconstrained;
          const unconstrained = anyPointer.getUnconstrained();
          switch (unconstrained.tag()) {
          case unconstrainedGroup.tags.anyKind:
            throw new Error("Forbidden type: List(AnyPointer).");
          case unconstrainedGroup.tags.struct:
            throw new Error("Forbidden type: List(AnyStruct).");
          case unconstrainedGroup.tags.list:
            //TODO: None of my current schemata use a `List(AnyList)`. Be sure that this gets tested.
            acc.type["reader-core"]["BoolListGutsR"] = this.mangle("BoolListGutsR");
            acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
            acc.value["reader-core"]["ListValue"] = this.mangle("ListValue");
            break;
          case unconstrainedGroup.tags.capability:
            throw new Error("TODO");
          default:
            throw new Error("Unrecognized unconstrained-AnyPointer tag.");
          }
        }
      case anyPointerGroup.tags.parameter:
        throw new Error("Forbidden type: List(T) for some parameter T");
      case anyPointerGroup.tags.implicitMethodParameter:
        throw new Error("TODO");
      default:
        throw new Error("Unrecognized type tag.");
      }
    }
  }

  addStruct(brand: null | Brand__InstanceR, acc: Acc): void {
    if (brand !== null) {
      const scopes = brand.getScopes();
      if (scopes !== null) {
        scopes.forEach(scope => {
          if (scope.tag() === Brand.Scope.tags.bind) {
            const bind = scope.getBind();
            if (bind !== null) {
              bind.forEach(binding => {
                if (binding.tag() === Brand.Binding.tags.type) {
                  this.addType(binding.getType(), acc);
                }
              });
            }
          }
        });
      }
    }
  }
}

export default function accumulateReaderLibs(index: Index, fileId: UInt64, names: Set<string>): Libs {
  const internalAcc = new LibsVisitor(index, names).visit(fileId, {
    type: {
      int64: {},
      uint64: {},
      layout: {},
      memory: {},
      "reader-core": {},
      "builder-core": {},
    },
    value: {
      int64: {},
      uint64: {},
      layout: {},
      memory: {},
      "reader-core": {},
      "builder-core": {},
      "reader-arena": {},
    },
    "all-value": {
      "read-data": null,
      "write-data": null,
    },
  });

  const libNames = new Set();

  addNames(internalAcc.type.int64, libNames);
  addNames(internalAcc.type.uint64, libNames);
  addNames(internalAcc.type.layout, libNames);
  addNames(internalAcc.type.memory, libNames);
  addNames(internalAcc.type["reader-core"], libNames);
  addNames(internalAcc.type["builder-core"], libNames);
  addNames(internalAcc.value.int64, libNames);
  addNames(internalAcc.value.uint64, libNames);
  addNames(internalAcc.value.layout, libNames);
  addNames(internalAcc.value.memory, libNames);
  addNames(internalAcc.value["reader-core"], libNames);
  addNames(internalAcc.value["builder-core"], libNames);

  return { ...internalAcc, names: libNames };
}
