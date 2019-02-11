/* @flow */

import type { CodeGeneratorRequest__InstanceR } from "./schema.capnp-r";

import Index from "./Index";
import { values, classes } from "./serialization/generate";

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
      const vs = values(index, requestedFile);

      [ readerStrategy, builderStrategy ].forEach(strategy => {
        classes(index, vs, strategy, requestedFile);
      });
    });
  }
}
