capnp-js
========

Yet another Capnproto implementation for Javascript.
Dust templates provide a more literate codebase than C++ string manipulation.

#CommonJS Modules
I want to support AMD by browserify, hence the use of browser types instead of node stuff.
I'm thinking to compartmentalize like so:
```
[filename].capnp -> [filename].js
struct [Name] {} \mapsto exports.[Name] = function (bytes) {...};
struct [Name] { struct [Sub] {} } \mapsto exports.[Name].[Sub] = ...
```

AMD Use Case
------------
```
define(['rpc/peep'], function (Peep) {
    exports = {};

    exports.peep = function (meta) {
        var stream = fn(meta);
        return peep = new Peep(stream);
    };
});
```

Since full messages are required for reliable reading, the interface that `Peep` consumes can be relatively simple.
I like the prospect of exposing the RPC methods by [js-signals](http://millermedeiros.github.io/js-signals/).
API docs can get generated as markdown for rendering by whatever.


Javascript Array Buffers
------------------------
Capnproto has 64bit words and pointer offsets of 29bit plus a sign bit.
This yields 64*2^29 = 8*2^32 bits of memory.
I'm handling the sign bit externally to cover the same address space.
Taking the 8*2^32 bits as the upper limit on the size of Capnproto messages, then Javascript's `ArrayBuffer` indexed with 32bit unsigned integers is adequate to contain whatever comes its way.
I don't expect a browser to handle such messages, but it's theoretically capable.

Types
-----
64bit integral types require more space than Javascript can provide natively, so some alternative will be needed.
As of this writing, 64bit integers are returned as an array of two integers.
I considered providing the raw data, but endian interpretation tipped the balance toward the current strategy.
