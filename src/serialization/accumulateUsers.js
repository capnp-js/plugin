/* @flow */

import type { UInt64 } from "@capnp-js/uint64";

import type { NodeIndex } from "../Visitor";
import type { Node__InstanceR, Type__InstanceR } from "../schema.capnp-r";

import { toHex } from "@capnp-js/uint64";

import Visitor from "../Visitor";
import address from "../util/address";
import unprefixName from "../util/unprefixName";
import { Field, Type } from "../schema.capnp-r";

type Acc = {
  structs: Set<UInt64>,
  aliases: { [name: string]: string },
};

interface MangledUsers {
  +imports: {
    [fileUuid: string]: {
      [naive: string]: string,
    },
  };
  +identifiers: { [uuid: string]: string };
}

export interface Users extends MangledUsers {
  +aliases: { [name: string]: string },
}

class UsersVisitor extends Visitor<Acc> {
  +names: Set<string>;

  constructor(index: NodeIndex, names: Set<string>) {
    super(index);
    this.names = names;
  }

  struct(node: Node__InstanceR, acc: Acc): Acc {
    acc.aliases["uint"] = "number";

    const struct = node.getStruct();

    if (struct.getDiscriminantCount() > 0) {
      acc.aliases["u16"] = "number";
    }

    const fields = struct.getFields();
    if (fields !== null) {
      fields.forEach(field => {
        switch (field.tag()) {
        case Field.tags.slot:
          this.addType(field.getSlot().getType(), acc);
          break;
        case Field.tags.group:
          /* Dig into the struct's groups for their field types too. */
          //TODO: Grep for this.struct calls that should be this.visit calls.
          this.visit(field.getGroup().getTypeId(), acc);
          break;
        default: throw new Error("Unrecognized field tag.");
        }
      });
    }

    return super.struct(node, acc);
  }

  addType(type: null | Type__InstanceR, acc: Acc): void {
    if (type === null) {
      type = Type.empty();
    }

    switch (type.tag()) {
    case Type.tags.void:
    case Type.tags.bool:
      break;
    case Type.tags.int8:
      acc.aliases["i8"] = "number";
      break;
    case Type.tags.int16:
      acc.aliases["i16"] = "number";
      break;
    case Type.tags.int32:
      acc.aliases["i32"] = "number";
      break;
    case Type.tags.int64:
      break;
    case Type.tags.uint8:
      acc.aliases["u8"] = "number";
      break;
    case Type.tags.uint16:
      acc.aliases["u16"] = "number";
      break;
    case Type.tags.uint32:
      acc.aliases["u32"] = "number";
      break;
    case Type.tags.uint64:
      break;
    case Type.tags.float32:
      acc.aliases["f32"] = "number";
      break;
    case Type.tags.float64:
      acc.aliases["f64"] = "number";
      break;
    case Type.tags.text:
    case Type.tags.data:
      break;
    case Type.tags.list:
      this.addType(type.getList().getElementType(), acc);
      break;
    case Type.tags.enum:
      acc.aliases["u16"] = "number";
      break;
    case Type.tags.struct:
      acc.structs.add(type.getStruct().getTypeId());
      break;
    case Type.tags.interface:
      throw new Error("TODO");
    case Type.tags.anyPointer:
      break;
    default:
      throw new Error("Unrecognized type tag.");
    }
  }
}

function shortestUniques(uuids: Array<string>): { +[uuid: string]: string } {
  const fixedWidthUuids = uuids.map(uuid => {
    /* Remove the leading `0x`. */
    const narrow = uuid.slice(2);

    const pad = "0000000000000000";

    return narrow + pad.slice(narrow.length);
  });

  for (let t=1; t<16; ++t) {
    /* Hypothesize that I've already found a truncated length under which all of
       the uuids remain unique. */
    let unique = true;

    /* Exhaustively search for a collision under truncated length `t`. */
    for (let i=0; i<fixedWidthUuids.length-1; ++i) {
      for (let j=i+1; j<fixedWidthUuids.length; ++j) {
        if (fixedWidthUuids[i].slice(0, t) === fixedWidthUuids[j].slice(0, t)) {
          /* I've found a contradiction. */
          unique = false;
          break;
        }
      }
      if (!unique) {
        break;
      }
    }

    if (unique) {
      /* My search found no collisions under the truncated length, so I return
         the dictionary of truncated uuids. */
      const map = {};
      for (let k=0; k<fixedWidthUuids.length; ++k) {
        map[uuids[k]] = fixedWidthUuids[k].slice(0, t);
      }
      return map;
    }
  }

  throw new Error("Nonunique IDs provided to `shortestUniques`.");
}

