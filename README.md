capnp-js-plugin
===============

Generate Javascript serialization classes for [Capnproto](http://kentonv.github.io/capnproto/index.html).

# Installation
* This plugin requires `capnp` (see the Capnproto [installation page](http://kentonv.github.io/capnproto/install.html)).
* Install the plugin: `npm install capnp-js-plugin`.
  I don't want root access to anybody's system, so please refrain from `npm install -g capnp-js-plugin` unless you have your system set up to sandbox such installs.

# Usage
The compiler is invoked with `capnp compile -ojs someSchema.capnp` to generate a `someSchema.capnp.d` directory containing the schema's AMD files.
Run `capnp help compile` for additional options.
Under the recommended installation, `npm install capnp-js-plugin`, the compiler will need a path hint to find the plugin, e.g.

```
PATH=$PATH:node_modules/.bin capnp compile -ojs someSchema.capnp
```

Thankfully, `npm run compileMySchema` will perform this path manipulation before executing the `compileMySchema` script from `package.json`.
See this [compileMySchema script](https://github.com/popham/rtc-github-protocol/blob/master/package.json#L7) for an example.

To obtain Node modules, I use [Nodefy](https://github.com/millermedeiros/nodefy/) (see this [nodefy script](https://github.com/popham/rtc-github-protocol/blob/master/package.json#L8) for an example).
I suspect that [AMDefine](https://github.com/jrburke/amdefine) provides an alternate solution, but until I personally abandon Nodefy for AMDefine, I won't chase any upstream bugs.

# Serialization Classes
This plugin generates serialization classes that imitate those of the [c++ reference implementation](http://kentonv.github.io/capnproto/cxx.html#types).
Given a schema `someSchema.capnp`, `capnp compile -ojs someSchema.capnp` will generate `someSchema.capnp.d/readers`, `someSchema.capnp.d/builders`, and some internal files:
* `someSchema.capnp.d/readers.js`:
  Javascript implementation of readers from `someSchema.capnp`.
  See [Readers](http://kentonv.github.io/capnproto/cxx.html#structs) from the reference implementation documentation.
* `someSchema.capnp.d/builders.js`:
  Javascript implementation of builders from `someSchema.capnp`.
  See [Builders](http://kentonv.github.io/capnproto/cxx.html#structs) from the reference implementation documentation.
* `someSchema.capnp.d/rTypes.js`:
  Not for importing.
  Structure reader types defined in `someSchema.capnp`, but without populated prototypes.
  This file exists to facilitate circular reference resolution in AMD loaders and Node.
* `someSchema.capnp.d/bTypes.js`: Analogous to `rTypes.js`.
* `someSchema.capnp.d/rScope.js`:
  Not for importing.
  Merge all structure reader types imported by `someSchema.capnp` with those from `rTypes.js`.
  None of the types have populated prototypes yet.
  This file exists to facilitate circular reference resolution in AMD loaders and Node.
* `someSchema.capnp.d/bScope.js`: Analogous to `rScope.js`.
* `someSchema.capnp.d/constants.js`:
  All of the constants from `someSchema.capnp`, accessible by internal identifier (not name).
  None of the structure types have populated prototypes yet.
  This file exists to facilitate circular reference resolution in AMD loaders and Node.

# Absolute Imports
See the [messaging example](https://github.com/popham/rtc-github/tree/gh-pages/example/messages/) from my [rtc-github](https://github.com/popham/rtc-github/) repository.
The [capnp/server.capnp](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp) schema lists an absolute import: `using import "/rtc-github-protocol/user.capnp".User;`.
The Javascript plugin maps absolute imports to absolute AMD paths, so the [package](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/package.json)'s `capnp compile -ojs -I ./node_modules/ capnp/*.capnp` yields [capnp/server.capnp.d/readers.js](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp.d/readers.js#L1), amongst others.
So now I just need to point my AMD loader at `rtc-github-protocol`, e.g. [index.htm](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/index.htm#L17).

So why the `/rtc-github-protocol` prefix?
Why not `using import "/user.capnp".User;`, `capnp compile -ojs -I ./node_modules/rtc-github-protocol/ capnp/*.capnp`, and then provide a `user.capnp.d` path to the AMD loader?
Nodefy doesn't remap absolute names.
If I need to use [capnp/server.capnp](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp) in a Node module, then every absolute path's root will need a corresponding entry under `node_modules/`.
This is no big deal if you're using `npm link` for these modules, but if you want to distribute under `registry.npmjs.org` (and don't want dependencies that point at git repositories), then publishing `user.capnp.d` seems wrong.
The schemas under `/rtc-github-protocol` are used by a [RTC signaling server](https://github.com/popham/rtc-github/blob/master/lib/server.js) that will probably appear on `npm`'s official public registry someday, hence the `/rtc-github-protocol` prefix.
