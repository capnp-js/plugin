/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Printer from "../Printer";
import type { NodeIndex } from "../Visitor";
import type {
  Node__InstanceR,
  Brand__InstanceR,
  Field__InstanceR,
  Type__InstanceR,
  Value__InstanceR,
  Type_anyPointer__InstanceR,
} from "../schema.capnp-r";
import type { ParametersIndex } from "./accumulateParameters";

import { toHex } from "@capnp-js/uint64";
import { nonnull } from "@capnp-js/nullary";
import { int32 } from "@capnp-js/read-data";

import Visitor from "../Visitor";
import address from "../util/address";
import capitalize from "../util/capitalize";
import flatMap from "../util/flatMap";
import unprefixName from "../util/unprefixName";
import { Node, Brand, Field, Type, Value } from "../schema.capnp-r";

type u16 = number;
type u33 = number;

function paramName(index: NodeIndex, id: UInt64, position: u16): string {
  const source = index[toHex(id)];
  const parameters = nonnull(source.getParameters());

  const name = nonnull(parameters.get(position).getName());
  const depth = address(index, id).classes.length - 1;

  return `${name.toString()}_${depth}`;
}

/* TODO: Clobber after this gets moved to BuilderBodies

type UnionLayout = {|
  maskedBytes: $ReadOnlyArray<{| offset: uint, mask: u8 |}>,
  dataSequences: $ReadOnlyArray<{| offset: uint, length: u19 |}>,
  pointersSequences: $ReadOnlyArray<{| offset: uint, length: u19 |}>,
|};

function unionLayout(nodes: NodeIndex, id: UInt64): UnionLayout {
  const layout = {
    dataBits: [],
    dataBytes: [],
    pointersWords: [],
  };
  addUnionMembers(id, layout);

  const dataBits = layout.dataBits.reduce((acc, { b, mask }) => {
    if (acc.hasOwnProperty(b)) {
      acc[b].mask &= mask;
    } else {
      acc[b] = { offset: b, mask };
    }

    return acc;
  }, {});
  / A 0x00 mask implies a full byte, so move any 0x00 masks to the `dataBytes`
     data structure. /
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

  function addUnionMembers(id, layout): void {
    const node = nodes[toHex(id)];
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
        const node = nodes[toHex(field.getGroup().getTypeId())];
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
}
*/

class InstanceType {
  +index: NodeIndex;
  +identifiers: { [uuid: string]: string };
  +parameters: ParametersIndex;

  constructor(index: NodeIndex, identifiers: { [uuid: string]: string }, parameters: ParametersIndex) {
    this.index = index;
    this.identifiers = identifiers;
    this.parameters = parameters;
  }

  type(type: null | Type__InstanceR): string {
    if (type === null) {
      type = Type.empty();
    }

    switch (type.tag()) {
    case Type.tags.void: return "void";
    case Type.tags.bool: return "boolean";
    case Type.tags.int8: return "i8";
    case Type.tags.int16: return "i16";
    case Type.tags.int32: return "i32";
    case Type.tags.int64: return "Int64";
    case Type.tags.uint8: return "u8";
    case Type.tags.uint16: return "u16";
    case Type.tags.uint32: return "u32";
    case Type.tags.uint64: return "UInt64";
    case Type.tags.float32: return "f32";
    case Type.tags.float64: return "f64";
    case Type.tags.enum: return "u16";
    case Type.tags.text:
    case Type.tags.data:
    case Type.tags.list:
    case Type.tags.struct:
    case Type.tags.interface:
    case Type.tags.anyPointer:
      return nonnull(this.pointer(type));
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  pointer(type: null | Type__InstanceR): null | string {
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

    case Type.tags.text: return "Text";
    case Type.tags.data: return "Data";
    case Type.tags.list: return this.list(type.getList().getElementType());
    case Type.tags.struct:
      {
        const struct = type.getStruct();
        return this.struct(struct.getTypeId(), struct.getBrand());
      }
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer: return this.anyPointer(type.getAnyPointer());
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  list(elementType: null | Type__InstanceR): string {
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
    case Type.tags.text: return "ListListR<NonboolListGutsR, Text>";
    case Type.tags.data: return "ListListR<NonboolListGutsR, Data>";
    case Type.tags.list:
      {
        const t = this.list(elementType.getList().getElementType());
        return `ListListR<NonboolListGutsR, ${t}>`;
      }
    case Type.tags.enum: return "UInt16List";
    case Type.tags.struct:
      {
        const struct = elementType.getStruct();
        const t = this.struct(struct.getTypeId(), struct.getBrand());
        return `StructListR<${t}>`;
      }
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer:
      const t = this.anyPointer(elementType.getAnyPointer());
      return `ListListR<NonboolListGutsR, ${t}>`;
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  struct(id: UInt64, brand: null | Brand__InstanceR): string {
    // #if _DEBUG
    Object.keys(this.identifiers).forEach(uuid => {
      console.log(`${uuid} -> ${this.identifiers[uuid]}`);
    });
    console.log(toHex(id));
    // #endif

    const mangledName = this.identifiers[toHex(id)];

    const parameters = this.parameters[toHex(id)];
    if (parameters.instance.size > 0) {
      //TODO: is `parameters.instance` the correct set for const resolution? Test me.
      const bindings = this.resolve(parameters.instance, brand);
      const specialPs = Array.from(parameters.instance).map(name => bindings[name]);
      return `${mangledName}__InstanceR<${specialPs.join(", ")}>`;
    } else {
      return `${mangledName}__InstanceR`;
    }
  }

  anyPointer(anyPointer: Type_anyPointer__InstanceR): string {
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
        case unconstrainedG.tags.capability: throw new Error("TODO"); //There exists a CapValue, but it's half-baked.
        default: throw new Error("Unrecognized unconstrained AnyPointer type.");
        }
      }
    case anyPointerG.tags.parameter:
      {
        const parameter = anyPointer.getParameter();
        const scopeId = parameter.getScopeId();
        const name = paramName(this.index, scopeId, parameter.getParameterIndex());
        return `${name}_r`;
      }
    case anyPointerG.tags.implicitMethodParameter:
      throw new Error("TODO");
    default:
      throw new Error("Unrecognized AnyPointer type tag");
    }
  }

  resolve(parameters: Set<string>, brand: null | Brand__InstanceR): { [name: string]: string } {
    if (brand === null) {
      brand = Brand.empty();
    }

    /* When I resolve a parameter, I remove it from a set of `unresolveds`. The
       Cap'n Proto specification prescribes that unresolvable parameters are
       AnyPointers, so any unresolved parameters get added to the result as
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
                      bindings[name] = "AnyValue";
                    }
                    break;
                  case Brand.Binding.tags.type:
                    if (unresolveds.has(name)) {
                      unresolveds.delete(name);
                      bindings[name] = nonnull(this.pointer(binding.getType()));
                    }
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
              const parameters = this.index[toHex(scopeId)].getParameters();
              if (parameters !== null) {
                parameters.forEach((parameter, position) => {
                  const name = paramName(this.index, scopeId, position);
                  if (unresolveds.has(name)) {
                    unresolveds.delete(name);
                    bindings[name] = `${name}_r`;
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
    }

    /* Use AnyValue types for any parameters that weren't touched. */
    unresolveds.forEach(name => {
      bindings[name] = "AnyValue";
    });

    return bindings;
  }
}

class CtorValue {
  +index: NodeIndex;
  +identifiers: { [uuid: string]: string };
  +parameters: ParametersIndex;

