/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";
import type { Libs } from "./libs";

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

  constructor(index: NodeIndex, names: Set<string>) {
    super(index);
    this.names = names;
  }

  //TODO: Implement me
}

export default function accumulateBuilderLibs(index: NodeIndex, fileId: UInt64, names: Set<string>): Libs {
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
