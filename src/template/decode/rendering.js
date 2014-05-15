var when = require('when/node');
var dust = require('dustjs-helpers');

// Populate the Dust global.
require('./build/precompiled');
require('./helpers');

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
