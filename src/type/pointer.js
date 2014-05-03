exports.List = function List(pointer, tail) {};

exports.Struct = function Struct(pointer, tail) {};

exports.InterSegment = function InterSegment(pointer, tail) {};

exports.Capability = function Capability(pointer, tail) {};

var p = {
    0 : Struct,
    1 : List,
    2 : InterSegment,
    3 : Capability
};

exports.AnyPointer = function AnyPointer(pointer, tail) {
    var Pointer = p[(0xC0000000 & p) >>> 30];
    return new Pointer(pointer, bytes);
};
