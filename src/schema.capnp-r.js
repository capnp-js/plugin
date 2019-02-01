/* @flow */

import type { Bytes } from "@capnp-js/layout";
import type { SegmentR, Word } from "@capnp-js/memory";
import type { Int64 } from "@capnp-js/int64";
import type { UInt64 } from "@capnp-js/uint64";
import type {
  ArenaR,
  AnyGutsR,
  StructGutsR,
  StructCtorR,
  StructListR,
} from "@capnp-js/reader-core";

import * as decode from "@capnp-js/read-data";
import { deserializeUnsafe } from "@capnp-js/reader-arena";
import { inject as injectI64 } from "@capnp-js/int64";
import { inject as injectU64 } from "@capnp-js/uint64";
import { isNull } from "@capnp-js/memory";
import {
  RefedStruct,
  Data,
  AnyValue,
  Text,
  structs,
} from "@capnp-js/reader-core";

const blob = deserializeUnsafe("EAEAAA");

type uint = number;
type i8 = number;
type i16 = number;
type i32 = number;
type u8 = number;
type u16 = number;
type u32 = number;
type f32 = number;
type f64 = number;

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

export class Node__CtorR implements StructCtorR<Node__InstanceR> {
  +Parameter: Node_Parameter__CtorR;
  +NestedNode: Node_NestedNode__CtorR;
  +SourceInfo: Node_SourceInfo__CtorR;
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
    this.Parameter = new Node_Parameter__CtorR();
    this.NestedNode = new Node_NestedNode__CtorR();
    this.SourceInfo = new Node_SourceInfo__CtorR();
    this.tags = Node__Tags;
    this.groups = Node__Groups;
  }

  intern(guts: StructGutsR): Node__InstanceR {
    return new Node__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Node__InstanceR {
    return new Node__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Node__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Node__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 40, pointers: 48};
  }

  empty(): Node__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Node__InstanceR(guts);
  }
}

export class Node__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(12);
  }

  /* id */
  getId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* displayName */
  getDisplayName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* displayNamePrefixLength */
  getDisplayNamePrefixLength(): u32 {
    const b = this.guts.layout.dataSection + 8;
    if (b + 4 <= this.guts.layout.pointersSection) {
      return decode.int32(this.guts.segment.raw, b) >>> 0;
    } else {
      return 0>>>0;
    }
  }

  /* scopeId */
  getScopeId(): UInt64 {
    const b = this.guts.layout.dataSection + 16;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* parameters */
  getParameters(): null | StructListR<Node_Parameter__InstanceR> {
    const ref = this.guts.pointersWord(40);
    return ref === null ? null : structs(Node.Parameter).get(this.guts.level, this.guts.arena, ref);
  }

  /* isGeneric */
  getIsGeneric(): boolean {
    const b = this.guts.layout.dataSection + 36;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 0);
    } else {
      return false;
    }
  }

  /* nestedNodes */
  getNestedNodes(): null | StructListR<Node_NestedNode__InstanceR> {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : structs(Node.NestedNode).get(this.guts.level, this.guts.arena, ref);
  }

  /* annotations */
  getAnnotations(): null | StructListR<Annotation__InstanceR> {
    const ref = this.guts.pointersWord(16);
    return ref === null ? null : structs(Annotation).get(this.guts.level, this.guts.arena, ref);
  }

  /* file */
  getFile(): void {
    this.guts.checkTag(0, 12);
  }

  /* struct */
  getStruct(): Node_struct__InstanceR {
    return new Node_struct__InstanceR(this.guts);
  }

  /* enum */
  getEnum(): Node_enum__InstanceR {
    return new Node_enum__InstanceR(this.guts);
  }

  /* interface */
  getInterface(): Node_interface__InstanceR {
    return new Node_interface__InstanceR(this.guts);
  }

  /* const */
  getConst(): Node_const__InstanceR {
    return new Node_const__InstanceR(this.guts);
  }

  /* annotation */
  getAnnotation(): Node_annotation__InstanceR {
    return new Node_annotation__InstanceR(this.guts);
  }
}

