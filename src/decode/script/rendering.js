var when = require('when/node');
var dust = require('dustjs-linkedin');

// Add helpers to Dust
require('dustjs-helpers');
require('./helpers');

// Load precompileds (reference to build directory ok, since this module should
// not be used by external requires).
require('./build/precompiled');

exports.list = {};
exports.list.primitive = function (context) {
    return when.lift(dust.render)('list/primitive', context);
};

exports.list.Nested = function (context) {
    return when.lift(dust.render)('list/Nested', context);
};

exports.list.Struct = function (context) {
    return when.lift(dust.render)('list/Struct', context);
};

exports.list.Data = function (context) {
    return when.lift(dust.render)('list/Data', context);
};

exports.list.Text = function (context) {
    return when.lift(dust.render)('list/Text', context);
};

exports.list.AnyPointer = function (context) {
    return when.lift(dust.render)('list/AnyPointer', context);
};
