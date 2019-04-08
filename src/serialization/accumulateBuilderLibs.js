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
  +aliases: { [naive: string]: string },
  +type: {
    int64: { [naive: string]: string },
    uint64: { [naive: string]: string },
    layout: { [naive: string]: string },
    memory: { [naive: string]: string },
    "reader-core": { [naive: string]: string },
    "builder-core": { [naive: string]: string },
  },
  +value: {
    +int64: { [naive: string]: string },
    +uint64: { [naive: string]: string },
    +"copy-pointers": { [naive: string]: string },
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
      acc.type["builder-core"]["ReaderCtor"] = this.mangle("ReaderCtor");
      acc.type["builder-core"]["CtorB"] = this.mangle("CtorB");
    }

    /* CtorR */
    acc.aliases["uint"] = "number";
    acc.type["reader-core"]["StructGutsR"] = this.mangle("StructGutsR");
    acc.type["builder-core"]["StructCtorB"] = this.mangle("StructCtorB");
    acc.type["builder-core"]["ArenaB"] = this.mangle("ArenaB");
    acc.type["builder-core"]["AnyGutsB"] = this.mangle("AnyGutsB");
    acc.type["builder-core"]["StructGutsB"] = this.mangle("StructGutsB");
    acc.type.layout["Bytes"] = this.mangle("Bytes");
    acc.type.memory["Pointer"] = this.mangle("Pointer");
    acc.type.memory["SegmentB"] = this.mangle("SegmentB");
    acc.type.memory["Word"] = this.mangle("Word");
    acc.value.memory["isNull"] = "isNull";
    acc.value["builder-core"]["RefedStruct"] = this.mangle("RefedStruct");
    acc.value["builder-core"]["Orphan"] = this.mangle("Orphan"); //TODO: this should prevent type Orphan from getting brought in. Consider a method that does this check instead of my assignments.

    /* InstanceR */
    if (node.getStruct().getDiscriminantCount() > 0) {
      acc.aliases["u16"] = "number";
    }

    acc.type["reader-core"]["CtorR"] = this.mangle("CtorR");
    acc.type["reader-core"]["StructGutsR"] = this.mangle("StructGutsR");
    const fields = node.getStruct().getFields();
    if (fields !== null) {
      fields.forEach(field => {
        switch (field.tag()) {
        case Field.tags.slot:
          this.addAlias(field.getSlot().getType(), acc);
          this.addType(field.getSlot().getType(), acc);
          break;
        case Field.tags.group:
          /* Dig into the struct's groups for their field types too. */
          this.visit(field.getGroup().getTypeId(), acc);
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
      acc.type["builder-core"]["CtorB"] = this.mangle("CtorB");
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

  addAlias(type: null | Type__InstanceR, acc: Acc): void {
    if (type === null) {
      type = Type.empty();
    }

    switch (type.tag()) {
    case Type.tags.void:
    case Type.tags.bool:
      break;
    case Type.tags.int8:
      acc.aliases["i8"] = "number";
      break;
    case Type.tags.int16:
      acc.aliases["i16"] = "number";
      break;
    case Type.tags.int32:
      acc.aliases["i32"] = "number";
      break;
    case Type.tags.uint8:
      acc.aliases["u8"] = "number";
      break;
    case Type.tags.uint16:
      acc.aliases["u16"] = "number";
      break;
    case Type.tags.uint32:
      acc.aliases["u32"] = "number";
      break;
    case Type.tags.float32:
      acc.aliases["f32"] = "number";
      break;
    case Type.tags.float64:
      acc.aliases["f64"] = "number";
      break;
    case Type.tags.enum:
      acc.aliases["u16"] = "number";
    }
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
      acc["all-value"]["write-data"] = "encode";
      break;
    case Type.tags.float64:
      acc["all-value"]["read-data"] = "decode";
      acc["all-value"]["write-data"] = "encode";
      acc.value.int64["inject"] = "injectI64";
      break;
    case Type.tags.int64:
      acc.type.int64["Int64"] = this.mangle("Int64");
      acc["all-value"]["read-data"] = "decode";
      acc["all-value"]["write-data"] = "encode";
      acc.value.int64["inject"] = "injectI64";
      break;
    case Type.tags.uint64:
      acc.type.uint64["UInt64"] = this.mangle("UInt64");
      acc["all-value"]["read-data"] = "decode";
      acc["all-value"]["write-data"] = "encode";
      acc.value.uint64["inject"] = "injectU64";
      break;
    case Type.tags.text:
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["reader-core"]["Text"] = this.mangle("TextR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Text"] = this.mangle("Text");
      break;
    case Type.tags.data:
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["reader-core"]["Data"] = this.mangle("DataR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Data"] = this.mangle("Data");
      break;
    case Type.tags.list:
      this.addList(type.getList().getElementType(), acc);
      break;
    case Type.tags.enum:
      acc["all-value"]["read-data"] = "decode";
      acc["all-value"]["write-data"] = "encode";
      break;
    case Type.tags.struct:
      this.addStruct(type.getStruct().getBrand(), acc);
      //TODO: Eslint rule for `//fall through` switch statements.
      break;
    case Type.tags.interface:
      acc.type["reader-core"]["CapValue"] = this.mangle("CapValueR");
      acc.type["reader-core"]["CapGutsR"] = this.mangle("CapGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["CapValue"] = this.mangle("CapValue");
      break;
    case Type.tags.anyPointer:
      {
        const anyPointerGroup = Type.groups.anyPointer;
        const anyPointer = type.getAnyPointer();
        switch (anyPointer.tag()) {
        case anyPointerGroup.tags.unconstrained:
          {
            const unconstrainedGroup = anyPointerGroup.groups.unconstrained;
            const unconstrained = anyPointer.getUnconstrained();
            switch (unconstrained.tag()) {
            case unconstrainedGroup.tags.anyKind:
              acc.type["reader-core"]["AnyValue"] = this.mangle("AnyValueR");
              acc.type["reader-core"]["AnyGutsR"] = this.mangle("AnyGutsR");
              acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
              acc.value["builder-core"]["AnyValue"] = this.mangle("AnyValue");
              break;
            case unconstrainedGroup.tags.struct:
              acc.type["reader-core"]["StructValue"] = this.mangle("StructValueR");
              acc.type["reader-core"]["StructGutsR"] = this.mangle("StructGutsR");
              acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
              acc.value["builder-core"]["StructValue"] = this.mangle("StructValue");
              break;
            case unconstrainedGroup.tags.list:
              acc.type["reader-core"]["ListValue"] = this.mangle("ListValueR");
              acc.type["reader-core"]["BoolListGutsR"] = this.mangle("BoolListGutsR");
              acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
              acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
              acc.value["builder-core"]["ListValue"] = this.mangle("ListValue");
              break;
            case unconstrainedGroup.tags.capability:
              acc.type["reader-core"]["CapValue"] = this.mangle("CapValueR");
              acc.type["reader-core"]["CapGutsR"] = this.mangle("CapGutsR");
              acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
              acc.value["builder-core"]["CapValue"] = this.mangle("CapValue");
              break;
            default:
              throw new Error("Unrecognized unconstrained-AnyPointer tag.");
            }
          }
        case anyPointerGroup.tags.parameter:
          break; //TODO: Can a parameter name collide with anything? My hunch is no given the underscores. If collisions can occur, then consider `__r` instead of `_r`.
        case anyPointerGroup.tags.implicitMethodParameter:
          throw new Error("TODO");
        default:
          throw new Error("Unrecognized any pointer tag.");
        }
      }
      break;
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  //TODO: Flag on Flow to stop treating uncalled functions as any. If you forget the parens, then you get errors silenced.
  addList(elementType: null | Type__InstanceR, acc: Acc): void {
    if (elementType === null) {
      elementType = Type.empty();
    }

    switch (elementType.tag()) {
    case Type.tags.void:
      acc.type["reader-core"]["VoidList"] = this.mangle("VoidListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["VoidList"] = this.mangle("VoidList");
      break;
    case Type.tags.bool:
      acc.type["reader-core"]["BoolList"] = this.mangle("BoolListR");
      acc.type["reader-core"]["BoolListGutsR"] = this.mangle("BoolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["BoolList"] = this.mangle("BoolList");
      break;
    case Type.tags.int8:
      acc.type["reader-core"]["Int8List"] = this.mangle("Int8ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Int8List"] = this.mangle("Int8List");
      break;
    case Type.tags.int16:
      acc.type["reader-core"]["Int16List"] = this.mangle("Int16ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Int16List"] = this.mangle("Int16List");
      break;
    case Type.tags.int32:
      acc.type["reader-core"]["Int32List"] = this.mangle("Int32ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Int32List"] = this.mangle("Int32List");
      break;
    case Type.tags.int64:
      acc.type["reader-core"]["Int64List"] = this.mangle("Int64ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Int64List"] = this.mangle("Int64List");
      break;
    case Type.tags.uint8:
      acc.type["reader-core"]["UInt8List"] = this.mangle("UInt8ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["UInt8List"] = this.mangle("UInt8List");
      break;
    case Type.tags.uint16:
      acc.type["reader-core"]["UInt16List"] = this.mangle("UInt16ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["UInt16List"] = this.mangle("UInt16List");
      break;
    case Type.tags.uint32:
      acc.type["reader-core"]["UInt32List"] = this.mangle("UInt32ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["UInt32List"] = this.mangle("UInt32List");
      break;
    case Type.tags.uint64:
      acc.type["reader-core"]["UInt64List"] = this.mangle("UInt64ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["UInt64List"] = this.mangle("UInt64List");
      break;
    case Type.tags.float32:
      acc.type["reader-core"]["Float32List"] = this.mangle("Float32ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Float32List"] = this.mangle("Float32List");
      break;
    case Type.tags.float64:
      acc.type["reader-core"]["Float64List"] = this.mangle("Float64ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Float64List"] = this.mangle("Float64List");
      break;
    case Type.tags.text:
      acc.type["reader-core"]["PointerListR"] = this.mangle("PointerListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["reader-core"]["Text"] = this.mangle("TextR");
      acc.type["builder-core"]["PointerListB"] = this.mangle("PointerListB");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Text"] = this.mangle("Text");
      acc.value["builder-core"]["pointers"] = "pointers";
      break;
    case Type.tags.data:
      acc.type["reader-core"]["PointerListR"] = this.mangle("PointerListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["reader-core"]["Data"] = this.mangle("DataR");
      acc.type["builder-core"]["PointerListB"] = this.mangle("PointerListB");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["Data"] = this.mangle("Data");
      acc.value["builder-core"]["pointers"] = "pointers";
      break;
    case Type.tags.list:
      acc.type["reader-core"]["PointerListR"] = this.mangle("PointerListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["PointerListB"] = this.mangle("PointerListB");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["pointers"] = "pointers";
      this.addList(elementType.getList().getElementType(), acc);
      break;
    case Type.tags.enum:
      acc.type["reader-core"]["UInt16List"] = this.mangle("UInt16ListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["UInt16List"] = this.mangle("UInt16List");
      break;
    case Type.tags.struct:
      acc.type["reader-core"]["StructListR"] = this.mangle("StructListR");
      acc.type["reader-core"]["NonboolListGutsR"] = this.mangle("NonboolListGutsR");
      acc.type["builder-core"]["StructListB"] = this.mangle("StructListB");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["structs"] = "structs";
      break;
    case Type.tags.interface:
      acc.type["reader-core"]["CapGutsR"] = this.mangle("CapGutsR");
      acc.type["reader-core"]["CapValue"] = this.mangle("CapValueR");
      acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
      acc.value["builder-core"]["CapValue"] = this.mangle("CapValue");
      break;
    case Type.tags.anyPointer:
      {
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
              acc.type["reader-core"]["ListValue"] = this.mangle("ListValueR");
              acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
              acc.value["builder-core"]["ListValue"] = this.mangle("ListValue");
              break;
            case unconstrainedGroup.tags.capability:
              acc.type["reader-core"]["CapGutsR"] = this.mangle("CapGutsR");
              acc.type["reader-core"]["CapValue"] = this.mangle("CapValueR");
              acc.type["builder-core"]["Orphan"] = this.mangle("Orphan");
              acc.value["builder-core"]["CapValue"] = this.mangle("CapValue");
              break;
            default:
              throw new Error("Unrecognized unconstrained-AnyPointer tag.");
            }
          }
          break;
        case anyPointerGroup.tags.parameter:
          throw new Error("Forbidden type: List(T) for some parameter T");
        case anyPointerGroup.tags.implicitMethodParameter:
          throw new Error("TODO");
        default:
          throw new Error("Unrecognized any pointer tag.");
        }
      }
      break;
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  addStruct(brand: null | Brand__InstanceR, acc: Acc): void {
    //TODO: I never touch the struct's id. Don't I need to? I expect imported structs to bust.
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

export default function accumulateBuilderLibs(index: Index, fileId: UInt64, names: Set<string>): Libs {
  function minus(lhs: { [naive: string]: string }, rhs: { [naive: string]: string }): { [naive: string]: string } {
    const result = {};
    Object.keys(lhs).forEach(naive => {
      if (!rhs.hasOwnProperty(naive)) {
        result[naive] = lhs[naive];
      }
    });

    return result;
  }

  function addNames(table: { [naive: string]: string }, acc: Set<string>): void {
    Object.keys(table).forEach(naive => {
      acc.add(table[naive]);
    });
  }

  const internalAcc = new LibsVisitor(index, names).visit(fileId, {
    aliases: {},
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
      "copy-pointers": {},
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

  internalAcc.type.int64 = minus(internalAcc.type.int64, internalAcc.value.int64);
  addNames(internalAcc.type.int64, libNames);
  internalAcc.type.uint64 = minus(internalAcc.type.uint64, internalAcc.value.uint64);
  addNames(internalAcc.type.uint64, libNames);
  internalAcc.type.layout = minus(internalAcc.type.layout, internalAcc.value.layout);
  addNames(internalAcc.type.layout, libNames);
  internalAcc.type.memory = minus(internalAcc.type.memory, internalAcc.value.memory);
  addNames(internalAcc.type.memory, libNames);
  internalAcc.type["reader-core"] = minus(internalAcc.type["reader-core"], internalAcc.value["reader-core"]);
  addNames(internalAcc.type["reader-core"], libNames);
  internalAcc.type["builder-core"] = minus(internalAcc.type["builder-core"], internalAcc.value["builder-core"]);
  addNames(internalAcc.type["builder-core"], libNames);

  addNames(internalAcc.value.int64, libNames);
  addNames(internalAcc.value.uint64, libNames);
  addNames(internalAcc.value.layout, libNames);
  addNames(internalAcc.value.memory, libNames);
  addNames(internalAcc.value["reader-core"], libNames);
  addNames(internalAcc.value["builder-core"], libNames);

  return { ...internalAcc, names: libNames };
}
