/* @flow */

import type { CodeGeneratorRequest__InstanceR } from "./schema.capnp-r";

import { writeFile } from "fs";
import { nonnull } from "@capnp-js/nullary";

import Index from "./Index";
import generateSerialization from "./serialization/generate";

const readerStrategy = {
  tag: "reader",
  filename(base: string): string {
    return base + "-r";
  },
  suffix(base: string): string {
    return base + "R";
  },
};

const builderStrategy = {
  tag: "builder",
  filename(base: string): string {
    return base + "-b";
  },
  suffix(base: string): string {
    return base + "B";
  },
};

export default function codeGeneratorRespond(request: CodeGeneratorRequest__InstanceR): void {
  const index = new Index(request.getNodes());

  const requestedFiles = request.getRequestedFiles();
  if (requestedFiles !== null) {
    requestedFiles.forEach(requestedFile => {
      [ readerStrategy, builderStrategy ].forEach(strategy => {
        const source = nonnull(requestedFile.getFilename()).toString();
        const prefix = source.charAt(0) === "." ? "" : "./";
        const filename = prefix + strategy.filename(source) + ".js";
        const content = generateSerialization(index, strategy, requestedFile);

        writeFile(filename, content, { encoding: "utf8" }, err => {
          if (err) {
            throw err;
          }
        });
      });
    });
  }
}
