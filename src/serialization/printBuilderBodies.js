/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Printer from "../Printer";
import type Index from "../Index";
import type {
  Node__InstanceR,
  Brand__InstanceR,
  Field__InstanceR,
  Type__InstanceR,
  Type_anyPointer__InstanceR,
} from "../schema.capnp-r";
import type { ParametersIndex } from "./accumulateParameters";
import type {
  MetaWord,
  Values,
} from "./accumulateValues";

import { toHex } from "@capnp-js/uint64";
import { nonnull } from "@capnp-js/nullary";
import { int32 } from "@capnp-js/read-data";

import Visitor from "../Visitor";
import NonRepeats from "../util/NonRepeats";
import capitalize from "../util/capitalize";
import flatMap from "../util/flatMap";
import paramName from "../util/paramName";
import { Node, Brand, Field, Type } from "../schema.capnp-r";

type uint = number;
type u8 = number;
type u16 = number;
type u19 = number;
type u33 = number;

type UnionLayout = {
  maskedBytes: $ReadOnlyArray<{ offset: uint, mask: u8 }>,
  dataSequences: $ReadOnlyArray<{ offset: uint, length: u19 }>,
  pointersSequences: $ReadOnlyArray<{ offset: uint, length: u19 }>,
};

function unionLayout(index: Index, id: UInt64): UnionLayout {
  const layout = {
    dataBits: [],
    dataBytes: [],
    pointersWords: [],
  };

  function addUnionMembers(id, layout): void {
    function addField(field, layout): void {
      switch (field.tag()) {
      case Field.tags.slot:
        {
          const slot = field.getSlot();
          const offset = slot.getOffset();
          const type = slot.getType();
          switch (type === null ? 0 : type.tag()) {
          case Type.tags.bool:
            {
              const b = offset >>> 3;
              layout.dataBits.push({ b, mask: ~(0x01 << (offset & 0x07)) });
            }
            break;
          case Type.tags.int8:
          case Type.tags.uint8:
            layout.dataBytes.push(offset);
            break;
          case Type.tags.int16:
          case Type.tags.uint16:
          case Type.tags.enum:
            {
              const b = offset << 1;
              layout.dataBytes.push(b);
              layout.dataBytes.push(b+1);
            }
            break;
          case Type.tags.int32:
          case Type.tags.uint32:
          case Type.tags.float32:
            {
              const b = offset << 2;
              layout.dataBytes.push(b);
              layout.dataBytes.push(b+1);
              layout.dataBytes.push(b+2);
              layout.dataBytes.push(b+3);
            }
            break;
          case Type.tags.int64:
          case Type.tags.uint64:
          case Type.tags.float64:
            {
              const b = offset << 3;
              layout.dataBytes.push(b);
              layout.dataBytes.push(b+1);
              layout.dataBytes.push(b+2);
              layout.dataBytes.push(b+3);
              layout.dataBytes.push(b+4);
              layout.dataBytes.push(b+5);
              layout.dataBytes.push(b+6);
              layout.dataBytes.push(b+7);
            }
            break;
          case Type.tags.text:
          case Type.tags.data:
          case Type.tags.list:
          case Type.tags.struct:
          case Type.tags.interface:
          case Type.tags.anyPointer:
            layout.pointersWords.push(offset);
            break;
          }
        }
        break;
      case Field.tags.group:
        {
          const node = index.getNode(field.getGroup().getTypeId());
          const struct = node.getStruct();
          if (struct.getDiscriminantCount() !== 0) {
            const b = struct.getDiscriminantOffset() << 1;
            layout.dataBytes.push(b);
            layout.dataBytes.push(b+1);
          }
          const fields = struct.getFields();
          if (fields !== null) {
            fields.forEach(field => addField(field, layout));
          }
        }
        break;
      }
    }

    const node = index.getNode(id);
    const struct = node.getStruct();
    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.getDiscriminantValue() !== Field.getNoDiscriminant()) {
          addField(field, layout);
        }
      });
    }
  }

  addUnionMembers(id, layout);

  const dataBits = layout.dataBits.reduce((acc, { b, mask }) => {
    if (acc.hasOwnProperty(b)) {
      acc[b].mask &= mask;
    } else {
      acc[b] = { offset: b, mask };
    }

    return acc;
  }, {});

  /* A 0x00 mask implies a full byte, so move any 0x00 masks to the `dataBytes`
     data structure. */
  const maskedBytes = [];
  Object.keys(dataBits).forEach(b => {
    const offset = dataBits[b].offset;
    const mask = dataBits[b].mask & 0xff;
    if (mask === 0x00) {
      layout.dataBytes.push(offset);
    } else {
      maskedBytes.push({
        offset,
        mask,
      });
    }
  });

  layout.dataBytes.sort();
  const dataSequences = [];
  const dataBytes = new NonRepeats(layout.dataBytes);
  let b = dataBytes.next();
  while (!b.done) {
    const offset = b.value;
    let length = 0;
    do {
      b = dataBytes.next();
      ++length;
    } while (!b.done && b.value === offset+length);
    dataSequences.push({ offset, length });
  }

  layout.pointersWords.sort();
  const pointersSequences = [];
  const pointersWords = new NonRepeats(layout.pointersWords);
  let w = pointersWords.next();
  while (!w.done) {
    const offset = w.value << 3;
    let length = 0;
    do {
      w = pointersWords.next();
      length += 8;
    } while (!w.done && (w.value<<3) === offset+length);
    pointersSequences.push({ offset, length });
  }

  return {
    maskedBytes,
    dataSequences,
    pointersSequences,
  };
}

type MainTypeT = {
  guts: string,
  reader: string,
  builder: string,
};

class MainType {
  +index: Index;
  +identifiers: { [uuid: string]: string };
  +parameters: ParametersIndex;

  constructor(index: Index, identifiers: { [uuid: string]: string }, parameters: ParametersIndex) {
    this.index = index;
    this.identifiers = identifiers;
    this.parameters = parameters;
  }