export class Node_struct__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* dataWordCount */
  getDataWordCount(): u16 {
    this.guts.checkTag(1, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* pointerCount */
  getPointerCount(): u16 {
    this.guts.checkTag(1, 12);
    const b = this.guts.layout.dataSection + 24;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* preferredListEncoding */
  getPreferredListEncoding(): u16 {
    this.guts.checkTag(1, 12);
    const b = this.guts.layout.dataSection + 26;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* isGroup */
  getIsGroup(): boolean {
    this.guts.checkTag(1, 12);
    const b = this.guts.layout.dataSection + 28;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 0);
    } else {
      return false;
    }
  }

  /* discriminantCount */
  getDiscriminantCount(): u16 {
    this.guts.checkTag(1, 12);
    const b = this.guts.layout.dataSection + 30;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* discriminantOffset */
  getDiscriminantOffset(): u32 {
    this.guts.checkTag(1, 12);
    const b = this.guts.layout.dataSection + 32;
    if (b + 4 <= this.guts.layout.pointersSection) {
      return decode.int32(this.guts.segment.raw, b) >>> 0;
    } else {
      return 0>>>0;
    }
  }

  /* fields */
  getFields(): null | StructListR<Field__InstanceR> {
    this.guts.checkTag(1, 12);
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : structs(Field).get(this.guts.level, this.guts.arena, ref);
  }
}

export class Node_enum__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* enumerants */
  getEnumerants(): null | StructListR<Enumerant__InstanceR> {
    this.guts.checkTag(2, 12);
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : structs(Enumerant).get(this.guts.level, this.guts.arena, ref);
  }
}

export class Node_interface__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* methods */
  getMethods(): null | StructListR<Method__InstanceR> {
    this.guts.checkTag(3, 12);
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : structs(Method).get(this.guts.level, this.guts.arena, ref);
  }

  /* superclasses */
  getSuperclasses(): null | StructListR<Superclass__InstanceR> {
    this.guts.checkTag(3, 12);
    const ref = this.guts.pointersWord(32);
    return ref === null ? null : structs(Superclass).get(this.guts.level, this.guts.arena, ref);
  }
}

export class Node_const__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* type */
  getType(): null | Type__InstanceR {
    this.guts.checkTag(4, 12);
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : Type.get(this.guts.level, this.guts.arena, ref);
  }

  /* value */
  getValue(): null | Value__InstanceR {
    this.guts.checkTag(4, 12);
    const ref = this.guts.pointersWord(32);
    return ref === null ? null : Value.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Node_annotation__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* type */
  getType(): null | Type__InstanceR {
    this.guts.checkTag(5, 12);
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : Type.get(this.guts.level, this.guts.arena, ref);
  }

  /* targetsFile */
  getTargetsFile(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 0);
    } else {
      return false;
    }
  }

  /* targetsConst */
  getTargetsConst(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 1);
    } else {
      return false;
    }
  }

  /* targetsEnum */
  getTargetsEnum(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 2);
    } else {
      return false;
    }
  }

  /* targetsEnumerant */
  getTargetsEnumerant(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 3);
    } else {
      return false;
    }
  }

  /* targetsStruct */
  getTargetsStruct(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 4);
    } else {
      return false;
    }
  }

  /* targetsField */
  getTargetsField(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 5);
    } else {
      return false;
    }
  }

  /* targetsUnion */
  getTargetsUnion(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 6);
    } else {
      return false;
    }
  }

  /* targetsGroup */
  getTargetsGroup(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 14;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 7);
    } else {
      return false;
    }
  }

  /* targetsInterface */
  getTargetsInterface(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 15;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 0);
    } else {
      return false;
    }
  }

  /* targetsMethod */
  getTargetsMethod(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 15;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 1);
    } else {
      return false;
    }
  }

  /* targetsParam */
  getTargetsParam(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 15;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 2);
    } else {
      return false;
    }
  }

  /* targetsAnnotation */
  getTargetsFile(): boolean {
    this.guts.checkTag(5, 12);
    const b = this.guts.layout.dataSection + 15;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 3);
    } else {
      return false;
    }
  }
}

export class Node_Parameter__CtorR implements StructCtorR<Node_Parameter__InstanceR> {
  intern(guts: StructGutsR): Node_Parameter__InstanceR {
    return new Node_Parameter__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Node_Parameter__InstanceR {
    return new Node_Parameter__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Node_Parameter__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_Parameter__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Node_Parameter__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 0, pointers: 8};
  }

  empty(): Node_Parameter__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Node_Parameter__InstanceR(guts);
  }
}

export class Node_Parameter__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Node_NestedNode__CtorR implements StructCtorR<Node_NestedNode__InstanceR> {
  intern(guts: StructGutsR): Node_NestedNode__InstanceR {
    return new Node_NestedNode__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Node_NestedNode__InstanceR {
    return new Node_NestedNode__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Node_NestedNode__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_NestedNode__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Node_NestedNode__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 8};
  }

  empty(): Node_NestedNode__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Node_NestedNode__InstanceR(guts);
  }
}

export class Node_NestedNode__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* id */
  getId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }
}

export class Node_SourceInfo__CtorR implements StructCtorR<Node_SourceInfo__InstanceR> {
  +Member: Node_SourceInfo_Member__CtorR;

  constructor() {
    this.Member = new Node_SourceInfo_Member__CtorR();
  }

