var Base = require("../base/List");

var List = function(segments, segment, begin, length) {
    Base.call(this, segments, segment, begin, length);
};

List.prototype = Object.create(Base.prototype);

List.prototype.get = function(index) {
    if (index < 0 || this.__length <= index) {
        throw RangeError();
    }
    /** This kinda sucks--someday there should be an iterator interface to* avoid the frequent `stride*i` computations.  The `byteOffset` helper* has some goofy logic going on too, but it's still semantic.*/ /** Use index as a register to record the start of the struct's data* section.*/ index = this.__begin + 2 * index;
    return (segment[index + 0] | 0) + (segment[index + 1] << 8);
};

List.deref = function(segments, segment, pointer) {
    var targetSegment, start, half;
    if (0 === (segment[pointer] | segment[pointer + 1] | segment[pointer + 2] | segment[pointer + 3] | segment[pointer + 4] | segment[pointer + 5] | segment[pointer + 6] | segment[pointer + 7] | segment[pointer + 8])) {
        return;
    }
    /*jshint -W018 */ if (!((segment[pointer] & 3) === 3)) {
        /*jshint +W018 */ targetSegment = segment;
        half = (segment[pointer] & 4294967292) + (segment[pointer + 1] << 8) + (segment[pointer + 2] << 16) + (segment[pointer + 3] << 24);
        start = pointer + 8 + half + half;
    } else {
        targetSegment = segments[(segment[pointer + 4] >>> 0) + (segment[pointer + 5] << 8) + (segment[pointer + 6] << 16) + (segment[pointer + 7] << 24)];
        if (segment[pointer] & 4) {
            pointer = (segment[pointer] & 4294967288) + (segment[pointer + 1] << 8) + (segment[pointer + 2] << 16) + (segment[pointer + 3] << 24);
            segment = targetSegment;
            half = (segment[pointer] & 4294967292) + (segment[pointer + 1] << 8) + (segment[pointer + 2] << 16) + (segment[pointer + 3] << 24);
            start = pointer + 8 + half + half;
        } else {
            pointer = (segment[pointer] & 4294967288) + (segment[pointer + 1] << 8) + (segment[pointer + 2] << 16) + (segment[pointer + 3] << 24);
            segment = targetSegment;
            targetSegment = segments[(segment[pointer + 4] >>> 0) + (segment[pointer + 5] << 8) + (segment[pointer + 6] << 16) + (segment[pointer + 7] << 24)];
            start = (segment[pointer] & 4294967288) + (segment[pointer + 1] << 8) + (segment[pointer + 2] << 16) + (segment[pointer + 3] << 24);
            pointer += 8;
        }
    }
    /*jshint -W018 */ if (!((segment[pointer] & 3) === 1)) {
        /*jshint +W018 */ throw new TypeError("Pointer resolves to non-list");
    }
    return new List(segments, targetSegment, start, (segment[pointer + 4] >>> 3) + (segment[pointer + 5] << 5) + (segment[pointer + 6] << 13) + (segment[pointer + 7] << 21));
};

module.exports = List;