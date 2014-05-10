var node = require('when/node');
var dust = require('dustjs-helpers');

// Introduce helpers into the Dust global.
require('./template/helpers');

// Introduce reader and its partials into the Dust global.
require('./precompile/reader');

exports.Struct = require('./src/base/struct');
exports.Struct.reader = function (schema) {
    var base = dust.makeBase(schema);
    return node.lift(dust.render)('struct/reader', base);
};
