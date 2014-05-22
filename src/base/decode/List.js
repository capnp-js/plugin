var Base = require('../List');

var List = function (segments, segment, begin, length) {
    this.__segments = segments;
    this.__segment = segment;
    this.__begin = begin;
    this.__length = length;
};

List.prototype = Object.create(Base.prototype);

Object.defineProperty(List.prototype, 'length', {
    get : function () { return this.__length; },
    set : function (value) { throw new Error('Readonly'); }
});

module.exports = List;
