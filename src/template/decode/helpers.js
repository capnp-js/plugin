var dust = require('dustjs-linkedin');
var traverse = require('traverse');

dust.helpers.injectLists = function (chunk, ctx, bodies, params) {
    var nodes = params.nodes;
    var primitives = ['Void', 'Bool', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'Int8', 'Int16', 'Int32', 'Int64', 'Float32', 'Float64'];
    var actives = [];
    for (p in primitives) {
        var count = traverse(nodes).reduce(function count(acc, node) {
            var isActive = node['type'] === 'List' && node['elementType'] === p;
            return isActive ? acc+1 : acc;
        }, 0);

        if (count > 0) {
            actives.push(p)
        }
    }

    return chunk.write(actives.map(function (active) {
        return "var List"+active+" = require('capnp-js/build/List"+active+"');";
    }).join('\n'));
};

dust.helpers.injectBuiltType = function (chunk, ctx, bodies, params) {
    var nodes = params.nodes;
    var type = params.type;

    var count = traverse(nodes).reduce(function count(acc, node) {
        return node['type'] === type ? acc+1 : acc;
    }, 0);

    if (count > 0) {
        return chunk.write("var "+type+" = require('capnp-js/build/"+type+"');");
    } else {
        return chunk.write('');
    }
};

dust.helpers.byteOffset = function (chunk, ctx, bodies, params) {
    var skip = params.skip === undefined ? 0 : params.skip; // Numeric only
    var offset = params.offset === undefined ? 0 : params.offset; // Numeric if undefined
    var type = params.type;

    if (typeof offset === 'string') {
        switch (type) {
        case 'Void':
            return chunk.write(0 + skip);
        case 'Bool':
            if (skip) {
                return chunk.write("((("+offset+") >>> 3) + "+skip+")");
            } else {
                return chunk.write("(("+offset+") >>> 3)");
            }
        case 'Int8':
            if (skip) {
                return chunk.write("(("+offset+") + "+skip+")");
            } else {
                return chunk.write("("+offset+")");
            }
        case 'Int16':
            return expression(2, offset, skip);
        case 'Int32':
            return expression(4, offset, skip);
        case 'Int64':
            return expression(8, offset, skip);
        case 'UInt8':
            if (skip) {
                return chunk.write("(("+offset+") + "+skip+")");
            } else {
                return chunk.write("("+offset+")");
            }
        case 'UInt16':
            return expression(2, offset, skip);
        case 'UInt32':
            return expression(4, offset, skip);
        case 'UInt64':
            return expression(8, offset, skip);
        default:
            throw new Error('byteOffset of unmanaged type');
        }
    } else {
        switch (type) {
        case 'Void':
            return chunk.write(0 + skip);
        case 'Bool':
            return chunk.write((offset >>> 3) + skip);
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
    }

    function expression(stride, offset, skip) {
        if (skip === 0) {
            return "("+stride+"*("+offset+"))";
        } else {
            return "("+stride+"*("+offset+") + "+skip+")";
        }
    }
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

