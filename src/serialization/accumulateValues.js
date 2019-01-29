/* @flow */

import type { UInt64 } from "@capnp-js/uint64";
import type { SegmentB, Word } from "@capnp-js/memory";

import type { NodeIndex } from "../Visitor";
import type { Node__InstanceR, Value__InstanceR } from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";
import { AnyValue } from "@capnp-js/reader-core";
import { Builder } from "@capnp-js/builder-arena";

import { array as injectArray } from "@capnp-js/trans-inject";
import { startEncodeSync as startStream } from "@capnp-js/trans-stream";
import { transEncodeSync as packing } from "@capnp-js/trans-packing";
import { transEncodeSync as alignment } from "@capnp-js/trans-align-bytes";
import { finishEncodeSync as base64 } from "@capnp-js/trans-base64";

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
type Values = {
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
  blob: Builder,
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
                value.guts.set(0, acc.blob, ref);
              }
            }
          }
          break;
        case Field.tags.group:
          /* Dig into the struct's groups for their defaults too. */
          this.visit(field.getGroup().getTypeId(), acc);
          break;
        default:
          throw new Error("Unrecognized field tag");
        }
      });
    }

    return super.struct(node, acc);
  }

  const(node: Node__InstanceR, acc: Acc): Acc {
    let value = node.getConst().getValue();
    if (value === null) {
      value = Value.empty();
    }

    value = this.getValue(value);
    if (value !== null) {
      const uuid = toHex(node.getId()).toString();
      const ref = this.allocateConstant(uuid, acc);
      value.guts.set(0, acc.blob, ref);
    }

    return super.const(node, acc);
  }
}

/* I reuse the same buffers for everything. Before calling `header` or
   `segment`, I must complete iterating prior call results. Otherwise data will
   get clobbered. */
const start = startStream(new Uint8Array(2048));
const pack = packing(new Uint8Array(2048));
const align = alignment(3);

export default function accumulateValues(index: NodeIndex, fileId: UInt64): Values {
  const blob = new Builder(2048);
  const internalAcc = new ValuesVisitor(index).visit(fileId, {
    blob,
    defaults: {},
    constants: {},
  });

  let b64 = "";
  const raws = blob.segments.map(s => s.raw.subarray(0, s.end));

  const header = base64(align(pack(start(raws))));
  if (header instanceof Error) {
    throw header;
  } else {
    b64 += header;
  }

  const body = base64(align(pack(injectArray(raws))));
  if (body instanceof Error) {
    throw body;
  } else {
    b64 += body;
  }

  return {
    blob: b64,
    defaults: internalAcc.defaults,
    constants: internalAcc.constants,
  };
}

/*
export default function consts(nodes: NodeIndex, fileId: UInt64, p: Printer): void {
  const { blob, defaults, constants } = new Consts(nodes).visit(fileId, {
    blob: new Builder(2048),
    defaults: {},
    constants: {},
  });

  
  
  if (Object.keys(defaults).length !== 0 || Object.keys(constants).length !== 0) {
    // Compress the arena's data to a base-64 string at compile time.
    let base64 = "";

    let header = serialize.header(blob);
    while (!header.done) {
      base64 += header.value;
    }
    if (header.done instanceof Error) {
      throw header.done;
    }

    for (let i=0; i<blob.segments.length; ++i) {
      let segment = serialize.segment(blob.segments[i]);
      while (!segment.done) {
        base64 += segment.value;
      }
      if (segment.done instanceof Error) {
        throw segment.done;
      }
    }

    p.blank();

    // Uncompress the base-64 string to an arena at run time.
    p.line(`const blob = deserializeUnsafe("${base64}");`);
  }

  if (Object.keys(defaults).length !== 0) {
    p.blank();
    p.line("const defaults = {");
    Object.keys(defaults).forEach(uuid => {
      const scope = defaults[uuid];
      p.indent(p => {
        p.line(`"${uuid}": {`);
        Object.keys(scope).forEach(name => {
          const ref = scope[name];
          p.indent(p => {
            p.line(`${name}: {`);
            p.indent(p => {
              p.line(`segment: blob.segment(${ref.segmentId}),`);
              p.line(`position: ${ref.position},`);
            });
            p.line("},");
          });
        });
        p.line("},");
      });
    });
    p.line("};");
  }

  if (Object.keys(constants).length !== 0) {
    p.blank();
    p.line("const constants = {");
    Object.keys(constants).forEach(uuid => {
      const ref = constants[uuid];
      p.indent(p => {
        p.line(`"${uuid}": {`);
        p.indent(p => {
          p.line(`segment: blob.segment(${ref.segmentId}),`);
          p.line(`position: ${ref.position},`);
        });
        p.line("},");
      });
    });
    p.line("};");
  }
}
*/
