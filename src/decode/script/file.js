var when = require('when/node');
var dust = require('dustjs-linkedin');

// Add helpers to Dust
require('dustjs-helpers');
require('./helpers');

// Load precompiled templates.
require('./templates');

module.exports = function (schema) {
    return when.lift(dust.render)('file', schema);
};