  pointer(hostId: UInt64, type: null | Type__InstanceR): null | MainTypeT {
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
    case Type.tags.enum:
      return null;

    case Type.tags.text: return { guts: "NonboolListGutsR", reader: "TextR", builder: "Text" };
    case Type.tags.data: return { guts: "NonboolListGutsR", reader: "DataR", builder: "Data" };
    case Type.tags.list: return this.list(hostId, type.getList().getElementType());
    case Type.tags.struct:
      {
        const struct = type.getStruct();
        return this.struct(hostId, struct.getTypeId(), struct.getBrand());
      }
    case Type.tags.interface: return { guts: "CapGutsR", reader: "CapValueR", builder: "CapValue" };
    case Type.tags.anyPointer: return this.anyPointer(hostId, type.getAnyPointer());
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  list(hostId: UInt64, elementType: null | Type__InstanceR): MainTypeT {
    if (elementType === null) {
      elementType = Type.empty();
    }

    switch (elementType.tag()) {
    case Type.tags.void: return { guts: "NonboolListGutsR", reader: "VoidListR", builder: "VoidList" };
    case Type.tags.bool: return { guts: "BoolListGutsR", reader: "BoolListR", builder: "BoolList" };
    case Type.tags.int8: return { guts: "NonboolListGutsR", reader: "Int8ListR", builder: "Int8List" };
    case Type.tags.int16: return { guts: "NonboolListGutsR", reader: "Int16ListR", builder: "Int16List" };
    case Type.tags.int32: return { guts: "NonboolListGutsR", reader: "Int32ListR", builder: "Int32List" };
    case Type.tags.int64: return { guts: "NonboolListGutsR", reader: "Int64ListR", builder: "Int64List" };
    case Type.tags.uint8: return { guts: "NonboolListGutsR", reader: "UInt8ListR", builder: "UInt8List" };
    case Type.tags.uint16: return { guts: "NonboolListGutsR", reader: "UInt16ListR", builder: "UInt16List" };
    case Type.tags.uint32: return { guts: "NonboolListGutsR", reader: "UInt32ListR", builder: "UInt32List" };
    case Type.tags.uint64: return { guts: "NonboolListGutsR", reader: "UInt64ListR", builder: "UInt64List" };
    case Type.tags.float32: return { guts: "NonboolListGutsR", reader: "Float32ListR", builder: "Float32List" };
    case Type.tags.float64: return { guts: "NonboolListGutsR", reader: "Float64ListR", builder: "Float64List" };
    case Type.tags.text:
      return {
        guts: "NonboolListGutsR",
        reader: "PointerListR<NonboolListGutsR, TextR>",
        builder: "PointerListB<NonboolListGutsR, TextR, Text>",
      };
    case Type.tags.data:
      return {
        guts: "NonboolListGutsR",
        reader: "PointerListR<NonboolListGutsR, DataR>",
        builder: "PointerListB<NonboolListGutsR, DataR, Data>",
      };
    case Type.tags.list:
      {
        const t = this.list(hostId, elementType.getList().getElementType());
        return {
          guts: "NonboolListGutsR",
          reader: `PointerListR<NonboolListGutsR, ${t.reader}>`,
          builder: `PointerListB<NonboolListGutsR, ${t.reader}, ${t.builder}>`,
        };
      }
    case Type.tags.enum:
      return {
        guts: "NonboolListGutsR",
        reader: "UInt16ListR",
        builder: "UInt16List",
      };
    case Type.tags.struct:
      {
        const struct = elementType.getStruct();
        const t = this.struct(hostId, struct.getTypeId(), struct.getBrand());
        return {
          guts: "NonboolListGutsR",
          reader: `StructListR<${t.reader}>`,
          builder: `StructListB<${t.reader}, ${t.builder}>`,
        };
      }
    case Type.tags.interface:
      return {
        guts: "NonboolListGutsR",
        reader: "CapListR",
        builder: "CapList",
      };
    case Type.tags.anyPointer:
      {
        const t = this.anyPointer(hostId, elementType.getAnyPointer());
        return {
          guts: "NonboolListGutsR",
          reader: `PointerListR<NonboolListGutsR, ${t.reader}>`,
          builder: `PointerListB<NonboolListGutsR, ${t.reader}, ${t.builder}>`,
        };
      }
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  struct(hostId: UInt64, id: UInt64, brand: null | Brand__InstanceR): MainTypeT {
    const mangledName = this.identifiers[toHex(id)];

    const parameters = this.parameters[toHex(id)];
    if (parameters.main.length > 0) {
      const bindings = this.resolve(hostId, parameters.main, brand);

      const readerSpecialPs = flatMap(Array.from(parameters.main), name => {
        const binding = bindings[name];
        return [ binding.guts, binding.reader ];
      });

      const builderSpecialPs = flatMap(Array.from(parameters.main), name => {
        const binding = bindings[name];
        return [ binding.guts, binding.reader, binding.builder ];
      });

      return {
        guts: "StructGutsR",
        reader: `${mangledName}__InstanceR<${readerSpecialPs.join(", ")}>`,
        builder: `${mangledName}__InstanceB<${builderSpecialPs.join(", ")}>`,
      };
    } else {
      return {
        guts: "StructGutsR",
        reader: `${mangledName}__InstanceR`,
        builder: `${mangledName}__InstanceB`,
      };
    }
  }

  structContext(
    hostId: UInt64,
    id: UInt64,
    brand: null | Brand__InstanceR,
    cb: (guts: "StructGutsR", mangledName: string, pts: Array<MainTypeT>) => void,
  ): void {
    const mangledName = this.identifiers[toHex(id)];
    const parameters = this.parameters[toHex(id)];
    const bindings = this.resolve(hostId, parameters.main, brand);
    const pts = Array.from(parameters.main).map(name => bindings[name]);
    cb("StructGutsR", mangledName, pts);
  }

  anyPointer(hostId: UInt64, anyPointer: Type_anyPointer__InstanceR): MainTypeT {
    const anyPointerG = Type.groups.anyPointer;
    switch (anyPointer.tag()) {
    case anyPointerG.tags.unconstrained:
      {
        const unconstrainedG = anyPointerG.groups.unconstrained;
        const unconstrained = anyPointer.getUnconstrained();
        switch (unconstrained.tag()) {
        case unconstrainedG.tags.anyKind:
          return {
            guts: "AnyGutsR",
            reader: "AnyValueR",
            builder: "AnyValue",
          };
        case unconstrainedG.tags.struct:
          return {
            guts: "StructGutsR",
            reader: "StructValueR",
            builder: "StructValue",
          };
        case unconstrainedG.tags.list:
          return {
            guts: "BoolListGutsR | NonboolListGutsR",
            reader: "ListValueR",
            builder: "ListValue",
          };
        case unconstrainedG.tags.capability:
          return {
            guts: "CapGutsR",
            reader: "CapValueR",
            builder: "CapValue",
          };
        default:
          throw new Error("Unrecognized unconstrained AnyPointer type.");
        }
      }
    case anyPointerG.tags.parameter:
      {
        const parameter = anyPointer.getParameter();
        const scopeId = parameter.getScopeId();
        const name = paramName(this.index, scopeId, parameter.getParameterIndex());
        return {
          guts: `${name}_guts`,
          reader: `${name}_r`,
          builder: `${name}_b`,
        };
      }
    case anyPointerG.tags.implicitMethodParameter:
      {
        const parameter = anyPointer.getImplicitMethodParameter();
        const name = paramName(this.index, hostId, parameter.getParameterIndex());
        return {
          guts: `${name}_guts`,
          reader: `${name}_r`,
          builder: `${name}_b`,
        };
      }
    default:
      throw new Error("Unrecognized AnyPointer type tag");
    }
  }

  resolve(hostId: UInt64, parameters: $ReadOnlyArray<string>, brand: null | Brand__InstanceR): { [name: string]: MainTypeT } {
    if (brand === null) {
      brand = Brand.empty();
    }

    /* When I resolve a parameter, I remove it from a set of `unresolveds`. The
       Cap'n Proto specification prescribes that unresolvable parameters are
       AnyPointers, so any unresolved parameters get added to the result as an
       AnyValue. */
    const unresolveds = new Set(parameters);
    const bindings = {};
    if (brand !== null) {
      const scopes = brand.getScopes();
      if (scopes !== null) {
        scopes.forEach(scope => {
          switch (scope.tag()) {
          case Brand.Scope.tags.bind:
            {
              const bind = scope.getBind();
              if (bind !== null) {
                bind.forEach((binding, position) => {
                  const name = paramName(this.index, scope.getScopeId(), position);
                  switch (binding.tag()) {
                  case Brand.Binding.tags.unbound:
                    if (unresolveds.has(name)) {
                      unresolveds.delete(name);
                      bindings[name] = {
                        guts: "AnyGutsR",
                        reader: "AnyValueR",
                        builder: "AnyValue",
                      };
                    }
                    break;
                  case Brand.Binding.tags.type:
                    if (unresolveds.has(name)) {
                      unresolveds.delete(name);
                      bindings[name] = nonnull(this.pointer(hostId, binding.getType()));
                    }
                    break;
                  default:
                    throw new Error("Unrecognized brand binding tag.");
                  }
                });
              }
            }
            break;
          case Brand.Scope.tags.inherit:
            {
              const scopeId = scope.getScopeId();
              const parameters = this.index.getNode(scopeId).getParameters();
              if (parameters !== null) {
                parameters.forEach((parameter, position) => {
                  const name = paramName(this.index, scopeId, position);
                  if (unresolveds.has(name)) {
                    unresolveds.delete(name);
                    bindings[name] = {
                      guts: `${name}_guts`,
                      reader: `${name}_r`,
                      builder: `${name}_b`,
                    };
                  }
                });
              }
            }
            break;
          default:
            throw new Error("Unrecognized brand scope tag.");
          }
        });
      }
    }

    /* Use AnyValue types for any parameters that weren't touched. */
    unresolveds.forEach(name => {
      bindings[name] = {
        guts: "AnyGutsR",
        reader: "AnyValueR",
        builder: "AnyValue",
      };
    });

    return bindings;
  }
}

class CtorValue {
  +index: Index;
  +identifiers: { [uuid: string]: string };
  +parameters: ParametersIndex;

  constructor(index: Index, identifiers: { [uuid: string]: string }, parameters: ParametersIndex) {
    this.index = index;
    this.identifiers = identifiers;
    this.parameters = parameters;
  }

  pointer(hostId: UInt64, type: null | Type__InstanceR): null | string {
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
      return null;

    case Type.tags.text: return "Text";
    case Type.tags.data: return "Data";
    case Type.tags.list: return this.list(hostId, type.getList().getElementType());
    case Type.tags.enum:
      return null;
    case Type.tags.struct:
      {
        const struct = type.getStruct();
        return this.struct(hostId, struct.getTypeId(), struct.getBrand());
      }
    case Type.tags.interface: return "CapValue";
    case Type.tags.anyPointer: return this.anyPointer(hostId, type.getAnyPointer());
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  list(hostId: UInt64, elementType: null | Type__InstanceR): string {
    if (elementType === null) {
      elementType = Type.empty();
    }

    switch (elementType.tag()) {
    case Type.tags.void: return "VoidList";
    case Type.tags.bool: return "BoolList";
    case Type.tags.int8: return "Int8List";
    case Type.tags.int16: return "Int16List";
    case Type.tags.int32: return "Int32List";
    case Type.tags.int64: return "Int64List";
    case Type.tags.uint8: return "UInt8List";
    case Type.tags.uint16: return "UInt16List";
    case Type.tags.uint32: return "UInt32List";
    case Type.tags.uint64: return "UInt64List";
    case Type.tags.float32: return "Float32List";
    case Type.tags.float64: return "Float64List";
    case Type.tags.text: return "pointers(Text)";
    case Type.tags.data: return "pointers(Data)";
    case Type.tags.list:
      return `pointers(${this.list(hostId, elementType.getList().getElementType())})`;
    case Type.tags.enum: return "UInt16List";
    case Type.tags.struct:
      {
        const struct = elementType.getStruct();
        return `structs(${this.struct(hostId, struct.getTypeId(), struct.getBrand())})`;
      }
    case Type.tags.interface: return "pointers(CapValue)";
    case Type.tags.anyPointer:
      return `pointers(${this.anyPointer(hostId, elementType.getAnyPointer())})`;
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  struct(hostId: UInt64, id: UInt64, brand: null | Brand__InstanceR): string {
    const mangledName = this.identifiers[toHex(id)];

    const parameters = this.parameters[toHex(id)];
    if (parameters.main.length > 0) {
      const bindings = this.resolve(hostId, parameters.main, brand);
      //TODO: Is parameters.ctor the correct set for consts? Do I need fix accumulateParameters? I think that ctor and instance converge at leafs, so this should be fine, no? Test me.
      const objectParams = Array.from(parameters.main).map(name => `${name}: ${bindings[name]}`);
      return `new ${mangledName}__CtorB({ ${objectParams.join(", ")} })`;
    } else {
      return `new ${mangledName}__CtorB()`;
    }
  }

  anyPointer(hostId: UInt64, anyPointer: Type_anyPointer__InstanceR): string {
    const anyPointerG = Type.groups.anyPointer;
    switch (anyPointer.tag()) {
    case anyPointerG.tags.unconstrained:
      {
        const unconstrainedG = anyPointerG.groups.unconstrained;
        const unconstrained = anyPointer.getUnconstrained();
        switch (unconstrained.tag()) {
        case unconstrainedG.tags.anyKind: return "AnyValue";
        case unconstrainedG.tags.struct: return "StructValue";
        case unconstrainedG.tags.list: return "ListValue";
        case unconstrainedG.tags.capability: return "CapValue";
        default: throw new Error("Unrecognized unconstrained AnyPointer type.");
        }
      }
    case anyPointerG.tags.parameter:
      {
        const parameter = anyPointer.getParameter();
        const scopeId = parameter.getScopeId();
        const name = paramName(this.index, scopeId, parameter.getParameterIndex());
        return `this.params.${name}`;
      }
    case anyPointerG.tags.implicitMethodParameter:
      {
        const parameter = anyPointer.getImplicitMethodParameter();
        const name = paramName(this.index, hostId, parameter.getParameterIndex());
        return `this.params.${name}`;
      }
    default:
      throw new Error("Unrecognized AnyPointer type tag");
    }
  }

  resolve(hostId: UInt64, parameters: $ReadOnlyArray<string>, brand: null | Brand__InstanceR): { [name: string]: string } {
    if (brand === null) {
      brand = Brand.empty();
    }

    /* When I resolve a parameter, I remove it from a set of `unresolveds`. The
       Cap'n Proto specification prescribes that unresolvable parameters are
       AnyPointers, so any unresolved parameters get added to the result as
       AnyValue. */
    const unresolveds = new Set(parameters);
    const bindings = {};
    const scopes = brand.getScopes();
    if (scopes !== null) {
      scopes.forEach(scope => {
        switch (scope.tag()) {
        case Brand.Scope.tags.bind:
          {
            const bind = scope.getBind();
            if (bind !== null) {
              bind.forEach((binding, position) => {
                const name = paramName(this.index, scope.getScopeId(), position);
                switch (binding.tag()) {
                case Brand.Binding.tags.unbound:
                  if (unresolveds.has(name)) {
                    unresolveds.delete(name);
                    bindings[name] = "AnyValue";
                  }
                  break;
                case Brand.Binding.tags.type:
                  if (unresolveds.has(name)) {
                    unresolveds.delete(name);
                    bindings[name] = nonnull(this.pointer(hostId, binding.getType()));
                  }
                  break;
                default:
                  throw new Error("Unrecognized brand binding tag.");
                }
              });
            }
          }
          break;
        case Brand.Scope.tags.inherit:
          {
            const scopeId = scope.getScopeId();
            const parameters = this.index.getNode(scopeId).getParameters();
            if (parameters !== null) {
              parameters.forEach((parameter, position) => {
                const name = paramName(this.index, scopeId, position);
                if (unresolveds.has(name)) {
                  unresolveds.delete(name);
                  bindings[name] = `this.params.${name}`;
                  //TODO: Bodies superclass that templates out this assignment?
                  //      Because Orphans need the guts type, I expect that the builder would return an object instead of strings
                }
              });
            }
          }
          break;
        default:
          throw new Error("Unrecognized brand scope tag.");
        }
      });
    }

    /* Use AnyValue types for any parameters that weren't touched. */
    unresolveds.forEach(name => {
      bindings[name] = "AnyValue";
    });

    return bindings;
  }
}

class GroupValues {
  +index: Index;

  constructor(index: Index) {
    this.index = index;
  }

  peek(id: UInt64): { tagExists: boolean, groupExists: boolean } {
    const struct = this.index.getNode(id).getStruct();
    const tagExists = struct.getDiscriminantCount() > 0;
    let groupExists = false;
    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          groupExists = true;
        }
      });
    }

    return { tagExists, groupExists };
  }

  tagsRoot(id: UInt64, baseName: string, p: Printer): boolean {
    const node = this.index.getNode(id);
    if (node.getStruct().getDiscriminantCount() > 0) {
      const fields = nonnull(node.getStruct().getFields());
      p.line(`const ${baseName}__Tags = {`);
      p.indent(p => {
        fields.forEach(field => {
          const tag = field.getDiscriminantValue();
          if (tag !== Field.getNoDiscriminant()) {
            p.line(`${nonnull(field.getName()).toString()}: ${tag},`);
          }
        });
      });
      p.line("};");

      return true;
    } else {
      return false;
    }
  }

  tags(id: UInt64, p: Printer): void {
    const node = this.index.getNode(id);
    const fields = nonnull(node.getStruct().getFields());
    p.line("tags: {");
    p.indent(p => {
      fields.forEach(field => {
        const tag = field.getDiscriminantValue();
        if (tag !== Field.getNoDiscriminant()) {
          p.line(`${nonnull(field.getName()).toString()}: ${tag},`);
        }
      });
    });
    p.line("},");
  }

  groupsRoot(id: UInt64, baseName: string, p: Printer): boolean {
    if (this.peek(id).groupExists) {
      const node = this.index.getNode(id);
      p.line(`const ${baseName}__Groups = {`);
      p.indent(p => {
        const fields = nonnull(node.getStruct().getFields());
        fields.forEach(field => {
          if (field.tag() === Field.tags.group) {
            const child = this.peek(field.getGroup().getTypeId());
            if (!child.tagExists && !child.groupExists) {
              p.line(`${nonnull(field.getName()).toString()}: {},`);
            } else {
              p.line(`${nonnull(field.getName()).toString()}: {`);
              this.groups(field.getGroup().getTypeId(), p);
              p.line("},");
            }
          }
        });
      });
      p.line("};");

      return true;
    } else {
      return false;
    }
  }

  groups(id: UInt64, p: Printer): void {
    const node = this.index.getNode(id);
    const parent = this.peek(id);
    if (parent.tagExists || parent.groupExists) {
      p.indent(p => {
        if (parent.tagExists) {
          this.tags(id, p);
        }

        if (parent.groupExists) {
          p.line("groups: {");
          p.indent(p => {
            const fields = nonnull(node.getStruct().getFields());
            fields.forEach(field => {
              if (field.tag() === Field.tags.group) {
                const child = this.peek(field.getGroup().getTypeId());
                if (!child.tagExists && !child.groupExists) {
                  p.line(`${nonnull(field.getName()).toString()}: {},`);
                } else {
                  p.line(`${nonnull(field.getName()).toString()}: {`);
                  this.groups(field.getGroup().getTypeId(), p);
                  p.line("},");
                }
              }
            });
          });
          p.line("},");
        }
      });
    }
  }
}

class GroupTypes {
  +index: Index;

  constructor(index: Index) {
    this.index = index;
  }

  peek(id: UInt64): { tagExists: boolean, groupExists: boolean } {
    const struct = this.index.getNode(id).getStruct();
    const tagExists = struct.getDiscriminantCount() > 0;
    let groupExists = false;
    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          groupExists = true;
        }
      });
    }

    return { tagExists, groupExists };
  }

  tagsRoot(id: UInt64, p: Printer): boolean {
    const node = this.index.getNode(id);
    if (node.getStruct().getDiscriminantCount() > 0) {
      const fields = nonnull(node.getStruct().getFields());
      p.line("+tags: {");
      p.indent(p => {
        fields.forEach(field => {
          const tag = field.getDiscriminantValue();
          if (tag !== Field.getNoDiscriminant()) {
            p.line(`+${nonnull(field.getName()).toString()}: ${tag},`);
          }
        });
      });
      p.line("};");

      return true;
    } else {
      return false;
    }
  }

  tags(id: UInt64, p: Printer): void {
    const node = this.index.getNode(id);
    const fields = nonnull(node.getStruct().getFields());
    p.line("+tags: {");
    p.indent(p => {
      fields.forEach(field => {
        const tag = field.getDiscriminantValue();
        if (tag !== Field.getNoDiscriminant()) {
          p.line(`+${nonnull(field.getName()).toString()}: ${tag},`);
        }
      });
    });
    p.line("},");
  }

  groupsRoot(id: UInt64, p: Printer): boolean {
    if (this.peek(id).groupExists) {
      const node = this.index.getNode(id);
      p.line("+groups: {");
      p.indent(p => {
        const fields = nonnull(node.getStruct().getFields());
        fields.forEach(field => {
          if (field.tag() === Field.tags.group) {
            const child = this.peek(field.getGroup().getTypeId());
            if (!child.tagExists && !child.groupExists) {
              p.line(`+${nonnull(field.getName()).toString()}: {},`);
            } else {
              p.line(`+${nonnull(field.getName()).toString()}: {`);
              this.groups(field.getGroup().getTypeId(), p);
              p.line("},");
            }
          }
        });
      });
      p.line("};");

      return true;
    } else {
      return false;
    }
  }

  groups(id: UInt64, p: Printer): void {
    const node = this.index.getNode(id);
    const parent = this.peek(id);
    if (parent.tagExists || parent.groupExists) {
      p.indent(p => {
        if (parent.tagExists) {
          this.tags(id, p);
        }

        if (parent.groupExists) {
          p.line("+groups: {");
          p.indent(p => {
            const fields = nonnull(node.getStruct().getFields());
            fields.forEach(field => {
              if (field.tag() === Field.tags.group) {
                const child = this.peek(field.getGroup().getTypeId());
                if (!child.tagExists && !child.groupExists) {
                  p.line(`+${nonnull(field.getName()).toString()}: {},`);
                } else {
                  p.line(`+${nonnull(field.getName()).toString()}: {`);
                  this.groups(field.getGroup().getTypeId(), p);
                  p.line("},");
                }
              }
            });
          });
          p.line("},");
        }
      });
    }
  }
}

