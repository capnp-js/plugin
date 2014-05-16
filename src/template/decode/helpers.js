var dust = require('dustjs-helpers');
var traverse = require('traverse');

var primitives = ['Void', 'Bool', 'Float32', 'Float64',
                  'UInt8', 'UInt16', 'UInt32', 'UInt64',
                   'Int8',  'Int16',  'Int32',  'Int64'];

var specialLists = ['Data', 'Text'];

dust.helpers.listType = function (chunk, ctx, bodies, params) {
    var type = params.elementType;
    var depth = params.depth;

    var listType;
    if (type in primitives) {
        listType = 'List' + type;
    } else if (type in specialLists) {
        listType = type;
    } else if (type === 'AnyPointer') {
        listType = 'ListAnyPointer';
    } else {
        listType = 'structListFactory(' + type + ')';
    }

    if (depth > 0) {
        return chunk.write('nestedListFactory(' + listType + ')');
    } else {
        return chunk.write(listType);
    }
};

dust.helpers.injectLists = function (chunk, ctx, bodies, params) {
    var nodes = params.nodes;
    var requires = [];

    var nestsCount = 0;
    var prependeds = primitives.concat(['AnyPointer']);
    prependeds.forEach(function (p) {
        var count = traverse(nodes).reduce(
            function (acc, node) {
                var isActive = node.type === 'List' && node.elementType === p;
                if (isActive && node.depth > 0) { nestsCount += 1; }
                return isActive ? acc+1 : acc;
            },
            0
        );

        if (count > 0) {
            requires.push("var List"+p+" = require('capnp-js/decode/list/"+p+"');");
        }
    });

    if (nestsCount > 0) {
        requires.push("var nestedListFactory = require('capnp-js/decode/list/nested');");
    }

    var structsCount = traverse(nodes).reduce(
        function (acc, node) {
            if (node.type === 'List' &&
                !(node.elementType in primitives) &&
                !(node.elementType in primitives)) {

                return acc+1;
            } else {
                return acc;
            }
        },
        0
    );

    if (structsCount > 0) {
        requires.push("var structListFactory = require('capnp-js/decode/list/struct');");
    }

    specialLists.forEach(function (s) {
        var count = traverse(nodes).reduce(
            function (acc, node) {
                var isActive = node.type === s;
                return isActive ? acc+1 : acc;
            },
            0
        );

        if (count > 0) {
            requires.push("var "+s+" = require('capnp-js/decode/list/"+s+"');");
        }
    });

    return chunk.write(requires.join('\n'));
};

var finals = ['AnyPointer'];
dust.helpers.injectFinals = function (chunk, ctx, bodies, params) {
    var nodes = params.nodes;
    var type = params.type;
    var requires = [];

    finals.forEach(function (b) {
        var count = traverse(nodes).reduce(
            function (acc, node) {
                var isActive = node.type === b;
                return isActive ? acc+1 : acc;
            },
            0
        );

        if (count > 0) {
            requires.push("var "+b+" = require('capnp-js/decode/base/"+b+"');");
        }
    });

    return chunk.write(requires.join('\n'));
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
        case 'UInt8':
            if (skip) {
                return chunk.write("(("+offset+") + "+skip+")");
            }
            return chunk.write("("+offset+")");
        case 'Int16':
        case 'UInt16':
            return chunk.write(expression(2, offset, skip));
        case 'Int32':
        case 'UInt32':
        case 'Float32':
            return chunk.write(expression(4, offset, skip));
        case 'Int64':
        case 'UInt64':
        case 'Float64':
            return chunk.write(expression(8, offset, skip));
        case 'AnyPointer':
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
        case 'UInt8':
            return chunk.write(offset + skip);
        case 'Int16':
        case 'UInt16':
            return chunk.write(2*offset + skip);
        case 'Int32':
        case 'UInt32':
        case 'Float32':
            return chunk.write(4*offset + skip);
        case 'Int64':
        case 'UInt64':
        case 'Float64':
            return chunk.write(8*offset + skip);
        case 'AnyPointer':
            return chunk.write(expression(8*offset + skip));
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

dust.helpers.injectFloatConversion = function (chunk, ctx, bodies, params) {
    var nodes = params.nodes;
    var actives = [];
    ['Float32', 'Float64'].forEach(function (p) {
        var count = traverse(nodes).reduce(
            function (acc, node) {
                var isActive = node.type === p;
                return isActive ? acc+1 : acc;
            },
            0
        );

        if (count > 0) {
            actives.push(p);
        }
    });

    return chunk.write(actives.map(function (active) {
        return "var decode"+active+" = require('capnp-js/decode/decoder/"+active+"');";
    }).join('\n'));
};

dust.helpers.boolMask = function (chunk, ctx, bodies, params) {
    return chunk.write((1 >>> 0) << (params.bitDistance & 0x00000007));
};

dust.helpers.lsB = function (chunk, ctx, bodies, params) {
    return chunk.write(8*params.word);
};
