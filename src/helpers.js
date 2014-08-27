var dust = require('dustjs-helpers');

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
    /* {@contains key=.someArrayMember set=.someObject} */
    if (params.key === undefined) { throw new Error('`contains` helper called without a `key` parameter'); }
    if (params.set === undefined) { throw new Error('`contains` helper called without a `set` parameter'); }

    var key = dust.helpers.tap(params.key, chunk, context);
    var set = dust.helpers.tap(params.set, chunk, context);
    var body = bodies.block;

    if (set.indexOf === undefined) { throw new Error('`set` parameter of the `contains` helper must have an `indexOf` method'); }

    if (set.indexOf(key) >= 0) {
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

dust.helpers.constant = function (chunk, context, bodies, params) {
    /* {@constant name="xyzAsdf"/} -> XYZ_ASDF */
    /* Insert '_' before any caps that are not the string's first letter. */
    var text = dust.helpers.tap(params.name, chunk, context);
    var newText = text[0];
    for (var i=1; i<text.length; ++i) {
        if (/[A-Z]/.test(text[i])) {
            newText = newText + '_';
        }
        newText = newText + text[i];
    }

    return chunk.write(newText.toUpperCase());
};

var prependCamel = function (head, camel) {
   return head + camel[0].toUpperCase() + camel.slice(1);
};

dust.helpers.fieldIser = function (chunk, context, bodies, params) {
    /* {@fieldGetter name="xyzAsdf"/} -> getXyzAsdf */
    var text = dust.helpers.tap(params.name, chunk, context);
    return chunk.write(prependCamel('is', text));
};

dust.helpers.fieldGetter = function (chunk, context, bodies, params) {
    /* {@fieldGetter name="xyzAsdf"/} -> getXyzAsdf */
    var text = dust.helpers.tap(params.name, chunk, context);
    return chunk.write(prependCamel('get', text));
};

dust.helpers.fieldHaser = function (chunk, context, bodies, params) {
    /* {@fieldHaser name="xyzAsdf"/} -> hasXyzAsdf */
    var text = dust.helpers.tap(params.name, chunk, context);
    return chunk.write(prependCamel('has', text));
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