  intern(guts: StructGutsR): Node_SourceInfo__InstanceR {
    return new Node_SourceInfo__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Node_SourceInfo__InstanceR {
    return new Node_SourceInfo__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Node_SourceInfo__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_SourceInfo__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Node_SourceInfo__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 16};
  }

  empty(): Node_SourceInfo__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Node_SourceInfo__InstanceR(guts);
  }
}

export class Node_SourceInfo__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* id */
  getId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* docComment */
  getDocComment(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* members */
  getMembers(): null | StructListR<Node_SourceInfo_Member__InstanceR> {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : structs(Node.SourceInfo.Member).get(this.guts.level, this.guts.arena, ref);
  }
}

export class Node_SourceInfo_Member__CtorR implements StructCtorR<Node_SourceInfo_Member__InstanceR> {
  intern(guts: StructGutsR): Node_SourceInfo_Member__InstanceR {
    return new Node_SourceInfo_Member__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Node_SourceInfo_Member__InstanceR {
    return new Node_SourceInfo_Member__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Node_SourceInfo_Member__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Node_SourceInfo_Member__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Node_SourceInfo_Member__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 0, pointers: 8};
  }

  empty(): Node_SourceInfo_Member__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Node_SourceInfo_Member__InstanceR(guts);
  }
}

export class Node_SourceInfo_Member__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* docComment */
  getDocComment(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }
}

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

export class Field__CtorR implements StructCtorR<Field__InstanceR> {
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

  intern(guts: StructGutsR): Field__InstanceR {
    return new Field__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Field__InstanceR {
    return new Field__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Field__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Field__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Field__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 24, pointers: 32};
  }

  empty(): Field__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Field__InstanceR(guts);
  }

  /* noDiscriminant */
  getNoDiscriminant(): u16 {
    return 65535;
  }
}

export class Field__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(8);
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* codeOrder */
  getCodeOrder(): u16 {
    const b = this.guts.layout.dataSection;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* annotations */
  getAnnotations(): null | StructListR<Annotation__InstanceR> {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : structs(Annotation).get(this.guts.level, this.guts.arena, ref);
  }

  /* discriminantValue */
  getDiscriminantValue(): u16 {
    const b = this.guts.layout.dataSection + 2;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return (65535 ^ decode.uint16(this.guts.segment.raw, b)) >>> 0;
    } else {
      return 65535 >>> 0;
    }
  }

  /* slot */
  getSlot(): Field_slot__InstanceR {
    return new Field_slot__InstanceR(this.guts);
  }

  /* group */
  getGroup(): Field_group__InstanceR {
    return new Field_group__InstanceR(this.guts);
  }

  /* ordinal */
  getOrdinal(): Field_ordinal__InstanceR {
    return new Field_ordinal__InstanceR(this.guts);
  }
}

export class Field_slot__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* offset */
  getOffset(): u32 {
    this.guts.checkTag(0, 8);
    const b = this.guts.layout.dataSection + 4;
    if (b + 4 <= this.guts.layout.pointersSection) {
      return decode.int32(this.guts.segment.raw, b) >>> 0;
    } else {
      return 0>>>0;
    }
  }

  /* type */
  getType(): null | Type__InstanceR {
    this.guts.checkTag(0, 8);
    const ref = this.guts.pointersWord(16);
    return ref === null ? null : Type.get(this.guts.level, this.guts.arena, ref);
  }

  /* defaultValue */
  getDefaultValue(): null | Value__InstanceR {
    this.guts.checkTag(0, 8);
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : Value.get(this.guts.level, this.guts.arena, ref);
  }

  /* hadExplicitDefault */
  getHadExplicitDefault(): boolean {
    this.guts.checkTag(0, 8);
    const b = this.guts.layout.dataSection + 16;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 0);
    } else {
      return false;
    }
  }
}

export class Field_group__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    this.guts.checkTag(1, 8);
    const b = this.guts.layout.dataSection + 16;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }
}

export class Field_ordinal__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(10);
  }

  /* implicit */
  getImplicit(): void {
    this.guts.checkTag(0, 10);
  }

  /* explicit */
  getExplicit(): u16 {
    this.guts.checkTag(1, 10);
    const b = this.guts.layout.dataSection + 12;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }
}

export class Enumerant__CtorR implements StructCtorR<Enumerant__InstanceR> {
  intern(guts: StructGutsR): Enumerant__InstanceR {
    return new Enumerant__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Enumerant__InstanceR {
    return new Enumerant__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Enumerant__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Enumerant__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Enumerant__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 16};
  }

  empty(): Enumerant__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Enumerant__InstanceR(guts);
  }
}