type NameCollisions = {
  [naive: string]: {
    [uuid: string]: {
      fileId: null | UInt64, // Null indicates that the node exists to scope a
                             // descendant, not as an import itself.
      +subscopes: NameCollisions,
    },
  },
};

function insertCollision(fileId: UInt64, classes: $ReadOnlyArray<Node__InstanceR>, collisions: NameCollisions): void {
  const naive = unprefixName(classes[0]);
  const uuid = toHex(classes[0].getId());

  if (!collisions[naive]) {
    collisions[naive] = {};
  }

  if (!collisions[naive][uuid]) {
    collisions[naive][uuid] = {
      fileId: null,
      subscopes: {},
    };
  }

  if (classes.length === 1) {
    collisions[naive][uuid].fileId = fileId;
  } else {
    insertCollision(fileId, classes.slice(1), collisions[naive][uuid].subscopes);
  }
}

type Path = {
  naive: Array<string>,
  local: Array<string>,
};

function mangle(names: Set<string>, path: Path, collisions: NameCollisions, mangled: MangledUsers): void {
  Object.keys(collisions).forEach(naive => {
    const uuids = Object.keys(collisions[naive]);

    /* Create a speculative base name for now. I may append some UUID characters
       at its tail to obtain the actual base name. */
    const baseName = path.local.length === 0 ? naive : path.local.join("_") + "_" + naive;

    if (uuids.length === 1 && !names.has(baseName)) {
      const uuid = uuids[0];

      /* There's no name collision, so my `baseName` can get used as-is. */
      path = {
        naive: path.naive.concat([naive]),
        local: path.local.concat([naive]),
      };
      const singleton = collisions[naive][uuid];
      if (singleton.fileId !== null) {
        /* The current path is itself imported, so I add it to the `mangled`
           data structure. */
        const fileUuid = toHex(singleton.fileId);
        if (!mangled.imports[fileUuid]) {
          mangled.imports[fileUuid] = {};
        }
        mangled.imports[fileUuid][path.naive.join("_")] = path.local.join("_");
        mangled.identifiers[uuid] = path.local.join("_");
      }
      mangle(names, path, singleton.subscopes, mangled);
    } else {
      const uniques = shortestUniques(uuids);
      for (let i=0; i<uuids.length; ++i) {
        const uuid = uuids[i];
        path = {
          naive: path.naive.concat([naive]),
          local: path.local.concat([naive + uniques[uuid]]),
        };
        const node = collisions[naive][uuid];
        if (node.fileId !== null) {
          /* The current path is itself imported, so I add it to the `mangled`
             data structure. */
          const fileUuid = toHex(node.fileId);
          if (!mangled.imports[fileUuid]) {
            mangled.imports[fileUuid] = {};
          }
          mangled.imports[fileUuid][path.naive.join("_")] = path.local.join("_");
          mangled.identifiers[uuid] = path.local.join("_");
        }
        mangle(names, path, node.subscopes, mangled);
      }
    }
  });
}

export default function accumulateUsers(index: NodeIndex, fileId: UInt64, names: Set<string>): Users {
  const internalAcc = new UsersVisitor(index, names).visit(fileId, {
    structs: new Set(),
    aliases: {},
  });

  const addresses = Array.from(internalAcc.structs).map(id => address(index, id));

  const collisions = {};
  addresses.forEach(address => {
    if (toHex(address.file.getId()) !== toHex(fileId)) {
      insertCollision(address.file.getId(), address.classes, collisions);
    }
  });
  const mangled = {
    imports: {},
    identifiers: {},
  };
  mangle(names, { naive: [], local: [] }, collisions, mangled);

  return {
    ...mangled,
    aliases: internalAcc.aliases,
  };
}