class BuildersVisitor extends Visitor<Printer> {
  +parameters: ParametersIndex;
  +type: MainType;
  +ctorValue: CtorValue;
  +groupTypes: GroupTypes;
  +groupValues: GroupValues;
  +values: null | Values;

  constructor(index: Index, identifiers: { [uuid: string]: string }, parameters: ParametersIndex, values: null | Values) {
    super(index);
    this.parameters = parameters;
    this.type = new MainType(index, identifiers, parameters);
    this.ctorValue = new CtorValue(index, identifiers, parameters);
    this.groupTypes = new GroupTypes(index);
    this.groupValues = new GroupValues(index);
    this.values = values;
  }

  structField(
    hostId: UInt64,
    field: Field__InstanceR,
    defs: null | { [name: string]: MetaWord },
    discrOffset: u33,
    union: UnionLayout,
    p: Printer
  ): void {
    function checkTag(discrValue: u16, discrOffset: u33, p: Printer): void {
      if (discrValue !== Field.getNoDiscriminant()) {
        p.line(`this.guts.checkTag(${discrValue}, ${discrOffset});`);
      }
    }

    function setTag(discrValue: u16, discrOffset: u33, p: Printer): void {
      if (discrValue !== Field.getNoDiscriminant()) {
        p.line(`this.guts.setTag(${discrValue}, ${discrOffset}, {`);
        p.indent(p => {
          const partialDBs = union.maskedBytes.map(p => `[${p.offset}, ${p.mask}]`);
          p.line(`partialDataBytes: [${partialDBs.join(", ")}],`);

          const dataBs = union.dataSequences.map(p => `[${p.offset}, ${p.length}]`);
          p.line(`dataBytes: [${dataBs.join(", ")}],`);

          const pointersBs = union.pointersSequences.map(p => `[${p.offset}, ${p.length}]`);
          p.line(`pointersBytes: [${pointersBs.join(", ")}],`);
        });
        p.line("});");
      }
    }

    function initTag(discrValue: u16, discrOffset: u33, p: Printer): void {
      if (discrValue !== Field.getNoDiscriminant()) {
        p.line(`this.guts.initTag(${discrValue}, ${discrOffset}, {`);
        p.indent(p => {
          const partialDBs = union.maskedBytes.map(p => `[${p.offset}, ${p.mask}]`);
          p.line(`partialDataBytes: [${partialDBs.join(", ")}],`);

          const dataBs = union.dataSequences.map(p => `[${p.offset}, ${p.length}]`);
          p.line(`dataBytes: [${dataBs.join(", ")}],`);

          const pointersBs = union.pointersSequences.map(p => `[${p.offset}, ${p.length}]`);
          p.line(`pointersBytes: [${pointersBs.join(", ")}],`);
        });
        p.line("});");
      }
    }

    const name = nonnull(field.getName());
    p.comment(name.toString());

    const discrValue = field.getDiscriminantValue();
    const getField = `get${capitalize(name.toString())}`;
    const setField = `set${capitalize(name.toString())}`;
    const disownField = `disown${capitalize(name.toString())}`;
    const adoptField = `adopt${capitalize(name.toString())}`;

    switch (field.tag()) {
    case Field.tags.slot:
      {
        const slot = field.getSlot();
        let type = slot.getType();
        if (type === null) {
          type = Type.empty();
        }

        switch (type.tag()) {
        case Type.tags.void:
          if (discrValue !== Field.getNoDiscriminant()) {
            p.block(`${getField}(): void`, p => {
              checkTag(discrValue, discrOffset, p);
            });
            p.block(`${setField}(): void`, p => {
              setTag(discrValue, discrOffset, p);
            });
          } else {
            p.line(`${getField}(): void {}`);
            p.line(`${setField}(): void {}`);
          }
          break;
        case Type.tags.bool:
          p.block(`${getField}(): boolean`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() >>> 3};`);

            const def = nonnull(slot.getDefaultValue()).getBool();
            const prefix = def === true ? "!" : "!!";
            p.line(`return ${prefix}decode.bit(this.guts.segment.raw, d, ${slot.getOffset() & 0x07});`);
          });
          p.block(`${setField}(value: boolean): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() >>> 3};`);

            const def = nonnull(slot.getDefaultValue()).getBool();
            const prefix = def === true ? "!" : "!!";
            p.line(`encode.bit(${prefix}value, this.guts.segment.raw, d, ${slot.getOffset() & 0x07});`);
          });
          break;
        case Type.tags.int8:
          p.block(`${getField}(): i8`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getInt8();
            p.line(`return ${def} ^ decode.int8(this.guts.segment.raw, d);`);
          });
          p.block(`${setField}(value: i8): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getInt8();
            p.line(`encode.int8(${def} ^ value, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.int16:
          p.block(`${getField}(): i16`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getInt16();
            p.line(`return ${def} ^ decode.int16(this.guts.segment.raw, d);`);
          });
          p.block(`${setField}(value: i16): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getInt16();
            p.line(`encode.int16(${def} ^ value, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.int32:
          p.block(`${getField}(): i32`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getInt32();
            p.line(`return ${def} ^ decode.int32(this.guts.segment.raw, d);`);
          });
          p.block(`${setField}(value: i32): void`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getInt32();
            p.line(`encode.int32(${def} ^ value, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.int64:
          p.block(`${getField}(): Int64`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getInt64();
            p.line ("return injectI64(");
            p.indent(p => {
              p.line(`${def[0]} ^ decode.int32(this.guts.segment.raw, d+4),`);
              p.line(`${def[1]} ^ decode.int32(this.guts.segment.raw, d),`);
            });
            p.line(");");
          });
          p.block(`${setField}(value: Int64): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getInt64();
            p.line(`encode.int32(${def[0]} ^ value[0], this.guts.segment.raw, d+4);`);
            p.line(`encode.int32(${def[1]} ^ value[1], this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.uint8:
          p.block(`${getField}(): u8`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getUint8();
            p.line(`return (${def} ^ decode.uint8(this.guts.segment.raw, d)) >>> 0;`);
          });
          p.block(`${setField}(value: u8): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getUint8();
            p.line(`encode.uint8(${def} ^ value, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.uint16:
          p.block(`${getField}(): u16`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getUint16();
            p.line(`return (${def} ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;`);
          });
          p.block(`${setField}(value: u16): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getUint16();
            p.line(`encode.uint16(${def} ^ value, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.uint32:
          p.block(`${getField}(): u32`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getUint32();
            p.line(`return (${def} ^ decode.uint32(this.guts.segment.raw, d)) >>> 0;`);
          });
          p.block(`${setField}(value: u32): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getUint32();
            p.line(`encode.uint32(${def} ^ value, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.uint64:
          p.block(`${getField}(): UInt64`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getUint64();
            p.line("return injectU64(");
            p.indent(p => {
              p.line(`${def[0]} ^ decode.int32(this.guts.segment.raw, d+4),`);
              p.line(`${def[1]} ^ decode.int32(this.guts.segment.raw, d),`);
            });
            p.line(");");
          });
          p.block(`${setField}(value: UInt64): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getUint64();
            p.line(`encode.int32(${def[0]} ^ value[0], this.guts.segment.raw, d+4);`);
            p.line(`encode.int32(${def[1]} ^ value[1], this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.float32:
          p.block(`${getField}(): f32`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            /* Manually grab the default's bit pattern from the Float32
               location. */
//TODO: If default was not explicitly provided, then don't include the `${def} ^`.
//      The following `nonnull` seems reliable, but it isn't necessary.
            const guts = nonnull(slot.getDefaultValue()).guts;
            const def = int32(guts.segment.raw, guts.layout.dataSection + 4);
            p.line("const bytes = decode.int32(this.guts.segment.raw, d);");
            p.line(`return decode.float32(${def} ^ bytes);`);
          });
          p.block(`${setField}(value: f32): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            /* Manually grab the default's bit pattern from the Float32
               location. */
            const guts = nonnull(slot.getDefaultValue()).guts;
            const def = int32(guts.segment.raw, guts.layout.dataSection + 4);
            p.line("const bytes = encode.float32(value);");
            p.line(`encode.int32(${def} ^ bytes, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.float64:
          p.block(`${getField}(): f64`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            /* Manually grab the default's bit pattern from the Float64
               location. */
            const guts = nonnull(slot.getDefaultValue()).guts;
            const def = [
              int32(guts.segment.raw, guts.layout.dataSection + 12),
              int32(guts.segment.raw, guts.layout.dataSection + 8),
            ];
            p.line("const bytes = injectI64(");
            p.indent(p => {
              p.line(`${def[0]} ^ decode.int32(this.guts.segment.raw, d+4),`);
              p.line(`${def[1]} ^ decode.int32(this.guts.segment.raw, d),`);
            });
            p.line(");");
            p.line("return decode.float64(bytes);");
          });
          p.block(`${setField}(value: f64): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            /* Manually grab the default's bit pattern from the Float64
               location. */
            const guts = nonnull(slot.getDefaultValue()).guts;
            const def = [
              int32(guts.segment.raw, guts.layout.dataSection + 12),
              int32(guts.segment.raw, guts.layout.dataSection + 8),
            ];
            p.line("const bytes = encode.float64(value);");
            p.line(`encode.int32(${def[0]} ^ bytes[0], this.guts.segment.raw, d+4);`);
            p.line(`encode.int32(${def[1]} ^ bytes[1], this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.enum:
          p.block(`${getField}(): u16`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getEnum();
            p.line(`return (${def} ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;`);
          });
          p.block(`${setField}(value: u16): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getEnum();
            p.line(`encode.uint16(${def} ^ value, this.guts.segment.raw, d);`);
          });
          break;
        case Type.tags.text:
        case Type.tags.data:
        case Type.tags.list:
        case Type.tags.struct:
        case Type.tags.interface:
        case Type.tags.anyPointer:
          const it = nonnull(this.type.pointer(hostId, type));
          if (slot.getHadExplicitDefault()) {
            p.block(`${getField}(): ${it.builder}`, p => {
              checkTag(discrValue, discrOffset, p);

              p.line(`const ref = this.guts.pointersWord(${slot.getOffset() << 3});`);
              const ctor = nonnull(this.ctorValue.pointer(hostId, type));
              const def = nonnull(defs)[name.toString()];
              p.if("isNull(ref)", p => {
                p.line(`pointerCopy(blob, { segment: blob.segments[${def.segmentId}], position: ${def.position} }, this.guts.level, this.guts.arena, ref);`);
              });
              p.line(`return ${ctor}.deref(this.guts.level, this.guts.arena, ref);`);
            });
          } else {
            p.block(`${getField}(): null | ${it.builder}`, p => {
              checkTag(discrValue, discrOffset, p);

              p.line(`const ref = this.guts.pointersWord(${slot.getOffset() << 3});`);
              const ctor = nonnull(this.ctorValue.pointer(hostId, type));
              p.line(`return ${ctor}.get(this.guts.level, this.guts.arena, ref);`);
            });
          }
          p.block(`${setField}(value: ${it.reader} | ${it.builder}): void`, p => {
            setTag(discrValue, discrOffset, p);

            p.line(`const ref = this.guts.pointersWord(${slot.getOffset() << 3});`);
            p.line("value.guts.set(this.guts.level, this.guts.arena, ref);");
          });
          if (slot.getHadExplicitDefault()) {
            p.block(`${disownField}(): Orphan<${it.guts}, ${it.reader}, ${it.builder}>`, p => {
              checkTag(discrValue, discrOffset, p);

              p.line(`const ref = this.guts.pointersWord(${slot.getOffset() << 3});`);
              const ctor = nonnull(this.ctorValue.pointer(hostId, type));
              const def = nonnull(defs)[name.toString()];

              p.if("isNull(ref)", p => {
                p.line(`pointerCopy(blob, { segment: blob.segments[${def.segmentId}], position: ${def.position} }, this.guts.level, this.guts.arena, ref);`);
              });
              p.line(`return ${ctor}.unref(this.guts.level, this.guts.arena, ref);`);
            });
          } else {
            p.block(`${disownField}(): null | Orphan<${it.guts}, ${it.reader}, ${it.builder}>`, p => {
              checkTag(discrValue, discrOffset, p);

              p.line(`const ref = this.guts.pointersWord(${slot.getOffset() << 3});`);
              const ctor = nonnull(this.ctorValue.pointer(hostId, type));
              p.line(`return ${ctor}.disown(this.guts.level, this.guts.arena, ref);`);
            });
          }
          p.block(`${adoptField}(orphan: Orphan<${it.guts}, ${it.reader}, ${it.builder}>): void`, p => {
            setTag(discrValue, discrOffset, p);
//TODO: Should this clobber the target pointer before orphan.guts.adopt has the opportunity to throw?
//      I think it's fine. This is a programmer error that should be fixed, not caught.
            p.line(`const ref = this.guts.pointersWord(${slot.getOffset() << 3});`);
            p.line("orphan.guts.adopt(this.guts.arena, ref);");
          });
          break;
        default:
          throw new Error("Unrecognized type tag.");
        }
      }
      break;
    case Field.tags.group:
      {
        const group = field.getGroup();
        const id = group.getTypeId();
        const baseName = `${this.index.getScopes(id).slice(1).map(s => s.name).join("_")}`;

        const parameters = this.parameters[toHex(id)].main;

        const specialPs = flatMap(Array.from(parameters), name => [
          `${name}_guts`,
          `${name}_r`,
          `${name}_b`,
        ]);
        const objectParams = Array.from(parameters).map(name => `${name}: this.params.${name}`);

        let specialization = `${baseName}__InstanceB`;
        if (parameters.length > 0) {
          specialization += `<${specialPs.join(", ")}>`;
        }

        p.block(`${getField}(): ${specialization}`, p => {
          checkTag(discrValue, discrOffset, p);

          if (parameters.length > 0) {
            p.line(`return new ${baseName}__InstanceB(this.guts, { ${objectParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__InstanceB(this.guts);`);
          }
        });

        if (discrValue !== Field.getNoDiscriminant()) {
          const initField = `init${capitalize(name.toString())}`;
          p.block(`${initField}(): ${specialization}`, p => {
            initTag(discrValue, discrOffset, p);

            if (parameters.length > 0) {
              p.line(`return new ${baseName}__InstanceB(this.guts, { ${objectParams.join(", ")} });`);
            } else {
              p.line(`return new ${baseName}__InstanceB(this.guts);`);
            }
          });
        }
      }
      break;
    default:
      throw new Error("Unrecognized field tag.");
    }
  }

  printStruct(type: "param" | "result" | "plain", node: Node__InstanceR, p: Printer): void {
    const uuid = toHex(node.getId());
    const baseName = this.index.getScopes(node.getId()).slice(1).map(s => s.name).join("_");
    const parameters = this.parameters[uuid];
    const struct  = node.getStruct();
    const defs = this.values === null ? null : this.values.defaults[uuid];
    let prefix;
    switch (type) {
    case "param":
      prefix = "Param";
      break;
    case "result":
      prefix = "Result";
      break;
    default:
      (type: "plain");
      prefix = "";
    }

    this.groupValues.tagsRoot(node.getId(), baseName, p);

    p.interrupt();

    this.groupValues.groupsRoot(node.getId(), baseName, p);

    p.interrupt();

    if (parameters.specialize.length > 0) {
      /* This struct introduces new generic parameters, so I need a
         `X__GenericB` class. */

      const declareParams = flatMap(Array.from(parameters.generic), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
        `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
      ]);

      const objectParams = Array.from(parameters.generic).map(name => {
        return `+${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`;
      });

      let class_ = `export class ${baseName}__${prefix}GenericB`;
      if (parameters.generic.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      p.block(class_, p => {
        const constructorAsses = [];

        const nestedNodes = node.getNestedNodes();
        if (nestedNodes !== null) {
          nestedNodes.forEach(nestedNode => {
            const contained = this.index.getNode(nestedNode.getId());
            if (contained.tag() === Node.tags.enum) {
              const localName = nonnull(nestedNode.getName()).toString();
              const enumerants = contained.getEnum().getEnumerants();
              if (enumerants === null || enumerants.length() === 0) {
                p.line(`+${localName}: {}`);
              } else {
                p.line(`+${localName}: {`);
                p.indent(p => {
                  enumerants.forEach((enumerant, value) => {
                    p.line(`+${nonnull(enumerant.getName()).toString()}: ${value},`);
                  });
                });
                p.line("};");
              }

              constructorAsses.push(`this.${localName} = ${baseName}_${localName}__Enum;`);
            }
          });
        }

        if (this.groupTypes.tagsRoot(node.getId(), p)) {
          constructorAsses.push(`this.tags = ${baseName}__Tags;`);
        }

        //TODO: Test enum code embedded within structs (and interfaces)
        if (this.groupTypes.groupsRoot(node.getId(), p)) {
          constructorAsses.push(`this.groups = ${baseName}__Groups;`);
        }

        if (parameters.generic.length > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);
          constructorAsses.push("this.params = params;");
        }

        p.interrupt();

        if (constructorAsses.length > 0) {
          if (parameters.generic.length > 0) {
            p.block(`constructor(params: { ${objectParams.join(", ")} })`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);
              });
            });
          } else {
            p.block(`constructor()`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);
              });
            });
          }
        }

        p.interrupt();

        const declarePs = flatMap(parameters.specialize, name => [
          `${name}_guts: AnyGutsR`,
          `${name}_r: {+guts: ${name}_guts}`,
          `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
        ]);
        const argPs = parameters.specialize.map(name => {
          return `${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`;
        });
        const specialPs = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
          `${name}_b`,
        ]);
        const specialization = `${baseName}__${prefix}CtorB<${specialPs.join(", ")}>`;
        p.block(`specialize<${declarePs.join(", ")}>(${argPs.join(", ")}): ${specialization}`, p => {
          let newPs = Array.from(parameters.generic).map(name => `${name}: this.params.${name}`);
          newPs = newPs.concat(parameters.specialize);

          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}CtorB({ ${newPs.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}CtorB();`);
          }
        });
      });
    }

    p.interrupt();

    {
      /* `X__CtorB` */

      let thisR = `${baseName}__${prefix}InstanceR`;
      let thisB = `${baseName}__${prefix}InstanceB`;
      if (parameters.main.length > 0) {
        const specialParamsR = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
        ]);
        thisR += `<${specialParamsR.join(", ")}>`;

        const specialParamsB = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
          `${name}_b`,
        ]);
        thisB += `<${specialParamsB.join(", ")}>`;
      }

      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
        `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`;
      });

      let class_ = `export class ${baseName}__${prefix}CtorB`;
      if (parameters.main.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      class_ += ` implements StructCtorB<${thisR}, ${thisB}>`;

      p.block(class_, p => {
        const constructorAsses = [];

        const nestedNodes = node.getNestedNodes();
        if (nestedNodes !== null) {
          nestedNodes.forEach(nestedNode => {
            const contained = this.index.getNode(nestedNode.getId());
            switch (contained.tag()) {
            case Node.tags.struct:
            case Node.tags.interface:
              {
                const localName = nonnull(nestedNode.getName()).toString();
                const parameters = this.parameters[toHex(nestedNode.getId())];
                if (parameters.specialize.length > 0) {
                  let t = `${baseName}_${localName}__GenericB`;
                  if (parameters.generic.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.generic), name => [
                      `${name}_guts`,
                      `${name}_r`,
                      `${name}_b`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.generic.length > 0) {
                    const params = Array.from(parameters.generic).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericB({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericB();`);
                  }
                } else {
                  let t = `${baseName}_${localName}__CtorB`;
                  if (parameters.main.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                      `${name}_b`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.main.length > 0) {
                    const params = Array.from(parameters.main).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorB({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorB();`);
                  }
                }
              }
              break;
            case Node.tags.enum:
              {
                const localName = nonnull(nestedNode.getName()).toString();
                const enumerants = contained.getEnum().getEnumerants();
                if (enumerants === null || enumerants.length() === 0) {
                  p.line(`+${localName}: {}`);
                } else {
                  //TODO: This bunch of enum stuff exists verbatim above. Consider factoring it out into a __Tags-like const.
                  p.line(`+${localName}: {`);
                  p.indent(p => {
                    enumerants.forEach((enumerant, value) => {
                      p.line(`+${nonnull(enumerant.getName()).toString()}: ${value},`);
                    });
                  });
                  p.line("};");
                }

                constructorAsses.push(`this.${localName} = ${baseName}_${localName}__Enum;`);
              }
              break;
            }
          });
        }

        if (this.groupTypes.tagsRoot(node.getId(), p)) {
          constructorAsses.push(`this.tags = ${baseName}__Tags;`);
        }

        if (this.groupTypes.groupsRoot(node.getId(), p)) {
          constructorAsses.push(`this.groups = ${baseName}__Groups;`);
        }

        if (parameters.main.length > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);
          constructorAsses.push("this.params = params;");
        }

        if (constructorAsses.length > 0) {
          p.interrupt();

          if (parameters.main.length > 0) {
            p.block(`constructor(params: { ${objectParams.join(", ")} })`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);
              });
            });
          } else {
            p.block(`constructor()`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);
              });
            });
          }
        }

        p.interrupt();

        //TODO: convert parameters.specialize to a Set<string> for consistency?
        const instanceParams = Array.from(parameters.main).map(name => `${name}: this.params.${name}`);

        p.block(`intern(guts: StructGutsB): ${thisB}`, p => {
          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}InstanceB(guts, { ${instanceParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}InstanceB(guts);`);
          }
        });

        p.interrupt();

        p.block(`fromAny(guts: AnyGutsB): ${thisB}`, p => {
          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}InstanceB(RefedStruct.fromAny(guts), { ${instanceParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}InstanceB(RefedStruct.fromAny(guts));`);
          }
        });

        p.interrupt();

        p.block(`deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): ${thisB}`, p => {
          p.line("const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());");
          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}InstanceB(guts, { ${instanceParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}InstanceB(guts);`);
          }
        });

        p.interrupt();

        p.block(`get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | ${thisB}`, p => {
          p.line("return isNull(ref) ? null : this.deref(level, arena, ref);");
        });

        p.interrupt();

        p.block(`unref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Orphan<StructGutsR, ${thisR}, ${thisB}>`, p => {
          p.line("const p = arena.pointer(ref);");
          p.line("arena.zero(ref, 8);");
          p.line("return new Orphan(this, arena, p);");
        });

        p.interrupt();

        p.block(`disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, ${thisR}, ${thisB}>`, p => {
          p.line("return isNull(ref) ? null : this.unref(level, arena, ref);");
        });

        p.interrupt();

        p.block("validate(p: Pointer<SegmentB>): void", p => {
          p.line("RefedStruct.validate(p, this.compiledBytes());");
        });

        p.interrupt();

        p.block("compiledBytes(): Bytes", p => {
          const data  = struct.getDataWordCount() << 3;
          const pointers = struct.getPointerCount() << 3;
          p.line(`return { data: ${data}, pointers: ${pointers} };`);
        });
      });
    }

    p.interrupt();

    {
      /* `X__InstanceB` */

      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
        `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`;
      });

      let class_ = `export class ${baseName}__${prefix}InstanceB`;
      if (parameters.main.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      let instanceR = `${baseName}__${prefix}InstanceR`;
      if (parameters.main.length > 0) {
        const specials = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
        ]);

        instanceR += `<${specials.join(", ")}>`;
      }

      p.block(class_, p => {
        p.line("+guts: StructGutsB;");

        if (parameters.main.length > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);

          p.interrupt();

          p.block(`constructor(guts: StructGutsB, params: { ${objectParams.join(", ")} })`, p => {
            p.line("this.guts = guts;");
            p.line("this.params = params;");
          });
        } else {
          p.interrupt();

          p.block(`constructor(guts: StructGutsB)`, p => {
            p.line("this.guts = guts;");
          });
        }

        p.interrupt();

        p.block(`reader(Ctor: CtorR<StructGutsR, ${instanceR}>): ${instanceR}`, p => {
          p.line("return Ctor.intern(this.guts);");
        });

        let union = {
          maskedBytes: [],
          dataSequences: [],
          pointersSequences: [],
        };
        if (struct.getDiscriminantCount() > 0) {
          p.interrupt();

          p.block("tag(): u16", p => {
            //TODO: Fix the offset annotation from getTag in reader-core. Its at u19 when it should be u33
            p.line(`return this.guts.getTag(${2 * struct.getDiscriminantOffset()});`);
          });

          union = unionLayout(this.index, node.getId());
        }

        const fields = struct.getFields();
        if (fields !== null) {
          fields.forEach(field => {
            p.interrupt();

            this.structField(node.getId(), field, defs, 2 * struct.getDiscriminantOffset(), union, p);
          });
        }
      });
    }
  }

  struct(node: Node__InstanceR, p: Printer): Printer {
    const uuid = toHex(node.getId());
    const parameters = this.parameters[uuid];
    const struct = node.getStruct();
    const defs = this.values === null ? null : this.values.defaults[uuid];
    const baseName = this.index.getScopes(node.getId()).slice(1).map(s => s.name).join("_");
    if (struct.getIsGroup()) {
      //TODO: This is a very common pattern. extract a function and refactor?
      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
        `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`;
      });

      let class_ = `export class ${baseName}__InstanceB`;
      if (parameters.main.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      p.block(class_, p => {
        p.line("+guts: StructGutsB;");

        if (parameters.main.length > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);
        }

        p.interrupt();

        if (parameters.main.length > 0) {
          p.block(`constructor(guts: StructGutsB, params: { ${objectParams.join(", ")} })`, p => {
            p.line("this.guts = guts;");
            p.line("this.params = params;");
          });
        } else {
          p.block(`constructor(guts: StructGutsB)`, p => {
            p.line("this.guts = guts;");
          });
        }

        p.interrupt();

        let union = {
          maskedBytes: [],
          dataSequences: [],
          pointersSequences: [],
        };
        if (struct.getDiscriminantCount() > 0) {
          p.block("tag(): u16", p => {
            //TODO: Fix the offset annotation from getTag in reader-core. Its at u19 when it should be u33
            p.line(`return this.guts.getTag(${2 * struct.getDiscriminantOffset()});`);
          });

          union = unionLayout(this.index, node.getId());
        }

        p.interrupt();

        const fields = struct.getFields();
        if (fields !== null) {
          fields.forEach(field => {
            p.interrupt();

            this.structField(node.getId(), field, defs, 2 * struct.getDiscriminantOffset(), union, p);
          });
        }
      });
    } else {
      p.interrupt();

      const names = this.index.getScopes(node.getId()).slice(1).map(s => s.name);
      p.line(`/**${"*".repeat(names.join(".").length)}**/`);
      p.line(`/* ${names.join(".")} */`);
      p.line(`/**${"*".repeat(names.join(".").length)}**/`);

      p.interrupt();

      this.printStruct("plain", node, p);
    }

    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          p.interrupt();

          p = this.visit(field.getGroup().getTypeId(), p);
        }
      });
    }

    //TODO: Check on all Visitor extensions to verify that super.struct, etc have been invoked under these methods
    return super.struct(node, p);
  }

  enum(node: Node__InstanceR, p: Printer): Printer {
    const names = this.index.getScopes(node.getId()).slice(1).map(s => s.name);
    const baseName = names.join("_");

    p.interrupt();

    p.line(`/**${"*".repeat(names.join(".").length)}**/`);
    p.line(`/* ${names.join(".")} */`);
    p.line(`/**${"*".repeat(names.join(".").length)}**/`);

    p.interrupt();

    p.line(`const ${baseName}__Enum: {`);
    p.indent(p => {
      nonnull(node.getEnum().getEnumerants()).forEach((enumerant, value) => {
        p.line(`+${nonnull(enumerant.getName()).toString()}: ${value},`);
      });
    });
    p.line("} = {");
    p.indent(p => {
      nonnull(node.getEnum().getEnumerants()).forEach((enumerant, value) => {
        p.line(`${nonnull(enumerant.getName()).toString()}: ${value},`);
      });
    });
    p.line("};");

    return super.enum(node, p);
  }

  interface(node: Node__InstanceR, p: Printer): Printer {
    const uuid = toHex(node.getId());
    const parameters = this.parameters[uuid];
    const iface = node.getInterface();
    const names = this.index.getScopes(node.getId()).slice(1).map(s => s.name);
    const baseName = names.join("_");

    p.interrupt();

    p.line(`/**${"*".repeat(names.join(".").length)}**/`);
    p.line(`/* ${names.join(".")} */`);
    p.line(`/**${"*".repeat(names.join(".").length)}**/`);

    p.interrupt();

    if (parameters.specialize.length > 0) {
      /* This struct or interface introduces new generic parameters, so I need
         a `X__GenericR` class. */

      const declareParams = flatMap(Array.from(parameters.generic), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
        `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
      ]);

      const objectParams = Array.from(parameters.generic).map(name => {
        return `+${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`;
      });

      let class_ = `export class ${baseName}__GenericB`;
      if (parameters.generic.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      p.block(class_, p => {
        const constructorAsses = [];

        const nestedNodes = node.getNestedNodes();
        if (nestedNodes !== null) {
          nestedNodes.forEach(nestedNode => {
            const contained = this.index.getNode(nestedNode.getId());
            if (contained.tag() === Node.tags.enum) {
              const localName = nonnull(nestedNode.getName()).toString();
              const enumerants = contained.getEnum().getEnumerants();
              if (enumerants === null || enumerants.length() === 0) {
                p.line(`+${localName}: {}`);
              } else {
                p.line(`+${localName}: {`);
                p.indent(p => {
                  enumerants.forEach((enumerant, value) => {
                    p.line(`+${nonnull(enumerant.getName()).toString()}: ${value},`);
                  });
                });
                p.line("};");
              }

              constructorAsses.push(`this.${localName} = ${baseName}_${localName}__Enum;`);
            }
          });
        }

        //TODO: Test enum code embedded within structs (and interfaces)
        if (parameters.generic.length > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);
          constructorAsses.push("this.params = params;");
        }

        if (constructorAsses.length > 0) {
          p.interrupt();

          if (parameters.generic.length > 0) {
            p.block(`constructor(params: { ${objectParams.join(", ")} })`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);
              });
            });
          } else {
            p.block(`constructor()`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);
              });
            });
          }
        }

        p.interrupt();

        const declarePs = flatMap(parameters.specialize, name => [
          `${name}_guts: AnyGutsR`,
          `${name}_r: {+guts: ${name}_guts}`,
          `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
        ]);
        const argPs = parameters.specialize.map(name => `${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`);
        const specialPs = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
          `${name}_b`,
        ]);
        const specialization = `${baseName}__CtorB<${specialPs.join(", ")}>`;
        p.block(`specialize<${declarePs.join(", ")}>(${argPs.join(", ")}): ${specialization}`, p => {
          let newPs = Array.from(parameters.generic).map(name => `${name}: this.params.${name}`);
          newPs = newPs.concat(parameters.specialize);

          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__CtorB({ ${newPs.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__CtorB();`);
          }
        });

      });
    }

    p.interrupt();

    {
      /* `X__CtorR` */

      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
        `${name}_b: ReaderCtor<${name}_guts, ${name}_r>`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorB<${name}_guts, ${name}_r, ${name}_b>`;
      });

      let class_ = `export class ${baseName}__CtorB`;
      if (parameters.main.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      p.block(class_, p => {
        const constructorAsses = [];

        const nestedNodes = node.getNestedNodes();
        if (nestedNodes !== null) {
          nestedNodes.forEach(nestedNode => {
            const contained = this.index.getNode(nestedNode.getId());
            switch (contained.tag()) {
            case Node.tags.struct:
            case Node.tags.interface:
              {
                const localName = nonnull(nestedNode.getName()).toString();
                const parameters = this.parameters[toHex(nestedNode.getId())];
                if (parameters.specialize.length > 0) {
                  let t = `${baseName}_${localName}__GenericB`;
                  if (parameters.generic.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.generic), name => [
                      `${name}_guts`,
                      `${name}_r`,
                      `${name}_b`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.generic.length > 0) {
                    const params = Array.from(parameters.generic).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericB({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericB();`);
                  }
                } else {
                  let t = `${baseName}_${localName}__CtorB`;
                  if (parameters.main.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                      `${name}_b`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.main.length > 0) {
                    const params = Array.from(parameters.main).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorB({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorB();`);
                  }
                }
              }
              break;
            case Node.tags.enum:
              {
                const localName = nonnull(nestedNode.getName()).toString();
                const enumerants = contained.getEnum().getEnumerants();
                if (enumerants === null || enumerants.length() === 0) {
                  p.line(`+${localName}: {}`);
                } else {
                  //TODO: This bunch of enum stuff exists verbatim above. Consider factoring it out into a __Tags-like const.
                  p.line(`+${localName}: {`);
                  p.indent(p => {
                    enumerants.forEach((enumerant, value) => {
                      p.line(`+${nonnull(enumerant.getName()).toString()}: ${value},`);
                    });
                  });
                  p.line("};");
                }

                constructorAsses.push(`this.${localName} = ${baseName}_${localName}__Enum;`);
              }
              break;
            }
          });
        }

        const methods = iface.getMethods();
        const constructorMethodCtors = [];
        if (methods !== null) {
          p.line("+methods: {");
          p.indent(p => {
            methods.forEach(method => {
              const name = nonnull(method.getName()).toString();
              const methodBaseName = `${baseName}_${name}`;
              let paramCtor = "";
              let resultCtor = "";
              p.line(`+${name}: {`);
              p.indent(p => {
                const paramId = method.getParamStructType();
                const param = this.index.getNode(paramId);
                const paramScopeId = param.getScopeId();
                if (paramScopeId[0] === 0 && paramScopeId[1] === 0) {
                  const parameters = this.parameters[toHex(paramId)];
                  let specialization = `${methodBaseName}__ParamCtorB`;
                  if (parameters.main.length > 0) {
                    const specialPs = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                      `${name}_b`,
                    ]);
                    const objectParams = Array.from(parameters.main).map(name => `${name}: this.params.${name}`);
                    specialization += `<${specialPs.join(", ")}>`;
                    paramCtor = `new ${methodBaseName}__ParamCtorB({ ${objectParams.join(", ")} })`;
                  } else {
                    paramCtor = `new ${methodBaseName}__ParamCtorB()`;
                  }
                  p.line(`+Param: ${specialization},`);
                } else {
                  //TODO: Now that instance and ctor have collapsed to main, I should be able to call this.type like regular.
                  //      Can I clobber the structContext method?
                  paramCtor = this.ctorValue.struct(paramId, paramId, method.getParamBrand());
                  this.type.structContext(paramId, paramId, method.getParamBrand(), (guts, mangledName, pts) => {
                    if (pts.length > 0) {
                      const specialPs = flatMap(pts, pt => [pt.guts, pt.reader, pt.builder]);
                      p.line(`+Param: ${mangledName}__CtorB<${specialPs.join(", ")}>,`);
                    } else {
                      p.line(`+Param: ${mangledName}__CtorB,`);
                    }
                  });
                }

                const resultId = method.getResultStructType();
                const resultScopeId = this.index.getNode(resultId).getScopeId();
                if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
                  const parameters = this.parameters[toHex(resultId)];
                  let specialization = `${methodBaseName}__ResultCtorB`;
                  if (parameters.main.length > 0) {
                    const specialPs = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                      `${name}_b`,
                    ]);
                    const objectParams = Array.from(parameters.main).map(name => `${name}: this.params.${name}`);
                    specialization += `<${specialPs.join(", ")}>`;
                    resultCtor = `new ${methodBaseName}__ResultCtorB({ ${objectParams.join(", ")} })`;
                  } else {
                    resultCtor = `new ${methodBaseName}__ResultCtorB()`;
                  }
                  p.line(`+Result: ${specialization},`);
                } else {
                  resultCtor = this.ctorValue.struct(resultId, resultId, method.getResultBrand());
                  this.type.structContext(resultId, resultId, method.getParamBrand(), (guts, mangledName, pts) => {
                    if (pts.length > 0) {
                      const specialPs = flatMap(pts, pt => [pt.guts, pt.reader, pt.builder]);
                      p.line(`+Result: ${mangledName}__CtorB<${specialPs.join(", ")}>,`);
                    } else {
                      p.line(`+Result: ${mangledName}__CtorB,`);
                    }
                  });
                }
              });
              p.line("},");

              constructorMethodCtors.push({ name, paramCtor, resultCtor });
            });
          });
          p.line("};");
        }

        if (parameters.main.length > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);
          constructorAsses.push("this.params = params;");
        }

        p.interrupt();

        if (constructorAsses.length > 0 || constructorMethodCtors.length > 0) {
          if (parameters.main.length > 0) {
            p.block(`constructor(params: { ${objectParams.join(", ")} })`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);
              });

              if (constructorMethodCtors.length > 0) {
                p.line("this.methods = {");
                p.indent(p => {
                  constructorMethodCtors.forEach(bundle => {
                    p.line(`${bundle.name}: {`);
                    p.indent(p => {
                      p.line(`Param: ${bundle.paramCtor},`);
                      p.line(`Result: ${bundle.resultCtor},`);
                    });
                    p.line("},");
                  });
                });
                p.line("};");
              }
            });
          } else {
            p.block(`constructor()`, p => {
              constructorAsses.forEach(ass => {
                p.line(ass);

                if (constructorMethodCtors.length > 0) {
                  p.line("this.methods = {");
                  p.indent(p => {
                    constructorMethodCtors.forEach(bundle => {
                      p.line(`${bundle.name}: {`);
                      p.indent(p => {
                        p.line(`Param: ${bundle.paramCtor},`);
                        p.line(`Result: ${bundle.resultCtor},`);
                      });
                      p.line("},");
                    });
                  });
                  p.line("};");
                }
              });
            });
          }
        }
      });
    }

    const methods = iface.getMethods();
    if (methods !== null) {
      methods.forEach(method => {
        const paramId = method.getParamStructType();
        const param = this.index.getNode(paramId);
        const paramScopeId = param.getScopeId();
        if (paramScopeId[0] === 0 && paramScopeId[1] === 0) {
          p.interrupt();

          const names = this.index.getScopes(paramId).slice(1).map(s => s.name);
          p.line(`/**${"*".repeat(names.join(".").length + 8)}**/`);
          p.line(`/* ${names.join(".")} (Param) */`);
          p.line(`/**${"*".repeat(names.join(".").length + 8)}**/`);

          this.printStruct("param", param, p);
        }

        const resultId = method.getResultStructType();
        const result = this.index.getNode(resultId);
        const resultScopeId = result.getScopeId();
        if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
          p.interrupt();

          const names = this.index.getScopes(resultId).slice(1).map(s => s.name);
          p.line(`/**${"*".repeat(names.join(".").length + 9)}**/`);
          p.line(`/* ${names.join(".")} (Result) */`);
          p.line(`/**${"*".repeat(names.join(".").length + 9)}**/`);

          this.printStruct("result", result, p);
        }
      });
    }

    return super.interface(node, p);
  }
}

export default function printReaderBodies(
  index: Index,
  fileId: UInt64,
  identifiers: { [uuid: string]: string },
  parameters: ParametersIndex,
  values: null | Values,
  p: Printer,
): void {
  //TODO: Add empty() to Data and Text? I don't think that I want to.
  new BuildersVisitor(index, identifiers, parameters, values).visit(fileId, p);
}
