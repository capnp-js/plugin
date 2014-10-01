capnp-js-plugin
===============

Yet another Capnproto implementation for Javascript.
[Dust](https://github.com/linkedin/dustjs) templates provide a literate codebase.
Most substance is currently under [decode](https://github.com/popham/capnp-js/tree/master/src/template/decode).

#CommonJS Modules
I'm building AMD modules--Nodefy will take care of building the CommonJS distribution.

#AMD Modules
The following strategy resolves circular references by populating prototypes as a final step: `[filename+extension]` ↦
* `[filename+extension].d/rTypes.js`: Structure reader types, but without populated prototypes.
* `[filename+extension].d/rScope.js`: Merge all structure reader types imported by `[filename+extension]`.
* `[filename+extension].d/constants.js`: All of the constants from `[filename+extension]`.
* `[filename+extension].d/readers.js`: Javascript implementation of readers from `[filename+extension]`.
  The types from `[filename+extension].d/rTypes.js` get populated here.
* `[filename+extension].d/bTypes.js`, `[filename+extension].d/bScope.js`, and `[filename+extension].d/builders.js` follow analogous to `[filename+extension].d/rTypes.js`, `[filename+extension].d/rScope.js`, and `[filename+extension].d/readers.js`.

Types
-----
64 bit integral types require more space than Javascript can provide natively, so 64 bit integers are provided as an array of two integers.
