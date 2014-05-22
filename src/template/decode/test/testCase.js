var dust = require('dustjs-linkedin');
var when = require('when/node');

var template = "it('should map {preimage} to an identical {image}', function () {";
template +=    "    var preimage = require('{preimage}');";
template +=    "    var image = require('{image}');";
template +=    "    assert.deepEqual(preimage, image);";
template +=    "});";

var compiled = dust.compile(template, 'testCase');
dust.loadSource(compiled);

module.exports = function (context) {
    return when.lift(dust.render)('testCase', context);
};
