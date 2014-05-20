var List = require("../base/List");

module.exports = function(TerminalList) {
    function Nested(segments, segment, begin, length, depth) {
        this.__segments = segments;
        this.__segment = segment;
        this.__begin = begin;
        this.__length = length;
        this.__depth = depth;
    }
    Nested.prototype = new List();
    Object.defineProperty(Nested.prototype, "length", {
        get: function() {
            return this.__length;
        },
        set: function() {
            throw new Error("Readonly");
        }
    });
    Nested.prototype.get = function(index) {
        if (index < 0 || this.__length <= index) {
            throw new RangeError();
        }
        if (this.__depth) {
            return Nested.deref(this.__segments, this.__segment, this.__begin + (index << 3), this.__depth - 1);
        } else {
            return TerminalList.deref(this.__segments, this.__segment, this.__begin + (index << 3));
        }
    };
    Nested.deref = function(segments, segment, pointer) {
        var targetSegment, start, half;
        if (0 === (segment[pointer] | segment[pointer + 1] | segment[pointer + 2] | segment[pointer + 3] | segment[pointer + 4] | segment[pointer + 5] | segment[pointer + 6] | segment[pointer + 7] | segment[pointer + 8])) {
            return new Nested(null, null, null, 0, null);
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
        var depth = arguments[3];
        return new Nested(segments, targetSegment, start, (segment[pointer + 4] >>> 3) + (segment[pointer + 5] << 5) + (segment[pointer + 6] << 13) + (segment[pointer + 7] << 21), depth);
    };
    return Nested;
};