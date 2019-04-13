# Installation
  [Install](https://capnproto.org/install.html) the Cap'n Proto compiler.
  Install the plugin locally:

  ```npm install --save-dev @capnp-js/plugin```

# Use
  Under a local installation the plugin will not be part of your path, but npm scripts will add the locally installed plugin to your path during execution.
  Invoke the Cap'n Proto compiler within your `package.json` file's scripts.
  Typically this looks like `"compile": "capnp compile -o flow-js ..."`.
