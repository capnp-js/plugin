var when = require('when/node');
var dust = require('dustjs-helpers');

// Populate the Dust global.
require('./precompiled');
require('./helpers');

module.exports = function (schema) {
    return when.lift(dust.render)('file', schema);
};
