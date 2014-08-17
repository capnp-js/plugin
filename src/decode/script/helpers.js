var dust = require('dustjs-linkedin');
var traverse = require('traverse');

dust.helpers.boolMask = function (chunk, ctx, bodies, params) {
    return chunk.write((1 >>> 0) << (params.bitDistance & 0x00000007));
};

dust.helpers.enumerantName = function (chunk, ctx, bodies, params) {
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
