var Base = require("../base/List");

module.exports = function(Reader) {
    function List(segments, segment, begin, length, dataBytes, pointerBytes) {
        Base.call(this, segments, segment, begin, length);
        this.__dataBytes = dataBytes;
        this.__pointerBytes = pointerBytes;
        this.__stride = dataBytes + pointerBytes;
    }
    List.prototype = Object.create(Base.prototype);
    List.prototype.get = function(index) {
        if (index < 0 || this.__length <= index) {
            throw new RangeError();
        }
        return new Reader(this.__segments, this.__segment, this.__begin + this.__stride * index, this.__dataBytes, this.__pointerBytes);
    };
    List.deref = function(segments, segment, pointer) {
        var targetSegment, start, half;
        if (0 === (segment[pointer] | segment[pointer + 1] | segment[pointer + 2] | segment[pointer + 3] | segment[pointer + 4] | segment[pointer + 5] | segment[pointer + 6] | segment[pointer + 7] | segment[pointer + 8])) {
            return new List(null, null, null, 0, null, null);
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
        var dataBytes;
        switch (segment[pointer + 4] & 7) {
          case 0:
            dataBytes = 0;
            break;

          case 2:
            dataBytes = 1;
            break;

          case 3:
            dataBytes = 2;
            break;

          case 4:
            dataBytes = 4;
            break;

          case 5:
            dataBytes = 8;
            break;

          case 7:
            dataBytes = (segment[pointer + 4] << 3) + (segment[pointer + 5] << 11);
            return new List(segments, targetSegment, start, (targetSegment[start - 8] >>> 2) + (targetSegment[start - 7] << 6) + (targetSegment[start - 6] << 14) + (targetSegment[start - 5] << 22), dataBytes, (segment[pointer + 6] >>> 0 << 3) + (segment[pointer + 7] << 11));

          case elementSize.BIT:
            throw new Error("Bit alignment of packed lists is not supported");

          case elementSize.POINTER:
            throw new Error("Lists of pointers are specifically supported for each type, i.e. Nested, Text, and Data");

          default:
            throw new Error("Invalid message");
        }
        return new List(segments, targetSegment, start, (segment[pointer + 4] >>> 3) + (segment[pointer + 5] << 5) + (segment[pointer + 6] << 13) + (segment[pointer + 7] << 21), dataBytes, 0);
    };
    return List;
};