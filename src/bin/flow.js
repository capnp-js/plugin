#!/usr/bin/env node
/* @flow */

import type { Readable } from "@capnp-js/trans-readable";

import readable from "@capnp-js/trans-readable";
import { nonnull } from "@capnp-js/nullary";
import { Reader } from "@capnp-js/reader-arena";
import { Builder } from "@capnp-js/builder-arena";
import { finishDecode } from "@capnp-js/trans-stream";
import { toHex } from "@capnp-js/uint64";

import { Node, CodeGeneratorRequest as CgrR } from "../schema.capnp-r";
import { CodeGeneratorRequest as CgrB } from "../schema.capnp-b";

import codeGeneratorRespond from "../codeGeneratorRespond";

function patch(segments) {
  const arena = Builder.limited(segments, 1 << 26, 64);

  const root = nonnull(arena.getRoot());
  const request = root.getAs(CgrB);

  const index = {};
  const nodes = request.getNodes();
  if (nodes !== null) {
    nodes.forEach(node => {
      index[toHex(node.getId())] = node;
    });

    nodes.forEach(node => {
      if (node.tag() === Node.tags.interface) {
        const methods = node.getInterface().getMethods();
        if (methods !== null) {
          methods.forEach(method => {
            const paramNode = index[toHex(method.getParamStructType())];
            const paramScopeId = paramNode.getScopeId();
            if (paramScopeId[0] === 0 && paramScopeId[1] === 0) {
              paramNode.setScopeId(node.getId());
            }

            const resultNode = index[toHex(method.getResultStructType())];
            const resultScopeId = resultNode.getScopeId();
            if (resultScopeId[0] === 0 && resultScopeId[1] === 0) {
              resultNode.setScopeId(node.getId());
            }
          });
        }
      }
    });
  }

  return segments;
}

//TODO: Verify that readable streams work under Node 8 and Node 10
const stdin = ((process.stdin: any): Readable); // eslint-disable-line flowtype/no-weak-types

const decode = finishDecode((err, data) => {
  if (err) {
    process.stderr.write("Failed: " + err.message + "\n");
  } else {
    const segments = patch(data.map((raw, id) => {
      return {
        id,
        raw,
        end: raw.length,
      };
    }));

    const arena = Reader.limited(segments, 1 << 26, 64);

    const root = nonnull(arena.getRoot());
    const request = root.getAs(CgrR);

    codeGeneratorRespond(request);
  }
});

decode(readable(stdin));
