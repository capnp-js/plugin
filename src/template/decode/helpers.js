var dust = require('dustjs-helpers');
var traverse = require('traverse');

dust.helpers.injectLists = function (chunk, ctx, bodies, params) {
    var nodes = params.nodes;
    var primitives = ['Void', 'Bool', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'Int8', 'Int16', 'Int32', 'Int64', 'Float32', 'Float64'];
    var actives = [];
    primitives.forEach(function (p) {
        var count = traverse(nodes).reduce(
            function (acc, node) {
                var isActive = node.type === 'List' && node.elementType === p;
                return isActive ? acc+1 : acc;
            },
            0
        );

        if (count > 0) {
            actives.push(p);
        }
    });

    return chunk.write(actives.map(function (active) {
        return "var List"+active+" = require('capnp-js/decode/list/"+active+"');";
    }).join('\n'));
};

dust.helpers.injectBuiltType = function (chunk, ctx, bodies, params) {
    var nodes = params.nodes;
    var type = params.type;

    var count = traverse(nodes).reduce(function count(acc, node) {
        return node.type === type ? acc+1 : acc;
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
            }
            return chunk.write("(("+offset+") >>> 3)");
        case 'Int8':
            if (skip) {
                return chunk.write("(("+offset+") + "+skip+")");
            }
            return chunk.write("("+offset+")");
        case 'Int16':
            return chunk.write(expression(2, offset, skip));
        case 'Int32':
            return chunk.write(expression(4, offset, skip));
        case 'Int64':
            return chunk.write(expression(8, offset, skip));
        case 'UInt8':
            if (skip) {
                return chunk.write("(("+offset+") + "+skip+")");
            }
            return chunk.write("("+offset+")");
        case 'UInt16':
            return chunk.write(expression(2, offset, skip));
        case 'UInt32':
            return chunk.write(expression(4, offset, skip));
        case 'UInt64':
            return chunk.write(expression(8, offset, skip));
        default:
            throw new TypeError('byteOffset of unmanaged type: ' + type);
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
            throw new TypeError('byteOffset of unmanaged type: ' + type);
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
    return chunk.write((1 >>> 0) << (params.bitDistance & 0x00000007));
};

dust.helpers.lsB = function (chunk, ctx, bodies, params) {
    return chunk.write(8*params.word);
};
