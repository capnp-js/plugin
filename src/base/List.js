var List = function (segments, segment, begin, length) {
    this.__segments = segments;
    this.__segment = segment;
    this.__begin = begin;
    this.__length = length;
};

Object.defineProperty(List.prototype, 'length', {
    get : function () { return this.__length; },
    set : function (value) { throw new Error('Readonly'); }
});

List.prototype.map = function (callback, context) {
    if (context) {
        callback = callback.bind(context);
    }

    var out = [];
    for (var i=0; i<this.length; ++i) {
        /* TODO: Optimize me */
        out[i] = callback(this.get(i));
    }

    return out;
};

List.prototype.forEach = function (callback, context) {
    if (context) {
        callback = callback.bind(context);
    }

    for (var i=0; i<this.length; ++i) {
        /* TODO: Optimize me */
        callback(this.get(i), i, this);
    }
};

module.exports = List;