  constructor(index: NodeIndex, identifiers: { [uuid: string]: string }, parameters: ParametersIndex) {
    this.index = index;
    this.identifiers = identifiers;
    this.parameters = parameters;
  }

  pointer(type: null | Type__InstanceR): null | string {
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
    case Type.tags.list: return this.list(type.getList().getElementType());
    case Type.tags.enum:
      return null;
    case Type.tags.struct:
      {
        const struct = type.getStruct();
        return this.struct(struct.getTypeId(), struct.getBrand());
      }
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer: return this.anyPointer(type.getAnyPointer());
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  list(elementType: null | Type__InstanceR): string {
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
    case Type.tags.text: return "lists(Text)";
    case Type.tags.data: return "lists(Data)";
    case Type.tags.list:
      return `lists(${this.list(elementType.getList().getElementType())})`;
    case Type.tags.enum: return "UInt16List";
    case Type.tags.struct:
      {
        const struct = elementType.getStruct();
        return `structs(${this.struct(struct.getTypeId(), struct.getBrand())})`;
      }
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer:
      return `lists(${this.anyPointer(elementType.getAnyPointer())})`;
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  struct(id: UInt64, brand: null | Brand__InstanceR): string {
    const mangledName = this.identifiers[toHex(id)];

    const parameters = this.parameters[toHex(id)];
    if (parameters.ctor.size > 0) {
      const bindings = this.resolve(parameters.ctor, brand);
      //TODO: Is parameters.ctor the correct set for consts? Do I need fix accumulateParameters? I think that ctor and instance converge at leafs, so this should be fine, no? Test me.
      const objectParams = Array.from(parameters.ctor).map(name => `${name}: ${bindings[name]}`);
      return `new ${mangledName}__CtorR({ ${objectParams.join(", ")} })`;
    } else {
      return `new ${mangledName}__CtorR()`;
    }
  }

  anyPointer(anyPointer: Type_anyPointer__InstanceR): string {
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
        case unconstrainedG.tags.capability: throw new Error("TODO"); //There exists a CapValue, but it's half-baked.
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
      throw new Error("TODO");
    default:
      throw new Error("Unrecognized AnyPointer type tag");
    }
  }

  resolve(parameters: Set<string>, brand: null | Brand__InstanceR): { [name: string]: string } {
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
                    bindings[name] = nonnull(this.pointer(binding.getType()));
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
            const parameters = this.index[toHex(scopeId)].getParameters();
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
  +index: NodeIndex;
  +constants: Constants;

  constructor(index: NodeIndex, constants: Constants) {
    this.index = index;
    this.constants = constants;
  }

  peek(id: UInt64): { tagExists: boolean, groupExists: boolean } {
    const struct = this.index[toHex(id)].getStruct();
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
    const baseName = address(this.index, id).classes.map(unprefixName).join("_");
    const node = this.index[toHex(id)];
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
    const node = this.index[toHex(id)];
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

  groupsRoot(id: UInt64, p: Printer): boolean {
    if (this.peek(id).groupExists) {
      const node = this.index[toHex(id)];
      const baseName = address(this.index, id).classes.map(unprefixName).join("_");
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
    const node = this.index[toHex(id)];
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

        const fields = node.getStruct().getFields();
        if (fields !== null) {
          fields.forEach(field => {
            if (field.tag() === Field.tags.slot) {
              const slot = field.getSlot();
              if (slot.getHadExplicitDefault()) {
                const name = nonnull(field.getName()).toString();
                const ref = `defaults["${toHex(id)}"].${name}`;
                this.constants.context(ref, slot.getType(), slot.getDefaultValue(), (type, body) => {
                  if (body === null) {
                    p.line(`default${capitalize(name)}(): ${type} {}`);
                  } else {
                    p.line(`default${capitalize(name)}(): ${type} {`);
                    p.indent(p => p.line(body));
                    p.line("},");
                  }
                });
              }
            }
          });
        }
      });
    }
  }
}

class GroupTypes {
  +index: NodeIndex;
  +instanceType: InstanceType;

