/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type Printer from "../Printer";
import type { NodeIndex } from "../Visitor";
import type { ParametersIndex } from "./accumulateParameters";

import { nonnull } from "@capnp-js/nullary";
import { toHex } from "@capnp-js/uint64";

import { Node } from "../schema.capnp-r";

export default function printReaderInstantiations(index: NodeIndex, fileId: UInt64, parameters: ParametersIndex, p: Printer): void {
  const file = index[toHex(fileId)];
  const nestedNodes = file.getNestedNodes();
  if (nestedNodes !== null) {
    nestedNodes.forEach(nestedNode => {
      const uuid = toHex(nestedNode.getId());
      const node = index[uuid];
      const name = nonnull(nestedNode.getName()).toString();
      switch (node.tag()) {
      case Node.tags.file:
        throw new Error("Invariant broken: File node occurred within another file node.");
      case Node.tags.struct:
        {
          if (parameters[uuid].specialize.length > 0) {
            p.line(`export const ${name} = new ${name}__GenericB();`);
          } else {
            p.line(`export const ${name} = new ${name}__CtorB();`);
          }
        }
        break;
      case Node.tags.enum:
        p.line(`export const ${name} = ${name}__Enum;`);
        break;
      case Node.tags.interface:
        throw new Error("TODO");
      case Node.tags.const:
        break;
      case Node.tags.annotation:
        break;
      default:
        throw new Error("Unrecognized node tag.");
      }
    });
  }
}
