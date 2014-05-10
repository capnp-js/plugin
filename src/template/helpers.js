var dust = require('dustjs-linkedin');

dust.helpers.byteOffset = function (chunk, ctx, bodies, params) {
    var skip = params.skip === undefined ? 0 : params.skip;
    var offset = params.offset;
    var type = params.type;

    switch (type) {
    case 'Void':
        return chunk.write(0 + skip);
    case 'Bool':
        return chunk.write(Math.floor(offset / 8) + skip);
    case 'Int8':
        return chunk.write(offset + skip);
    case 'Int16':
        return chunk.write(2*offset + skip);
    case 'Int32':
        return chunk.write(4*offset + skip);
    case 'Int64':
        return chunk.write(8*offset + skip);
    case 'UInt8':
        return chunk.write(offset + skip);
    case 'UInt16':
        return chunk.write(2*offset + skip);
    case 'UInt32':
        return chunk.write(4*offset + skip);
    case 'UInt64':
        return chunk.write(8*offset + skip);
    default:
        throw new Error('byteOffset of unmanaged type');
    }
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

dust.helpers.pointer = {};

dust.helpers.pointer.STRUCT = function (chunk, ctx, bodies, params) {
    return 0x00000000;
};

dust.helpers.pointer.LIST = function (chunk, ctx, bodies, params) {
    return 0x00000001;
};

dust.helpers.pointer.INTER_SEGMENT = function (chunk, ctx, bodies, params) {
    return 0x00000002;
};

dust.helpers.pointer.CAPABILITY = function (chunk, ctx, bodies, params) {
    return 0x00000003;
};

dust.helpers.pointer.type = function (chunk, ctx, bodies, params) {
    return params.segment[params.p] & 0x00000003;
};
