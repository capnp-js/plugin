module.exports = function List(segments, segment, begin, length) {
    this.__segments = segments;
    this.__segment = segment;
    this.__begin = begin;
    this.__length = length;
};

Object.defineProperty(List.prototype, 'length', {
    get : function () { return this.__length; },
    set : function (value) { throw new Error('Readonly'); }
});