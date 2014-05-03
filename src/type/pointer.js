exports.List = function List(bytes) {};

exports.Struct = function Struct(bytes) {};

exports.InterSegment = function InterSegment(bytes) {};

exports.Capability = function Capability(bytes) {};

var p = {
    0 : Struct,
    1 : List,
    2 : InterSegment,
    3 : Capability
};

exports.AnyPointer = function AnyPointer(bytes) {
    var Pointer = p[bytes[0] & 0x00000003];
    return new Pointer(bytes);
};
