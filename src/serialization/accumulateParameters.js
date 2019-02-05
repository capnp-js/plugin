/* @flow */

import type Index from "../Index";
import type { Scope } from "../Index";

import { toHex } from "@capnp-js/uint64";
import { nonnull } from "@capnp-js/nullary";

import { Node } from "../schema.capnp-r";

export type Parameters = {
  main: $ReadOnlyArray<string>,
  generic: $ReadOnlyArray<string>,
  specialize: $ReadOnlyArray<string>,
};

export type ParametersIndex = { [hostId: string]: Parameters };

function parameters(scopes: $ReadOnlyArray<Scope>): Parameters {
  const main = scopes.slice(1).map((scope, depth) => {
    const locals = scope.node.getParameters();
    if (locals === null) {
      return [];
    } else {
      return locals.map(parameter => {
        const name = nonnull(parameter.getName()).toString();
        return `${name}_${depth}`;
      });
    }
  });

  const generic = main.slice(0, main.length - 1);
  const specialize = main.slice(main.length - 1);

  return {
    main: main.reduce((acc, params) => acc.concat(params), []),
    generic: generic.reduce((acc, params) => acc.concat(params), []),
    specialize: specialize.reduce((acc, params) => acc.concat(params), []),
  };
}

export default function accumulateParameters(index: Index): ParametersIndex {
  const parametersIndex = {};
  index.forEachNode(node => {
    parametersIndex[toHex(node.getId())] = parameters(index.getScopes(node.getId()));

    if (node.tag() === Node.tags.interface) {
      const iface = node.getInterface();
      const methods = iface.getMethods();
      if (methods !== null) {
        methods.forEach(method => {
          const paramId = method.getParamStructType();
          const param = index.getNode(paramId);
          const paramScopeId = param.getScopeId();
          if (!(paramScopeId[0] === 0 && paramScopeId[1] === 0)) {
            parametersIndex[toHex(paramId)] = parameters(index.getScopes(paramId));
          }

          const resultId = method.getResultStructType();
          const result = index.getNode(resultId);
          const resultScopeId = result.getScopeId();
          if (!(resultScopeId[0] === 0 && resultScopeId[1] === 0)) {
            parametersIndex[toHex(resultId)] = parameters(index.getScopes(resultId));
          }
        });
      }
    }
  });

  return parametersIndex;
}