export class Enumerant__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* codeOrder */
  getCodeOrder(): u16 {
    const b = this.guts.layout.dataSection;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* annotations */
  getAnnotations(): null | StructListR<Annotation__InstanceR> {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : structs(Annotation).get(this.guts.level, this.guts.arena, ref);
  }
}

export class Superclass__CtorR implements StructCtorR<Superclass__InstanceR> {
  intern(guts: StructGutsR): Superclass__InstanceR {
    return new Superclass__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Superclass__InstanceR {
    return new Superclass__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Superclass__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Superclass__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Superclass__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 8};
  }

  empty(): Superclass__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Superclass__InstanceR(guts);
  }
}

export class Superclass__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* id */
  getId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* brand */
  getBrand(): null | Brand__InstanceR {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Brand.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Method__CtorR implements StructCtorR<Method__InstanceR> {
  intern(guts: StructGutsR): Method__InstanceR {
    return new Method__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Method__InstanceR {
    return new Method__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Method__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Method__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Method__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 24, pointers: 40};
  }

  empty(): Method__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Method__InstanceR(guts);
  }
}

export class Method__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* codeOrder */
  getCodeOrder(): u16 {
    const b = this.guts.layout.dataSection;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* implicitParameters */
  getImplicitParameters(): null | StructListR<Node_Parameter__InstanceR> {
    const ref = this.guts.pointersWord(32);
    return ref === null ? null : structs(Node.Parameter).get(this.guts.level, this.guts.arena, ref);
  }

  /* paramStructType */
  getParamStructType(): UInt64 {
    const b = this.guts.layout.dataSection + 8;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* paramBrand */
  getParamBrand(): null | Brand__InstanceR {
    const ref = this.guts.pointersWord(16);
    return ref === null ? null : Brand.get(this.guts.level, this.guts.arena, ref);
  }

  /* resultStructType */
  getResultStructType(): UInt64 {
    const b = this.guts.layout.dataSection + 16;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* resultBrand */
  getResultBrand(): null | Brand__InstanceR {
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : Brand.get(this.guts.level, this.guts.arena, ref);
  }

  /* annotations */
  getAnnotations(): null | StructListR<Annotation__InstanceR> {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : structs(Annotation).get(this.guts.level, this.guts.arena, ref);
  }
}

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

export class Type__CtorR implements StructCtorR<Type__InstanceR> {
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

  intern(guts: StructGutsR): Type__InstanceR {
    return new Type__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Type__InstanceR {
    return new Type__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Type__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Type__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Type__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 24, pointers: 8};
  }

  empty(): Type__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Type__InstanceR(guts);
  }
}

export class Type__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(0);
  }

  /* void */
  getVoid(): void {
    this.guts.checkTag(0, 0);
  }

  /* bool */
  getBool(): void {
    this.guts.checkTag(1, 0);
  }

  /* int8 */
  getInt8(): void {
    this.guts.checkTag(2, 0);
  }

  /* int16 */
  getInt16(): void {
    this.guts.checkTag(3, 0);
  }

  /* int32 */
  getInt32(): void {
    this.guts.checkTag(4, 0);
  }

  /* int64 */
  getInt64(): void {
    this.guts.checkTag(5, 0);
  }

  /* uint8 */
  getUint8(): void {
    this.guts.checkTag(6, 0);
  }

  /* uint16 */
  getUint16(): void {
    this.guts.checkTag(7, 0);
  }

  /* uint32 */
  getUint32(): void {
    this.guts.checkTag(8, 0);
  }

  /* uint64 */
  getUint64(): void {
    this.guts.checkTag(9, 0);
  }

  /* float32 */
  getFloat32(): void {
    this.guts.checkTag(10, 0);
  }

  /* float64 */
  getFloat64(): void {
    this.guts.checkTag(11, 0);
  }

  /* text */
  getText(): void {
    this.guts.checkTag(12, 0);
  }

  /* data */
  getData(): void {
    this.guts.checkTag(13, 0);
  }

  /* list */
  getList(): Type_list__InstanceR {
    return new Type_list__InstanceR(this.guts);
  }

  /* enum */
  getEnum(): Type_enum__InstanceR {
    return new Type_enum__InstanceR(this.guts);
  }

  /* struct */
  getStruct(): Type_struct__InstanceR {
    return new Type_struct__InstanceR(this.guts);
  }

  /* interface */
  getInterface(): Type_interface__InstanceR {
    return new Type_interface__InstanceR(this.guts);
  }

  /* anyPointer */
  getAnyPointer(): Type_anyPointer__InstanceR {
    return new Type_anyPointer__InstanceR(this.guts);
  }
}

