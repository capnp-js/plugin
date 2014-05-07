var dust = require('dustjs-linkedin');

dust.helpers.byteOffset = function (chunk, ctx, bodies, params) {
    var base = params.skip ? parseInt(params.skip) : 0;
    return (params.capnpSlot.type.bits >>> 3) * params.capnpSlot.offset;
};

dust.helpers.byteCount = function (chunk, ctx, bodies, params) {
    return params.capnpType.bits >>> 3;
};

dust.helpers.boolMask = function (chunk, ctx, bodies, params) {
    return (1 >>> 0) << (params.bitDistance & 0x00000007);
};

// Little endian least significant byte.
dust.helpers.lsB = function (chunk, ctx, bodies, params) {
    return 8*params.word;
};
