var when = require('when/node');
var dust = require('dustjs-helpers');

// Introduce helpers into the Dust global.
require('./src/template/helpers');

// Introduce reader and its partials into the Dust global.
require('./precompile/reader');

function contextFree(name) {
    return function () {
        return when.lift(dust.render)(name, {});
    };
}

exports.struct = {};
exports.struct.reader = function (schema) {
    return when.lift(dust.render)('struct/reader', schema);
};

exports.list = {};
exports.list.primitive = function (context) {
    return when.lift(dust.render)('list/primitive', context);
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
