/* @flow */

import type { Int64 } from "@capnp-js/int64";
import type { UInt64 } from "@capnp-js/uint64";
import type { Bytes } from "@capnp-js/layout";
import type {
  Pointer,
  SegmentB,
  Word,
} from "@capnp-js/memory";
import type {
  AnyGutsR,
  AnyValue as AnyValueR,
  CtorR,
  Data as DataR,
  NonboolListGutsR,
  StructGutsR,
  StructListR,
  Text as TextR,
} from "@capnp-js/reader-core";
import type {
  AnyGutsB,
  ArenaB,
  StructCtorB,
  StructGutsB,
  StructListB,
} from "@capnp-js/builder-core";

import * as decode from "@capnp-js/read-data";
import * as encode from "@capnp-js/write-data";
import { inject as injectI64 } from "@capnp-js/int64";
import { inject as injectU64 } from "@capnp-js/uint64";
import { isNull } from "@capnp-js/memory";
import {
  AnyValue,
  Data,
  Orphan,
  RefedStruct,
  Text,
  structs,
} from "@capnp-js/builder-core";

import type {
  Node__InstanceR,
  Node_Parameter__InstanceR,
  Node_NestedNode__InstanceR,
  Node_SourceInfo__InstanceR,
  Node_SourceInfo_Member__InstanceR,
  Field__InstanceR,
  Enumerant__InstanceR,
  Superclass__InstanceR,
  Method__InstanceR,
  Type__InstanceR,
  Brand__InstanceR,
  Brand_Scope__InstanceR,
  Brand_Binding__InstanceR,
  Value__InstanceR,
  Annotation__InstanceR,
  CapnpVersion__InstanceR,
  CodeGeneratorRequest__InstanceR,
  CodeGeneratorRequest_RequestedFile__InstanceR,
  CodeGeneratorRequest_RequestedFile_Import__InstanceR,
} from "./schema.capnp-r.js";

type f32 = number;
type f64 = number;
type i16 = number;
type i32 = number;
type i8 = number;
type u16 = number;
type u32 = number;
type u8 = number;
type uint = number;

/********/
/* Node */
/********/

const Node__Tags = {
  file: 0,
  struct: 1,
  enum: 2,
  interface: 3,
  const: 4,
  annotation: 5,
};

const Node__Groups = {
  struct: {},
  enum: {},
  interface: {},
  const: {},
  annotation: {},
};

export class Node__CtorB {
  +Parameter: Node_Parameter__CtorB;
  +NestedNode: Node_NestedNode__CtorB;
  +SourceInfo: Node_SourceInfo__CtorB;
  +tags: {
    +file: 0,
    +struct: 1,
    +enum: 2,
    +interface: 3,
    +const: 4,
    +annotation: 5,
  };
  +groups: {
    +struct: {},
    +enum: {},
    +interface: {},
    +const: {},
    +annotation: {},
  };

  constructor() {
    this.Parameter = new Node_Parameter__CtorB();
    this.NestedNode = new Node_NestedNode__CtorB();
    this.SourceInfo = new Node_SourceInfo__CtorB();
    this.tags = Node__Tags;
    this.groups = Node__Groups;
  }

  intern(guts: StructGutsB): Node__InstanceB {
    return new Node__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Node__InstanceB {
    return new Node__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Node__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Node__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Node__InstanceR, Node__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 40, pointers: 48 };
  }
}