export class Type_list__InstanceR {
  +guts: StructGutsR;
  
  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  getElementType(): null | Type__InstanceR {
    this.guts.checkTag(14, 0);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Type.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Type_enum__InstanceR {
  +guts: StructGutsR;
  
  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    this.guts.checkTag(15, 0);
    const b = this.guts.layout.dataSection + 8;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* brand */
  getBrand(): null | Brand__InstanceR {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Brand.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Type_struct__InstanceR {
  +guts: StructGutsR;
  
  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    this.guts.checkTag(16, 0);
    const b = this.guts.layout.dataSection + 8;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* brand */
  getBrand(): null | Brand__InstanceR {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Brand.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Type_interface__InstanceR {
  +guts: StructGutsR;
  
  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* typeId */
  getTypeId(): UInt64 {
    this.guts.checkTag(17, 0);
    const b = this.guts.layout.dataSection + 8;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* brand */
  getBrand(): null | Brand__InstanceR {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Brand.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Type_anyPointer__InstanceR {
  +guts: StructGutsR;
  
  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(8);
  }

  /* unconstrained */
  getUnconstrained(): Type_anyPointer_unconstrained__InstanceR {
    return new Type_anyPointer_unconstrained__InstanceR(this.guts);
  }

  /* parameter */
  getParameter(): Type_anyPointer_parameter__InstanceR {
    return new Type_anyPointer_parameter__InstanceR(this.guts);
  }

  /* implicitMethodParameter */
  getImplicitMethodParameter(): Type_anyPointer_implicitMethodParameter__InstanceR {
    return new Type_anyPointer_implicitMethodParameter__InstanceR(this.guts);
  }
}

class Type_anyPointer_unconstrained__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(10);
  }

  /* anyKind */
  getAnyKind(): void {
    this.guts.checkTag(18, 0);
    this.guts.checkTag(0, 8);
    this.guts.checkTag(0, 10);
  }

  /* struct */
  getStruct(): void {
    this.guts.checkTag(18, 0);
    this.guts.checkTag(0, 8);
    this.guts.checkTag(1, 10);
  }

  /* list */
  getList(): void {
    this.guts.checkTag(18, 0);
    this.guts.checkTag(0, 8);
    this.guts.checkTag(2, 10);
  }

  /* capability */
  getCapability(): void {
//TODO: Unwind this BS. 1 Check tag per get.
    this.guts.checkTag(18, 0);
    this.guts.checkTag(0, 8);
    this.guts.checkTag(3, 10);
  }
}

class Type_anyPointer_parameter__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* scopeId */
  getScopeId(): UInt64 {
    this.guts.checkTag(18, 0);
    this.guts.checkTag(1, 8);
    const b = this.guts.layout.dataSection + 16;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* parameterIndex */
  getParameterIndex(): u16 {
    this.guts.checkTag(18, 0);
    this.guts.checkTag(1, 8);
    const b = this.guts.layout.dataSection + 10;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }
}

class Type_anyPointer_implicitMethodParameter__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  getParameterIndex(): u16 {
    this.guts.checkTag(18, 0);
    this.guts.checkTag(2, 8);
    const b = this.guts.layout.dataSection + 10;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }
}

export class Brand__CtorR implements StructCtorR<Brand__InstanceR> {
  +Scope: Brand_Scope__CtorR;
  +Binding: Brand_Binding__CtorR;

  constructor() {
    this.Scope = new Brand_Scope__CtorR();
    this.Binding = new Brand_Binding__CtorR();
  }

  intern(guts: StructGutsR): Brand__InstanceR {
    return new Brand__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Brand__InstanceR {
    return new Brand__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Brand__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Brand__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Brand__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 0, pointers: 8};
  }

  empty(): Brand__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Brand__InstanceR(guts);
  }
}

export class Brand__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* scopes */
  getScopes(): null | StructListR<Brand_Scope__InstanceR> {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : structs(Brand.Scope).get(this.guts.level, this.guts.arena, ref);
  }
}

const Brand_Scope__Tags = {
  bind: 0,
  inherit: 1,
};

export class Brand_Scope__CtorR implements StructCtorR<Brand_Scope__InstanceR> {
  +tags: {
    +bind: 0,
    +inherit: 1,
  };

  constructor() {
    this.tags = Brand_Scope__Tags;
  }

  intern(guts: StructGutsR): Brand_Scope__InstanceR {
    return new Brand_Scope__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Brand_Scope__InstanceR {
    return new Brand_Scope__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Brand_Scope__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Brand_Scope__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Brand_Scope__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 16, pointers: 8};
  }

  empty(): Brand_Scope__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Brand_Scope__InstanceR(guts);
  }
}

export class Brand_Scope__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(8);
  }

  /* scopeId */
  getScopeId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* bind */
  getBind(): null | StructListR<Brand_Binding__InstanceR> {
    this.guts.checkTag(0, 8);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : structs(Brand.Binding).get(this.guts.level, this.guts.arena, ref);
  }

