capnp-js
========

Yet another Capnproto implementation for Javascript.
Dust templates provide a more literate codebase than C++ string manipulation.
CommonJS modules with an eye toward Browserifying to UMD:
```
[filename].capnp -> [filename].js
struct [Name] {} \mapsto exports.[Name] = function (bytes) {...};
struct [Name] { struct [Subname] {} } \mapsto exports.[Name].[Subname] = ...
```

I still need a strategy for stubbing out RPC methods.
In C++, Capnproto can provide headers, leaving .cpp files for user construction.
In Javascript, I guess I can stub our `require` calls for nonexisting files, but `js-doc`ed stub methods would be nice as a compiler option.

AMD Use Case
------------
```
define(['capnp-js/frame/multiplex', 'messages/types1', 'messages/types2'],
       function (              mx,            types1,            types2) {
    exports = {};
    var types = types1.table();
    var types.mixin(types2.table());

    exports.deserialize = function (buffer) {
        var header = mx.Header.unwire(buffer);
        var Type = types[header.gid];

        return new Type(header.packet(buffer));
    };
});
```

Javascript Array Buffers
------------------------
Capnproto has 64bit words and pointer offsets of 29bit plus a sign bit.
This yields 64*2^29 = 8*2^32 bits of memory.
I'm handling the sign bit externally to cover the same address space.
Taking the 8*2^32 bits as the upper limit on the size of Capnproto messages, then Javascript's `ArrayBuffer` indexed with 32bit unsigned integers is adequate to contain whatever comes its way.
I don't expect a browser to handle such messages, but it's theoretically capable.

Buffer Immutability
-------------------
Buffers are treated as immutable internally.
All processing returns `Uint8Array` views of the source buffer if possible.
The outlier, booleans, get interpreted to `true` or `false`.

Types
-----
Since Capnproto supports data types that Javascript doesn't support manually, 

Frames
------
Capnproto's standard serialization assumes that the message type is known a priori.
My use cases will require multiplexing, so I've added a global unique id to the frame header for a multiplexing serialization.
Standard serialization is required for compiling, so there's no getting out of that.

Terminology
-----------
1. `buffer` - ArrayBuffer
2. `bytes` - Uint32Array
3. `offset` - Uint32 offset with respect to bytes
