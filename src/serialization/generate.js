/* @flow */

import type Index from "../Index";
import type { CodeGeneratorRequest_RequestedFile__InstanceR } from "../schema.capnp-r";
import type { Values } from "./accumulateValues";

import * as path from "path";
import { writeFile } from "fs";
import { nonnull } from "@capnp-js/nullary";
import { toHex } from "@capnp-js/uint64";

import Printer from "../Printer";
import accumulateLocals from "./accumulateLocals";
import accumulateReaderLibs from "./accumulateReaderLibs";
import accumulateBuilderLibs from "./accumulateBuilderLibs";
import accumulateUsers from "./accumulateUsers";
import accumulateValues from "./accumulateValues";
import accumulateParameters from "./accumulateParameters";
import printReaderBodies from "./printReaderBodies";
import printBuilderBodies from "./printBuilderBodies";
import printReaderInstantiations from "./printReaderInstantiations";
import printBuilderInstantiations from "./printBuilderInstantiations";

type RequestedFile = CodeGeneratorRequest_RequestedFile__InstanceR;

function baseFilename(file: RequestedFile): string {
  const source = nonnull(file.getFilename()).toString();
  const prefix = source.charAt(0) === "." ? "" : "./";

  return prefix + source;
}

export function values(index: Index, file: RequestedFile): null | Values {
  const vs = accumulateValues(index, file.getId());
  if (vs !== null) {
    const p = new Printer(2);

    p.line("/* @flow */");
    p.interrupt();
    p.line("import type { Reader } from \"@capnp-js/reader-arena\";");
    p.line("import { deserializeUnsafe } from \"@capnp-js/reader-arena\";");
    p.interrupt();
    p.line(`const blob: Reader = deserializeUnsafe("${vs.blob}");`);
    p.line("export default blob;");

    const filename = baseFilename(file) + "-blob.js";
    writeFile(filename, p.text, { encoding: "utf8" }, err => {
      if (err) {
        throw err;
      }
    });

    return vs;
  } else {
    return null;
  }
}

export type Strategy = {
  tag: "reader" | "builder",
  filename(base: string): string,
  suffix(base: string): string,
};

