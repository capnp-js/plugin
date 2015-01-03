capnp-js-plugin [![Build Status](https://travis-ci.org/popham/capnp-js-plugin.svg?branch=master)](https://travis-ci.org/popham/capnp-js-plugin)
===============================================================================================================================================

Generate Javascript serialization classes for [Capnproto](http://kentonv.github.io/capnproto/index.html).

Installation and preferred use
* Install by npm: `npm install capnp-js-plugin`.
* This plugin checks out and then builds the Capnproto compiler.
  - The build takes about 5 minutes on my system, so I use a global install: `npm install -g capnp-js-plugin`.
  - For each project that uses a Capnproto schema, I include the plugin as a `devDependency`: `npm install --save-dev capnp-js-plugin`.
  - I avoid including the plugin as a `dependency`, because this would result in absurdly long build times for non-dev users.
  - Under this arrangement, I must distribute generated-code instead of creating it client-side--I feel that the build time-savings warrants the source-of-truth confusion.

Usage
* The compiler is invoked with `capnp compile -ojs someSchema.capnp` to generate a `someSchema.capnp.d` directory that contains the schema's AMD files.
* Run `capnp help compile` for additional options.
* To obtain Node modules, I convert the generated AMD modules with a fork of [Nodefy](https://github.com/millermedeiros/nodefy) called [Nfy](https://github.com/popham/nodefy).
  See this [nfy script](https://github.com/popham/rtc-github-protocol/blob/master/package.json#L8) for an example.
  I suspect that [AMDefine](https://github.com/jrburke/amdefine) provides an alternate solution, but I won't chase any upstream bugs related to the use of AMDefine.

# Serialization Classes
This plugin generates serialization classes similar to those of the [c++ reference implementation](http://kentonv.github.io/capnproto/cxx.html#types).
Given a schema *someSchema.capnp*, `capnp compile -ojs someSchema.capnp` will generate *someSchema.capnp.d/readers.js*, *someSchema.capnp.d/builders.js*, and some internal files:

## Readers (*someSchema.capnp.d/readers.js*)
Javascript implementation of readers for members of *someSchema.capnp*.
See [Readers](http://kentonv.github.io/capnproto/cxx.html#structs) from the reference implementation's documentation.

## Builders (*someSchema.capnp.d/builders.js*)
Javascript implementation of builders for members of *someSchema.capnp*.
See [Builders](http://kentonv.github.io/capnproto/cxx.html#structs) from the reference implementation's documentation.

## Internal Files
The following files exist under *someSchema.capnp.d/*, but should not be imported by user code.
These files facilitate circular reference resolution by creating types and accumulating them, without calling any prototype methods.
* **someSchema.capnp.d/rTypes.js**: Reader types defined in *someSchema.capnp*.
* **someSchema.capnp.d/rScope.js**: Merge all Reader types imported by *someSchema.capnp* with those created within *someSchema.capnp*.
* **someSchema.capnp.d/bTypes.js**: Analogous to *rTypes.js*.
* **someSchema.capnp.d/bScope.js**: Analogous to *rScope.js*.

# Absolute Imports
The Javascript plugin maps absolute imports to absolute AMD paths.
Consider the [messaging example](https://github.com/popham/rtc-github/tree/gh-pages/example/messages/) from the [rtc-github](https://github.com/popham/rtc-github/) repository:
* Its [capnp/server.capnp](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp) schema lists an absolute import: `using import "/rtc-github-protocol/user.capnp".User;`.
* The package's [rtc-github-protocol dependency](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/package.json#L17) exposes the *user.capnp* schema as *node_modules/rtc-github-protocol/user.capnp*.
* The package's [capnp script](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/package.json#L8), `capnp compile -ojs -I node_modules/ capnp/*.capnp`, yields an absolute path in [capnp/server.capnp.d/readers.js](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp.d/readers.js#L1), amongst others.
* Now I just need to point my AMD loader at *rtc-github-protocol*, e.g. [index.htm](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/index.htm#L17).

So why the */rtc-github-protocol* prefix?
Why not `using import "/user.capnp".User;`, `capnp compile -ojs -I ./node_modules/rtc-github-protocol/ capnp/*.capnp`, and then provide a *user.capnp.d* path to the AMD loader?
Nfy doesn't remap absolute names.
If I need to use [capnp/server.capnp](https://github.com/popham/rtc-github/blob/gh-pages/example/messages/capnp/server.capnp) in a Node module, then every absolute path's root will need a corresponding entry under *node_modules/*.
This is no big deal if you're using `npm link` for these modules, but if you want to distribute under `npm`'s official public registry (and don't want dependencies that point at git repositories), then publishing *user.capnp.d* seems wrong.
The schemas under */rtc-github-protocol* are used by an [RTC signaling server](https://github.com/popham/rtc-github/blob/master/lib/server.js) that will probably appear on `npm`'s official public registry someday, hence the */rtc-github-protocol* prefix.

# Production Builds
You should minify the generated code for production builds.
The generated code contains `console.warn` calls for development purposes--use something like `uglifyjs -c drop_console` to eliminate them.
