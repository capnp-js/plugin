var assert = require('assert');
var deep = require('deep-diff');

describe ('Code generator request schema', function () {
    it ('should induce a template parametrization equivalent to schema.json', function () {
        var diff = deep(
            require('./schema.capnp.json'),
            require('../schema.json')
        );

        assert.strictEqual(diff, undefined);
    });
});
