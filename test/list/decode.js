var assert = require('assert');

var when = require('when/node');

var dust = require('dustjs-linkedin');
require('dustjs-helpers');
require('../../decode/helpers');
require('../../decode/precompiled');

function wrap(partial) {
    var schema = { segment : 'data', pointer : 0 };

    return when.lift(dust.render)(partial, schema)
        .then(
            function (body) {
                eval('var result = function (data) { return ' + body + ' }');
                return result;
            }
        );
}

describe('List decoding', function () {
    it('should recognize whether a pointer dereferences to a list', function () {
        wrap('list/is')
            .done(
                function (isList) {
                    var pointer = new Uint8Array(4);
                    pointer[0] = 0;
                    assert(!isList(pointer), 'That was a struct pointer');
                    pointer[0] = 1;
                    assert(isList(pointer), 'That was a list pointer');
                    pointer[0] = 2;
                    assert(!isList(pointer), 'That was an intersegment pointer');
                    pointer[0] = 3;
                    assert(!isList(pointer), 'That was an interface pointer');
                }
            )
        }
    );

    it('should compute offsets without overflowing', function () {
        wrap('list/objectHalfOffset')
            .done(
                function (half) {
                    var start = 0xfffffff8 >>> 0; // Largest word aligned byte offset.
                    var pointer = new Uint8Array(4);
                    var raw = 0x80000007; // 10...111 (trailing two bits of junk).

                    // Encode the hypothetical offset (words).
                    pointer[0] = (raw & 0x000000ff);
                    pointer[1] = (raw & 0x0000ff00) >>> 8;
                    pointer[2] = (raw & 0x00ff0000) >>> 16;
                    pointer[3] = (raw & 0xff000000) >>> 24;

                    // Compute offset (bytes) and convert to words.
                    assert.equal(start + half(pointer) + half(pointer), 0);
                }
            )
        }
    );
});
