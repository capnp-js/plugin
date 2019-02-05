/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Index from "../Index";
import type Printer from "../Printer";
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
import capitalize from "../util/capitalize";
import flatMap from "../util/flatMap";
import paramName from "../util/paramName";
import { Node, Brand, Field, Type, Value } from "../schema.capnp-r";

type u16 = number;
type u33 = number;

type MainTypeT = {
  guts: string,
  reader: string,
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

  pointer(type: null | Type__InstanceR): null | MainTypeT {
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

    case Type.tags.text: return { guts: "NonboolListGutsR", reader: "Text" };
    case Type.tags.data: return { guts: "NonboolListGutsR", reader: "Data" };
    case Type.tags.list: return this.list(type.getList().getElementType());
    case Type.tags.struct:
      {
        const struct = type.getStruct();
        return this.struct(struct.getTypeId(), struct.getBrand());
      }
    case Type.tags.interface:
      // TODO
      // I'm not sure what this'll look like. I suspect that once I've got a
      // `-i.js` file of interfaces, then I'll bind a type like `Orphan` does,
      // yielding a type like "Cap<SomeInterface<T1, ..., Tn>>".
      throw new Error("TODO");
    case Type.tags.anyPointer: return this.anyPointer(type.getAnyPointer());
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  list(elementType: null | Type__InstanceR): MainTypeT {
    if (elementType === null) {
      elementType = Type.empty();
    }

    switch (elementType.tag()) {
    case Type.tags.void: return { guts: "NonboolListGutsR", reader: "VoidList" };
    case Type.tags.bool: return { guts: "BoolListGutsR", reader: "BoolList" };
    case Type.tags.int8: return { guts: "NonboolListGutsR", reader: "Int8List" };
    case Type.tags.int16: return { guts: "NonboolListGutsR", reader: "Int16List" };
    case Type.tags.int32: return { guts: "NonboolListGutsR", reader: "Int32List" };
    case Type.tags.int64: return { guts: "NonboolListGutsR", reader: "Int64List" };
    case Type.tags.uint8: return { guts: "NonboolListGutsR", reader: "UInt8List" };
    case Type.tags.uint16: return { guts: "NonboolListGutsR", reader: "UInt16List" };
    case Type.tags.uint32: return { guts: "NonboolListGutsR", reader: "UInt32List" };
    case Type.tags.uint64: return { guts: "NonboolListGutsR", reader: "UInt64List" };
    case Type.tags.float32: return { guts: "NonboolListGutsR", reader: "Float32List" };
    case Type.tags.float64: return { guts: "NonboolListGutsR", reader: "Float64List" };
    case Type.tags.text: return { guts: "NonboolListGutsR", reader: "ListListR<NonboolListGutsR, Text>" };
    case Type.tags.data: return { guts: "NonboolListGutsR", reader: "ListListR<NonboolListGutsR, Data>" };
    case Type.tags.list:
      {
        const t = this.list(elementType.getList().getElementType());
        return { guts: "NonboolListGutsR", reader: `ListListR<NonboolListGutsR, ${t.reader}>` };
      }
    case Type.tags.enum: return { guts: "NonboolListGutsR", reader: "UInt16List" };
    case Type.tags.struct:
      {
        const struct = elementType.getStruct();
        const t = this.struct(struct.getTypeId(), struct.getBrand());
        return { guts: "NonboolListGutsR", reader: `StructListR<${t.reader}>` };
      }
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer:
      {
        const t = this.anyPointer(elementType.getAnyPointer());
        return { guts: "NonboolListGutsR", reader: `ListListR<NonboolListGutsR, ${t.reader}>` };
      }
    default:
      throw new Error("Unrecognized type tag.");
    }
  }

  struct(id: UInt64, brand: null | Brand__InstanceR): MainTypeT {
    const mangledName = this.identifiers[toHex(id)];

    const parameters = this.parameters[toHex(id)];
    if (parameters.main.length > 0) {
      const bindings = this.resolve(parameters.main, brand);

      const specialPs = flatMap(Array.from(parameters.main), name => {
        const binding = bindings[name];
        return [ binding.guts, binding.reader ];
      });

      return {
        guts: "StructGutsR",
        reader: `${mangledName}__InstanceR<${specialPs.join(", ")}>`,
      };
    } else {
      return {
        guts: "StructGutsR",
        reader: `${mangledName}__InstanceR`,
      };
    }
  }

  structContext(
    id: UInt64,
    brand: null | Brand__InstanceR,
    cb: (guts: "StructGutsR", mangledName: string, pts: Array<MainTypeT>) => void,
  ): void {
    const mangledName = this.identifiers[toHex(id)];
    const parameters = this.parameters[toHex(id)];
    const bindings = this.resolve(parameters.main, brand);
    const pts = Array.from(parameters.main).map(name => bindings[name]);
    cb("StructGutsR", mangledName, pts);
  }

  anyPointer(anyPointer: Type_anyPointer__InstanceR): MainTypeT {
    const anyPointerG = Type.groups.anyPointer;
    switch (anyPointer.tag()) {
    case anyPointerG.tags.unconstrained:
      {
        const unconstrainedG = anyPointerG.groups.unconstrained;
        const unconstrained = anyPointer.getUnconstrained();
        switch (unconstrained.tag()) {
        case unconstrainedG.tags.anyKind: return { guts: "AnyGutsR", reader: "AnyValue" };
        case unconstrainedG.tags.struct: return { guts: "StructGutsR", reader: "StructValue" };
        case unconstrainedG.tags.list: return { guts: "BoolListGutsR | NonboolListGutsR", reader: "ListValue" };
        case unconstrainedG.tags.capability: throw new Error("TODO"); //There exists a CapValue, but it's half-baked.
        default: throw new Error("Unrecognized unconstrained AnyPointer type.");
        }
      }
    case anyPointerG.tags.parameter:
      {
        const parameter = anyPointer.getParameter();
        const scopeId = parameter.getScopeId();
        const name = paramName(this.index, scopeId, parameter.getParameterIndex());
        return { guts: `${name}_guts`, reader: `${name}_r` };
      }
    case anyPointerG.tags.implicitMethodParameter:
      throw new Error("TODO");
    default:
      throw new Error("Unrecognized AnyPointer type tag");
    }
  }

  resolve(parameters: $ReadOnlyArray<string>, brand: null | Brand__InstanceR): { [name: string]: MainTypeT } {
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
                      bindings[name] = {
                        guts: "AnyGutsR",
                        reader: "AnyValue",
                      };
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
              const parameters = this.index.getNode(scopeId).getParameters();
              if (parameters !== null) {
                parameters.forEach((parameter, position) => {
                  const name = paramName(this.index, scopeId, position);
                  if (unresolveds.has(name)) {
                    unresolveds.delete(name);
                    bindings[name] = {
                      guts: `${name}_guts`,
                      reader: `${name}_r`,
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
      bindings[name] = { guts: "AnyGutsR", reader: "AnyValue" };
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
      // I doubt that serialization code will ever instantiate interfaces, but
      // I'll leave the TODO label for now.
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
      // I doubt that serialization code will ever instantiate interfaces, but
      // I'll leave the TODO label for now.
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
    if (parameters.main.length > 0) {
      const bindings = this.resolve(parameters.main, brand);
      //TODO: Is parameters.ctor the correct set for consts? Do I need fix accumulateParameters? I think that ctor and instance converge at leafs, so this should be fine, no? Test me.
      const objectParams = Array.from(parameters.main).map(name => `${name}: ${bindings[name]}`);
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

  resolve(parameters: $ReadOnlyArray<string>, brand: null | Brand__InstanceR): { [name: string]: string } {
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
  +constants: Constants;

  constructor(index: Index, constants: Constants) {
    this.index = index;
    this.constants = constants;
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

        //TODO: This includes nonpointers among the defaults, no? That's a bug, no?
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
  +index: Index;
  +type: MainType;

  //TODO: convert instanceType to plain old type, right? not value, though, right?
  constructor(index: Index, type: MainType) {
    this.index = index;
    this.type = type;
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

        const fields = node.getStruct().getFields();
        if (fields !== null) {
          fields.forEach(field => {
            if (field.tag() === Field.tags.slot) {
              const slot = field.getSlot();
              if (slot.getHadExplicitDefault()) {
                const name = capitalize(nonnull(field.getName()).toString());
                const type = nonnull(this.type.pointer(slot.getType()));
                p.line(`default${name}(): ${type.reader},`);
              }
            }
          });
        }
      });
    }
  }
}

class Constants {
  +type: MainType;
  +ctorValue: CtorValue;

  constructor(type: MainType, ctorValue: CtorValue) {
    this.type = type;
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
        nonnull(this.type.pointer(type)).reader,
        `return ${ctor}.deref(0, blob, ${ref});`,
      );
      break;
    default:
      throw new Error("Unrecognized value tag.");
    }
  }
}

class ReadersVisitor extends Visitor<Printer> {
  +parameters: ParametersIndex;
  +type: MainType;
  +ctorValue: CtorValue;
  +constants: Constants;
  +groupTypes: GroupTypes;
  +groupValues: GroupValues;

  constructor(index: Index, identifiers: { [uuid: string]: string }, parameters: ParametersIndex) {
    super(index);
    this.parameters = parameters;
    this.type = new MainType(index, identifiers, parameters);
    this.ctorValue = new CtorValue(index, identifiers, parameters);
    this.constants = new Constants(this.type, this.ctorValue);
    this.groupTypes = new GroupTypes(index, this.type);
    this.groupValues = new GroupValues(index, this.constants);
  }

  structField(field: Field__InstanceR, discrOffset: u33, p: Printer): void {
    function checkTag(discrValue: u16, discrOffset: u33, p: Printer): void {
      if (discrValue !== Field.getNoDiscriminant()) {
        p.line(`this.guts.checkTag(${discrValue}, ${discrOffset});`);
      }
    }

    const name = nonnull(field.getName());
    p.comment(name.toString());

    const discrValue = field.getDiscriminantValue();
    const getField = `get${capitalize(name.toString())}`;
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() >>> 3};`);

            const def = nonnull(slot.getDefaultValue()).getBool();
            p.ifElse(
              "d < this.guts.layout.pointersSection",
              p => {
                const prefix = def === true ? "!" : "!!";
                p.line(`return ${prefix}decode.bit(this.guts.segment.raw, d, ${slot.getOffset() & 0x07});`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getInt8();
            p.ifElse(
              "d + 1 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return ${def} ^ decode.int8(this.guts.segment.raw, d);`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getInt16();
            p.ifElse(
              "d + 2 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return ${def} ^ decode.int16(this.guts.segment.raw, d);`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getInt32();
            p.ifElse(
              "d + 4 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return ${def} ^ decode.int32(this.guts.segment.raw, d);`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getInt64();
            p.ifElse(
              "d + 8 <= this.guts.layout.pointersSection",
              p => {
                p.line ("return injectI64(");
                p.indent(p => {
                  p.line(`${def[0]} ^ decode.int32(this.guts.segment.raw, d+4),`);
                  p.line(`${def[1]} ^ decode.int32(this.guts.segment.raw, d),`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset()};`);

            const def = nonnull(slot.getDefaultValue()).getUint8();
            p.ifElse(
              "d + 1 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint8(this.guts.segment.raw, d)) >>> 0;`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getUint16();
            p.ifElse(
              "d + 2 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            const def = nonnull(slot.getDefaultValue()).getUint32();
            p.ifElse(
              "d + 4 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint32(this.guts.segment.raw, d)) >>> 0;`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            const def = nonnull(slot.getDefaultValue()).getUint64();
            p.ifElse(
              "d + 8 <= this.guts.layout.pointersSection",
              p => {
                p.line("return injectU64(");
                p.indent(p => {
                  p.line(`${def[0]} ^ decode.int32(this.guts.segment.raw, d+4),`);
                  p.line(`${def[1]} ^ decode.int32(this.guts.segment.raw, d),`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 2};`);

            /* Manually grab the default's bit pattern from the Float32
               location. */
            const def = int32(slot.guts.segment.raw, slot.guts.layout.dataSection + 4);
            p.ifElse(
              "d + 4 <= this.guts.layout.pointersSection",
              p => {
                p.line("const bytes = decode.int32(this.guts.segment.raw, d);");
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 3};`);

            /* Manually grab the default's bit pattern from the Float64
               location. */
            const def = [
              int32(slot.guts.segment.raw, slot.guts.layout.dataSection + 12),
              int32(slot.guts.segment.raw, slot.guts.layout.dataSection + 8),
            ];
            p.ifElse(
              "d + 8 <= this.guts.layout.pointersSection",
              p => {
                p.line("const bytes = injectI64(");
                p.indent(p => {
                  p.line(`decode.int32(this.guts.segment.raw, d+4) ^ ${def[0]},`);
                  p.line(`decode.int32(this.guts.segment.raw, d) ^ ${def[1]},`);
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

            p.line(`const d = this.guts.layout.dataSection + ${slot.getOffset() << 1};`);

            const def = nonnull(slot.getDefaultValue()).getEnum();
            p.ifElse(
              "d + 2 <= this.guts.layout.pointersSection",
              p => {
                p.line(`return (${def} ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;`);
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
          p.block(`${getField}(): null | ${nonnull(this.type.pointer(type)).reader}`, p => {
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
        const baseName = `${this.index.getScopes(id).slice(1).map(s => s.name).join("_")}`;

        const parameters = this.parameters[toHex(id)].main;

        const specialPs = flatMap(Array.from(parameters), name => [
          `${name}_guts`,
          `${name}_r`,
        ]);
        const objectParams = Array.from(parameters).map(name => `${name}: this.params.${name}`);

        let specialization = `${baseName}__InstanceR`;
        if (parameters.length > 0) {
          specialization += `<${specialPs.join(", ")}>`;
        }

        p.block(`${getField}(): ${specialization}`, p => {
          checkTag(discrValue, discrOffset, p);

          if (parameters.length > 0) {
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

  // TODO: I made lots of assumptions about the name patterns within a non-"" prefixed struct.
  //       Try to generate some gibberish under those assumptions.
  printStruct(type: "param" | "result" | "plain", node: Node__InstanceR, p: Printer): void {
    const uuid = toHex(node.getId());
    const baseName = this.index.getScopes(node.getId()).slice(1).map(s => s.name).join("_");
    const parameters = this.parameters[uuid];
    const struct = node.getStruct();
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
      /* This struct or interface introduces new generic parameters, so I need
         a `X__GenericR` class. */

      const declareParams = flatMap(Array.from(parameters.generic), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
      ]);

      const objectParams = Array.from(parameters.generic).map(name => {
        return `+${name}: CtorR<${name}_guts, ${name}_r>`;
      });

      let class_ = `export class ${baseName}__${prefix}GenericR`;
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
                    p.line(`+${nonnull(enumerant.getName()).toString()}: ${value}`);
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
        ]);
        const argPs = parameters.specialize.map(name => `${name}: CtorR<${name}_guts, ${name}_r>`);
        const specialPs = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
        ]);
        const specialization = `${baseName}__${prefix}CtorR<${specialPs.join(", ")}>`;
        p.block(`specialize<${declarePs.join(", ")}>(${argPs.join(", ")}): ${specialization}`, p => {
          let newPs = Array.from(parameters.generic).map(name => `${name}: this.params.${name}`);
          newPs = newPs.concat(parameters.specialize);

          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}CtorR({ ${newPs.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}CtorR();`);
          }
        });

        if (nestedNodes !== null) {
          let heading = true;
          nestedNodes.forEach(nestedNode => {
            const uuid = toHex(nestedNode.getId());
            const contained = this.index.getNode(nestedNode.getId());
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

      let this_ = `${baseName}__${prefix}InstanceR`;
      if (parameters.main.length > 0) {
        const specialParams = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
        ]);
        this_ += `<${specialParams.join(", ")}>`;
      }

      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorR<${name}_guts, ${name}_r>`;
      });

      let class_ = `export class ${baseName}__${prefix}CtorR`;
      if (parameters.main.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      class_ += ` implements StructCtorR<${this_}>`;

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
                  let t = `${baseName}_${localName}__GenericR`;
                  if (parameters.generic.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.generic), name => [
                      `${name}_guts`,
                      `${name}_r`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.generic.length > 0) {
                    const params = Array.from(parameters.generic).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericR({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericR();`);
                  }
                } else {
                  let t = `${baseName}_${localName}__CtorR`;
                  if (parameters.main.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.main.length > 0) {
                    const params = Array.from(parameters.main).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorR({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorR();`);
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
                      p.line(`+${nonnull(enumerant.getName()).toString()}: ${value}`);
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

        p.block(`intern(guts: StructGutsR): ${this_}`, p => {
          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}InstanceR(guts, { ${instanceParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}InstanceR(guts);`);
          }
        });

        p.interrupt();

        p.block(`fromAny(guts: AnyGutsR): ${this_}`, p => {
          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}InstanceR(RefedStruct.fromAny(guts), { ${instanceParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}InstanceR(RefedStruct.fromAny(guts));`);
          }
        });

        p.interrupt();

        p.block(`deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): ${this_}`, p => {
          p.line("const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());");
          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}InstanceR(guts, { ${instanceParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}InstanceR(guts);`);
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
          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__${prefix}InstanceR(guts, { ${instanceParams.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__${prefix}InstanceR(guts);`);
          }
        });

        if (nestedNodes !== null) {
          let heading = true;
          nestedNodes.forEach(nestedNode => {
            const contained = this.index.getNode(nestedNode.getId());
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

      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorR<${name}_guts, ${name}_r>`;
      });

      let class_ = `export class ${baseName}__${prefix}InstanceR`;
      if (parameters.main.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      p.block(class_, p => {
        p.line("+guts: StructGutsR;");

        if (parameters.main.length > 0) {
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

        if (struct.getDiscriminantCount() > 0) {
          p.interrupt();

          p.block("tag(): u16", p => {
            //TODO: Fix the offset annotation from getTag in reader-core. Its at u19 when it should be u33
            p.line(`return this.guts.getTag(${2 * struct.getDiscriminantOffset()});`);
          });
        }

        const fields = struct.getFields();
        if (fields !== null) {
          fields.forEach(field => {
            p.interrupt();

            this.structField(field, 2 * struct.getDiscriminantOffset(), p);
          });
        }
      });
    }

    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        if (field.tag() === Field.tags.group) {
          p.interrupt();

          p = this.struct(this.index.getNode(field.getGroup().getTypeId()), p);
        }
      });
    }
  }

  file(node: Node__InstanceR, p: Printer): Printer {
    const nestedNodes = node.getNestedNodes();
    if (nestedNodes !== null) {
      let heading = true;
      nestedNodes.forEach(nestedNode => {
        const uuid = toHex(nestedNode.getId());
        const contained = this.index.getNode(nestedNode.getId());
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
    const baseName = this.index.getScopes(node.getId()).slice(1).map(s => s.name).join("_");
    if (struct.getIsGroup()) {
      //TODO: This is a very common pattern. extract a function and refactor?
      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorR<${name}_guts, ${name}_r>`;
      });

      let class_ = `export class ${baseName}__InstanceR`;
      if (parameters.main.length > 0) {
        class_ += `<${declareParams.join(", ")}>`;
      }

      p.block(class_, p => {
        p.line("+guts: StructGutsR;");

        if (parameters.main.length > 0) {
          p.line(`+params: { ${objectParams.join(", ")} };`);
        }

        p.interrupt();

        if (parameters.main.length > 0) {
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

          //TODO: Should this be a `visit` call instead?
          p = this.struct(this.index.getNode(field.getGroup().getTypeId()), p);
        }
      });
    }

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
      ]);

      const objectParams = Array.from(parameters.generic).map(name => {
        return `+${name}: CtorR<${name}_guts, ${name}_r>`;
      });

      let class_ = `export class ${baseName}__GenericR`;
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
                    p.line(`+${nonnull(enumerant.getName()).toString()}: ${value}`);
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
        ]);
        const argPs = parameters.specialize.map(name => `${name}: CtorR<${name}_guts, ${name}_r>`);
        const specialPs = flatMap(Array.from(parameters.main), name => [
          `${name}_guts`,
          `${name}_r`,
        ]);
        const specialization = `${baseName}__CtorR<${specialPs.join(", ")}>`;
        p.block(`specialize<${declarePs.join(", ")}>(${argPs.join(", ")}): ${specialization}`, p => {
          let newPs = Array.from(parameters.generic).map(name => `${name}: this.params.${name}`);
          newPs = newPs.concat(parameters.specialize);

          if (parameters.main.length > 0) {
            p.line(`return new ${baseName}__CtorR({ ${newPs.join(", ")} });`);
          } else {
            p.line(`return new ${baseName}__CtorR();`);
          }
        });

        if (nestedNodes !== null) {
          let heading = true;
          nestedNodes.forEach(nestedNode => {
            const uuid = toHex(nestedNode.getId());
            const contained = this.index.getNode(nestedNode.getId());
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
      });
    }

    p.interrupt();

    {
      /* `X__CtorR` */

      const declareParams = flatMap(Array.from(parameters.main), name => [
        `${name}_guts: AnyGutsR`,
        `${name}_r: {+guts: ${name}_guts}`,
      ]);

      const objectParams = Array.from(parameters.main).map(name => {
        return `+${name}: CtorR<${name}_guts, ${name}_r>`;
      });

      let class_ = `export class ${baseName}__CtorR`;
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
                  let t = `${baseName}_${localName}__GenericR`;
                  if (parameters.generic.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.generic), name => [
                      `${name}_guts`,
                      `${name}_r`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.generic.length > 0) {
                    const params = Array.from(parameters.generic).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericR({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__GenericR();`);
                  }
                } else {
                  let t = `${baseName}_${localName}__CtorR`;
                  if (parameters.main.length > 0) {
                    const specialParams = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                    ]);
                    t += `<${specialParams.join(", ")}>`;
                  }
                  p.line(`+${localName}: ${t};`);

                  if (parameters.main.length > 0) {
                    const params = Array.from(parameters.main).map(name => {
                      return `${name}: this.params.${name}`;
                    });
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorR({ ${params.join(", ")} });`);
                  } else {
                    constructorAsses.push(`this.${localName} = new ${baseName}_${localName}__CtorR();`);
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
                      p.line(`+${nonnull(enumerant.getName()).toString()}: ${value}`);
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
                  let specialization = `${methodBaseName}__ParamCtorR`;
                  if (parameters.main.length > 0) {
                    const specialPs = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                    ]);
                    const objectParams = Array.from(parameters.main).map(name => `${name}: this.params.${name}`);
                    specialization += `<${specialPs.join(", ")}>`;
                    paramCtor = `new ${methodBaseName}__ParamCtorR({ ${objectParams.join(", ")} })`;
                  } else {
                    paramCtor = `new ${methodBaseName}__ParamCtorR()`;
                  }
                  p.line(`+Param: ${specialization},`);
                } else {
                  paramCtor = this.ctorValue.struct(paramId, method.getParamBrand());
                  this.type.structContext(paramId, method.getParamBrand(), (guts, mangledName, pts) => {
                    if (pts.length > 0) {
                      const specialPs = flatMap(pts, pt => [pt.guts, pt.reader]);
                      p.line(`+Param: ${mangledName}__CtorR<${specialPs.join(", ")}>,`);
                    } else {
                      p.line(`+Param: ${mangledName}__CtorR,`);
                    }
                  });
                }

                const resultId = method.getResultStructType();
                const resultScopeId = this.index.getNode(resultId).getScopeId();
                if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
                  const parameters = this.parameters[toHex(resultId)];
                  let specialization = `${methodBaseName}__ResultCtorR`;
                  if (parameters.main.length > 0) {
                    const specialPs = flatMap(Array.from(parameters.main), name => [
                      `${name}_guts`,
                      `${name}_r`,
                    ]);
                    const objectParams = Array.from(parameters.main).map(name => `${name}: this.params.${name}`);
                    specialization += `<${specialPs.join(", ")}>`;
                    resultCtor = `new ${methodBaseName}__ResultCtorR({ ${objectParams.join(", ")} })`;
                  } else {
                    resultCtor = `new ${methodBaseName}__ResultCtorR()`;
                  }
                  p.line(`+Result: ${specialization},`);
                } else {
                  resultCtor = this.ctorValue.struct(resultId, method.getResultBrand());
                  this.type.structContext(resultId, method.getParamBrand(), (guts, mangledName, pts) => {
                    if (pts.length > 0) {
                      const specialPs = flatMap(pts, pt => [pt.guts, pt.reader]);
                      p.line(`+Result: ${mangledName}__CtorR<${specialPs.join(", ")}>,`);
                    } else {
                      p.line(`+Result: ${mangledName}__CtorR,`);
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

        if (nestedNodes !== null) {
          let heading = true;
          nestedNodes.forEach(nestedNode => {
            const contained = this.index.getNode(nestedNode.getId());
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
  p: Printer,
): void {
  //TODO: Add empty() to Data and Text? I don't think that I want to.
  new ReadersVisitor(index, identifiers, parameters).visit(fileId, p);
}
