var when = require('when/node');
var dust = require('capnp-js-plugin-dust');

// Load precompiled templates.
require('./bTemplates');
require('./sharedTemplates');

module.exports = function (context) {
    return when.lift(dust.render)('builders', context);
};
