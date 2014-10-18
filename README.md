capnp-js-plugin
===============

Generate Javascript serialization classes for [Capnproto](http://kentonv.github.io/capnproto/index.html).

# Installation
* This plugin requires `capnp` (see the Capnproto [installation page](http://kentonv.github.io/capnproto/install.html)).
* Install the plugin: `npm install capnp-js-plugin`.
  I don't want root access to anybody's system, so please refrain from `npm install -g capnp-js-plugin` unless you have your system set up to sandbox such installs.

# Usage
* The compiler is invoked with `capnp compile -ojs someSchema.capnp` to generate a `someSchema.capnp.d` directory containing the schema's AMD files.
* Run `capnp help compile` for additional options.
* Under the recommended installation, `npm install capnp-js-plugin`, the compiler will need a path hint to find the plugin, e.g. `PATH=$PATH:node_modules/.bin/ capnp compile -ojs someSchema.capnp`.
  Thankfully, `npm run compileMySchema` will perform this path manipulation before executing the *compileMySchema* script from *package.json*.
  See this [compileMySchema script](https://github.com/popham/rtc-github-protocol/blob/master/package.json#L7) for an example.

* To obtain Node modules, I use [Nodefy](https://github.com/millermedeiros/nodefy) (see this [nodefy script](https://github.com/popham/rtc-github-protocol/blob/master/package.json#L8) for an example).
  I suspect that [AMDefine](https://github.com/jrburke/amdefine) provides an alternate solution, but until I personally abandon Nodefy for AMDefine, I won't chase any upstream bugs related to the use of AMDefine.

# Serialization Classes
This plugin generates serialization classes that very similar to those of the [c++ reference implementation](http://kentonv.github.io/capnproto/cxx.html#types).
Given a schema *someSchema.capnp*, `capnp compile -ojs someSchema.capnp` will generate *someSchema.capnp.d/readers*, *someSchema.capnp.d/builders*, and some internal files:

## Readers (*someSchema.capnp.d/readers.js*)
Javascript implementation of structure readers from *someSchema.capnp* plus any constants and enumerations.
See [Readers](http://kentonv.github.io/capnproto/cxx.html#structs) from the reference implementation documentation.

## Builders (*someSchema.capnp.d/builders.js*)
Javascript implementation of structure builders from *someSchema.capnp* plus any constants and enumerations.
See [Builders](http://kentonv.github.io/capnproto/cxx.html#structs) from the reference implementation documentation.

## Internal Files
The following files exist under *someSchema.capnp.d/*, but should not be imported by user code.
These files facilitate circular reference resolution by creating types and accumulating them, without calling any prototype methods.
* **someSchema.capnp.d/rTypes.js**: Structure reader types defined in *someSchema.capnp*.
* **someSchema.capnp.d/rScope.js**: Merge all structure reader types imported by *someSchema.capnp* with those created within *someSchema.capnp*.
* **someSchema.capnp.d/constants.js**: All of the constants from *someSchema.capnp*, accessible by internal identifier (not name).
* **someSchema.capnp.d/bTypes.js**: Analogous to *rTypes.js*.
* **someSchema.capnp.d/bScope.js**: Analogous to *rScope.js*.

# Absolute Imports
The Javascript plugin maps absolute imports to absolute AMD paths.
Consider the [messaging example](https://github.com/popham/rtc-github/tree/gh-pages/example/messages/) from my [rtc-github](https://github.com/popham/rtc-github/) repository:
* Its [capnp/server.capnp](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp) schema lists an absolute import: `using import "/rtc-github-protocol/user.capnp".User;`.
* The package's [rtc-github-protocol dependency](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/package.json#L17) exposes the *user.capnp* schema as *node_modules/rtc-github-protocol/user.capnp*.
* The package's [capnp script](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/package.json*L8), `capnp compile -ojs -I node_modules/ capnp/*.capnp`, yields an absolute path in [capnp/server.capnp.d/readers.js](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp.d/readers.js#L1), amongst others.
* Now I just need to point my AMD loader at *rtc-github-protocol*, e.g. [index.htm](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/index.htm#L17).

So why the */rtc-github-protocol* prefix?
Why not `using import "/user.capnp".User;`, `capnp compile -ojs -I ./node_modules/rtc-github-protocol/ capnp/*.capnp`, and then provide a *user.capnp.d* path to the AMD loader?
Nodefy doesn't remap absolute names.
If I need to use [capnp/server.capnp](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp) in a Node module, then every absolute path's root will need a corresponding entry under *node_modules/*.
This is no big deal if you're using `npm link` for these modules, but if you want to distribute under `npm`'s official public registry (and don't want dependencies that point at git repositories), then publishing *user.capnp.d* seems wrong.
The schemas under `/rtc-github-protocol` are used by a [RTC signaling server](https://github.com/popham/rtc-github/blob/master/lib/server.js) that will probably appear on `npm`'s official public registry someday, hence the */rtc-github-protocol* prefix.
