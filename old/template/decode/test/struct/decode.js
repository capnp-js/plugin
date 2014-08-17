var assert = require('assert');

var when = require('when/node');

var dust = require('dustjs-linkedin');
require('dustjs-helpers');
require('../../build/helpers');
require('../../build/precompiled');

function wrap(partial) {
    var schema = { segment : 'data', pointer : 0 };

    return when.lift(dust.render)(partial, schema)
        .then(
            function (body) {
                /*jshint evil:true */
                eval('var result = function (data) { return ' + body + ' }');
                return result;
            }
        );
}

describe('Struct decoding', function () {
    it('should recognize whether a pointer dereferences to a struct', function () {
        wrap('struct/is')
            .done(
                function (isStruct) {
                    var pointer = new Uint8Array(8);
                    pointer[0] = 0;
                    assert(isStruct(pointer));
                    pointer[0] = 1;
                    assert(!isStruct(pointer), 'That was a list pointer');
                    pointer[0] = 2;
                    assert(!isStruct(pointer), 'That was an intersegment pointer');
                    pointer[0] = 3;
                    assert(!isStruct(pointer), 'That was an interface pointer');
                }
            );
        }
    );
});
