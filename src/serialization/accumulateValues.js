/* @flow */

import type { UInt64 } from "@capnp-js/uint64";
import type { SegmentB, Word } from "@capnp-js/memory";

import type Index from "../Index";
import type { Node__InstanceR, Value__InstanceR } from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";
import { AnyValue } from "@capnp-js/reader-core";
import { Unlimited } from "@capnp-js/base-arena";
import { Builder } from "@capnp-js/builder-arena";
import { create, getSubarray } from "@capnp-js/bytes";

import { array as injectArray } from "@capnp-js/trans-inject";
import { startEncodeSync as startStream } from "@capnp-js/trans-stream";
import { transEncodeSync as packing } from "@capnp-js/trans-packing";
import { transEncodeSync as alignment } from "@capnp-js/trans-align-bytes";
import { finishEncodeSync as base64 } from "@capnp-js/trans-base64";
import { concat } from "@capnp-js/trans-concat";

import Visitor from "../Visitor";
import { nonnull } from "@capnp-js/nullary";
import { Field, Value } from "../schema.capnp-r";

type uint = number;
type u32 = number;

export type MetaWord = {
  segmentId: u32,
  position: uint,
};

//TODO: Should the blob from an earlier visitor intertwine with the logic here?
//      At least it decides whether to begin this stage at all.
export type Values = {
  blob: string,
  defaults: {
    [hostUuid: string]: {
      [name: string]: MetaWord,
    },
  },
  constants: {
    [uuid: string]: MetaWord,
  },
};

type Acc = {
  blob: null | Builder,
  defaults: {
    [hostUuid: string]: {
      [name: string]: MetaWord,
    },
  },
  constants: {
    [uuid: string]: MetaWord,
  },
};

class ValuesVisitor extends Visitor<Acc> {
  allocateDefault(hostUuid: string, field: string, acc: Acc): Word<SegmentB> {
    if (acc.blob === null) {
      acc.blob = Builder.fresh(2048, new Unlimited());
    }

    if (!acc.defaults[hostUuid]) {
      acc.defaults[hostUuid] = {};
    }

    const ref = acc.blob.allocate(8);
    acc.defaults[hostUuid][field] = {
      segmentId: ref.segment.id,
      position: ref.position,
    };

    return ref;
  }

  allocateConstant(uuid: string, acc: Acc): Word<SegmentB> {
    if (acc.blob === null) {
      acc.blob = Builder.fresh(2048, new Unlimited());
    }

    const ref = acc.blob.allocate(8);
    acc.constants[uuid] = {
      segmentId: ref.segment.id,
      position: ref.position,
    };

    return ref;
  }

  getValue(value: Value__InstanceR): null | AnyValue {
    switch (value.tag()) {
    case Value.tags.void:
    case Value.tags.bool:
    case Value.tags.int8:
    case Value.tags.int16:
    case Value.tags.int32:
    case Value.tags.int64:
    case Value.tags.uint8:
    case Value.tags.uint16:
    case Value.tags.uint32:
    case Value.tags.uint64:
    case Value.tags.float32:
    case Value.tags.float64:
      return null;

    case Value.tags.text: return AnyValue.intern(nonnull(value.getText()).guts);
    case Value.tags.data: return AnyValue.intern(nonnull(value.getData()).guts);
    case Value.tags.list: return nonnull(value.getList());
    case Value.tags.enum:
      return null;
    case Value.tags.struct: return nonnull(value.getStruct());
    case Value.tags.interface:
      return null;
    case Value.tags.anyPointer: return nonnull(value.getAnyPointer());
    default:
      throw new Error("Unrecognized value tag.");
    }
  }

  struct(node: Node__InstanceR, acc: Acc): Acc {
    const hostUuid = toHex(node.getId());
    const struct = node.getStruct();
    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        const name = nonnull(field.getName()).toString();
        switch (field.tag()) {
        case Field.tags.slot:
          {
            const slot = field.getSlot();
            if (slot.getHadExplicitDefault()) {
              const value = this.getValue(nonnull(slot.getDefaultValue()));
              if (value !== null) {
                const ref = this.allocateDefault(hostUuid, name, acc);
                value.guts.set(0, ((acc.blob: any): Builder), ref); // eslint-disable-line flowtype/no-weak-types
              }
            }
          }
          break;
        case Field.tags.group:
          {
            /* Dig into the struct's groups for their defaults too. */
            this.visit(field.getGroup().getTypeId(), acc);
          }
          break;
        default:
          throw new Error("Unrecognized field tag");
        }
      });
    }

    return super.struct(node, acc);
  }

  //TODO: Interfaces can contain constants. Implement the interface handler.

  const(node: Node__InstanceR, acc: Acc): Acc {
    let value = node.getConst().getValue();
    if (value === null) {
      value = Value.empty();
    }

    value = this.getValue(value);
    if (value !== null) {
      const uuid = toHex(node.getId()).toString();
      const ref = this.allocateConstant(uuid, acc);
      value.guts.set(0, ((acc.blob: any): Builder), ref); // eslint-disable-line flowtype/no-weak-types
    }

    return super.const(node, acc);
  }
}

/* I reuse the same buffers for everything. Before calling `header` or
   `segment`, I must complete iterating prior call results. Otherwise data will
   get clobbered. */
const start = startStream(create(2048));
const pack = packing(create(2048));
const align = alignment(3);

export default function accumulateValues(index: Index, fileId: UInt64): null | Values {
  const internalAcc = new ValuesVisitor(index).visit(fileId, {
    blob: null,
    defaults: {},
    constants: {},
  });

  if (internalAcc.blob === null) {
    return null;
  } else {
    const raws = internalAcc.blob.segments.map(s => getSubarray(0, s.end, s.raw));
    const b64 = base64(align(pack(concat(start(raws), injectArray(raws)))));
    if (b64 instanceof Error) {
      throw b64;
    } else {
      return {
        blob: b64,
        defaults: internalAcc.defaults,
        constants: internalAcc.constants,
      };
    }
  }
}
