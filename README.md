capnp-js
========

Yet another Capnproto implementation for Javascript.
Handlebars templates provide a more literate codebase than C++ string manipulation.
CommonJS modules with an eye toward Browserifying to UMD:
```
[filename].capnp -> [filename].js
struct [Name] {} \mapsto exports.[Name] = function (bytes) {...};
struct [Name] { struct [Mame] {} } \mapsto exports.[Name].[Mame] = ...
```

I still need a strategy for stubbing out RPC methods.
In C++, Capnproto can provide headers, leaving .cpp files for user construction.
In Javascript, I guess I can stub our `require` calls for nonexisting files, but `js-doc` stub methods would be nice as a compiler option.

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

32bit Words
-----------
CapnProto has 64bit words and pointer offsets of 29bit or 30bit.
This yields 64*2^29 = 32*2^30 or 64*2^30 = 32*2^31 bits of memory.
Using Javascript's 32bit integers for words and offsets of 32bit integers, I get 32*2^32 bits of memory.
Just a simple `pointer <<= 1` converts a Capnproto pointer to a pointer compatible with the alternative wordspace.

Buffer Immutability
-------------------
Buffers are treated as immutable internally.
All processing returns `Uint8Array` views of the source buffer if possible.
Any byte-misaligned data gets aligned into a new buffer.

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
1. Buffer - ArrayBuffer
2. Bytes - Uint8Array
