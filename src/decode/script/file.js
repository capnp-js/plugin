var when = require('when/node');
var dust = require('dustjs-helpers');

// Add helpers to Dust
require('./helpers');

// Load precompiled templates.
require('./templates');

module.exports = function (schema) {
    return when.lift(dust.render)('file', schema);
};
