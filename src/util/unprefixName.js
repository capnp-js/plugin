/* @flow */

import type { Node__InstanceR } from "../schema.capnp-r";

import { nonnull } from "@capnp-js/nullary";

export default function unprefixName(node: Node__InstanceR): string {
  const offset = node.getDisplayNamePrefixLength();
  const displayName = nonnull(node.getDisplayName());
  return displayName.toString().slice(offset);
  //TODO: `offset` is a character count.
  //      Is a naive slice okay with utf8 converted to ucs2?
}