export function classes(index: Index, values: null | Values, strategy: Strategy, file: RequestedFile): void {
  const p = new Printer(2);

  p.line("/* @flow */");

  /* Accumulator for names so that I can test for name collisions. */
  const names = new Set();

  /* I'll construct the `identifiers` accumulator from seperate dictionaries
     once they're all available. */

  /* The data types constructed within a serialization file never have their
     names mangled. Upon collision, the imported name(s) get mangled. Before
     generating anything I've got to scan the file's member names. Non-
     capitalized names cannot collide by construction (`inject` from
     @capnp-js/int64 and @capnp-js/uint64 are exceptions, but I would alias them
     for readability even in the absence of the collision). */
  const locals = accumulateLocals(index, file.getId());
  locals.names.forEach(name => names.add(name));

  /* A serialization file (suffixed `-r` or `-b`) consists of 5 sections. */

  p.interrupt();

  /* Section 1: Library Imports
     The `@capnp-js` scope contains all sorts of types and helpers that
     serialization code uses. The imported types have capitalized names that may
     collide with serialization code; such imports get their names mangled.
     Since `locals` contains all of the capitalized local base names, it
     contains sufficient information to mangle any collisions found among the
     imports. User imports and type aliases are left to another section because
     I don't need seperate reader and builder versions for those types. */
  let libs;
  if (strategy.tag === "reader") {
    libs = accumulateReaderLibs(index, file.getId(), names);
  } else {
    (strategy.tag: "builder");
    libs = accumulateBuilderLibs(index, file.getId(), names);
  }
  libs.names.forEach(name => names.add(name));

  /* Library types */
  for (let source in libs.type) {
    const lib = libs.type[source];
    if (Object.keys(lib).length === 1) {
      Object.keys(lib).forEach(type => {
        if (lib[type] === type) {
          p.line(`import type { ${type} } from "@capnp-js/${source}";`);
        } else {
          p.line(`import type { ${type} as ${lib[type]} } from "@capnp-js/${source}";`);
        }
      });
    } else if (Object.keys(lib).length > 1) {
      p.line("import type {");
      const keys = Object.keys(lib);
      keys.sort();
      keys.forEach(type => {
        p.indent(p => {
          if (lib[type] === type) {
            p.line(`${type},`);
          } else {
            p.line(`${type} as ${lib[type]},`);
          }
        });
      });
      p.line(`} from "@capnp-js/${source}";`);
    }
  }

  p.interrupt();

  /* Library indices */
  for (let source in libs["all-value"]) {
    const name = libs["all-value"][source];
    if (name !== null) {
      p.line(`import * as ${name} from "@capnp-js/${source}";`);
    }
  }

  /* Library values */
  for (let source in libs.value) {
    const lib = libs.value[source];
    if (Object.keys(lib).length === 1) {
      Object.keys(lib).forEach(value => {
        if (lib[value] === value) {
          p.line(`import { ${value} } from "@capnp-js/${source}";`);
        } else {
          p.line(`import { ${value} as ${lib[value]} } from "@capnp-js/${source}";`);
        }
      });
    } else if (Object.keys(lib).length > 1) {
      p.line("import {");
      const keys = Object.keys(lib);
      keys.sort();
      keys.forEach(value => {
        p.indent(p => {
          if (lib[value] === value) {
            p.line(`${value},`);
          } else {
            p.line(`${value} as ${lib[value]},`);
          }
        });
      });
      p.line(`} from "@capnp-js/${source}";`);
    }
  }

  /* pointerCopy */
  if (strategy.tag === "builder" && values !== null) {
    if (Object.keys(values.defaults).length > 0) {
      p.line("import { pointerCopy } from \"@capnp-js/copy-pointers\";");
    }
  }

  p.interrupt();

  /* Section 2: Reader Imports (builder only)
     Each builder instance exposes a `reader` method to derive a read-only
     instance for the builder's data. The `reader` method requires the reader's
     type. */
  if (strategy.tag === "builder") {
    const baseName = path.basename(nonnull(file.getFilename()).toString());
    const source = `./${baseName}-r`;
    if (locals.structs.size + locals.paramStructs.size + locals.resultStructs.size === 1) {
      locals.structs.forEach(name => {
        p.line(`import type { ${name}__InstanceR } from "${source}";`);
      });
      locals.paramStructs.forEach(name => {
        p.line(`import type { ${name}__ParamInstanceR } from "${source}";`);
      });
      locals.resultStructs.forEach(name => {
        p.line(`import type { ${name}__ResultInstanceR } from "${source}";`);
      });
    } else if (locals.structs.size > 1) {
      p.line("import type {");
      p.indent(p => {
        locals.structs.forEach(name => {
          p.line(`${name}__InstanceR,`);
        });
        locals.paramStructs.forEach(name => {
          p.line(`${name}__ParamInstanceR,`);
        });
        locals.resultStructs.forEach(name => {
          p.line(`${name}__ResultInstanceR,`);
        });
      });
      p.line(`} from "${source}";`);
    }
  }

  p.interrupt();

  /* Section 3: User Imports and Type Aliases
     Cap'n Proto schema files admit user imports where the unqualified names may
     collide with local names. I scan all of the imports and mangle a name if it
     collides with a local name. */
  const users = accumulateUsers(index, file.getId(), names);
  const identifiers = { ...locals.identifiers, ...users.identifiers };

  /* User imports */
  {
    const imports = file.getImports();
    const table = {};
    if (imports !== null) {
      imports.forEach(import_ => {
        table[toHex(import_.getId())] = nonnull(import_.getName()).toString();
      });

      for (let fileUuid in users.imports) {
        let filename = strategy.filename(table[fileUuid]);
        if (filename.charAt(0) === "/") {
          throw new Error("Non-relative imports are not supported.");
        } else if (filename.charAt(0) !== ".") {
          filename = "./" + filename;
        }

        if (Object.keys(users.imports[fileUuid]).length === 1) {
          Object.keys(users.imports[fileUuid]).forEach(naiveBaseName => {
            const localBaseName = users.imports[fileUuid][naiveBaseName];
            const naiveName = strategy.suffix(`${naiveBaseName}__Instance`);
            if (naiveBaseName === localBaseName) {
              p.line(`import type { ${naiveName} } from "${filename}";`);
            } else {
              const localName = strategy.suffix(`${localBaseName}__Instance`);
              p.line(`import type { ${naiveName} as ${localName} } from "${filename}";`);
            }
          });
        } else {
          p.line("import type {");
          p.indent(p => {
            Object.keys(users.imports[fileUuid]).forEach(naiveBaseName => {
              const localBaseName = users.imports[fileUuid][naiveBaseName];
              const naiveName = strategy.suffix(`${naiveBaseName}__Instance`);
              if (naiveBaseName === localBaseName) {
                p.line(`${naiveName},`);
              } else {
                const localName = strategy.suffix(`${localBaseName}__Instance`);
                p.line(`${naiveName} as ${localName},`);
              }
            });
          });
          p.line(`} from "${filename}";`);
        }
      }

      p.interrupt();

      for (let fileUuid in users.imports) {
        let filename = strategy.filename(table[fileUuid]);
        if (filename.charAt(0) === "/") {
          throw new Error("Non-relative imports are not supported.");
        } else if (filename.charAt(0) !== ".") {
          filename = "./" + filename;
        }

        if (Object.keys(users.imports[fileUuid]).length === 1) {
          Object.keys(users.imports[fileUuid]).forEach(naiveBaseName => {
            const localBaseName = users.imports[fileUuid][naiveBaseName];
            const naiveName = strategy.suffix(`${naiveBaseName}__Ctor`);
            if (naiveBaseName === localBaseName) {
              p.line(`import { ${naiveName} } from "${filename}";`);
            } else {
              const localName = strategy.suffix(`${localBaseName}__Ctor`);
              p.line(`import { ${naiveName} as ${localName} } from "${filename}";`);
            }
          });
        } else {
          p.line("import {");
          p.indent(p => {
            Object.keys(users.imports[fileUuid]).forEach(naiveBaseName => {
              const localBaseName = users.imports[fileUuid][naiveBaseName];
              const naiveName = strategy.suffix(`${naiveBaseName}__Ctor`);
              if (naiveBaseName === localBaseName) {
                p.line(`${naiveName},`);
              } else {
                const localName = strategy.suffix(`${localBaseName}__Ctor`);
                p.line(`${naiveName} as ${localName},`);
              }
            });
          });
          p.line(`} from "${filename}";`);
        }
      }
    }
  }

  p.interrupt();

  /* Constant and default values */
  if (values !== null) {
    const baseName = path.basename(nonnull(file.getFilename()).toString());
    const blob = `./${baseName}-blob`;
    if (strategy.tag === "reader") {
      p.line(`import blob from "${blob}";`);
    } else {
      (strategy.tag: "builder");
      if (Object.keys(values.defaults).length > 0) {
        p.line(`import blob from "${blob}";`);
      }
    }
  }

  p.interrupt();

  /* Type aliases */
  {
    const keys = Object.keys(libs.aliases);
    keys.sort();
    keys.forEach(alias => p.line(`type ${alias} = ${libs.aliases[alias]};`));
  }

  p.interrupt();

  /* Section 4: Translated Nodes
     Translate Cap'n Proto schema nodes into JavaScript classes. */

  /* Generic parametrizations */
  const parameters = accumulateParameters(index);

  /* Print bodies */
  if (strategy.tag === "reader") {
    printReaderBodies(index, file.getId(), identifiers, parameters, values, p);
  } else {
    (strategy.tag: "builder");
    printBuilderBodies(index, file.getId(), identifiers, parameters, values, p);
  }

  p.interrupt();

  /* Section 5: Export instantiations of file scoped types from the schema. */
  if (strategy.tag === "reader") {
    printReaderInstantiations(index, file.getId(), parameters, p);
  } else {
    (strategy.tag: "builder");
    printBuilderInstantiations(index, file.getId(), parameters, p);
  }

  const filename = strategy.filename(baseFilename(file)) + ".js";
  writeFile(filename, p.text, { encoding: "utf8" }, err => {
    if (err) {
      throw err;
    }
  });

  /*
     * A section of library imports. These imports all begin with a
       `@capnp-js/`.
     * A section of generated imports. These imports all come from other
       generated files.
TODO: What about libs? Suppose that I've got some external library.
NodeJS uses an entry point for exports, but I'd rather not aggregate all of the
generated files into a blob (I suspect that this would foil "tree-shaking" reductions).
How about an annotation? How about rejecting all absolute paths. The user can write
the schema to someplace locally refable. Having a single source of truth is nice, though.
* I think that I can use Flow's name_mapper and babel-plugin-module-resolver to make absolute paths work.
* I'm not so sure about aliasing under TypeScript.
* Reject absolute paths for now?
     * A section of type aliases for improved readability, e.g.
       `type uint = number`.
     * A section of constant and/or default values.
     * A section generated from the schema file's nodes.
     * A section of constructor instantiations.
  */
  //TODO: My struct lists need adoptWithCaveats to work with freshly allocated structs, right? Wrong. The bytes were allocated as part of the list. But I should admit adoption into a list.
}
