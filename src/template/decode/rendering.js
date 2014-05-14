var when = require('when/node');
var dust = require('dustjs-helpers');

// Introduce helpers into the Dust global.
require('./helpers');

function contextFree(name) {
    return function () {
        return when.lift(dust.render)(name, {});
    };
}

function loadPartials() {
    require('./build/precompiled');
}

exports.struct = {};
exports.struct.reader = function (schema) {
    loadPartials();
    return when.lift(dust.render)('struct/reader', schema);
};

exports.list = {};
exports.list.primitive = function (context) {
    loadPartials();
    return when.lift(dust.render)('list/primitive', context);
};

exports.list.Struct = function (context) {
    loadPartials();
    return when.lift(dust.render)('list/Struct', context);
};

exports.list.Data = function (context) {
    loadPartials();
    return when.lift(dust.render)('list/Data', context);
};

exports.list.Text = function (context) {
    loadPartials();
    return when.lift(dust.render)('list/Text', context);
};
