var dust = require('dustjs-helpers');
var traverse = require('traverse');

dust.helpers.boolOffset = function (chunk, ctx, bodies, params) {
    return chunk.write(params.offset >>> 3);
};

dust.helpers.boolMask = function (chunk, ctx, bodies, params) {
    return chunk.write(params.offset & 0x00000007);
};

dust.helpers.allCapitalize = function (chunk, ctx, bodies, params) {
    /* Insert '_' before any caps that are not the string's first letter. */
    var text = dust.helpers.tap(bodies.block, chunk, ctx);
    var newText = text[0];
    for (var i=1; i<text.length; ++i) {
        if (/[A-Z]/.test(text[i])) {
            newText = newText + '_';
        }
        newText = newText + text[i];
    }

    return chunk.write(newText.toUpperCase());
};

dust.helpers.assert = function (chunk, ctx, bodies, params) {
    var value = dust.helpers.tap(params.value, chunk, ctx);
    var expect = dust.helpers.tap(params.expect, chunk, ctx);
    if (value !== expect) {
        throw new Error('Failed assertion: '+value+' !== '+expect);
    }

    return chunk.write('');
};

dust.helpers.ctThrow = function (chunk, ctx, bodies, params) {
    throw new Error(params.message);
};