  /* inherit */
  getInherit(): void {
    this.guts.checkTag(1, 8);
  }
}

const Brand_Binding__Tags = {
  unbound: 0,
  type: 1,
};

export class Brand_Binding__CtorR implements StructCtorR<Brand_Binding__InstanceR> {
  +tags: {|
    +unbound: 0,
    +type: 1,
  |};

  constructor() {
    this.tags = Brand_Binding__Tags;
  }

  intern(guts: StructGutsR): Brand_Binding__InstanceR {
    return new Brand_Binding__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Brand_Binding__InstanceR {
    return new Brand_Binding__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Brand_Binding__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Brand_Binding__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Brand_Binding__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 8};
  }

  empty(): Brand_Binding__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Brand_Binding__InstanceR(guts);
  }
}

export class Brand_Binding__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(0);
  }

  /* unbound */
  getUnbound(): void {
    this.guts.checkTag(0, 0);
  }

  /* type */
  getType(): null | Type__InstanceR {
    this.guts.checkTag(1, 0);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Type.get(this.guts.level, this.guts.arena, ref);
  }
}

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

export class Value__CtorR implements StructCtorR<Value__InstanceR> {
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
  //TODO: The + variance is redundant for literal types, no?

  constructor() {
    this.tags = Value__Tags;
  }

  intern(guts: StructGutsR): Value__InstanceR {
    return new Value__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Value__InstanceR {
    return new Value__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Value__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Value__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Value__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 16, pointers: 8};
  }

  empty(): Value__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Value__InstanceR(guts);
  }
}

export class Value__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  tag(): u16 {
    return this.guts.getTag(0);
  }

  /* void */
  getVoid(): void {
    this.guts.checkTag(0, 0);
  }

  /* bool */
  getBool(): boolean {
    this.guts.checkTag(1, 0);
    const b = this.guts.layout.dataSection + 2;
    if (b < this.guts.layout.pointersSection) {
      return !!decode.bit(this.guts.segment.raw, b, 0);
    } else {
      return false;
    }
  }

  /* int8 */
  getInt8(): i8 {
    this.guts.checkTag(2, 0);
    const b = this.guts.layout.dataSection + 2;
    if (b + 1 <= this.guts.layout.pointersSection) {
      return decode.int8(this.guts.segment.raw, b);
    } else {
      return 0 | 0;
    }
  }

  /* int16 */
  getInt16(): i16 {
    this.guts.checkTag(3, 0);
    const b = this.guts.layout.dataSection + 2;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.int16(this.guts.segment.raw, b);
    } else {
      return 0 | 0;
    }
  }

  /* int32 */
  getInt32(): i32 {
    this.guts.checkTag(4, 0);
    const b = this.guts.layout.dataSection + 4;
    if (b + 4 <= this.guts.layout.pointersSection) {
      return decode.int32(this.guts.segment.raw, b);
    } else {
      return 0 | 0;
    }
  }

  /* int64 */
  getInt64(): Int64 {
    this.guts.checkTag(5, 0);
    const b = this.guts.layout.dataSection + 8;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectI64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectI64(0, 0);
    }
  }

  /* uint8 */
  getUint8(): u8 {
    this.guts.checkTag(6, 0);
    const b = this.guts.layout.dataSection + 2;
    if (b + 1 <= this.guts.layout.pointersSection) {
      return decode.uint8(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* uint16 */
  getUint16(): u16 {
    this.guts.checkTag(7, 0);
    const b = this.guts.layout.dataSection + 2;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* uint32 */
  getUint32(): u32 {
    this.guts.checkTag(8, 0);
    const b = this.guts.layout.dataSection + 4;
    if (b + 4 <= this.guts.layout.pointersSection) {
      return decode.int32(this.guts.segment.raw, b) >>> 0;
    } else {
      return 0>>>0;
    }
  }

  /* uint64 */
  getUint64(): UInt64 {
    this.guts.checkTag(9, 0);
    const b = this.guts.layout.dataSection + 8;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* float32 */
  getFloat32(): f32 {
    this.guts.checkTag(10, 0);
    const b = this.guts.layout.dataSection + 4;
    if (b + 4 <= this.guts.layout.pointersSection) {
      const bytes = decode.int32(this.guts.segment.raw, b);
      return decode.float32(bytes);
    } else {
      return 0.0;
    }
  }

  /* float64 */
  getFloat64(): f64 {
    this.guts.checkTag(11, 0);
    const b = this.guts.layout.dataSection + 8;
    if (b + 8 <= this.guts.layout.pointersSection) {
      const bytes = injectI64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
      return decode.float64(bytes);
    } else {
      return 0.0;
    }
  }

  /* text */
  getText(): null | Text {
    this.guts.checkTag(12, 0);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* data */
  getData(): null | Data {
    this.guts.checkTag(13, 0);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Data.get(this.guts.level, this.guts.arena, ref);
  }

  /* list */
  getList(): null | AnyValue {
    this.guts.checkTag(14, 0);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : AnyValue.get(this.guts.level, this.guts.arena, ref);
  }

  /* enum */
  getEnum(): u16 {
    this.guts.checkTag(15, 0);
    const b = this.guts.layout.dataSection + 2;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* struct */
  getStruct(): null | AnyValue {
    this.guts.checkTag(16, 0);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : AnyValue.get(this.guts.level, this.guts.arena, ref);
  }

  /* interface */
  getInterface(): void {
    this.guts.checkTag(17, 0);
  }

  /* anyPointer */
  getAnyPointer(): null | AnyValue {
    this.guts.checkTag(18, 0);
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : AnyValue.get(this.guts.level, this.guts.arena, ref);
  }
}

export class Annotation__CtorR implements StructCtorR<Annotation__InstanceR> {
  intern(guts: StructGutsR): Annotation__InstanceR {
    return new Annotation__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): Annotation__InstanceR {
    return new Annotation__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): Annotation__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new Annotation__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | Annotation__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 16};
  }

  empty(): Annotation__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new Annotation__InstanceR(guts);
  }
}

export class Annotation__InstanceR {
  +guts: StructGutsR;
  
  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* id */
  getId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* brand */
  getBrand(): null | Brand__InstanceR {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : Brand.get(this.guts.level, this.guts.arena, ref);
  }

  /* value */
  getValue(): null | Value__InstanceR {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Value.get(this.guts.level, this.guts.arena, ref);
  }
}

export class CapnpVersion__CtorR implements StructCtorR<CapnpVersion__InstanceR> {
  intern(guts: StructGutsR): CapnpVersion__InstanceR {
    return new CapnpVersion__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): CapnpVersion__InstanceR {
    return new CapnpVersion__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): CapnpVersion__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CapnpVersion__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | CapnpVersion__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 0};
  }

  empty(): CapnpVersion__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new CapnpVersion__InstanceR(guts);
  }
}