  constructor(index: NodeIndex, instanceType: InstanceType) {
    this.index = index;
    this.instanceType = instanceType;
  }

  peek(id: UInt64): { tagExists: boolean, groupExists: boolean } {
    const struct = this.index[toHex(id)].getStruct();
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
    const node = this.index[toHex(id)];
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
    const node = this.index[toHex(id)];
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
      const node = this.index[toHex(id)];
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
    const node = this.index[toHex(id)];
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

        const fields = node.getStruct().getFields();
        if (fields !== null) {
          fields.forEach(field => {
            if (field.tag() === Field.tags.slot) {
              const slot = field.getSlot();
              if (slot.getHadExplicitDefault()) {
                const name = capitalize(nonnull(field.getName()).toString());
                const type = this.instanceType.type(slot.getType());
                p.line(`default${name}(): ${type},`);
              }
            }
          });
        }
      });
    }
  }
}

class Constants {
  +instanceType: InstanceType;
  +ctorValue: CtorValue;

  constructor(instanceType: InstanceType, ctorValue: CtorValue) {
    this.instanceType = instanceType;
    this.ctorValue = ctorValue;
  }

  context(
    ref: string,
    type: null | Type__InstanceR,
    value: null | Value__InstanceR,
    cb: (type: string, body: null | string) => void,
  ): void {
    if (type === null) {
      type = Type.empty();
    }

    if (value === null) {
      value = Value.empty();
    }

    switch (value.tag()) {
    case Value.tags.void:
      cb("void", null);
      break;
    case Value.tags.bool:
      cb(
        "boolean",
        `return ${((value: any): Value__InstanceR).getBool() ? "true" : "false"};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.int8:
      cb(
        "i8",
        `return ${((value: any): Value__InstanceR).getInt8()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.int16:
      cb(
        "i16",
        `return ${((value: any): Value__InstanceR).getInt16()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.int32:
      cb(
        "i32",
        `return ${((value: any): Value__InstanceR).getInt32()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.int64:
      const i = ((value: any): Value__InstanceR).getInt64(); // eslint-disable-line flowtype/no-weak-types
      cb(
        "Int64",
        `return injectI64(${i[0]}, ${i[1]});`,
      );
      break;
    case Value.tags.uint8:
      cb(
        "u8",
        `return ${((value: any): Value__InstanceR).getUint8()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.uint16:
      cb(
        "u16",
        `return ${((value: any): Value__InstanceR).getUint16()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.uint32:
      cb(
        "u32",
        `return ${((value: any): Value__InstanceR).getUint32()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.uint64:
      const u = ((value: any): Value__InstanceR).getUint64(); // eslint-disable-line flowtype/no-weak-types
      cb(
        "UInt64",
        `return injectU64(${u[0]}, ${u[1]});`,
      );
      break;
    case Value.tags.float32:
      cb(
        "f32",
        `return ${((value: any): Value__InstanceR).getFloat32()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.float64:
      cb(
        "f64",
        `return ${((value: any): Value__InstanceR).getFloat64()};`, // eslint-disable-line flowtype/no-weak-types
      );
      break;
    case Value.tags.text:
    case Value.tags.data:
    case Type.tags.list:
    case Type.tags.struct:
    case Type.tags.interface:
    case Type.tags.anyPointer:
      const ctor = nonnull(this.ctorValue.pointer(((type: any): Type__InstanceR))); // eslint-disable-line flowtype/no-weak-types
      cb(
        nonnull(this.instanceType.pointer(type)),
        `return ${ctor}.deref(0, blob, ${ref});`,
      );
      break;
    default:
      throw new Error("Unrecognized value tag.");
    }
  }

  print(ref: string, front: string, type: null | Type__InstanceR, value: null | Value__InstanceR, p: Printer): void {
    if (type === null) {
      type = Type.empty();
    }

    if (value === null) {
      value = Value.empty();
    }

    switch (value.tag()) {
    case Value.tags.void:
      p.line(`${front}(): void {}`);
      break;
    case Value.tags.bool:
      p.block(`${front}(): boolean`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getBool() ? "true" : "false"};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.int8:
      p.block(`${front}(): i8`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getInt8()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.int16:
      p.block(`${front}(): i16`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getInt16()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.int32:
      p.block(`${front}(): i32`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getInt32()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.int64:
      p.block(`${front}(): Int64`, p => {
        const i = ((value: any): Value__InstanceR).getInt64(); // eslint-disable-line flowtype/no-weak-types
        p.line(`return injectI64(${i[0]}, ${i[1]});`);
      });
      break;
    case Value.tags.uint8:
      p.block(`${front}(): u8`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getUint8()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.uint16:
      p.block(`${front}(): u16`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getUint16()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.uint32:
      p.block(`${front}(): u32`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getUint32()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.uint64:
      p.block(`${front}(): UInt64`, p => {
        const u = ((value: any): Value__InstanceR).getUint64(); // eslint-disable-line flowtype/no-weak-types
        p.line(`return injectU64(${u[0]}, ${u[1]});`);
      });
      break;
    case Value.tags.float32:
      p.block(`${front}(): f32`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getFloat32()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.float64:
      p.block(`${front}(): f64`, p => {
        p.line(`return ${((value: any): Value__InstanceR).getFloat64()};`); // eslint-disable-line flowtype/no-weak-types
      });
      break;
    case Value.tags.text:
    case Value.tags.data:
    case Type.tags.list:
    case Type.tags.struct:
    case Type.tags.interface:
    case Type.tags.anyPointer:
      p.block(`${front}(): ${nonnull(this.instanceType.pointer(type))}`, p => {
        const ctor = nonnull(this.ctorValue.pointer(((type: any): Type__InstanceR))); // eslint-disable-line flowtype/no-weak-types
        p.line(`return ${ctor}.deref(0, blob, ${ref});`);
      });
      break;
    default:
      throw new Error("Unrecognized value tag.");
    }
  }
}

class ReadersVisitor extends Visitor<Printer> {
  +parameters: ParametersIndex;
  +instanceType: InstanceType;
  +ctorValue: CtorValue;
  +constants: Constants;
  +groupTypes: GroupTypes;
  +groupValues: GroupValues;

  constructor(index: NodeIndex, identifiers: { [uuid: string]: string }, parameters: ParametersIndex) {
    super(index);
    this.parameters = parameters;
    this.instanceType = new InstanceType(index, identifiers, parameters);
    this.ctorValue = new CtorValue(index, identifiers, parameters);
    this.constants = new Constants(this.instanceType, this.ctorValue);
    this.groupTypes = new GroupTypes(index, this.instanceType);
    this.groupValues = new GroupValues(index, this.constants);
  }

  structField(field: Field__InstanceR, discrOffset: u33, p: Printer): void {
    function checkTag(discrValue: u16, discrOffset: u33, p: Printer) {
      if (discrValue !== Field.getNoDiscriminant()) {
        p.line(`this.guts.checkTag(${discrValue}, ${discrOffset});`);
      }
    }

    const name = nonnull(field.getName());
    p.comment(name.toString());

    const discrValue = field.getDiscriminantValue();
    const getField = `get${capitalize(nonnull(field.getName()).toString())}`;
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
          p.block(`${getField}(): void`, p => {
            checkTag(discrValue, discrOffset, p);
          });
          break;
        case Type.tags.bool:
          p.block(`${getField}(): boolean`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() >>> 3};`);

            const def = nonnull(slot.getDefaultValue()).getBool();
            p.ifElse(
              "b < this.guts.layout.pointersSection",
              p => {
                const prefix = def === true ? "!" : "!!";
                p.line(`return ${prefix}decode.bit(this.guts.segment.raw, b, ${slot.getOffset() & 0x07});`);
              },
              p => {
                p.line(`return ${def === true ? "true" : "false"};`);
              }
            );
          });
          break;
        case Type.tags.int8:
          p.block(`${getField}(): i8`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getInt8();
            p.ifElse(
              "b + 1 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return ${def} ^ decode.int8(this.guts.segment.raw, b);`);
              },
              p => {
                p.line(`return ${def};`);
              }
            );
          });
          break;
        case Type.tags.int16:
          p.block(`${getField}(): i16`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getInt16();
            p.ifElse(
              "b + 2 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return ${def} ^ decode.int16(this.guts.segment.raw, b);`);
              },
              p => {
                p.line(`return ${def};`);
              }
            );
          });
          break;
        case Type.tags.int32:
          p.block(`${getField}(): i32`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getInt32();
            p.ifElse(
              "b + 4 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return ${def} ^ decode.int32(this.guts.segment.raw, b);`);
              },
              p => {
                p.line(`return ${def};`);
              }
            );
          });
          break;
        case Type.tags.int64:
          p.block(`${getField}(): Int64`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getInt64();
            p.ifElse(
              "b + 8 <= this.guts.layout.pointersSection",
              p => {
                p.line ("return injectI64(");
                p.indent(p => {
                  p.line(`${def[0]} ^ decode.int32(this.guts.segment.raw, b+4),`);
                  p.line(`${def[1]} ^ decode.int32(this.guts.segment.raw, b),`);
                });
                p.line(");");
              },
              p => {
                p.line(`return injectI64(${def[0]}, ${def[1]});`);
              }
            );
          });
          break;
        case Type.tags.uint8:
          p.block(`${getField}(): u8`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getUint8();
            p.ifElse(
              "b + 1 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint8(this.guts.segment.raw, b)) >>> 0;`);
              },
              p => {
                p.line(`return ${def} >>> 0;`);
              }
            );
          });
          break;
        case Type.tags.uint16:
          p.block(`${getField}(): u16`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getUint16();
            p.ifElse(
              "b + 2 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint16(this.guts.segment.raw, b)) >>> 0;`);
              },
              p => {
                p.line(`return ${def} >>> 0;`);
              }
            );
          });
          break;
        case Type.tags.uint32:
          p.block(`${getField}(): u32`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getUint32();
            p.ifElse(
              "b + 4 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint32(this.guts.segment.raw, b)) >>> 0;`);
              },
              p => {
                p.line(`return ${def} >>> 0;`);
              }
            );
          });
          break;
        case Type.tags.uint64:
          p.block(`${getField}(): UInt64`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getUint64();
            p.ifElse(
              "b + 8 <= this.guts.layout.pointersSection",
              p => {
                p.line("return injectU64(");
                p.indent(p => {
                  p.line(`${def[0]} ^ decode.int32(this.guts.segment.raw, b+4),`);
                  p.line(`${def[1]} ^ decode.int32(this.guts.segment.raw, b),`);
                });
                p.line(");");
              },
              p => {
                p.line(`return injectU64(${def[0]}, ${def[1]});`);
              }
            );
          });
          break;
        case Type.tags.float32:
          p.block(`${getField}(): f32`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            /* Manually grab the default's bit pattern from the Float32
               location. */
            const def = int32(slot.guts.segment.raw, slot.guts.layout.dataSection + 4);
            p.ifElse(
              "b + 4 <= this.guts.layout.pointersSection",
              p => {
                p.line("const bytes = decode.int32(this.guts.segment.raw, b);");
                p.line(`return decode.float32(${def} ^ bytes);`);
              },
              p => {
                p.line(`return ${nonnull(slot.getDefaultValue()).getFloat32()};`);
              }
            );
          });
          break;
        case Type.tags.float64:
          p.block(`${getField}(): f64`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            /* Manually grab the default's bit pattern from the Float64
               location. */
            const def = [
              int32(slot.guts.segment.raw, slot.guts.layout.dataSection + 12),
              int32(slot.guts.segment.raw, slot.guts.layout.dataSection + 8),
            ];
            p.ifElse(
              "b + 8 <= this.guts.layout.pointersSection",
              p => {
                p.line("const bytes = injectI64(");
                p.indent(p => {
                  p.line(`decode.int32(this.guts.segment.raw, b+4) ^ ${def[0]},`);
                  p.line(`decode.int32(this.guts.segment.raw, b) ^ ${def[1]},`);
                });
                p.line(");");
                p.line("return decode.float64(bytes);");
              },
              p => {
                p.line(`return ${nonnull(slot.getDefaultValue()).getFloat64()};`);
              }
            );
          });
          break;
        case Type.tags.enum:
          p.block(`${getField}(): u16`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const b = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getEnum();
            p.ifElse(
              "b + 2 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint16(this.guts.segment.raw, b)) >>> 0;`);
              },
              p => {
                p.line(`return ${def} >>> 0;`);
              }
            );
          });
          break;
        case Type.tags.text:
        case Type.tags.data:
        case Type.tags.list:
        case Type.tags.struct:
        case Type.tags.interface:
        case Type.tags.anyPointer:
          p.block(`${getField}(): null | ${nonnull(this.instanceType.pointer(type))}`, p => {
            checkTag(discrValue, discrOffset, p);

            p.line(`const ref = this.guts.pointersWord(${slot.getOffset() << 3});`);
            const ctor = nonnull(this.ctorValue.pointer(type));
            p.line(`return ref === null ? null : ${ctor}.get(this.guts.level, this.guts.arena, ref);`);
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
        const baseName = address(this.index, id).classes.map(unprefixName).join("_");

        const parameters = this.parameters[toHex(id)].instance;

        const specialPs = flatMap(Array.from(parameters), name => [
          `${name}_guts`,
          `${name}_r`,
        ]);
        const objectParams = Array.from(parameters).map(name => `${name}: this.params.${name}`);

        let specialization = `${baseName}__InstanceR`;
        if (parameters.size > 0) {
          specialization += `<${specialPs.join(", ")}>`;
        }

        p.block(`${getField}(): ${specialization}`, p => {
          checkTag(discrValue, discrOffset, p);

          if (parameters.size > 0) {
            p.line(`return new ${baseName}__InstanceR(this.guts, { ${objectParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__InstanceR(this.guts);`);
          }
        });
      }
      break;
    default:
      throw new Error("Unrecognized field tag.");
    }
  }

  file(node: Node__InstanceR, p: Printer): Printer {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      let heading = true;
      nestedNodes.forEach(nestedNode => {
        const uuid = toHex(nestedNode.getId());
        const contained = this.index[uuid];
        if (contained.tag() === Node.tags.const) {
          if (heading) {
            p.comment("Constants");
            heading = false;
          }

          p.interrupt();

          const ref = `constants["${uuid}"]`;
          const name = nonnull(nestedNode.getName()).toString();
          const c = contained.getConst();
          this.constants.context(ref, c.getType(), c.getValue(), (type, body) => {
            if (body === null) {
              p.line(`export function get${capitalize(name)}(): ${type} {}`);
            } else {
              p.block(`export function get${capitalize(name)}(): ${type}`, p => {
                p.line(body);
              });
            }
          });
        }
      });
    }

    return super.file(node, p);
  }

  struct(node: Node__InstanceR, p: Printer): Printer {
    const uuid = toHex(node.getId());
    const parameters = this.parameters[uuid];
    const struct = node.getStruct();
    const baseName = address(this.index, node.getId()).classes.map(unprefixName).join("_");
    if (struct.getIsGroup()) {
      //TODO: This is a very common pattern. extract a function and refactor?
      const declareParams = flatMap(Array.from(parameters.instance), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
      ]);

      const objectParams = Array.from(parameters.instance).map(name => {
        return `+${name}: CtorR<${name}_guts, ${name}_r>`;
      });

      let class_ = `export class ${baseName}__InstanceR`;
      if (parameters.instance.size > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      p.block(class_, p => {
        p.line("+guts: StructGutsR;");

        if (parameters.instance.size > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);
        }

        p.interrupt();

        if (parameters.instance.size > 0) {
          p.block(`constructor(guts: StructGutsR, params: { ${objectParams.join(", ")} })`, p => {
            p.line("this.guts = guts;");
            p.line("this.params = params;");
          });
        } else {
          p.block(`constructor(guts: StructGutsR)`, p => {
            p.line("this.guts = guts;");
          });
        }

        p.interrupt();

        if (struct.getDiscriminantCount() > 0) {
          p.block("tag(): u16", p => {
            //TODO: Fix the offset annotation from getTag in reader-core. Its at u19 when it should be u33
            p.line(`return this.guts.getTag(${2 * struct.getDiscriminantOffset()});`);
          });
        }

        p.interrupt();

        const fields = struct.getFields();
        if (fields !== null) {
          fields.forEach(field => {
            p.interrupt();

            this.structField(field, 2 * struct.getDiscriminantOffset(), p);
          });
        }
      });
    } else {
      p.interrupt();

      const path = address(this.index, node.getId()).classes.map(unprefixName);
      p.line(`/**${"*".repeat(path.join(".").length)}**/`);
      p.line(`/* ${path.join(".")} */`);
      p.line(`/**${"*".repeat(path.join(".").length)}**/`);

      p.interrupt();

      this.groupValues.tagsRoot(node.getId(), p);

      p.interrupt();

      this.groupValues.groupsRoot(node.getId(), p);

      p.interrupt();

      if (parameters.specialize.length > 0) {
        /* This struct introduces new generic parameters, so I need a
           `X__GenericR` class. */

        const declareParams = flatMap(Array.from(parameters.generic), name => [
          `${name}_guts: AnyGutsR`,
          `${name}_r: {+guts: ${name}_guts}`,
        ]);

        const objectParams = Array.from(parameters.generic).map(name => {
          return `+${name}: CtorR<${name}_guts, ${name}_r>`;
        });

        let class_ = `export class ${baseName}__GenericR`;
        if (parameters.generic.size > 0) {
          class_ += `<${declareParams.join(", ")}>`;
        }

        p.block(class_, p => {
          const constructorAsses = [];

          const nestedNodes = node.getNestedNodes();
          if (nestedNodes !== null) {
            nestedNodes.forEach(nestedNode => {
              const contained = this.index[toHex(nestedNode.getId())];
              if (contained.tag() === Node.tags.enum) {
                const localName = nonnull(nestedNode.getName()).toString();
                const baseName = address(this.index, contained.getId()).classes.map(unprefixName).join("_");
                const enumerants = contained.getEnum().getEnumerants();
                if (enumerants === null || enumerants.length() === 0) {
                  p.line(`+${localName}: {}`);
                } else {
                  p.line(`+${localName}: {`);
                  p.indent(p => {
                    enumerants.forEach((enumerant, value) => {
                      p.line(`+${nonnull(enumerant.getName()).toString()}: ${value}`);
                    });
                  });
                  p.line("};");
                }

                constructorAsses.push(`this.${localName} = ${baseName}__Enum;`);
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

          if (parameters.generic.size > 0) {
            p.line(`+params: { ${objectParams.join(", ")} };`);
            constructorAsses.push("this.params = params;");
          }

          p.interrupt();

          if (constructorAsses.length > 0) {
            if (parameters.generic.size > 0) {
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
          ]);
          const argPs = parameters.specialize.map(name => `${name}: CtorR<${name}_guts, ${name}_r>`);
          const specialPs = flatMap(Array.from(parameters.ctor), name => [
            `${name}_guts`,
            `${name}_r`,
          ]);
          let specialization = `${baseName}__CtorR`;
          if (parameters.ctor.size > 0) {
            /* I gotta check for existence because all of the generic parameters
               may go unused. */
            specialization += `<${specialPs.join(", ")}>`;
          }
          p.block(`specialize<${declarePs.join(", ")}>(${argPs.join(", ")}): ${specialization}`, p => {
            const newPs = Array.from(parameters.generic).map(name => `${name}: this.params.${name}`);

            /* Some of the specialize arguments may go unused, so I need to add
               the subset that actually appear in `parameters.ctor`. */
            parameters.specialize.forEach(name => {
              if (parameters.ctor.has(name)) {
                newPs.push(name);
              }
            });

            if (parameters.ctor.size > 0) {
              p.line(`return new ${baseName}__CtorR({ ${newPs.join(", ")} });`);
            } else {
              p.line(`return new ${baseName}__CtorR();`);
            }
          });

          if (nestedNodes !== null) {
            let heading = true;
            nestedNodes.forEach(nestedNode => {
              const uuid = toHex(nestedNode.getId());
              const contained = this.index[uuid];
              if (contained.tag() === Node.tags.const) {
                if (heading) {
                  p.interrupt();

                  p.comment("Constants");
                  heading = false;
                }

                p.interrupt();

                const ref = `constants["${uuid}"]`;
                const c = contained.getConst();
                this.constants.context(ref, c.getType(), c.getValue(), (type, body) => {
                  const name = nonnull(nestedNode.getName()).toString();
                  if (body === null) {
                    p.line(`get${capitalize(name)}(): ${type} {}`);
                  } else {
                    p.block(`get${capitalize(name)}(): ${type}`, p => {
                      p.line(body);
                    });
                  }
                });
              }
            });
          }

          const fields = struct.getFields();
          if (fields !== null) {
            let heading = true;
            fields.forEach(field => {
              if (field.tag === Field.tags.slot) {
                const slot = field.getSlot();
                if (slot.getHadExplicitDefault()) {
                  if (heading) {
                    p.comment("Defaults");
                    heading = false;
                  }

                  p.interrupt();

                  const name = nonnull(field.getName()).toString();
                  const ref = `defaults["${uuid}"].${name}`;
                  this.constants.context(ref, slot.getType(), slot.getDefaultValue(), (type, body) => {
                    if (body === null) {
                      p.line(`default${capitalize(name)}(): ${type} {}`);
                    } else {
                      p.block(`default${capitalize(name)}(): ${type}`, p => {
                        p.line(body);
                      });
                    }
                  });
                }
              }
            });
          }
        });
      }

      p.interrupt();

      {
        /* `X__CtorR` */

        const declareParams = flatMap(Array.from(parameters.ctor), name => [
          `${name}_guts: AnyGutsR`,
          `${name}_r: {+guts: ${name}_guts}`,
        ]);

        const objectParams = Array.from(parameters.ctor).map(name => {
          return `+${name}: CtorR<${name}_guts, ${name}_r>`;
        });

        let class_ = `export class ${baseName}__CtorR`;
        if (parameters.ctor.size > 0) {
          class_ += `<${declareParams.join(", ")}>`;
        }

        p.block(class_, p => {
          const constructorAsses = [];

          const nestedNodes = node.getNestedNodes();
          if (nestedNodes !== null) {
            nestedNodes.forEach(nestedNode => {
              const contained = this.index[toHex(nestedNode.getId())];
              switch (contained.tag()) {
              case Node.tags.struct:
                {
                  const localName = nonnull(nestedNode.getName()).toString();
                  const baseName = address(this.index, contained.getId()).classes.map(unprefixName).join("_");
                  const parameters = this.parameters[toHex(nestedNode.getId())];
                  if (parameters.specialize.length > 0) {
                    let t = `${baseName}__GenericR`;
                    if (parameters.generic.size > 0) {
                      const specialParams = flatMap(Array.from(parameters.generic), name => [
                        `${name}_guts`,
                        `${name}_r`,
                      ]);
                      t += `<${specialParams.join(", ")}>`;
                    }
                    p.line(`+${localName}: ${t};`);

                    if (parameters.generic.size > 0) {
                      const params = Array.from(parameters.generic).map(name => {
                        return `${name}: this.params.${name}`;
                      });
                      constructorAsses.push(`this.${localName} = new ${baseName}__GenericR({ ${params.join(", ")} });`);
                    } else {
                      constructorAsses.push(`this.${localName} = new ${baseName}__GenericR();`);
                    }
                  } else {
                    let t = `${baseName}__CtorR`;
                    if (parameters.ctor.size > 0) {
                      const specialParams = flatMap(Array.from(parameters.ctor), name => [
                        `${name}_guts`,
                        `${name}_r`,
                      ]);
                      t += `<${specialParams.join(", ")}>`;
                    }
                    p.line(`+${localName}: ${t};`);

                    if (parameters.ctor.size > 0) {
                      const params = Array.from(parameters.ctor).map(name => {
                        return `${name}: this.params.${name}`;
                      });
                      constructorAsses.push(`this.${localName} = new ${baseName}__CtorR({ ${params.join(", ")} });`);
                    } else {
                      constructorAsses.push(`this.${localName} = new ${baseName}__CtorR();`);
                    }
                  }
                }
                break;
              case Node.tags.enum:
                {
                  const localName = nonnull(nestedNode.getName()).toString();
                  const baseName = address(this.index, contained.getId()).classes.map(unprefixName).join("_");
                  const enumerants = contained.getEnum().getEnumerants();
                  if (enumerants === null || enumerants.length() === 0) {
                    p.line(`+${localName}: {}`);
                  } else {
                    //TODO: This bunch of enum stuff exists verbatim above. Consider factoring it out into a __Tags-like const.
                    p.line(`+${localName}: {`);
                    p.indent(p => {
                      enumerants.forEach((enumerant, value) => {
                        p.line(`+${nonnull(enumerant.getName()).toString()}: ${value}`);
                      });
                    });
                    p.line("};");
                  }

                  constructorAsses.push(`this.${localName} = ${baseName}__Enum;`);
                }
                break;
              case Node.tags.interface:
                throw new Error("TODO");
              }
            });
          }

          if (this.groupTypes.tagsRoot(node.getId(), p)) {
            constructorAsses.push(`this.tags = ${baseName}__Tags;`);
          }

          if (this.groupTypes.groupsRoot(node.getId(), p)) {
            constructorAsses.push(`this.groups = ${baseName}__Groups;`);
          }

          if (parameters.ctor.size > 0) {
            p.line(`+params: { ${objectParams.join(", ")} };`);
            constructorAsses.push("this.params = params;");
          }

          p.interrupt();

          if (constructorAsses.length > 0) {
            if (parameters.ctor.size > 0) {
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

          let this_ = `${baseName}__InstanceR`;
          if (parameters.instance.size > 0) {
            const specialParams = flatMap(Array.from(parameters.instance), name => [
              `${name}_guts`,
              `${name}_r`,
            ]);
            this_ += `<${specialParams.join(", ")}>`;
          }

          //TODO: convert parameters.specialize to a Set<string> for consistency?
          const instanceParams = Array.from(parameters.instance).map(name => `${name}: this.params.${name}`);

          p.block(`intern(guts: StructGutsR): ${this_}`, p => {
            if (parameters.instance.size > 0) {
              p.line(`return new ${baseName}__InstanceR(guts, { ${instanceParams.join(", ")} });`);
            } else {
              p.line(`return new ${baseName}__InstanceR(guts);`);
            }
          });

          p.interrupt();

          p.block(`fromAny(guts: AnyGutsR): ${this_}`, p => {
            if (parameters.instance.size > 0) {
              p.line(`return new ${baseName}__InstanceR(RefedStruct.fromAny(guts), { ${instanceParams.join(", ")} });`);
            } else {
              p.line(`return new ${baseName}__InstanceR(RefedStruct.fromAny(guts));`);
            }
          });

          p.interrupt();

          p.block(`deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): ${this_}`, p => {
            p.line("const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());");
            if (parameters.instance.size > 0) {
              p.line(`return new ${baseName}__InstanceR(guts, { ${instanceParams.join(", ")} });`);
            } else {
              p.line(`return new ${baseName}__InstanceR(guts);`);
            }
          });

          p.interrupt();

          p.block(`get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | ${this_}`, p => {
            p.line("return isNull(ref) ? null : this.deref(level, arena, ref);");
          });

          p.interrupt();

          p.block("compiledBytes(): Bytes", p => {
            const data  = struct.getDataWordCount() << 3;
            const pointers = struct.getPointerCount() << 3;
            p.line(`return { data: ${data}, pointers: ${pointers} };`);
          });

          p.interrupt();

          p.block(`empty(): ${this_}`, p => {
            p.line("const guts = RefedStruct.empty(blob);");
            if (parameters.instance.size > 0) {
              p.line(`return new ${baseName}__InstanceR(guts, { ${instanceParams.join(", ")} });`);
            } else {
              p.line(`return new ${baseName}__InstanceR(guts);`);
            }
          });

          if (nestedNodes !== null) {
            let heading = true;
            nestedNodes.forEach(nestedNode => {
              const contained = this.index[toHex(nestedNode.getId())];
              if (contained.tag() === Node.tags.const) {
                if (heading) {
                  p.interrupt();

                  p.comment("Constants");
                  heading = false;
                }

                p.interrupt();

                const c = contained.getConst();
                const uuid = toHex(nestedNode.getId());
                const ref = `constants["${uuid}"]`;
                this.constants.context(ref, c.getType(), c.getValue(), (type, body) => {
                  const name = nonnull(nestedNode.getName()).toString();
                  if (body === null) {
                    p.line(`get${capitalize(name)}(): ${type} {}`);
                  } else {
                    p.block(`get${capitalize(name)}(): ${type}`, p => {
                      p.line(body);
                    });
                  }
                });
              }
            });
          }

          const fields = struct.getFields();
          if (fields !== null) {
            let heading = true;
            fields.forEach(field => {
              if (field.tag === Field.tags.slot) {
                const slot = field.getSlot();
                if (slot.getHadExplicitDefault()) {
                  if (heading) {
                    p.comment("Defaults");
                    heading = false;
                  }

                  p.interrupt();

                  const name = nonnull(field.getName()).toString();
                  const ref = `defaults["${uuid}"].${name}`;
                  this.constants.context(ref, slot.getType(), slot.getDefaultValue(), (type, body) => {
                    if (body === null) {
                      p.line(`default${capitalize(name)}(): ${type} {}`);
                    } else {
                      p.block(`default${capitalize(name)}(): ${type}`, p => {
                        p.line(body);
                      });
                    }
                  });
                }
              }
            });
          }
        });
      }

      p.interrupt();

      {
        /* `X__InstanceR` */

        const declareParams = flatMap(Array.from(parameters.instance), name => [
          `${name}_guts: AnyGutsR`,
          `${name}_r: {+guts: ${name}_guts}`,
        ]);

        const objectParams = Array.from(parameters.instance).map(name => {
          return `+${name}: CtorR<${name}_guts, ${name}_r>`;
        });

        let class_ = `export class ${baseName}__InstanceR`;
        if (parameters.instance.size > 0) {
          class_ += `<${declareParams.join(", ")}>`;
        }

        p.block(class_, p => {
          p.line("+guts: StructGutsR;");

          if (parameters.instance.size > 0) {
            p.line(`+params: { ${objectParams.join(", ")} };`);

            p.interrupt();

            p.block(`constructor(guts: StructGutsR, params: { ${objectParams.join(", ")} })`, p => {
              p.line("this.guts = guts;");
              p.line("this.params = params;");
            });
          } else {
            p.interrupt();

            p.block(`constructor(guts: StructGutsR)`, p => {
              p.line("this.guts = guts;");
            });
          }

          p.interrupt();

          if (struct.getDiscriminantCount() > 0) {
            p.block("tag(): u16", p => {
              //TODO: Fix the offset annotation from getTag in reader-core. Its at u19 when it should be u33
              p.line(`return this.guts.getTag(${2 * struct.getDiscriminantOffset()});`);
            });
          }

          p.interrupt();

          const fields = struct.getFields();
          if (fields !== null) {
            fields.forEach(field => {
              p.interrupt();

              this.structField(field, 2 * struct.getDiscriminantOffset(), p);
            });
          }
        });
      }
    }

    //TODO: Check on all Visitor extensions to verify that super.struct, etc have been invoked under these methods
    p = super.struct(node, p);

    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          p.interrupt();

          p = this.struct(this.index[toHex(field.getGroup().getTypeId())], p);
        }
      });
    }

    return p;
  }

  enum(node: Node__InstanceR, p: Printer): Printer {
    const baseName = address(this.index, node.getId()).classes.map(unprefixName).join("_");

    p.interrupt();

    const path = address(this.index, node.getId()).classes.map(unprefixName);
    p.line(`/**${"*".repeat(path.join(".").length)}**/`);
    p.line(`/* ${path.join(".")} */`);
    p.line(`/**${"*".repeat(path.join(".").length)}**/`);

    p.interrupt();

    p.line(`const ${baseName}__Enum: {`);
    p.indent(p => {
      nonnull(node.getEnum().getEnumerants()).forEach((enumerant, value) => {
        p.line(`+${nonnull(enumerant.getName()).toString()}: ${value}`);
      });
    });
    p.line("} = {");
    p.indent(p => {
      nonnull(node.getEnum().getEnumerants()).forEach((enumerant, value) => {
        p.line(`${nonnull(enumerant.getName()).toString()}: ${value}`);
      });
    });
    p.line("};");

    return super.enum(node, p);
  }

  interface(node: Node__InstanceR, p: Printer): Printer {
    //TODO
    //This will swallow any nested nodes of the interface
    return p;
  }
}

export default function printReaderBodies(
  index: NodeIndex,
  fileId: UInt64,
  identifiers: { [uuid: string]: string },
  parameters: ParametersIndex,
  p: Printer,
): void {
  //TODO: Add empty() to Data and Text? I don't think that I want to.
  new ReadersVisitor(index, identifiers, parameters).visit(fileId, p);
}
