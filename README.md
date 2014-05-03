capnp-js
========

Yet another Capnproto implementation for Javascript.
Handlebars templates provide a more literate codebase than C++ string manipulation.
CommonJS modules with an eye toward Browserifying to UMD:
```
[filename].capnp -> [filename].js
struct [Name] \mapsto export.[Name] = function (bytes) {...};
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