export class CapnpVersion__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* major */
  getMajor(): u16 {
    const b = this.guts.layout.dataSection;
    if (b + 2 <= this.guts.layout.pointersSection) {
      return decode.uint16(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* minor */
  getMinor(): u8 {
    const b = this.guts.layout.dataSection + 2;
    if (b + 1 <= this.guts.layout.pointersSection) {
      return decode.uint8(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }

  /* micro */
  getMicro(): u8 {
    const b = this.guts.layout.dataSection + 3;
    if (b + 1 <= this.guts.layout.pointersSection) {
      return decode.uint8(this.guts.segment.raw, b);
    } else {
      return 0>>>0;
    }
  }
}

export class CodeGeneratorRequest__CtorR implements StructCtorR<CodeGeneratorRequest__InstanceR> {
  +RequestedFile: CodeGeneratorRequest_RequestedFile__CtorR;

  constructor() {
    this.RequestedFile = new CodeGeneratorRequest_RequestedFile__CtorR();
  }

  intern(guts: StructGutsR): CodeGeneratorRequest__InstanceR {
    return new CodeGeneratorRequest__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): CodeGeneratorRequest__InstanceR {
    return new CodeGeneratorRequest__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): CodeGeneratorRequest__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CodeGeneratorRequest__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | CodeGeneratorRequest__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 0, pointers: 32};
  }

  empty(): CodeGeneratorRequest__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new CodeGeneratorRequest__InstanceR(guts);
  }
}

export class CodeGeneratorRequest__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* capnpVersion */
  getCapnpVersion(): null | CapnpVersion__InstanceR {
    const ref = this.guts.pointersWord(16);
    return ref === null ? null : CapnpVersion.get(this.guts.level, this.guts.arena, ref);
  }

  /* nodes */
  getNodes(): null | StructListR<Node__InstanceR> {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : structs(Node).get(this.guts.level, this.guts.arena, ref);
  }

  /* sourceInfo */
  getSourceInfo(): null | StructListR<Node_SourceInfo__InstanceR> {
    const ref = this.guts.pointersWord(24);
    return ref === null ? null : structs(Node.SourceInfo).get(this.guts.level, this.guts.arena, ref);
  }

  /* requestedFiles */
  getRequestedFiles(): null | StructListR<CodeGeneratorRequest_RequestedFile__InstanceR> {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : structs(CodeGeneratorRequest.RequestedFile).get(this.guts.level, this.guts.arena, ref);
  }
}

