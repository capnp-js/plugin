var List = require("./UInt8");

var decoder = new require("text-encoding").TextDecoder("utf-8");

var Text = function(segments, segment, begin, length) {
    List.call(this, segments, segment, begin, length);
};

Text.prototype = new List();

Object.defineProperty(Text.prototype, "length", {
    get: function() {
        return this.__length - 1;
    },
    set: function(value) {
        throw new Error("Readonly");
    }
});

Text.prototype.get = function() {
    return decoder.decode(this.getRaw());
};

Text.prototype.getRaw = function() {
    return this.__segment.subarray(this.__begin, this.__begin + this.__length - 1);
};

Text.prototype.getRawNulled = function() {
    return this.__segment.subarray(this.__begin, this.__begin + this.__length);
};

Text.deref = function(segments, segment, pointer) {
    var targetSegment, start, half;
    if (0 === (segment[pointer] | segment[pointer + 1] | segment[pointer + 2] | segment[pointer + 3] | segment[pointer + 4] | segment[pointer + 5] | segment[pointer + 6] | segment[pointer + 7] | segment[pointer + 8])) {
        return new Text(segments, segment, pointer, 1);
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
    return new Text(segments, targetSegment, start, (segment[pointer + 4] >>> 3) + (segment[pointer + 5] << 5) + (segment[pointer + 6] << 13) + (segment[pointer + 7] << 21));
};

/** If null then use the null pointer's zeros with length 1 (null terminated* empty string).*/ module.exports = Text;