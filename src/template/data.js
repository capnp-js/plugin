exports.byteOffset = function (chunk, ctx, bodies, params) {
    var base = params.skip ? parseInt(params.skip) : 0;
    return (params.capnpSlot.type.bits >>> 3) * params.capnpSlot.offset;
};

exports.byteCount = function (chunk, ctx, bodies, params) {
    return params.capnpType.bits >>> 3;
};

exports.boolMask = function (chunk, ctx, bodies, params) {
    return (1 >>> 0) << (params.bitDistance & 0x00000007);
};

// Little endian least significant byte.
exports.lsB = function (chunk, ctx, bodies, params) {
    return 8*params.word;
};
