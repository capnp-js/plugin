/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Printer from "../Printer";
import type { NodeIndex } from "../Visitor";
import type { ParametersIndex } from "./accumulateParameters";

export default function printReaderBodies(
  index: NodeIndex,
  fileId: UInt64,
  identifiers: { [uuid: string]: string },
  parameters: ParametersIndex,
  p: Printer,
): void {}
