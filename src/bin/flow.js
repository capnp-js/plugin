#!/usr/bin/env node
/* @flow */

import type { Readable } from "@capnp-js/trans-readable";

import readable from "@capnp-js/trans-readable";
import { segmentize } from "@capnp-js/memory";
import { nonnull } from "@capnp-js/nullary";
import { Reader } from "@capnp-js/reader-arena";
import { finishDecode } from "@capnp-js/trans-stream";

import { CodeGeneratorRequest } from "../schema.capnp-r";

import codeGeneratorRespond from "../codeGeneratorRespond";

//TODO: Verify that readable streams work under Node 8 and Node 10
const stdin = ((process.stdin: any): Readable); // eslint-disable-line flowtype/no-weak-types

const decode = finishDecode((err, raws) => {
  if (err) {
    process.stderr.write("Failed: " + err.message + "\n");
  } else {
    const arena = Reader.limited(segmentize(raws), 1 << 26, 64);

    //TODO: Write an empty file on null? Can null happen?
    const root = nonnull(arena.getRoot());
    const request = root.getAs(CodeGeneratorRequest);

    codeGeneratorRespond(request);
  }
});

decode(readable(stdin));