export class Node__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Node__InstanceR>): Node__InstanceR {
    return Ctor.intern(this.guts);
  }

  tag(): u16 {
    return this.guts.getTag(12);
  }

  /* id */
  getId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* displayName */
  getDisplayName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setDisplayName(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownDisplayName(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptDisplayName(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* displayNamePrefixLength */
  getDisplayNamePrefixLength(): u32 {
    const d = this.guts.layout.dataSection + 8;
    return (0 ^ decode.uint32(this.guts.segment.raw, d)) >>> 0;
  }
  setDisplayNamePrefixLength(value: u32): void {
    const d = this.guts.layout.dataSection + 8;
    encode.uint32(0 ^ value, this.guts.segment.raw, d);
  }

  /* scopeId */
  getScopeId(): UInt64 {
    const d = this.guts.layout.dataSection + 16;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setScopeId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 16;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* nestedNodes */
  getNestedNodes(): null | StructListB<Node_NestedNode__InstanceR, Node_NestedNode__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return structs(new Node_NestedNode__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setNestedNodes(value: StructListR<Node_NestedNode__InstanceR> | StructListB<Node_NestedNode__InstanceR, Node_NestedNode__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownNestedNodes(): null | Orphan<NonboolListGutsR, StructListR<Node_NestedNode__InstanceR>, StructListB<Node_NestedNode__InstanceR, Node_NestedNode__InstanceB>> {
    const ref = this.guts.pointersWord(8);
    return structs(new Node_NestedNode__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptNestedNodes(orphan: Orphan<NonboolListGutsR, StructListR<Node_NestedNode__InstanceR>, StructListB<Node_NestedNode__InstanceR, Node_NestedNode__InstanceB>>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* annotations */
  getAnnotations(): null | StructListB<Annotation__InstanceR, Annotation__InstanceB> {
    const ref = this.guts.pointersWord(16);
    return structs(new Annotation__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setAnnotations(value: StructListR<Annotation__InstanceR> | StructListB<Annotation__InstanceR, Annotation__InstanceB>): void {
    const ref = this.guts.pointersWord(16);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownAnnotations(): null | Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>> {
    const ref = this.guts.pointersWord(16);
    return structs(new Annotation__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptAnnotations(orphan: Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>>): void {
    const ref = this.guts.pointersWord(16);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* file */
  getFile(): void {
    this.guts.checkTag(0, 12);
  }
  setFile(): void {
    this.guts.setTag(0, 12, {
      partialDataBytes: [ [15, 240], [28, 254] ],
      dataBytes: [ [14, 2], [24, 4], [30, 6] ],
      pointersBytes: [ [24, 16] ],
    });
  }

  /* struct */
  getStruct(): Node_struct__InstanceB {
    this.guts.checkTag(1, 12);
    return new Node_struct__InstanceB(this.guts);
  }
  initStruct(): void {
    this.guts.initTag(1, 12, {
      partialDataBytes: [ [15, 240], [28, 254] ],
      dataBytes: [ [14, 2], [24, 4], [30, 6] ],
      pointersBytes: [ [24, 16] ],
    });
    return new Node_struct__InstanceB(this.guts);
  }

  /* enum */
  getEnum(): Node_enum__InstanceB {
    this.guts.checkTag(2, 12);
    return new Node_enum__InstanceB(this.guts);
  }
  initEnum(): void {
    this.guts.initTag(2, 12, {
      partialDataBytes: [ [15, 240], [28, 254] ],
      dataBytes: [ [14, 2], [24, 4], [30, 6] ],
      pointersBytes: [ [24, 16] ],
    });
    return new Node_enum__InstanceB(this.guts);
  }

  /* interface */
  getInterface(): Node_interface__InstanceB {
    this.guts.checkTag(3, 12);
    return new Node_interface__InstanceB(this.guts);
  }
  initInterface(): void {
    this.guts.initTag(3, 12, {
      partialDataBytes: [ [15, 240], [28, 254] ],
      dataBytes: [ [14, 2], [24, 4], [30, 6] ],
      pointersBytes: [ [24, 16] ],
    });
    return new Node_interface__InstanceB(this.guts);
  }

  /* const */
  getConst(): Node_const__InstanceB {
    this.guts.checkTag(4, 12);
    return new Node_const__InstanceB(this.guts);
  }
  initConst(): void {
    this.guts.initTag(4, 12, {
      partialDataBytes: [ [15, 240], [28, 254] ],
      dataBytes: [ [14, 2], [24, 4], [30, 6] ],
      pointersBytes: [ [24, 16] ],
    });
    return new Node_const__InstanceB(this.guts);
  }

  /* annotation */
  getAnnotation(): Node_annotation__InstanceB {
    this.guts.checkTag(5, 12);
    return new Node_annotation__InstanceB(this.guts);
  }
  initAnnotation(): void {
    this.guts.initTag(5, 12, {
      partialDataBytes: [ [15, 240], [28, 254] ],
      dataBytes: [ [14, 2], [24, 4], [30, 6] ],
      pointersBytes: [ [24, 16] ],
    });
    return new Node_annotation__InstanceB(this.guts);
  }

  /* parameters */
  getParameters(): null | StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB> {
    const ref = this.guts.pointersWord(40);
    return structs(new Node_Parameter__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setParameters(value: StructListR<Node_Parameter__InstanceR> | StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB>): void {
    const ref = this.guts.pointersWord(40);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownParameters(): null | Orphan<NonboolListGutsR, StructListR<Node_Parameter__InstanceR>, StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB>> {
    const ref = this.guts.pointersWord(40);
    return structs(new Node_Parameter__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptParameters(orphan: Orphan<NonboolListGutsR, StructListR<Node_Parameter__InstanceR>, StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB>>): void {
    const ref = this.guts.pointersWord(40);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* isGeneric */
  getIsGeneric(): boolean {
    const d = this.guts.layout.dataSection + 36;
    return !!decode.bit(this.guts.segment.raw, d, 0);
  }
  setIsGeneric(value: boolean): void {
    const d = this.guts.layout.dataSection + 36;
    encode.bit(!!value, this.guts.segment.raw, d, 0);
  }
}

/******************/
/* Node.Parameter */
/******************/

export class Node_Parameter__CtorB {
  intern(guts: StructGutsB): Node_Parameter__InstanceB {
    return new Node_Parameter__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Node_Parameter__InstanceB {
    return new Node_Parameter__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Node_Parameter__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_Parameter__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Node_Parameter__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Node_Parameter__InstanceR, Node_Parameter__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 0, pointers: 8 };
  }
}

export class Node_Parameter__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Node_Parameter__InstanceR>): Node_Parameter__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setName(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownName(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptName(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/*******************/
/* Node.NestedNode */
/*******************/

export class Node_NestedNode__CtorB {
  intern(guts: StructGutsB): Node_NestedNode__InstanceB {
    return new Node_NestedNode__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Node_NestedNode__InstanceB {
    return new Node_NestedNode__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Node_NestedNode__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_NestedNode__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Node_NestedNode__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Node_NestedNode__InstanceR, Node_NestedNode__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 8 };
  }
}

export class Node_NestedNode__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Node_NestedNode__InstanceR>): Node_NestedNode__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setName(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownName(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptName(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* id */
  getId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }
}

/*******************/
/* Node.SourceInfo */
/*******************/

export class Node_SourceInfo__CtorB {
  +Member: Node_SourceInfo_Member__CtorB;

  constructor() {
    this.Member = new Node_SourceInfo_Member__CtorB();
  }

  intern(guts: StructGutsB): Node_SourceInfo__InstanceB {
    return new Node_SourceInfo__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Node_SourceInfo__InstanceB {
    return new Node_SourceInfo__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Node_SourceInfo__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_SourceInfo__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Node_SourceInfo__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Node_SourceInfo__InstanceR, Node_SourceInfo__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 16 };
  }
}

export class Node_SourceInfo__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Node_SourceInfo__InstanceR>): Node_SourceInfo__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* id */
  getId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* docComment */
  getDocComment(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setDocComment(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownDocComment(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptDocComment(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* members */
  getMembers(): null | StructListB<Node_SourceInfo_Member__InstanceR, Node_SourceInfo_Member__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return structs(new Node_SourceInfo_Member__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setMembers(value: StructListR<Node_SourceInfo_Member__InstanceR> | StructListB<Node_SourceInfo_Member__InstanceR, Node_SourceInfo_Member__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownMembers(): null | Orphan<NonboolListGutsR, StructListR<Node_SourceInfo_Member__InstanceR>, StructListB<Node_SourceInfo_Member__InstanceR, Node_SourceInfo_Member__InstanceB>> {
    const ref = this.guts.pointersWord(8);
    return structs(new Node_SourceInfo_Member__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptMembers(orphan: Orphan<NonboolListGutsR, StructListR<Node_SourceInfo_Member__InstanceR>, StructListB<Node_SourceInfo_Member__InstanceR, Node_SourceInfo_Member__InstanceB>>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/**************************/
/* Node.SourceInfo.Member */
/**************************/

export class Node_SourceInfo_Member__CtorB {
  intern(guts: StructGutsB): Node_SourceInfo_Member__InstanceB {
    return new Node_SourceInfo_Member__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Node_SourceInfo_Member__InstanceB {
    return new Node_SourceInfo_Member__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Node_SourceInfo_Member__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_SourceInfo_Member__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Node_SourceInfo_Member__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Node_SourceInfo_Member__InstanceR, Node_SourceInfo_Member__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 0, pointers: 8 };
  }
}

export class Node_SourceInfo_Member__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Node_SourceInfo_Member__InstanceR>): Node_SourceInfo_Member__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* docComment */
  getDocComment(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setDocComment(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownDocComment(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptDocComment(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Node_struct__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* dataWordCount */
  getDataWordCount(): u16 {
    const d = this.guts.layout.dataSection + 14;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setDataWordCount(value: u16): void {
    const d = this.guts.layout.dataSection + 14;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* pointerCount */
  getPointerCount(): u16 {
    const d = this.guts.layout.dataSection + 24;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setPointerCount(value: u16): void {
    const d = this.guts.layout.dataSection + 24;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* preferredListEncoding */
  getPreferredListEncoding(): u16 {
    const d = this.guts.layout.dataSection + 26;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setPreferredListEncoding(value: u16): void {
    const d = this.guts.layout.dataSection + 26;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* isGroup */
  getIsGroup(): boolean {
    const d = this.guts.layout.dataSection + 28;
    return !!decode.bit(this.guts.segment.raw, d, 0);
  }
  setIsGroup(value: boolean): void {
    const d = this.guts.layout.dataSection + 28;
    encode.bit(!!value, this.guts.segment.raw, d, 0);
  }

  /* discriminantCount */
  getDiscriminantCount(): u16 {
    const d = this.guts.layout.dataSection + 30;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setDiscriminantCount(value: u16): void {
    const d = this.guts.layout.dataSection + 30;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* discriminantOffset */
  getDiscriminantOffset(): u32 {
    const d = this.guts.layout.dataSection + 32;
    return (0 ^ decode.uint32(this.guts.segment.raw, d)) >>> 0;
  }
  setDiscriminantOffset(value: u32): void {
    const d = this.guts.layout.dataSection + 32;
    encode.uint32(0 ^ value, this.guts.segment.raw, d);
  }

  /* fields */
  getFields(): null | StructListB<Field__InstanceR, Field__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return structs(new Field__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setFields(value: StructListR<Field__InstanceR> | StructListB<Field__InstanceR, Field__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownFields(): null | Orphan<NonboolListGutsR, StructListR<Field__InstanceR>, StructListB<Field__InstanceR, Field__InstanceB>> {
    const ref = this.guts.pointersWord(24);
    return structs(new Field__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptFields(orphan: Orphan<NonboolListGutsR, StructListR<Field__InstanceR>, StructListB<Field__InstanceR, Field__InstanceB>>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Node_enum__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* enumerants */
  getEnumerants(): null | StructListB<Enumerant__InstanceR, Enumerant__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return structs(new Enumerant__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setEnumerants(value: StructListR<Enumerant__InstanceR> | StructListB<Enumerant__InstanceR, Enumerant__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownEnumerants(): null | Orphan<NonboolListGutsR, StructListR<Enumerant__InstanceR>, StructListB<Enumerant__InstanceR, Enumerant__InstanceB>> {
    const ref = this.guts.pointersWord(24);
    return structs(new Enumerant__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptEnumerants(orphan: Orphan<NonboolListGutsR, StructListR<Enumerant__InstanceR>, StructListB<Enumerant__InstanceR, Enumerant__InstanceB>>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Node_interface__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* methods */
  getMethods(): null | StructListB<Method__InstanceR, Method__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return structs(new Method__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setMethods(value: StructListR<Method__InstanceR> | StructListB<Method__InstanceR, Method__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownMethods(): null | Orphan<NonboolListGutsR, StructListR<Method__InstanceR>, StructListB<Method__InstanceR, Method__InstanceB>> {
    const ref = this.guts.pointersWord(24);
    return structs(new Method__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptMethods(orphan: Orphan<NonboolListGutsR, StructListR<Method__InstanceR>, StructListB<Method__InstanceR, Method__InstanceB>>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* superclasses */
  getSuperclasses(): null | StructListB<Superclass__InstanceR, Superclass__InstanceB> {
    const ref = this.guts.pointersWord(32);
    return structs(new Superclass__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setSuperclasses(value: StructListR<Superclass__InstanceR> | StructListB<Superclass__InstanceR, Superclass__InstanceB>): void {
    const ref = this.guts.pointersWord(32);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownSuperclasses(): null | Orphan<NonboolListGutsR, StructListR<Superclass__InstanceR>, StructListB<Superclass__InstanceR, Superclass__InstanceB>> {
    const ref = this.guts.pointersWord(32);
    return structs(new Superclass__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptSuperclasses(orphan: Orphan<NonboolListGutsR, StructListR<Superclass__InstanceR>, StructListB<Superclass__InstanceR, Superclass__InstanceB>>): void {
    const ref = this.guts.pointersWord(32);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Node_const__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* type */
  getType(): null | Type__InstanceB {
    const ref = this.guts.pointersWord(24);
    return new Type__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setType(value: Type__InstanceR | Type__InstanceB): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownType(): null | Orphan<StructGutsR, Type__InstanceR, Type__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return new Type__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptType(orphan: Orphan<StructGutsR, Type__InstanceR, Type__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* value */
  getValue(): null | Value__InstanceB {
    const ref = this.guts.pointersWord(32);
    return new Value__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setValue(value: Value__InstanceR | Value__InstanceB): void {
    const ref = this.guts.pointersWord(32);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownValue(): null | Orphan<StructGutsR, Value__InstanceR, Value__InstanceB> {
    const ref = this.guts.pointersWord(32);
    return new Value__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptValue(orphan: Orphan<StructGutsR, Value__InstanceR, Value__InstanceB>): void {
    const ref = this.guts.pointersWord(32);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Node_annotation__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* type */
  getType(): null | Type__InstanceB {
    const ref = this.guts.pointersWord(24);
    return new Type__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setType(value: Type__InstanceR | Type__InstanceB): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownType(): null | Orphan<StructGutsR, Type__InstanceR, Type__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return new Type__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptType(orphan: Orphan<StructGutsR, Type__InstanceR, Type__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* targetsFile */
  getTargetsFile(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 0);
  }
  setTargetsFile(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 0);
  }

  /* targetsConst */
  getTargetsConst(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 1);
  }
  setTargetsConst(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 1);
  }

  /* targetsEnum */
  getTargetsEnum(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 2);
  }
  setTargetsEnum(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 2);
  }

  /* targetsEnumerant */
  getTargetsEnumerant(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 3);
  }
  setTargetsEnumerant(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 3);
  }

  /* targetsStruct */
  getTargetsStruct(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 4);
  }
  setTargetsStruct(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 4);
  }

  /* targetsField */
  getTargetsField(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 5);
  }
  setTargetsField(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 5);
  }

  /* targetsUnion */
  getTargetsUnion(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 6);
  }
  setTargetsUnion(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 6);
  }

  /* targetsGroup */
  getTargetsGroup(): boolean {
    const d = this.guts.layout.dataSection + 14;
    return !!decode.bit(this.guts.segment.raw, d, 7);
  }
  setTargetsGroup(value: boolean): void {
    const d = this.guts.layout.dataSection + 14;
    encode.bit(!!value, this.guts.segment.raw, d, 7);
  }

  /* targetsInterface */
  getTargetsInterface(): boolean {
    const d = this.guts.layout.dataSection + 15;
    return !!decode.bit(this.guts.segment.raw, d, 0);
  }
  setTargetsInterface(value: boolean): void {
    const d = this.guts.layout.dataSection + 15;
    encode.bit(!!value, this.guts.segment.raw, d, 0);
  }

  /* targetsMethod */
  getTargetsMethod(): boolean {
    const d = this.guts.layout.dataSection + 15;
    return !!decode.bit(this.guts.segment.raw, d, 1);
  }
  setTargetsMethod(value: boolean): void {
    const d = this.guts.layout.dataSection + 15;
    encode.bit(!!value, this.guts.segment.raw, d, 1);
  }

  /* targetsParam */
  getTargetsParam(): boolean {
    const d = this.guts.layout.dataSection + 15;
    return !!decode.bit(this.guts.segment.raw, d, 2);
  }
  setTargetsParam(value: boolean): void {
    const d = this.guts.layout.dataSection + 15;
    encode.bit(!!value, this.guts.segment.raw, d, 2);
  }

  /* targetsAnnotation */
  getTargetsAnnotation(): boolean {
    const d = this.guts.layout.dataSection + 15;
    return !!decode.bit(this.guts.segment.raw, d, 3);
  }
  setTargetsAnnotation(value: boolean): void {
    const d = this.guts.layout.dataSection + 15;
    encode.bit(!!value, this.guts.segment.raw, d, 3);
  }
}

/*********/
/* Field */
/*********/

const Field__Tags = {
  slot: 0,
  group: 1,
};

const Field__Groups = {
  slot: {},
  group: {},
  ordinal: {
    tags: {
      implicit: 0,
      explicit: 1,
    },
  },
};

export class Field__CtorB {
  +tags: {
    +slot: 0,
    +group: 1,
  };
  +groups: {
    +slot: {},
    +group: {},
    +ordinal: {
      +tags: {
        +implicit: 0,
        +explicit: 1,
      },
    },
  };

  constructor() {
    this.tags = Field__Tags;
    this.groups = Field__Groups;
  }

  intern(guts: StructGutsB): Field__InstanceB {
    return new Field__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Field__InstanceB {
    return new Field__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Field__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Field__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Field__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Field__InstanceR, Field__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 24, pointers: 32 };
  }
}

export class Field__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Field__InstanceR>): Field__InstanceR {
    return Ctor.intern(this.guts);
  }

  tag(): u16 {
    return this.guts.getTag(8);
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setName(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownName(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptName(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* codeOrder */
  getCodeOrder(): u16 {
    const d = this.guts.layout.dataSection + 0;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setCodeOrder(value: u16): void {
    const d = this.guts.layout.dataSection + 0;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* annotations */
  getAnnotations(): null | StructListB<Annotation__InstanceR, Annotation__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return structs(new Annotation__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setAnnotations(value: StructListR<Annotation__InstanceR> | StructListB<Annotation__InstanceR, Annotation__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownAnnotations(): null | Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>> {
    const ref = this.guts.pointersWord(8);
    return structs(new Annotation__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptAnnotations(orphan: Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* discriminantValue */
  getDiscriminantValue(): u16 {
    const d = this.guts.layout.dataSection + 2;
    return (65535 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setDiscriminantValue(value: u16): void {
    const d = this.guts.layout.dataSection + 2;
    encode.uint16(65535 ^ value, this.guts.segment.raw, d);
  }

  /* slot */
  getSlot(): Field_slot__InstanceB {
    this.guts.checkTag(0, 8);
    return new Field_slot__InstanceB(this.guts);
  }
  initSlot(): void {
    this.guts.initTag(0, 8, {
      partialDataBytes: [ [16, 254] ],
      dataBytes: [ [16, 8], [4, 4] ],
      pointersBytes: [ [16, 16] ],
    });
    return new Field_slot__InstanceB(this.guts);
  }

  /* group */
  getGroup(): Field_group__InstanceB {
    this.guts.checkTag(1, 8);
    return new Field_group__InstanceB(this.guts);
  }
  initGroup(): void {
    this.guts.initTag(1, 8, {
      partialDataBytes: [ [16, 254] ],
      dataBytes: [ [16, 8], [4, 4] ],
      pointersBytes: [ [16, 16] ],
    });
    return new Field_group__InstanceB(this.guts);
  }

  /* ordinal */
  getOrdinal(): Field_ordinal__InstanceB {
    return new Field_ordinal__InstanceB(this.guts);
  }
}

export class Field_slot__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* offset */
  getOffset(): u32 {
    const d = this.guts.layout.dataSection + 4;
    return (0 ^ decode.uint32(this.guts.segment.raw, d)) >>> 0;
  }
  setOffset(value: u32): void {
    const d = this.guts.layout.dataSection + 4;
    encode.uint32(0 ^ value, this.guts.segment.raw, d);
  }

  /* type */
  getType(): null | Type__InstanceB {
    const ref = this.guts.pointersWord(16);
    return new Type__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setType(value: Type__InstanceR | Type__InstanceB): void {
    const ref = this.guts.pointersWord(16);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownType(): null | Orphan<StructGutsR, Type__InstanceR, Type__InstanceB> {
    const ref = this.guts.pointersWord(16);
    return new Type__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptType(orphan: Orphan<StructGutsR, Type__InstanceR, Type__InstanceB>): void {
    const ref = this.guts.pointersWord(16);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* defaultValue */
  getDefaultValue(): null | Value__InstanceB {
    const ref = this.guts.pointersWord(24);
    return new Value__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setDefaultValue(value: Value__InstanceR | Value__InstanceB): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownDefaultValue(): null | Orphan<StructGutsR, Value__InstanceR, Value__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return new Value__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptDefaultValue(orphan: Orphan<StructGutsR, Value__InstanceR, Value__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* hadExplicitDefault */
  getHadExplicitDefault(): boolean {
    const d = this.guts.layout.dataSection + 16;
    return !!decode.bit(this.guts.segment.raw, d, 0);
  }
  setHadExplicitDefault(value: boolean): void {
    const d = this.guts.layout.dataSection + 16;
    encode.bit(!!value, this.guts.segment.raw, d, 0);
  }
}

export class Field_group__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    const d = this.guts.layout.dataSection + 16;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setTypeId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 16;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }
}

export class Field_ordinal__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(10);
  }

  /* implicit */
  getImplicit(): void {
    this.guts.checkTag(0, 10);
  }
  setImplicit(): void {
    this.guts.setTag(0, 10, {
      partialDataBytes: [  ],
      dataBytes: [ [12, 2] ],
      pointersBytes: [  ],
    });
  }

  /* explicit */
  getExplicit(): u16 {
    this.guts.checkTag(1, 10);
    const d = this.guts.layout.dataSection + 12;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setExplicit(value: u16): void {
    this.guts.setTag(1, 10, {
      partialDataBytes: [  ],
      dataBytes: [ [12, 2] ],
      pointersBytes: [  ],
    });
    const d = this.guts.layout.dataSection + 12;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }
}

/*************/
/* Enumerant */
/*************/

export class Enumerant__CtorB {
  intern(guts: StructGutsB): Enumerant__InstanceB {
    return new Enumerant__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Enumerant__InstanceB {
    return new Enumerant__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Enumerant__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Enumerant__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Enumerant__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Enumerant__InstanceR, Enumerant__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 16 };
  }
}

export class Enumerant__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Enumerant__InstanceR>): Enumerant__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setName(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownName(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptName(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* codeOrder */
  getCodeOrder(): u16 {
    const d = this.guts.layout.dataSection + 0;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setCodeOrder(value: u16): void {
    const d = this.guts.layout.dataSection + 0;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* annotations */
  getAnnotations(): null | StructListB<Annotation__InstanceR, Annotation__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return structs(new Annotation__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setAnnotations(value: StructListR<Annotation__InstanceR> | StructListB<Annotation__InstanceR, Annotation__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownAnnotations(): null | Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>> {
    const ref = this.guts.pointersWord(8);
    return structs(new Annotation__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptAnnotations(orphan: Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/**************/
/* Superclass */
/**************/

export class Superclass__CtorB {
  intern(guts: StructGutsB): Superclass__InstanceB {
    return new Superclass__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Superclass__InstanceB {
    return new Superclass__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Superclass__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Superclass__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Superclass__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Superclass__InstanceR, Superclass__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 8 };
  }
}

export class Superclass__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Superclass__InstanceR>): Superclass__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* id */
  getId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* brand */
  getBrand(): null | Brand__InstanceB {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setBrand(value: Brand__InstanceR | Brand__InstanceB): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownBrand(): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptBrand(orphan: Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/**********/
/* Method */
/**********/

export class Method__CtorB {
  intern(guts: StructGutsB): Method__InstanceB {
    return new Method__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Method__InstanceB {
    return new Method__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Method__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Method__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Method__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Method__InstanceR, Method__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 24, pointers: 40 };
  }
}

export class Method__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Method__InstanceR>): Method__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setName(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownName(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptName(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* codeOrder */
  getCodeOrder(): u16 {
    const d = this.guts.layout.dataSection + 0;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setCodeOrder(value: u16): void {
    const d = this.guts.layout.dataSection + 0;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* paramStructType */
  getParamStructType(): UInt64 {
    const d = this.guts.layout.dataSection + 8;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setParamStructType(value: UInt64): void {
    const d = this.guts.layout.dataSection + 8;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* resultStructType */
  getResultStructType(): UInt64 {
    const d = this.guts.layout.dataSection + 16;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setResultStructType(value: UInt64): void {
    const d = this.guts.layout.dataSection + 16;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* annotations */
  getAnnotations(): null | StructListB<Annotation__InstanceR, Annotation__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return structs(new Annotation__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setAnnotations(value: StructListR<Annotation__InstanceR> | StructListB<Annotation__InstanceR, Annotation__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownAnnotations(): null | Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>> {
    const ref = this.guts.pointersWord(8);
    return structs(new Annotation__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptAnnotations(orphan: Orphan<NonboolListGutsR, StructListR<Annotation__InstanceR>, StructListB<Annotation__InstanceR, Annotation__InstanceB>>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* paramBrand */
  getParamBrand(): null | Brand__InstanceB {
    const ref = this.guts.pointersWord(16);
    return new Brand__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setParamBrand(value: Brand__InstanceR | Brand__InstanceB): void {
    const ref = this.guts.pointersWord(16);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownParamBrand(): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    const ref = this.guts.pointersWord(16);
    return new Brand__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptParamBrand(orphan: Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB>): void {
    const ref = this.guts.pointersWord(16);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* resultBrand */
  getResultBrand(): null | Brand__InstanceB {
    const ref = this.guts.pointersWord(24);
    return new Brand__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setResultBrand(value: Brand__InstanceR | Brand__InstanceB): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownResultBrand(): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return new Brand__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptResultBrand(orphan: Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* implicitParameters */
  getImplicitParameters(): null | StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB> {
    const ref = this.guts.pointersWord(32);
    return structs(new Node_Parameter__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setImplicitParameters(value: StructListR<Node_Parameter__InstanceR> | StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB>): void {
    const ref = this.guts.pointersWord(32);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownImplicitParameters(): null | Orphan<NonboolListGutsR, StructListR<Node_Parameter__InstanceR>, StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB>> {
    const ref = this.guts.pointersWord(32);
    return structs(new Node_Parameter__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptImplicitParameters(orphan: Orphan<NonboolListGutsR, StructListR<Node_Parameter__InstanceR>, StructListB<Node_Parameter__InstanceR, Node_Parameter__InstanceB>>): void {
    const ref = this.guts.pointersWord(32);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/********/
/* Type */
/********/

const Type__Tags = {
  void: 0,
  bool: 1,
  int8: 2,
  int16: 3,
  int32: 4,
  int64: 5,
  uint8: 6,
  uint16: 7,
  uint32: 8,
  uint64: 9,
  float32: 10,
  float64: 11,
  text: 12,
  data: 13,
  list: 14,
  enum: 15,
  struct: 16,
  interface: 17,
  anyPointer: 18,
};

const Type__Groups = {
  list: {},
  enum: {},
  struct: {},
  interface: {},
  anyPointer: {
    tags: {
      unconstrained: 0,
      parameter: 1,
      implicitMethodParameter: 2,
    },
    groups: {
      unconstrained: {
        tags: {
          anyKind: 0,
          struct: 1,
          list: 2,
          capability: 3,
        },
      },
      parameter: {},
      implicitMethodParameter: {},
    },
  },
};

export class Type__CtorB {
  +tags: {
    +void: 0,
    +bool: 1,
    +int8: 2,
    +int16: 3,
    +int32: 4,
    +int64: 5,
    +uint8: 6,
    +uint16: 7,
    +uint32: 8,
    +uint64: 9,
    +float32: 10,
    +float64: 11,
    +text: 12,
    +data: 13,
    +list: 14,
    +enum: 15,
    +struct: 16,
    +interface: 17,
    +anyPointer: 18,
  };
  +groups: {
    +list: {},
    +enum: {},
    +struct: {},
    +interface: {},
    +anyPointer: {
      +tags: {
        +unconstrained: 0,
        +parameter: 1,
        +implicitMethodParameter: 2,
      },
      +groups: {
        +unconstrained: {
          +tags: {
            +anyKind: 0,
            +struct: 1,
            +list: 2,
            +capability: 3,
          },
        },
        +parameter: {},
        +implicitMethodParameter: {},
      },
    },
  };

  constructor() {
    this.tags = Type__Tags;
    this.groups = Type__Groups;
  }

  intern(guts: StructGutsB): Type__InstanceB {
    return new Type__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Type__InstanceB {
    return new Type__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Type__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Type__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Type__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Type__InstanceR, Type__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 24, pointers: 8 };
  }
}

export class Type__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Type__InstanceR>): Type__InstanceR {
    return Ctor.intern(this.guts);
  }

  tag(): u16 {
    return this.guts.getTag(0);
  }

  /* void */
  getVoid(): void {
    this.guts.checkTag(0, 0);
  }
  setVoid(): void {
    this.guts.setTag(0, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* bool */
  getBool(): void {
    this.guts.checkTag(1, 0);
  }
  setBool(): void {
    this.guts.setTag(1, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* int8 */
  getInt8(): void {
    this.guts.checkTag(2, 0);
  }
  setInt8(): void {
    this.guts.setTag(2, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* int16 */
  getInt16(): void {
    this.guts.checkTag(3, 0);
  }
  setInt16(): void {
    this.guts.setTag(3, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* int32 */
  getInt32(): void {
    this.guts.checkTag(4, 0);
  }
  setInt32(): void {
    this.guts.setTag(4, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* int64 */
  getInt64(): void {
    this.guts.checkTag(5, 0);
  }
  setInt64(): void {
    this.guts.setTag(5, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* uint8 */
  getUint8(): void {
    this.guts.checkTag(6, 0);
  }
  setUint8(): void {
    this.guts.setTag(6, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* uint16 */
  getUint16(): void {
    this.guts.checkTag(7, 0);
  }
  setUint16(): void {
    this.guts.setTag(7, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* uint32 */
  getUint32(): void {
    this.guts.checkTag(8, 0);
  }
  setUint32(): void {
    this.guts.setTag(8, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* uint64 */
  getUint64(): void {
    this.guts.checkTag(9, 0);
  }
  setUint64(): void {
    this.guts.setTag(9, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* float32 */
  getFloat32(): void {
    this.guts.checkTag(10, 0);
  }
  setFloat32(): void {
    this.guts.setTag(10, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* float64 */
  getFloat64(): void {
    this.guts.checkTag(11, 0);
  }
  setFloat64(): void {
    this.guts.setTag(11, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* text */
  getText(): void {
    this.guts.checkTag(12, 0);
  }
  setText(): void {
    this.guts.setTag(12, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* data */
  getData(): void {
    this.guts.checkTag(13, 0);
  }
  setData(): void {
    this.guts.setTag(13, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* list */
  getList(): Type_list__InstanceB {
    this.guts.checkTag(14, 0);
    return new Type_list__InstanceB(this.guts);
  }
  initList(): void {
    this.guts.initTag(14, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
    return new Type_list__InstanceB(this.guts);
  }

  /* enum */
  getEnum(): Type_enum__InstanceB {
    this.guts.checkTag(15, 0);
    return new Type_enum__InstanceB(this.guts);
  }
  initEnum(): void {
    this.guts.initTag(15, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
    return new Type_enum__InstanceB(this.guts);
  }

  /* struct */
  getStruct(): Type_struct__InstanceB {
    this.guts.checkTag(16, 0);
    return new Type_struct__InstanceB(this.guts);
  }
  initStruct(): void {
    this.guts.initTag(16, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
    return new Type_struct__InstanceB(this.guts);
  }

  /* interface */
  getInterface(): Type_interface__InstanceB {
    this.guts.checkTag(17, 0);
    return new Type_interface__InstanceB(this.guts);
  }
  initInterface(): void {
    this.guts.initTag(17, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
    return new Type_interface__InstanceB(this.guts);
  }

  /* anyPointer */
  getAnyPointer(): Type_anyPointer__InstanceB {
    this.guts.checkTag(18, 0);
    return new Type_anyPointer__InstanceB(this.guts);
  }
  initAnyPointer(): void {
    this.guts.initTag(18, 0, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 14], [8, 2] ],
      pointersBytes: [ [0, 8] ],
    });
    return new Type_anyPointer__InstanceB(this.guts);
  }
}

export class Type_list__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* elementType */
  getElementType(): null | Type__InstanceB {
    const ref = this.guts.pointersWord(0);
    return new Type__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setElementType(value: Type__InstanceR | Type__InstanceB): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownElementType(): null | Orphan<StructGutsR, Type__InstanceR, Type__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return new Type__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptElementType(orphan: Orphan<StructGutsR, Type__InstanceR, Type__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Type_enum__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    const d = this.guts.layout.dataSection + 8;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setTypeId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 8;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* brand */
  getBrand(): null | Brand__InstanceB {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setBrand(value: Brand__InstanceR | Brand__InstanceB): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownBrand(): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptBrand(orphan: Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Type_struct__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    const d = this.guts.layout.dataSection + 8;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setTypeId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 8;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* brand */
  getBrand(): null | Brand__InstanceB {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setBrand(value: Brand__InstanceR | Brand__InstanceB): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownBrand(): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptBrand(orphan: Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Type_interface__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    const d = this.guts.layout.dataSection + 8;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setTypeId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 8;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* brand */
  getBrand(): null | Brand__InstanceB {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setBrand(value: Brand__InstanceR | Brand__InstanceB): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownBrand(): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return new Brand__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptBrand(orphan: Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export class Type_anyPointer__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(8);
  }

  /* unconstrained */
  getUnconstrained(): Type_anyPointer_unconstrained__InstanceB {
    this.guts.checkTag(0, 8);
    return new Type_anyPointer_unconstrained__InstanceB(this.guts);
  }
  initUnconstrained(): void {
    this.guts.initTag(0, 8, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 2], [16, 8] ],
      pointersBytes: [  ],
    });
    return new Type_anyPointer_unconstrained__InstanceB(this.guts);
  }

  /* parameter */
  getParameter(): Type_anyPointer_parameter__InstanceB {
    this.guts.checkTag(1, 8);
    return new Type_anyPointer_parameter__InstanceB(this.guts);
  }
  initParameter(): void {
    this.guts.initTag(1, 8, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 2], [16, 8] ],
      pointersBytes: [  ],
    });
    return new Type_anyPointer_parameter__InstanceB(this.guts);
  }

  /* implicitMethodParameter */
  getImplicitMethodParameter(): Type_anyPointer_implicitMethodParameter__InstanceB {
    this.guts.checkTag(2, 8);
    return new Type_anyPointer_implicitMethodParameter__InstanceB(this.guts);
  }
  initImplicitMethodParameter(): void {
    this.guts.initTag(2, 8, {
      partialDataBytes: [  ],
      dataBytes: [ [10, 2], [16, 8] ],
      pointersBytes: [  ],
    });
    return new Type_anyPointer_implicitMethodParameter__InstanceB(this.guts);
  }
}

export class Type_anyPointer_unconstrained__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(10);
  }

  /* anyKind */
  getAnyKind(): void {
    this.guts.checkTag(0, 10);
  }
  setAnyKind(): void {
    this.guts.setTag(0, 10, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [  ],
    });
  }

  /* struct */
  getStruct(): void {
    this.guts.checkTag(1, 10);
  }
  setStruct(): void {
    this.guts.setTag(1, 10, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [  ],
    });
  }

  /* list */
  getList(): void {
    this.guts.checkTag(2, 10);
  }
  setList(): void {
    this.guts.setTag(2, 10, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [  ],
    });
  }

  /* capability */
  getCapability(): void {
    this.guts.checkTag(3, 10);
  }
  setCapability(): void {
    this.guts.setTag(3, 10, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [  ],
    });
  }
}

export class Type_anyPointer_parameter__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* scopeId */
  getScopeId(): UInt64 {
    const d = this.guts.layout.dataSection + 16;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setScopeId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 16;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* parameterIndex */
  getParameterIndex(): u16 {
    const d = this.guts.layout.dataSection + 10;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setParameterIndex(value: u16): void {
    const d = this.guts.layout.dataSection + 10;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }
}

export class Type_anyPointer_implicitMethodParameter__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  /* parameterIndex */
  getParameterIndex(): u16 {
    const d = this.guts.layout.dataSection + 10;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setParameterIndex(value: u16): void {
    const d = this.guts.layout.dataSection + 10;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }
}

/*********/
/* Brand */
/*********/

export class Brand__CtorB {
  +Scope: Brand_Scope__CtorB;
  +Binding: Brand_Binding__CtorB;

  constructor() {
    this.Scope = new Brand_Scope__CtorB();
    this.Binding = new Brand_Binding__CtorB();
  }

  intern(guts: StructGutsB): Brand__InstanceB {
    return new Brand__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Brand__InstanceB {
    return new Brand__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Brand__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Brand__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Brand__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 0, pointers: 8 };
  }
}

export class Brand__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Brand__InstanceR>): Brand__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* scopes */
  getScopes(): null | StructListB<Brand_Scope__InstanceR, Brand_Scope__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return structs(new Brand_Scope__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setScopes(value: StructListR<Brand_Scope__InstanceR> | StructListB<Brand_Scope__InstanceR, Brand_Scope__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownScopes(): null | Orphan<NonboolListGutsR, StructListR<Brand_Scope__InstanceR>, StructListB<Brand_Scope__InstanceR, Brand_Scope__InstanceB>> {
    const ref = this.guts.pointersWord(0);
    return structs(new Brand_Scope__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptScopes(orphan: Orphan<NonboolListGutsR, StructListR<Brand_Scope__InstanceR>, StructListB<Brand_Scope__InstanceR, Brand_Scope__InstanceB>>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/***************/
/* Brand.Scope */
/***************/

const Brand_Scope__Tags = {
  bind: 0,
  inherit: 1,
};

export class Brand_Scope__CtorB {
  +tags: {
    +bind: 0,
    +inherit: 1,
  };

  constructor() {
    this.tags = Brand_Scope__Tags;
  }

  intern(guts: StructGutsB): Brand_Scope__InstanceB {
    return new Brand_Scope__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Brand_Scope__InstanceB {
    return new Brand_Scope__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Brand_Scope__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Brand_Scope__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Brand_Scope__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Brand_Scope__InstanceR, Brand_Scope__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 16, pointers: 8 };
  }
}

export class Brand_Scope__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Brand_Scope__InstanceR>): Brand_Scope__InstanceR {
    return Ctor.intern(this.guts);
  }

  tag(): u16 {
    return this.guts.getTag(8);
  }

  /* scopeId */
  getScopeId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setScopeId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* bind */
  getBind(): null | StructListB<Brand_Binding__InstanceR, Brand_Binding__InstanceB> {
    this.guts.checkTag(0, 8);
    const ref = this.guts.pointersWord(0);
    return structs(new Brand_Binding__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setBind(value: StructListR<Brand_Binding__InstanceR> | StructListB<Brand_Binding__InstanceR, Brand_Binding__InstanceB>): void {
    this.guts.setTag(0, 8, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownBind(): null | Orphan<NonboolListGutsR, StructListR<Brand_Binding__InstanceR>, StructListB<Brand_Binding__InstanceR, Brand_Binding__InstanceB>> {
    this.guts.checkTag(0, 8);
    const ref = this.guts.pointersWord(0);
    return structs(new Brand_Binding__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptBind(orphan: Orphan<NonboolListGutsR, StructListR<Brand_Binding__InstanceR>, StructListB<Brand_Binding__InstanceR, Brand_Binding__InstanceB>>): void {
    this.guts.setTag(0, 8, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* inherit */
  getInherit(): void {
    this.guts.checkTag(1, 8);
  }
  setInherit(): void {
    this.guts.setTag(1, 8, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [ [0, 8] ],
    });
  }
}

/*****************/
/* Brand.Binding */
/*****************/

const Brand_Binding__Tags = {
  unbound: 0,
  type: 1,
};

export class Brand_Binding__CtorB {
  +tags: {
    +unbound: 0,
    +type: 1,
  };

  constructor() {
    this.tags = Brand_Binding__Tags;
  }

  intern(guts: StructGutsB): Brand_Binding__InstanceB {
    return new Brand_Binding__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Brand_Binding__InstanceB {
    return new Brand_Binding__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Brand_Binding__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Brand_Binding__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Brand_Binding__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Brand_Binding__InstanceR, Brand_Binding__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 8 };
  }
}

export class Brand_Binding__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Brand_Binding__InstanceR>): Brand_Binding__InstanceR {
    return Ctor.intern(this.guts);
  }

  tag(): u16 {
    return this.guts.getTag(0);
  }

  /* unbound */
  getUnbound(): void {
    this.guts.checkTag(0, 0);
  }
  setUnbound(): void {
    this.guts.setTag(0, 0, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* type */
  getType(): null | Type__InstanceB {
    this.guts.checkTag(1, 0);
    const ref = this.guts.pointersWord(0);
    return new Type__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setType(value: Type__InstanceR | Type__InstanceB): void {
    this.guts.setTag(1, 0, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownType(): null | Orphan<StructGutsR, Type__InstanceR, Type__InstanceB> {
    this.guts.checkTag(1, 0);
    const ref = this.guts.pointersWord(0);
    return new Type__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptType(orphan: Orphan<StructGutsR, Type__InstanceR, Type__InstanceB>): void {
    this.guts.setTag(1, 0, {
      partialDataBytes: [  ],
      dataBytes: [  ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/*********/
/* Value */
/*********/

const Value__Tags = {
  void: 0,
  bool: 1,
  int8: 2,
  int16: 3,
  int32: 4,
  int64: 5,
  uint8: 6,
  uint16: 7,
  uint32: 8,
  uint64: 9,
  float32: 10,
  float64: 11,
  text: 12,
  data: 13,
  list: 14,
  enum: 15,
  struct: 16,
  interface: 17,
  anyPointer: 18,
};

export class Value__CtorB {
  +tags: {
    +void: 0,
    +bool: 1,
    +int8: 2,
    +int16: 3,
    +int32: 4,
    +int64: 5,
    +uint8: 6,
    +uint16: 7,
    +uint32: 8,
    +uint64: 9,
    +float32: 10,
    +float64: 11,
    +text: 12,
    +data: 13,
    +list: 14,
    +enum: 15,
    +struct: 16,
    +interface: 17,
    +anyPointer: 18,
  };

  constructor() {
    this.tags = Value__Tags;
  }

  intern(guts: StructGutsB): Value__InstanceB {
    return new Value__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Value__InstanceB {
    return new Value__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Value__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Value__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Value__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Value__InstanceR, Value__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 16, pointers: 8 };
  }
}

export class Value__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Value__InstanceR>): Value__InstanceR {
    return Ctor.intern(this.guts);
  }

  tag(): u16 {
    return this.guts.getTag(0);
  }

  /* void */
  getVoid(): void {
    this.guts.checkTag(0, 0);
  }
  setVoid(): void {
    this.guts.setTag(0, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* bool */
  getBool(): boolean {
    this.guts.checkTag(1, 0);
    const d = this.guts.layout.dataSection + 2;
    return !!decode.bit(this.guts.segment.raw, d, 0);
  }
  setBool(value: boolean): void {
    this.guts.setTag(1, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 2;
    encode.bit(!!value, this.guts.segment.raw, d, 0);
  }

  /* int8 */
  getInt8(): i8 {
    this.guts.checkTag(2, 0);
    const d = this.guts.layout.dataSection + 2;
    return 0 ^ decode.int8(this.guts.segment.raw, d);
  }
  setInt8(value: i8): void {
    this.guts.setTag(2, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 2;
    encode.int8(0 ^ value, this.guts.segment.raw, d);
  }

  /* int16 */
  getInt16(): i16 {
    this.guts.checkTag(3, 0);
    const d = this.guts.layout.dataSection + 2;
    return 0 ^ decode.int16(this.guts.segment.raw, d);
  }
  setInt16(value: i16): void {
    this.guts.setTag(3, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 2;
    encode.int16(0 ^ value, this.guts.segment.raw, d);
  }

  /* int32 */
  getInt32(): i32 {
    this.guts.checkTag(4, 0);
    const d = this.guts.layout.dataSection + 4;
    return 0 ^ decode.int32(this.guts.segment.raw, d);
  }
  setInt32(value: i32): void {
    this.guts.checkTag(4, 0);
    const d = this.guts.layout.dataSection + 4;
    encode.int32(0 ^ value, this.guts.segment.raw, d);
  }

  /* int64 */
  getInt64(): Int64 {
    this.guts.checkTag(5, 0);
    const d = this.guts.layout.dataSection + 8;
    return injectI64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setInt64(value: Int64): void {
    this.guts.setTag(5, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 8;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* uint8 */
  getUint8(): u8 {
    this.guts.checkTag(6, 0);
    const d = this.guts.layout.dataSection + 2;
    return (0 ^ decode.uint8(this.guts.segment.raw, d)) >>> 0;
  }
  setUint8(value: u8): void {
    this.guts.setTag(6, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 2;
    encode.uint8(0 ^ value, this.guts.segment.raw, d);
  }

  /* uint16 */
  getUint16(): u16 {
    this.guts.checkTag(7, 0);
    const d = this.guts.layout.dataSection + 2;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setUint16(value: u16): void {
    this.guts.setTag(7, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 2;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* uint32 */
  getUint32(): u32 {
    this.guts.checkTag(8, 0);
    const d = this.guts.layout.dataSection + 4;
    return (0 ^ decode.uint32(this.guts.segment.raw, d)) >>> 0;
  }
  setUint32(value: u32): void {
    this.guts.setTag(8, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 4;
    encode.uint32(0 ^ value, this.guts.segment.raw, d);
  }

  /* uint64 */
  getUint64(): UInt64 {
    this.guts.checkTag(9, 0);
    const d = this.guts.layout.dataSection + 8;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setUint64(value: UInt64): void {
    this.guts.setTag(9, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 8;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* float32 */
  getFloat32(): f32 {
    this.guts.checkTag(10, 0);
    const d = this.guts.layout.dataSection + 4;
    const bytes = decode.int32(this.guts.segment.raw, d);
    return decode.float32(1 ^ bytes);
  }
  setFloat32(value: f32): void {
    this.guts.setTag(10, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 4;
    const bytes = encode.float32(value);
    encode.int32(1 ^ bytes, this.guts.segment.raw, d);
  }

  /* float64 */
  getFloat64(): f64 {
    this.guts.checkTag(11, 0);
    const d = this.guts.layout.dataSection + 8;
    const bytes = injectI64(
      11 ^ decode.int32(this.guts.segment.raw, d+4),
      65536 ^ decode.int32(this.guts.segment.raw, d),
    );
    return decode.float64(bytes);
  }
  setFloat64(value: f64): void {
    this.guts.setTag(11, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 8;
    const bytes = encode.float64(value);
    encode.int32(11 ^ bytes[0], this.guts.segment.raw, d+4);
    encode.int32(65536 ^ bytes[1], this.guts.segment.raw, d);
  }

  /* text */
  getText(): null | Text {
    this.guts.checkTag(12, 0);
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setText(value: TextR | Text): void {
    this.guts.setTag(12, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownText(): null | Orphan<NonboolListGutsR, TextR, Text> {
    this.guts.checkTag(12, 0);
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptText(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    this.guts.setTag(12, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* data */
  getData(): null | Data {
    this.guts.checkTag(13, 0);
    const ref = this.guts.pointersWord(0);
    return Data.get(this.guts.level, this.guts.arena, ref);
  }
  setData(value: DataR | Data): void {
    this.guts.setTag(13, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownData(): null | Orphan<NonboolListGutsR, DataR, Data> {
    this.guts.checkTag(13, 0);
    const ref = this.guts.pointersWord(0);
    return Data.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptData(orphan: Orphan<NonboolListGutsR, DataR, Data>): void {
    this.guts.setTag(13, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* list */
  getList(): null | AnyValue {
    this.guts.checkTag(14, 0);
    const ref = this.guts.pointersWord(0);
    return AnyValue.get(this.guts.level, this.guts.arena, ref);
  }
  setList(value: AnyValueR | AnyValue): void {
    this.guts.setTag(14, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownList(): null | Orphan<AnyGutsR, AnyValueR, AnyValue> {
    this.guts.checkTag(14, 0);
    const ref = this.guts.pointersWord(0);
    return AnyValue.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptList(orphan: Orphan<AnyGutsR, AnyValueR, AnyValue>): void {
    this.guts.setTag(14, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* enum */
  getEnum(): u16 {
    this.guts.checkTag(15, 0);
    const d = this.guts.layout.dataSection + 2;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setEnum(value: u16): void {
    this.guts.setTag(15, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const d = this.guts.layout.dataSection + 2;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* struct */
  getStruct(): null | AnyValue {
    this.guts.checkTag(16, 0);
    const ref = this.guts.pointersWord(0);
    return AnyValue.get(this.guts.level, this.guts.arena, ref);
  }
  setStruct(value: AnyValueR | AnyValue): void {
    this.guts.setTag(16, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownStruct(): null | Orphan<AnyGutsR, AnyValueR, AnyValue> {
    this.guts.checkTag(16, 0);
    const ref = this.guts.pointersWord(0);
    return AnyValue.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptStruct(orphan: Orphan<AnyGutsR, AnyValueR, AnyValue>): void {
    this.guts.setTag(16, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* interface */
  getInterface(): void {
    this.guts.checkTag(17, 0);
  }
  setInterface(): void {
    this.guts.setTag(17, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
  }

  /* anyPointer */
  getAnyPointer(): null | AnyValue {
    this.guts.checkTag(18, 0);
    const ref = this.guts.pointersWord(0);
    return AnyValue.get(this.guts.level, this.guts.arena, ref);
  }
  setAnyPointer(value: AnyValueR | AnyValue): void {
    this.guts.setTag(18, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownAnyPointer(): null | Orphan<AnyGutsR, AnyValueR, AnyValue> {
    this.guts.checkTag(18, 0);
    const ref = this.guts.pointersWord(0);
    return AnyValue.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptAnyPointer(orphan: Orphan<AnyGutsR, AnyValueR, AnyValue>): void {
    this.guts.setTag(18, 0, {
      partialDataBytes: [ [2, 254] ],
      dataBytes: [ [10, 6], [2, 8] ],
      pointersBytes: [ [0, 8] ],
    });
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/**************/
/* Annotation */
/**************/

export class Annotation__CtorB {
  intern(guts: StructGutsB): Annotation__InstanceB {
    return new Annotation__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): Annotation__InstanceB {
    return new Annotation__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): Annotation__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Annotation__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Annotation__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, Annotation__InstanceR, Annotation__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 16 };
  }
}

export class Annotation__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, Annotation__InstanceR>): Annotation__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* id */
  getId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* value */
  getValue(): null | Value__InstanceB {
    const ref = this.guts.pointersWord(0);
    return new Value__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setValue(value: Value__InstanceR | Value__InstanceB): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownValue(): null | Orphan<StructGutsR, Value__InstanceR, Value__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return new Value__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptValue(orphan: Orphan<StructGutsR, Value__InstanceR, Value__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* brand */
  getBrand(): null | Brand__InstanceB {
    const ref = this.guts.pointersWord(8);
    return new Brand__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setBrand(value: Brand__InstanceR | Brand__InstanceB): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownBrand(): null | Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return new Brand__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptBrand(orphan: Orphan<StructGutsR, Brand__InstanceR, Brand__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/***************/
/* ElementSize */
/***************/

const ElementSize__Enum: {
  +empty: 0,
  +bit: 1,
  +byte: 2,
  +twoBytes: 3,
  +fourBytes: 4,
  +eightBytes: 5,
  +pointer: 6,
  +inlineComposite: 7,
} = {
  empty: 0,
  bit: 1,
  byte: 2,
  twoBytes: 3,
  fourBytes: 4,
  eightBytes: 5,
  pointer: 6,
  inlineComposite: 7,
};

/****************/
/* CapnpVersion */
/****************/

export class CapnpVersion__CtorB {
  intern(guts: StructGutsB): CapnpVersion__InstanceB {
    return new CapnpVersion__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): CapnpVersion__InstanceB {
    return new CapnpVersion__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): CapnpVersion__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CapnpVersion__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | CapnpVersion__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, CapnpVersion__InstanceR, CapnpVersion__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 0 };
  }
}

export class CapnpVersion__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, CapnpVersion__InstanceR>): CapnpVersion__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* major */
  getMajor(): u16 {
    const d = this.guts.layout.dataSection + 0;
    return (0 ^ decode.uint16(this.guts.segment.raw, d)) >>> 0;
  }
  setMajor(value: u16): void {
    const d = this.guts.layout.dataSection + 0;
    encode.uint16(0 ^ value, this.guts.segment.raw, d);
  }

  /* minor */
  getMinor(): u8 {
    const d = this.guts.layout.dataSection + 2;
    return (0 ^ decode.uint8(this.guts.segment.raw, d)) >>> 0;
  }
  setMinor(value: u8): void {
    const d = this.guts.layout.dataSection + 2;
    encode.uint8(0 ^ value, this.guts.segment.raw, d);
  }

  /* micro */
  getMicro(): u8 {
    const d = this.guts.layout.dataSection + 3;
    return (0 ^ decode.uint8(this.guts.segment.raw, d)) >>> 0;
  }
  setMicro(value: u8): void {
    const d = this.guts.layout.dataSection + 3;
    encode.uint8(0 ^ value, this.guts.segment.raw, d);
  }
}

/************************/
/* CodeGeneratorRequest */
/************************/

export class CodeGeneratorRequest__CtorB {
  +RequestedFile: CodeGeneratorRequest_RequestedFile__CtorB;

  constructor() {
    this.RequestedFile = new CodeGeneratorRequest_RequestedFile__CtorB();
  }

  intern(guts: StructGutsB): CodeGeneratorRequest__InstanceB {
    return new CodeGeneratorRequest__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): CodeGeneratorRequest__InstanceB {
    return new CodeGeneratorRequest__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): CodeGeneratorRequest__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CodeGeneratorRequest__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | CodeGeneratorRequest__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, CodeGeneratorRequest__InstanceR, CodeGeneratorRequest__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 0, pointers: 32 };
  }
}

export class CodeGeneratorRequest__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, CodeGeneratorRequest__InstanceR>): CodeGeneratorRequest__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* nodes */
  getNodes(): null | StructListB<Node__InstanceR, Node__InstanceB> {
    const ref = this.guts.pointersWord(0);
    return structs(new Node__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setNodes(value: StructListR<Node__InstanceR> | StructListB<Node__InstanceR, Node__InstanceB>): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownNodes(): null | Orphan<NonboolListGutsR, StructListR<Node__InstanceR>, StructListB<Node__InstanceR, Node__InstanceB>> {
    const ref = this.guts.pointersWord(0);
    return structs(new Node__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptNodes(orphan: Orphan<NonboolListGutsR, StructListR<Node__InstanceR>, StructListB<Node__InstanceR, Node__InstanceB>>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* requestedFiles */
  getRequestedFiles(): null | StructListB<CodeGeneratorRequest_RequestedFile__InstanceR, CodeGeneratorRequest_RequestedFile__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return structs(new CodeGeneratorRequest_RequestedFile__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setRequestedFiles(value: StructListR<CodeGeneratorRequest_RequestedFile__InstanceR> | StructListB<CodeGeneratorRequest_RequestedFile__InstanceR, CodeGeneratorRequest_RequestedFile__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownRequestedFiles(): null | Orphan<NonboolListGutsR, StructListR<CodeGeneratorRequest_RequestedFile__InstanceR>, StructListB<CodeGeneratorRequest_RequestedFile__InstanceR, CodeGeneratorRequest_RequestedFile__InstanceB>> {
    const ref = this.guts.pointersWord(8);
    return structs(new CodeGeneratorRequest_RequestedFile__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptRequestedFiles(orphan: Orphan<NonboolListGutsR, StructListR<CodeGeneratorRequest_RequestedFile__InstanceR>, StructListB<CodeGeneratorRequest_RequestedFile__InstanceR, CodeGeneratorRequest_RequestedFile__InstanceB>>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* capnpVersion */
  getCapnpVersion(): null | CapnpVersion__InstanceB {
    const ref = this.guts.pointersWord(16);
    return new CapnpVersion__CtorB().get(this.guts.level, this.guts.arena, ref);
  }
  setCapnpVersion(value: CapnpVersion__InstanceR | CapnpVersion__InstanceB): void {
    const ref = this.guts.pointersWord(16);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownCapnpVersion(): null | Orphan<StructGutsR, CapnpVersion__InstanceR, CapnpVersion__InstanceB> {
    const ref = this.guts.pointersWord(16);
    return new CapnpVersion__CtorB().disown(this.guts.level, this.guts.arena, ref);
  }
  adoptCapnpVersion(orphan: Orphan<StructGutsR, CapnpVersion__InstanceR, CapnpVersion__InstanceB>): void {
    const ref = this.guts.pointersWord(16);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* sourceInfo */
  getSourceInfo(): null | StructListB<Node_SourceInfo__InstanceR, Node_SourceInfo__InstanceB> {
    const ref = this.guts.pointersWord(24);
    return structs(new Node_SourceInfo__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setSourceInfo(value: StructListR<Node_SourceInfo__InstanceR> | StructListB<Node_SourceInfo__InstanceR, Node_SourceInfo__InstanceB>): void {
    const ref = this.guts.pointersWord(24);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownSourceInfo(): null | Orphan<NonboolListGutsR, StructListR<Node_SourceInfo__InstanceR>, StructListB<Node_SourceInfo__InstanceR, Node_SourceInfo__InstanceB>> {
    const ref = this.guts.pointersWord(24);
    return structs(new Node_SourceInfo__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptSourceInfo(orphan: Orphan<NonboolListGutsR, StructListR<Node_SourceInfo__InstanceR>, StructListB<Node_SourceInfo__InstanceR, Node_SourceInfo__InstanceB>>): void {
    const ref = this.guts.pointersWord(24);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/**************************************/
/* CodeGeneratorRequest.RequestedFile */
/**************************************/

export class CodeGeneratorRequest_RequestedFile__CtorB {
  +Import: CodeGeneratorRequest_RequestedFile_Import__CtorB;

  constructor() {
    this.Import = new CodeGeneratorRequest_RequestedFile_Import__CtorB();
  }

  intern(guts: StructGutsB): CodeGeneratorRequest_RequestedFile__InstanceB {
    return new CodeGeneratorRequest_RequestedFile__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): CodeGeneratorRequest_RequestedFile__InstanceB {
    return new CodeGeneratorRequest_RequestedFile__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): CodeGeneratorRequest_RequestedFile__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CodeGeneratorRequest_RequestedFile__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | CodeGeneratorRequest_RequestedFile__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, CodeGeneratorRequest_RequestedFile__InstanceR, CodeGeneratorRequest_RequestedFile__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 16 };
  }
}

export class CodeGeneratorRequest_RequestedFile__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, CodeGeneratorRequest_RequestedFile__InstanceR>): CodeGeneratorRequest_RequestedFile__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* id */
  getId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* filename */
  getFilename(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setFilename(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownFilename(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptFilename(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }

  /* imports */
  getImports(): null | StructListB<CodeGeneratorRequest_RequestedFile_Import__InstanceR, CodeGeneratorRequest_RequestedFile_Import__InstanceB> {
    const ref = this.guts.pointersWord(8);
    return structs(new CodeGeneratorRequest_RequestedFile_Import__CtorB()).get(this.guts.level, this.guts.arena, ref);
  }
  setImports(value: StructListR<CodeGeneratorRequest_RequestedFile_Import__InstanceR> | StructListB<CodeGeneratorRequest_RequestedFile_Import__InstanceR, CodeGeneratorRequest_RequestedFile_Import__InstanceB>): void {
    const ref = this.guts.pointersWord(8);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownImports(): null | Orphan<NonboolListGutsR, StructListR<CodeGeneratorRequest_RequestedFile_Import__InstanceR>, StructListB<CodeGeneratorRequest_RequestedFile_Import__InstanceR, CodeGeneratorRequest_RequestedFile_Import__InstanceB>> {
    const ref = this.guts.pointersWord(8);
    return structs(new CodeGeneratorRequest_RequestedFile_Import__CtorB()).disown(this.guts.level, this.guts.arena, ref);
  }
  adoptImports(orphan: Orphan<NonboolListGutsR, StructListR<CodeGeneratorRequest_RequestedFile_Import__InstanceR>, StructListB<CodeGeneratorRequest_RequestedFile_Import__InstanceR, CodeGeneratorRequest_RequestedFile_Import__InstanceB>>): void {
    const ref = this.guts.pointersWord(8);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

/*********************************************/
/* CodeGeneratorRequest.RequestedFile.Import */
/*********************************************/

export class CodeGeneratorRequest_RequestedFile_Import__CtorB {
  intern(guts: StructGutsB): CodeGeneratorRequest_RequestedFile_Import__InstanceB {
    return new CodeGeneratorRequest_RequestedFile_Import__InstanceB(guts);
  }

  fromAny(guts: AnyGutsB): CodeGeneratorRequest_RequestedFile_Import__InstanceB {
    return new CodeGeneratorRequest_RequestedFile_Import__InstanceB(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaB, ref: Word<SegmentB>): CodeGeneratorRequest_RequestedFile_Import__InstanceB {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CodeGeneratorRequest_RequestedFile_Import__InstanceB(guts);
  }

  get(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | CodeGeneratorRequest_RequestedFile_Import__InstanceB {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  disown(level: uint, arena: ArenaB, ref: Word<SegmentB>): null | Orphan<StructGutsR, CodeGeneratorRequest_RequestedFile_Import__InstanceR, CodeGeneratorRequest_RequestedFile_Import__InstanceB> {
    if (isNull(ref)) {
      return null;
    } else {
      const p = arena.pointer(ref);
      arena.zero(ref, 8);
      return new Orphan(this, arena, p);
    }
  }

  validate(p: Pointer<SegmentB>): void {
    RefedStruct.validate(p, this.compiledBytes());
  }

  compiledBytes(): Bytes {
    return { data: 8, pointers: 8 };
  }
}

export class CodeGeneratorRequest_RequestedFile_Import__InstanceB {
  +guts: StructGutsB;

  constructor(guts: StructGutsB) {
    this.guts = guts;
  }

  reader(Ctor: CtorR<StructGutsR, CodeGeneratorRequest_RequestedFile_Import__InstanceR>): CodeGeneratorRequest_RequestedFile_Import__InstanceR {
    return Ctor.intern(this.guts);
  }

  /* id */
  getId(): UInt64 {
    const d = this.guts.layout.dataSection + 0;
    return injectU64(
      0 ^ decode.int32(this.guts.segment.raw, d+4),
      0 ^ decode.int32(this.guts.segment.raw, d),
    );
  }
  setId(value: UInt64): void {
    const d = this.guts.layout.dataSection + 0;
    encode.int32(0 ^ value[0], this.guts.segment.raw, d+4);
    encode.int32(0 ^ value[1], this.guts.segment.raw, d);
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return Text.get(this.guts.level, this.guts.arena, ref);
  }
  setName(value: TextR | Text): void {
    const ref = this.guts.pointersWord(0);
    value.guts.set(this.guts.level, this.guts.arena, ref);
  }
  disownName(): null | Orphan<NonboolListGutsR, TextR, Text> {
    const ref = this.guts.pointersWord(0);
    return Text.disown(this.guts.level, this.guts.arena, ref);
  }
  adoptName(orphan: Orphan<NonboolListGutsR, TextR, Text>): void {
    const ref = this.guts.pointersWord(0);
    orphan.guts.adopt(this.guts.arena, ref);
  }
}

export const Node = new Node__CtorB();
export const Field = new Field__CtorB();
export const Enumerant = new Enumerant__CtorB();
export const Superclass = new Superclass__CtorB();
export const Method = new Method__CtorB();
export const Type = new Type__CtorB();
export const Brand = new Brand__CtorB();
export const Value = new Value__CtorB();
export const Annotation = new Annotation__CtorB();
export const ElementSize = ElementSize__Enum;
export const CapnpVersion = new CapnpVersion__CtorB();
export const CodeGeneratorRequest = new CodeGeneratorRequest__CtorB();
