var types = require('types');

exports.byteOffset = function (chunk, ctx, bodies, params) {
    return (params.capnpSlot.type.bits >>> 3) * params.capnpSlot.offset;
};

exports.byteCount = function (chunk, ctx, bodies, params) {
    return params.capnpType.bits >>> 3;
};

exports.boolMask = function (chunk, ctx, bodies, params) {
    return 1 << (params.bitDistance % 8);
};
