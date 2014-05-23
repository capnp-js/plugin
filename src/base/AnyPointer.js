var nested = require('../decode/list/nested.js');

var Any = function (segments, segment, pointer) {
    this.__segments = segments;
    this.__segment = segment;
    this.__pointer = pointer;
};

Any.prototype = function () {};

Any.prototype.listDeref = function (TerminalList, depth) {
    if (depth === undefined || depth === 1) {
        return TerminalList.deref(this.__segments, this.__segment, this.__pointer);
    } else if (depth > 1) {
        return nested(TerminalList).deref(this.__segments, this.__segment, this.__pointer, depth);
    } else {
        throw new Error('Lists must have depth of at least 1');
    }
};

Any.prototype.structDeref = function (Reader) {
    return Reader.deref(this.__segments, this.__segment, this.__pointer);
};

module.exports = Any;
