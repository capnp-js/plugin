var List = require("./UInt8");

var Data = function(segments, segment, begin, length) {
    List.call(this, segments, segment, begin, length);
};

Data.prototype = new List();

Object.defineProperty(Data.prototype, "length", {
    get: function() {
        return this.__length;
    },
    set: function(value) {
        throw new Error("Readonly");
    }
});

Data.prototype.get = function() {
    return this.__segment.subarray(this.__begin, this.__begin + this.__length);
};

Data.deref = function(segments, segment, pointer) {
    var targetSegment, start, half;
    if (0 === (segment[pointer] | segment[pointer + 1] | segment[pointer + 2] | segment[pointer + 3] | segment[pointer + 4] | segment[pointer + 5] | segment[pointer + 6] | segment[pointer + 7] | segment[pointer + 8])) {
        return new Data(null, null, null, 0);
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
    return new Data(segments, targetSegment, start, (segment[pointer + 4] >>> 3) + (segment[pointer + 5] << 5) + (segment[pointer + 6] << 13) + (segment[pointer + 7] << 21));
};

module.exports = Data;