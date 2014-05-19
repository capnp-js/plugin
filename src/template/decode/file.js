var when = require('when/node');
var dust = require('dustjs-linkedin');

// Add helpers to Dust
require('dustjs-helpers');
require('dustmotes-provide');
require('./helpers');

// Load precompileds.
require('./precompiled');

module.exports = function (schema) {
    return when.lift(dust.render)('file', schema);
};
