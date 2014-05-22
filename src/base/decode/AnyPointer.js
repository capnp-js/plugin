var Base = require('../AnyPointer');
var List = require('./List');
var Struct = require('./Struct');

var Any = function (segments, segment, pointer) {
    this.__segments = segments;
    this.__segment = segment;
    this.__pointer = pointer;
};

Any.prototype = Object.create(Base.prototype);

Any.prototype.cast = function (Reader, depth) {
    if (depth !== undefined) {
        if (!(Reader.prototype instanceof List)) {
            throw new TypeError('Target reader is not a list reader');
        }

        return Reader.deref(this.__segments, this.__segment, this.__pointer, depth);
    } else {
        if (!(Reader.prototype instanceof Struct)) {
            throw new TypeError('Target reader is not a struct reader');
        }

        return Reader.deref(this.__segments, this.__segment, this.__pointer);
    }
};

module.exports = Any;
