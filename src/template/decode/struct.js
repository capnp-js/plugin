var when = require('when/node');
var dust = require('dustjs-helpers');

// Populate the Dust global.
require('./build/precompiled');
require('./helpers');

exports.struct = function (schema) {
    return when.lift(dust.render)('struct/reader', schema);
};
