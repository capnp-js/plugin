var dust = require('dustjs-helpers');
var traverse = require('traverse');

dust.helpers.boolOffset = function (chunk, context, bodies, params) {
    return chunk.write(params.offset >>> 3);
};

dust.helpers.boolMask = function (chunk, context, bodies, params) {
    return chunk.write(params.offset & 0x00000007);
};

dust.helpers.join = function (chunk, context, bodies, params) {
    /* {@join array=.someArrayKey interpolator=","/} */
    if (params.array === undefined) { throw new Error('`join` helper called without an `array` parameter'); }
    if (params.interpolator === undefined) { throw new Error('`join` helper called without an `interpolator` parameter'); }

    var interpolator = "" + dust.helpers.tap(params.interpolator, chunk, context); /* Coerce to string type */
    var arr = dust.helpers.tap(params.array, chunk, context);

    if (arr.join === undefined) { throw new Error('`array` parameter of the `join` helper must have a `join` method'); }

    return chunk.write(arr.join(interpolator));
};

dust.helpers.contains = function (chunk, context, bodies, params) {
    /* {@contains key=.someArrayMember hash=.someObject} */
    if (params.key === undefined) { throw new Error('`contains` helper called without a `key` parameter'); }
    if (params.hash === undefined) { throw new Error('`contains` helper called without a `hash` parameter'); }

    var key = dust.helpers.tap(params.key, chunk, context);
    var hash = dust.helpers.tap(params.hash, chunk, context);
    var body = bodies.block;

    if (hash[key]) {
        if (body) {
            return chunk.render(body, context);
        } else {
            throw new Error('No body block was provided to the `contains` helper');
        }
    } else if (bodies['else']) {
        return chunk.render(bodies['else'], context);
    }

    return chunk;
};

dust.helpers.lookup = function (chunk, context, bodies, params) {
    /* {@lookup key=.someKeyIntoHash hash=.someHash/} */
    if (params.key === undefined) { throw new Error('`lookup` helper called without a `key` parameter'); }
    if (params.hash === undefined) { throw new Error('`lookup` helper called without a `hash` parameter'); }

    var key = dust.helpers.tap(params.key, chunk, context);
    var hash = dust.helpers.tap(params.hash, chunk, context);

    if (!(key in hash)) { throw new Error('`lookup` was unable to find the sought key'); }

    return chunk.write(hash[key]);
};

dust.helpers.allCapitalize = function (chunk, context, bodies, params) {
    /* Insert '_' before any caps that are not the string's first letter. */
    var text = dust.helpers.tap(bodies.block, chunk, context);
    var newText = text[0];
    for (var i=1; i<text.length; ++i) {
        if (/[A-Z]/.test(text[i])) {
            newText = newText + '_';
        }
        newText = newText + text[i];
    }

    return chunk.write(newText.toUpperCase());
};

dust.helpers.assert = function (chunk, context, bodies, params) {
    var value = dust.helpers.tap(params.value, chunk, context);
    var expect = dust.helpers.tap(params.expect, chunk, context);
    if (value !== expect) {
        throw new Error('Failed assertion: '+value+' !== '+expect);
    }

    return chunk.write('');
};

dust.helpers.ctThrow = function (chunk, context, bodies, params) {
    throw new Error(params.message);
};