export class CodeGeneratorRequest_RequestedFile__CtorR implements StructCtorR<CodeGeneratorRequest_RequestedFile__InstanceR> {
  +Import: CodeGeneratorRequest_RequestedFile_Import__CtorR;

  constructor() {
    this.Import = new CodeGeneratorRequest_RequestedFile_Import__CtorR();
  }

  intern(guts: StructGutsR): CodeGeneratorRequest_RequestedFile__InstanceR {
    return new CodeGeneratorRequest_RequestedFile__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): CodeGeneratorRequest_RequestedFile__InstanceR {
    return new CodeGeneratorRequest_RequestedFile__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): CodeGeneratorRequest_RequestedFile__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CodeGeneratorRequest_RequestedFile__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | CodeGeneratorRequest_RequestedFile__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 16};
  }

  empty(): CodeGeneratorRequest_RequestedFile__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new CodeGeneratorRequest_RequestedFile__InstanceR(guts);
  }
}

export class CodeGeneratorRequest_RequestedFile__InstanceR {
  +guts: StructGutsR;
  
  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* id */
  getId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* filename */
  getFilename(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }

  /* imports */
  getImports(): null | StructListR<CodeGeneratorRequest_RequestedFile_Import__InstanceR> {
    const ref = this.guts.pointersWord(8);
    return ref === null ? null : structs(CodeGeneratorRequest.RequestedFile.Import).get(this.guts.level, this.guts.arena, ref);
  }
}

export class CodeGeneratorRequest_RequestedFile_Import__CtorR implements StructCtorR<CodeGeneratorRequest_RequestedFile_Import__InstanceR> {
  intern(guts: StructGutsR): CodeGeneratorRequest_RequestedFile_Import__InstanceR {
    return new CodeGeneratorRequest_RequestedFile_Import__InstanceR(guts);
  }

  fromAny(guts: AnyGutsR): CodeGeneratorRequest_RequestedFile_Import__InstanceR {
    return new CodeGeneratorRequest_RequestedFile_Import__InstanceR(RefedStruct.fromAny(guts));
  }

  deref(level: uint, arena: ArenaR, ref: Word<SegmentR>): CodeGeneratorRequest_RequestedFile_Import__InstanceR {
    const guts = RefedStruct.deref(level, arena, ref, this.compiledBytes());
    return new CodeGeneratorRequest_RequestedFile_Import__InstanceR(guts);
  }

  get(level: uint, arena: ArenaR, ref: Word<SegmentR>): null | CodeGeneratorRequest_RequestedFile_Import__InstanceR {
    return isNull(ref) ? null : this.deref(level, arena, ref);
  }

  compiledBytes(): Bytes {
    return {data: 8, pointers: 8};
  }

  empty(): CodeGeneratorRequest_RequestedFile_Import__InstanceR {
    const guts = RefedStruct.empty(blob);
    return new CodeGeneratorRequest_RequestedFile_Import__InstanceR(guts);
  }
}

export class CodeGeneratorRequest_RequestedFile_Import__InstanceR {
  +guts: StructGutsR;

  constructor(guts: StructGutsR) {
    this.guts = guts;
  }

  /* id */
  getId(): UInt64 {
    const b = this.guts.layout.dataSection;
    if (b + 8 <= this.guts.layout.pointersSection) {
      return injectU64(
        decode.int32(this.guts.segment.raw, b+4),
        decode.int32(this.guts.segment.raw, b),
      );
    } else {
      return injectU64(0, 0);
    }
  }

  /* name */
  getName(): null | Text {
    const ref = this.guts.pointersWord(0);
    return ref === null ? null : Text.get(this.guts.level, this.guts.arena, ref);
  }
}

export const Node: Node__CtorR = new Node__CtorR();
export const Field: Field__CtorR = new Field__CtorR();
export const Enumerant: Enumerant__CtorR = new Enumerant__CtorR();
export const Superclass: Superclass__CtorR = new Superclass__CtorR();
export const Method: Method__CtorR = new Method__CtorR();
export const Type: Type__CtorR = new Type__CtorR();
export const Brand: Brand__CtorR = new Brand__CtorR();
export const Value: Value__CtorR = new Value__CtorR();
export const Annotation: Annotation__CtorR = new Annotation__CtorR();
export const ElementSize: {
  empty: 0,
  bit: 1,
  byte: 2,
  twoBytes: 3,
  fourBytes: 4,
  eightBytes: 5,
  pointer: 6,
  inlineComposite: 7,
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
export const CapnpVersion: CapnpVersion__CtorR = new CapnpVersion__CtorR();
export const CodeGeneratorRequest: CodeGeneratorRequest__CtorR = new CodeGeneratorRequest__CtorR();
